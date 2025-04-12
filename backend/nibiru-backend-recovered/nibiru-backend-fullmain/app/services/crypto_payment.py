from typing import Dict, List, Optional
from decimal import Decimal
from web3 import Web3
from eth_account import Account
from app.core.config import settings
from app.core.exceptions import PaymentError
from app.models.payment import CryptoTransaction

class CryptoPaymentService:
    def __init__(self):
        # Initialize Web3 connections for different networks
        self.networks = {
            'polygon': {
                'rpc': settings.POLYGON_RPC_URL,
                'chain_id': 137,
                'name': 'Polygon Mainnet',
                'supported_tokens': {
                    'USDC': settings.POLYGON_USDC_ADDRESS,
                    'DAI': settings.POLYGON_DAI_ADDRESS
                }
            },
            'base': {
                'rpc': settings.BASE_RPC_URL,
                'chain_id': 8453,
                'name': 'Base Mainnet',
                'supported_tokens': {
                    'USDC': settings.BASE_USDC_ADDRESS,
                    'DAI': settings.BASE_DAI_ADDRESS
                }
            },
            'ronin': {
                'rpc': settings.RONIN_RPC_URL,
                'chain_id': 2020,
                'name': 'Ronin Mainnet',
                'supported_tokens': {
                    'USDC': settings.RONIN_USDC_ADDRESS,
                    'DAI': settings.RONIN_DAI_ADDRESS
                }
            }
        }
        
        # Initialize Web3 instances
        self.web3_instances = {
            network: Web3(Web3.HTTPProvider(config['rpc']))
            for network, config in self.networks.items()
        }
        
        # Load token ABIs
        self.token_abi = self._load_token_abi()
        
    def _load_token_abi(self) -> Dict:
        """Load ERC20 token ABI."""
        return [
            {
                "constant": True,
                "inputs": [],
                "name": "decimals",
                "outputs": [{"name": "", "type": "uint8"}],
                "type": "function"
            },
            {
                "constant": True,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": False,
                "inputs": [
                    {"name": "_to", "type": "address"},
                    {"name": "_value", "type": "uint256"}
                ],
                "name": "transfer",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
            }
        ]

    async def estimate_gas_fee(
        self,
        network: str,
        token: str,
        amount: Decimal,
        from_address: str
    ) -> Dict:
        """Estimate gas fee for a transaction."""
        if network not in self.networks:
            raise PaymentError(f"Unsupported network: {network}")
            
        if token not in self.networks[network]['supported_tokens']:
            raise PaymentError(f"Unsupported token: {token} on {network}")
            
        web3 = self.web3_instances[network]
        token_address = self.networks[network]['supported_tokens'][token]
        token_contract = web3.eth.contract(
            address=web3.to_checksum_address(token_address),
            abi=self.token_abi
        )
        
        # Get token decimals
        decimals = token_contract.functions.decimals().call()
        amount_wei = int(amount * (10 ** decimals))
        
        # Estimate gas
        gas_estimate = token_contract.functions.transfer(
            web3.to_checksum_address(settings.TREASURY_ADDRESS),
            amount_wei
        ).estimate_gas({'from': from_address})
        
        # Get gas price
        gas_price = web3.eth.gas_price
        
        # Calculate total gas cost
        total_gas_cost = gas_estimate * gas_price
        
        return {
            'gas_estimate': gas_estimate,
            'gas_price': gas_price,
            'total_gas_cost': web3.from_wei(total_gas_cost, 'ether'),
            'network': network,
            'token': token
        }

    async def create_payment(
        self,
        network: str,
        token: str,
        amount: Decimal,
        from_address: str,
        user_id: int
    ) -> CryptoTransaction:
        """Create a new crypto payment transaction."""
        # Validate network and token
        if network not in self.networks:
            raise PaymentError(f"Unsupported network: {network}")
            
        if token not in self.networks[network]['supported_tokens']:
            raise PaymentError(f"Unsupported token: {token} on {network}")
            
        # Estimate gas fee
        gas_estimate = await self.estimate_gas_fee(
            network, token, amount, from_address
        )
        
        # Create transaction record
        transaction = CryptoTransaction(
            user_id=user_id,
            network=network,
            token=token,
            amount=amount,
            from_address=from_address,
            to_address=settings.TREASURY_ADDRESS,
            gas_estimate=gas_estimate['gas_estimate'],
            gas_price=gas_estimate['gas_price'],
            status='pending'
        )
        
        return transaction

    async def process_payment(
        self,
        transaction: CryptoTransaction,
        private_key: str
    ) -> str:
        """Process the crypto payment transaction."""
        web3 = self.web3_instances[transaction.network]
        token_address = self.networks[transaction.network]['supported_tokens'][transaction.token]
        token_contract = web3.eth.contract(
            address=web3.to_checksum_address(token_address),
            abi=self.token_abi
        )
        
        # Get token decimals
        decimals = token_contract.functions.decimals().call()
        amount_wei = int(transaction.amount * (10 ** decimals))
        
        # Create transaction
        tx = token_contract.functions.transfer(
            web3.to_checksum_address(transaction.to_address),
            amount_wei
        ).build_transaction({
            'from': transaction.from_address,
            'nonce': web3.eth.get_transaction_count(transaction.from_address),
            'gas': transaction.gas_estimate,
            'gasPrice': transaction.gas_price,
            'chainId': self.networks[transaction.network]['chain_id']
        })
        
        # Sign and send transaction
        signed_tx = web3.eth.account.sign_transaction(tx, private_key)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        # Wait for transaction receipt
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        
        return receipt['transactionHash'].hex()

    async def get_network_status(self, network: str) -> Dict:
        """Get current network status and gas prices."""
        if network not in self.networks:
            raise PaymentError(f"Unsupported network: {network}")
            
        web3 = self.web3_instances[network]
        
        return {
            'network': network,
            'name': self.networks[network]['name'],
            'gas_price': web3.from_wei(web3.eth.gas_price, 'gwei'),
            'block_number': web3.eth.block_number,
            'is_synced': web3.eth.syncing is False
        }

    async def get_supported_networks(self) -> List[Dict]:
        """Get list of supported networks and their status."""
        networks = []
        for network in self.networks:
            status = await self.get_network_status(network)
            networks.append({
                **status,
                'supported_tokens': list(self.networks[network]['supported_tokens'].keys())
            })
        return networks

    async def validate_address(self, network: str, address: str) -> bool:
        """Validate if an address is valid for the given network."""
        if network not in self.networks:
            raise PaymentError(f"Unsupported network: {network}")
            
        web3 = self.web3_instances[network]
        return web3.is_address(address) 