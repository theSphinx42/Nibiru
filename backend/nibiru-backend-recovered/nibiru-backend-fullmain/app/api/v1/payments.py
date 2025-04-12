from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.api import deps
from app.services.crypto_payment import CryptoPaymentService
from app.models.payment import CryptoTransaction, TransactionStatus
from app.schemas.payment import (
    CryptoTransactionCreate,
    CryptoTransactionResponse,
    NetworkStatus,
    GasEstimate
)
from app.core.rate_limit import rate_limiter
from datetime import datetime

router = APIRouter()
crypto_service = CryptoPaymentService()

@router.get("/networks", response_model=List[NetworkStatus])
async def get_supported_networks(
    request: Request,
    db: Session = Depends(deps.get_db)
):
    """Get list of supported networks and their current status."""
    await rate_limiter.check_rate_limit(request, **{"limit": 60, "window": 60})
    return await crypto_service.get_supported_networks()

@router.get("/networks/{network}/status", response_model=NetworkStatus)
async def get_network_status(
    network: str,
    request: Request,
    db: Session = Depends(deps.get_db)
):
    """Get current status of a specific network."""
    await rate_limiter.check_rate_limit(request, **{"limit": 60, "window": 60})
    return await crypto_service.get_network_status(network)

@router.post("/estimate-gas", response_model=GasEstimate)
async def estimate_gas_fee(
    network: str,
    token: str,
    amount: float,
    from_address: str,
    request: Request,
    db: Session = Depends(deps.get_db)
):
    """Estimate gas fee for a transaction."""
    await rate_limiter.check_rate_limit(request, **{"limit": 30, "window": 60})
    return await crypto_service.estimate_gas_fee(
        network=network,
        token=token,
        amount=amount,
        from_address=from_address
    )

@router.post("/transactions", response_model=CryptoTransactionResponse)
async def create_transaction(
    transaction: CryptoTransactionCreate,
    request: Request,
    current_user = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Create a new crypto payment transaction."""
    await rate_limiter.check_rate_limit(request, **{"limit": 10, "window": 60})
    
    # Validate user's wallet address
    if not await crypto_service.validate_address(
        transaction.network,
        transaction.from_address
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid wallet address for the selected network"
        )
    
    # Create transaction
    db_transaction = await crypto_service.create_payment(
        network=transaction.network,
        token=transaction.token,
        amount=transaction.amount,
        from_address=transaction.from_address,
        user_id=current_user.id
    )
    
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    return db_transaction

@router.post("/transactions/{transaction_id}/process")
async def process_transaction(
    transaction_id: int,
    private_key: str,
    request: Request,
    current_user = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """Process a pending crypto payment transaction."""
    await rate_limiter.check_rate_limit(request, **{"limit": 5, "window": 60})
    
    # Get transaction
    transaction = db.query(CryptoTransaction).filter(
        CryptoTransaction.id == transaction_id,
        CryptoTransaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )
    
    if transaction.status != TransactionStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail=f"Transaction is {transaction.status}"
        )
    
    try:
        # Update status to processing
        transaction.status = TransactionStatus.PROCESSING
        db.commit()
        
        # Process payment
        tx_hash = await crypto_service.process_payment(transaction, private_key)
        
        # Update transaction with success
        transaction.tx_hash = tx_hash
        transaction.status = TransactionStatus.COMPLETED
        transaction.completed_at = datetime.utcnow()
        db.commit()
        
        return {"status": "success", "tx_hash": tx_hash}
        
    except Exception as e:
        # Update transaction with failure
        transaction.status = TransactionStatus.FAILED
        transaction.error_message = str(e)
        db.commit()
        raise HTTPException(
            status_code=500,
            detail=f"Transaction failed: {str(e)}"
        )

@router.get("/transactions", response_model=List[CryptoTransactionResponse])
async def get_user_transactions(
    request: Request,
    current_user = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 10
):
    """Get user's crypto payment transactions."""
    await rate_limiter.check_rate_limit(request, **{"limit": 30, "window": 60})
    
    transactions = db.query(CryptoTransaction).filter(
        CryptoTransaction.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return transactions 