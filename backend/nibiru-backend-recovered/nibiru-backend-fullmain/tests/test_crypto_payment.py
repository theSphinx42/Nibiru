import pytest
from decimal import Decimal
from unittest.mock import Mock, patch, AsyncMock
from web3 import Web3
from app.services.crypto_payment import CryptoPaymentService
from app.models.payment import CryptoTransaction, TransactionStatus
from app.core.exceptions import PaymentError, NetworkError, GasPriceError

@pytest.fixture
def crypto_service():
    return CryptoPaymentService()

@pytest.fixture
def mock_web3():
    with patch('web3.Web3') as mock:
        web3_instance = Mock()
        web3_instance.eth = Mock()
        web3_instance.eth.gas_price = 50000000000  # 50 Gwei
        web3_instance.eth.block_number = 1000000
        web3_instance.eth.syncing = False
        web3_instance.is_address.return_value = True
        web3_instance.to_checksum_address.return_value = "0x1234567890123456789012345678901234567890"
        web3_instance.from_wei.return_value = Decimal('0.0001')
        web3_instance.eth.get_transaction_count.return_value = 1
        web3_instance.eth.send_raw_transaction.return_value = "0x1234567890abcdef"
        web3_instance.eth.wait_for_transaction_receipt.return_value = {
            'transactionHash': b'\x12\x34\x56\x78\x90\xab\xcd\xef'
        }
        mock.return_value = web3_instance
        yield web3_instance

@pytest.fixture
def mock_token_contract():
    with patch('web3.eth.Contract') as mock:
        contract = Mock()
        contract.functions = Mock()
        contract.functions.decimals.return_value = Mock()
        contract.functions.decimals.return_value.call.return_value = 6
        contract.functions.transfer.return_value = Mock()
        contract.functions.transfer.return_value.estimate_gas.return_value = 100000
        contract.functions.transfer.return_value.build_transaction.return_value = {
            'from': '0x1234567890123456789012345678901234567890',
            'nonce': 1,
            'gas': 100000,
            'gasPrice': 50000000000,
            'chainId': 137
        }
        mock.return_value = contract
        yield contract

