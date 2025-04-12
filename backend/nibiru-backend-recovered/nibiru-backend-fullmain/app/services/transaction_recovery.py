import asyncio
import logging
from typing import Optional, Dict, List
from datetime import datetime, timedelta
from decimal import Decimal
from web3 import Web3
from app.models.payment import CryptoTransaction, TransactionStatus
from app.core.exceptions import PaymentError, NetworkError, GasPriceError
from app.services.crypto_payment import CryptoPaymentService
from app.services.cross_chain import CrossChainService

logger = logging.getLogger(__name__)

class TransactionRecoveryService:
    def __init__(self):
        self.crypto_service = CryptoPaymentService()
        self.cross_chain_service = CrossChainService()
        self.max_retries = 3
        self.retry_delay = 5  # seconds
        self.gas_price_threshold = Decimal('100')  # Gwei

    async def retry_transaction(
        self,
        transaction: CryptoTransaction,
        private_key: str,
        retry_count: int = 0
    ) -> str:
        """Retry a failed transaction with updated gas price."""
        try:
            # Get current gas price
            web3 = Web3(Web3.HTTPProvider(settings.NETWORK_RPC_URLS[transaction.network]))
            current_gas_price = web3.eth.gas_price

            # Check if gas price is too high
            if current_gas_price > self.gas_price_threshold * 1e9:
                raise GasPriceError(f"Gas price too high: {current_gas_price / 1e9} Gwei")

            # Update transaction with new gas price
            transaction.gas_price = current_gas_price
            transaction.status = TransactionStatus.PENDING
            transaction.updated_at = datetime.utcnow()

            # Process transaction based on type
            if transaction.is_cross_chain:
                tx_hash = await self.cross_chain_service.process_cross_chain_transaction(
                    transaction=transaction,
                    private_key=private_key
                )
            else:
                tx_hash = await self.crypto_service.process_payment(
                    transaction=transaction,
                    private_key=private_key
                )

            return tx_hash

        except (NetworkError, GasPriceError) as e:
            if retry_count < self.max_retries:
                logger.warning(f"Retry {retry_count + 1}/{self.max_retries} failed: {str(e)}")
                await asyncio.sleep(self.retry_delay)
                return await self.retry_transaction(transaction, private_key, retry_count + 1)
            raise

        except Exception as e:
            logger.error(f"Transaction retry failed: {str(e)}")
            transaction.status = TransactionStatus.FAILED
            transaction.error_message = str(e)
            transaction.updated_at = datetime.utcnow()
            raise

    async def recover_failed_transactions(
        self,
        user_id: int,
        private_key: str,
        max_age_hours: int = 24
    ) -> List[Dict]:
        """Recover failed transactions within the specified time window."""
        # Get failed transactions
        failed_transactions = await CryptoTransaction.filter(
            user_id=user_id,
            status=TransactionStatus.FAILED,
            created_at__gte=datetime.utcnow() - timedelta(hours=max_age_hours)
        )

        results = []
        for transaction in failed_transactions:
            try:
                # Check if transaction is recoverable
                if not self._is_recoverable(transaction):
                    continue

                # Retry transaction
                tx_hash = await self.retry_transaction(transaction, private_key)
                
                results.append({
                    'transaction_id': transaction.id,
                    'status': 'recovered',
                    'tx_hash': tx_hash
                })

            except Exception as e:
                results.append({
                    'transaction_id': transaction.id,
                    'status': 'failed',
                    'error': str(e)
                })

        return results

    async def get_transaction_status(
        self,
        transaction: CryptoTransaction
    ) -> Dict:
        """Get detailed transaction status including network status."""
        try:
            # Get network status
            network_status = await self.crypto_service.get_network_status(transaction.network)
            
            # Get transaction receipt if available
            receipt = None
            if transaction.tx_hash:
                web3 = Web3(Web3.HTTPProvider(settings.NETWORK_RPC_URLS[transaction.network]))
                receipt = web3.eth.get_transaction_receipt(transaction.tx_hash)

            return {
                'transaction_id': transaction.id,
                'status': transaction.status,
                'network_status': network_status,
                'receipt': receipt,
                'error_message': transaction.error_message,
                'created_at': transaction.created_at,
                'updated_at': transaction.updated_at,
                'completed_at': transaction.completed_at
            }

        except Exception as e:
            logger.error(f"Failed to get transaction status: {str(e)}")
            raise

    def _is_recoverable(self, transaction: CryptoTransaction) -> bool:
        """Check if a transaction is recoverable."""
        # Check if transaction is too old
        if transaction.created_at < datetime.utcnow() - timedelta(hours=24):
            return False

        # Check if transaction has permanent failure
        if transaction.error_message and any(
            error in transaction.error_message.lower()
            for error in ['insufficient balance', 'invalid private key', 'invalid address']
        ):
            return False

        return True

    async def get_network_health(
        self,
        network: str
    ) -> Dict:
        """Get network health metrics for transaction optimization."""
        try:
            # Get network status
            status = await self.crypto_service.get_network_status(network)
            
            # Get gas price history
            web3 = Web3(Web3.HTTPProvider(settings.NETWORK_RPC_URLS[network]))
            current_gas_price = web3.eth.gas_price
            
            # Get recent block data
            current_block = web3.eth.block_number
            block_timestamp = web3.eth.get_block(current_block)['timestamp']
            
            # Calculate network congestion
            recent_blocks = [
                web3.eth.get_block(current_block - i)
                for i in range(10)
            ]
            
            avg_gas_used = sum(
                block['gasUsed'] / block['gasLimit']
                for block in recent_blocks
            ) / len(recent_blocks)

            return {
                'network': network,
                'is_synced': status['is_synced'],
                'current_gas_price': current_gas_price,
                'block_number': current_block,
                'block_timestamp': block_timestamp,
                'congestion_level': avg_gas_used,
                'recommendation': self._get_network_recommendation(
                    current_gas_price,
                    avg_gas_used
                )
            }

        except Exception as e:
            logger.error(f"Failed to get network health: {str(e)}")
            raise

    def _get_network_recommendation(
        self,
        gas_price: int,
        congestion_level: float
    ) -> str:
        """Get network usage recommendation based on current conditions."""
        if gas_price > self.gas_price_threshold * 1e9:
            return "High gas prices detected. Consider waiting or using a different network."
        
        if congestion_level > 0.8:
            return "Network is highly congested. Consider waiting or using a different network."
        
        if congestion_level > 0.6:
            return "Network is moderately congested. Consider using a higher gas price."
        
        return "Network conditions are good. Proceed with transaction." 