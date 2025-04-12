from decimal import Decimal
from typing import Dict, List, Optional
from web3 import Web3
from app.core.exceptions import PaymentError, NetworkError, BridgeError
from app.models.payment import CryptoTransaction, TransactionStatus
from app.core.config import settings

class CrossChainService:
    def __init__(self):
        self.bridge_contracts = {
            'polygon': {
                'base': settings.POLYGON_BASE_BRIDGE,
                'ronin': settings.POLYGON_RONIN_BRIDGE
            },
            'base': {
                'polygon': settings.BASE_POLYGON_BRIDGE,
                'ronin': settings.BASE_RONIN_BRIDGE
            },
            'ronin': {
                'polygon': settings.RONIN_POLYGON_BRIDGE,
                'base': settings.RONIN_BASE_BRIDGE
            }
        }
        
        self.web3_instances = {
            network: Web3(Web3.HTTPProvider(settings.NETWORK_RPC_URLS[network]))
            for network in ['polygon', 'base', 'ronin']
        }

    async def estimate_cross_chain_fee(
        self,
        from_network: str,
        to_network: str,
        token: str,
        amount: Decimal,
        from_address: str
    ) -> Dict:
        """Estimate gas fees for cross-chain transaction."""
        if from_network not in self.bridge_contracts or to_network not in self.bridge_contracts[from_network]:
            raise BridgeError(f"Bridge not supported between {from_network} and {to_network}")

        web3 = self.web3_instances[from_network]
        bridge_address = self.bridge_contracts[from_network][to_network]
        
        # Get bridge contract
        bridge_contract = web3.eth.contract(
            address=bridge_address,
            abi=settings.BRIDGE_CONTRACT_ABI
        )

        # Estimate gas for bridge transaction
        gas_estimate = bridge_contract.functions.transfer(
            to_network,
            token,
            amount,
            from_address
        ).estimate_gas({'from': from_address})

        # Get current gas price
        gas_price = web3.eth.gas_price

        # Calculate total gas cost
        total_gas_cost = Decimal(gas_estimate) * Decimal(gas_price) / Decimal(1e18)

        return {
            'gas_estimate': gas_estimate,
            'gas_price': gas_price,
            'total_gas_cost': total_gas_cost,
            'from_network': from_network,
            'to_network': to_network,
            'token': token
        }

    async def create_cross_chain_transaction(
        self,
        from_network: str,
        to_network: str,
        token: str,
        amount: Decimal,
        from_address: str,
        user_id: int
    ) -> CryptoTransaction:
        """Create a cross-chain transaction record."""
        # Validate networks and bridge support
        if from_network not in self.bridge_contracts or to_network not in self.bridge_contracts[from_network]:
            raise BridgeError(f"Bridge not supported between {from_network} and {to_network}")

        # Estimate gas fees
        gas_estimate = await self.estimate_cross_chain_fee(
            from_network=from_network,
            to_network=to_network,
            token=token,
            amount=amount,
            from_address=from_address
        )

        # Create transaction record
        transaction = CryptoTransaction(
            user_id=user_id,
            network=f"{from_network}-{to_network}",  # Special format for cross-chain
            token=token,
            amount=amount,
            from_address=from_address,
            to_address=self.bridge_contracts[from_network][to_network],
            gas_estimate=gas_estimate['gas_estimate'],
            gas_price=gas_estimate['gas_price'],
            status=TransactionStatus.PENDING,
            is_cross_chain=True,
            target_network=to_network
        )

        return transaction

    async def process_cross_chain_transaction(
        self,
        transaction: CryptoTransaction,
        private_key: str
    ) -> str:
        """Process a cross-chain transaction."""
        if not transaction.is_cross_chain:
            raise BridgeError("Not a cross-chain transaction")

        from_network, to_network = transaction.network.split('-')
        web3 = self.web3_instances[from_network]
        
        # Get bridge contract
        bridge_contract = web3.eth.contract(
            address=self.bridge_contracts[from_network][to_network],
            abi=settings.BRIDGE_CONTRACT_ABI
        )

        try:
            # Build transaction
            tx = bridge_contract.functions.transfer(
                to_network,
                transaction.token,
                transaction.amount,
                transaction.from_address
            ).build_transaction({
                'from': transaction.from_address,
                'nonce': web3.eth.get_transaction_count(transaction.from_address),
                'gas': transaction.gas_estimate,
                'gasPrice': transaction.gas_price,
                'chainId': settings.NETWORK_CHAIN_IDS[from_network]
            })

            # Sign and send transaction
            signed_tx = web3.eth.account.sign_transaction(tx, private_key)
            tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)

            # Wait for transaction receipt
            receipt = web3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)

            if receipt['status'] == 0:
                raise BridgeError("Cross-chain transaction failed")

            return receipt['transactionHash'].hex()

        except Exception as e:
            raise BridgeError(f"Cross-chain transaction failed: {str(e)}")

    async def get_bridge_status(
        self,
        from_network: str,
        to_network: str
    ) -> Dict:
        """Get the current status of a bridge between networks."""
        if from_network not in self.bridge_contracts or to_network not in self.bridge_contracts[from_network]:
            raise BridgeError(f"Bridge not supported between {from_network} and {to_network}")

        web3 = self.web3_instances[from_network]
        bridge_address = self.bridge_contracts[from_network][to_network]
        
        bridge_contract = web3.eth.contract(
            address=bridge_address,
            abi=settings.BRIDGE_CONTRACT_ABI
        )

        try:
            is_active = bridge_contract.functions.isActive().call()
            daily_limit = bridge_contract.functions.dailyLimit().call()
            total_locked = bridge_contract.functions.totalLocked().call()

            return {
                'from_network': from_network,
                'to_network': to_network,
                'is_active': is_active,
                'daily_limit': daily_limit,
                'total_locked': total_locked
            }
        except Exception as e:
            raise BridgeError(f"Failed to get bridge status: {str(e)}")

    async def get_supported_bridges(self) -> List[Dict]:
        """Get list of all supported bridges and their status."""
        bridges = []
        for from_network in self.bridge_contracts:
            for to_network in self.bridge_contracts[from_network]:
                try:
                    status = await self.get_bridge_status(from_network, to_network)
                    bridges.append(status)
                except BridgeError:
                    continue
        return bridges 