class TestCryptoPaymentService:
    async def test_estimate_gas_fee(self, crypto_service, mock_web3, mock_token_contract):
        # Test gas fee estimation
        result = await crypto_service.estimate_gas_fee(
            network='polygon',
            token='USDC',
            amount=Decimal('100'),
            from_address='0x1234567890123456789012345678901234567890'
        )
        
        assert result['gas_estimate'] == 100000
        assert result['gas_price'] == 50000000000
        assert result['network'] == 'polygon'
        assert result['token'] == 'USDC'
        assert isinstance(result['total_gas_cost'], Decimal)

    async def test_create_payment(self, crypto_service, mock_web3, mock_token_contract):
        # Test payment creation
        transaction = await crypto_service.create_payment(
            network='polygon',
            token='USDC',
            amount=Decimal('100'),
            from_address='0x1234567890123456789012345678901234567890',
            user_id=1
        )
        
        assert isinstance(transaction, CryptoTransaction)
        assert transaction.network == 'polygon'
        assert transaction.token == 'USDC'
        assert transaction.amount == Decimal('100')
        assert transaction.status == TransactionStatus.PENDING
        assert transaction.gas_estimate == 100000
        assert transaction.gas_price == 50000000000

    async def test_process_payment(self, crypto_service, mock_web3, mock_token_contract):
        # Create a transaction
        transaction = CryptoTransaction(
            id=1,
            user_id=1,
            network='polygon',
            token='USDC',
            amount=Decimal('100'),
            from_address='0x1234567890123456789012345678901234567890',
            to_address='0x0987654321098765432109876543210987654321',
            gas_estimate=100000,
            gas_price=50000000000,
            status=TransactionStatus.PENDING
        )
        
        # Test payment processing
        tx_hash = await crypto_service.process_payment(
            transaction=transaction,
            private_key='0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        )
        
        assert tx_hash == '0x1234567890abcdef'
        mock_web3.eth.send_raw_transaction.assert_called_once()
        mock_web3.eth.wait_for_transaction_receipt.assert_called_once()

    async def test_get_network_status(self, crypto_service, mock_web3):
        # Test network status retrieval
        status = await crypto_service.get_network_status('polygon')
        
        assert status['network'] == 'polygon'
        assert status['name'] == 'Polygon Mainnet'
        assert status['gas_price'] == 50  # 50 Gwei
        assert status['block_number'] == 1000000
        assert status['is_synced'] is True

    async def test_get_supported_networks(self, crypto_service, mock_web3):
        # Test supported networks retrieval
        networks = await crypto_service.get_supported_networks()
        
        assert len(networks) == 3
        assert all(network['is_synced'] for network in networks)
        assert all('supported_tokens' in network for network in networks)

    async def test_validate_address(self, crypto_service, mock_web3):
        # Test address validation
        is_valid = await crypto_service.validate_address(
            network='polygon',
            address='0x1234567890123456789012345678901234567890'
        )
        
        assert is_valid is True
        mock_web3.is_address.assert_called_once()

    async def test_invalid_network(self, crypto_service):
        # Test invalid network handling
        with pytest.raises(PaymentError):
            await crypto_service.estimate_gas_fee(
                network='invalid',
                token='USDC',
                amount=Decimal('100'),
                from_address='0x1234567890123456789012345678901234567890'
            )

    async def test_invalid_token(self, crypto_service):
        # Test invalid token handling
        with pytest.raises(PaymentError):
            await crypto_service.estimate_gas_fee(
                network='polygon',
                token='INVALID',
                amount=Decimal('100'),
                from_address='0x1234567890123456789012345678901234567890'
            )

    async def test_invalid_address(self, crypto_service, mock_web3):
        # Test invalid address handling
        mock_web3.is_address.return_value = False
        
        with pytest.raises(PaymentError):
            await crypto_service.validate_address(
                network='polygon',
                address='invalid_address'
            )

    async def test_payment_failure_insufficient_balance(self, crypto_service, mock_web3, mock_token_contract):
        # Mock insufficient balance
        mock_token_contract.functions.balanceOf.return_value = Mock()
        mock_token_contract.functions.balanceOf.return_value.call.return_value = 0
        
        with pytest.raises(PaymentError) as exc_info:
            await crypto_service.create_payment(
                network='polygon',
                token='USDC',
                amount=Decimal('100'),
                from_address='0x1234567890123456789012345678901234567890',
                user_id=1
            )
        assert "Insufficient balance" in str(exc_info.value)

    async def test_payment_failure_network_error(self, crypto_service, mock_web3):
        # Mock network error
        mock_web3.eth.send_raw_transaction.side_effect = Exception("Network error")
        
        transaction = CryptoTransaction(
            id=1,
            user_id=1,
            network='polygon',
            token='USDC',
            amount=Decimal('100'),
            from_address='0x1234567890123456789012345678901234567890',
            to_address='0x0987654321098765432109876543210987654321',
            gas_estimate=100000,
            gas_price=50000000000,
            status=TransactionStatus.PENDING
        )
        
        with pytest.raises(NetworkError):
            await crypto_service.process_payment(
                transaction=transaction,
                private_key='0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
            )

    async def test_gas_price_spike(self, crypto_service, mock_web3):
        # Mock gas price spike
        mock_web3.eth.gas_price = 100000000000  # 100 Gwei
        
        with pytest.raises(GasPriceError):
            await crypto_service.estimate_gas_fee(
                network='polygon',
                token='USDC',
                amount=Decimal('100'),
                from_address='0x1234567890123456789012345678901234567890'
            )

    async def test_concurrent_transactions(self, crypto_service, mock_web3, mock_token_contract):
        # Create multiple transactions
        transactions = [
            CryptoTransaction(
                id=i,
                user_id=1,
                network='polygon',
                token='USDC',
                amount=Decimal('100'),
                from_address='0x1234567890123456789012345678901234567890',
                to_address='0x0987654321098765432109876543210987654321',
                gas_estimate=100000,
                gas_price=50000000000,
                status=TransactionStatus.PENDING
            )
            for i in range(3)
        ]
        
        # Process transactions concurrently
        results = await asyncio.gather(*[
            crypto_service.process_payment(
                transaction=tx,
                private_key='0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
            )
            for tx in transactions
        ])
        
        assert len(results) == 3
        assert all(isinstance(tx_hash, str) for tx_hash in results)

    async def test_transaction_timeout(self, crypto_service, mock_web3):
        # Mock transaction timeout
        mock_web3.eth.wait_for_transaction_receipt.side_effect = TimeoutError()
        
        transaction = CryptoTransaction(
            id=1,
            user_id=1,
            network='polygon',
            token='USDC',
            amount=Decimal('100'),
            from_address='0x1234567890123456789012345678901234567890',
            to_address='0x0987654321098765432109876543210987654321',
            gas_estimate=100000,
            gas_price=50000000000,
            status=TransactionStatus.PENDING
        )
        
        with pytest.raises(PaymentError) as exc_info:
            await crypto_service.process_payment(
                transaction=transaction,
                private_key='0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
            )
        assert "Transaction timeout" in str(exc_info.value)

    async def test_invalid_private_key(self, crypto_service, mock_web3):
        transaction = CryptoTransaction(
            id=1,
            user_id=1,
            network='polygon',
            token='USDC',
            amount=Decimal('100'),
            from_address='0x1234567890123456789012345678901234567890',
            to_address='0x0987654321098765432109876543210987654321',
            gas_estimate=100000,
            gas_price=50000000000,
            status=TransactionStatus.PENDING
        )
        
        with pytest.raises(PaymentError) as exc_info:
            await crypto_service.process_payment(
                transaction=transaction,
                private_key='invalid_key'
            )
        assert "Invalid private key" in str(exc_info.value)

    async def test_network_sync_status(self, crypto_service, mock_web3):
        # Mock network syncing
        mock_web3.eth.syncing = True
        
        with pytest.raises(NetworkError) as exc_info:
            await crypto_service.get_network_status('polygon')
        assert "Network is syncing" in str(exc_info.value)

    async def test_token_approval_required(self, crypto_service, mock_web3, mock_token_contract):
        # Mock insufficient allowance
        mock_token_contract.functions.allowance.return_value = Mock()
        mock_token_contract.functions.allowance.return_value.call.return_value = 0
        
        with pytest.raises(PaymentError) as exc_info:
            await crypto_service.create_payment(
                network='polygon',
                token='USDC',
                amount=Decimal('100'),
                from_address='0x1234567890123456789012345678901234567890',
                user_id=1
            )
        assert "Token approval required" in str(exc_info.value) 