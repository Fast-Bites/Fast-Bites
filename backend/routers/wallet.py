import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.wallet import Wallet, WalletTransaction
from schemas.wallet import (
    WalletSummaryResponse,
    WalletTransactionResponse,
    WalletTransactionsListResponse,
)
from services.jwt_auth import get_current_user

log = logging.getLogger(__name__)
router = APIRouter(prefix="/wallet", tags=["wallet"])

POSITIVE_TYPES = {"deposit", "received"}


async def get_or_create_wallet(user_id: UUID, db: AsyncSession) -> Wallet:
    result = await db.execute(select(Wallet).where(Wallet.user_id == user_id))
    wallet = result.scalar_one_or_none()
    if wallet:
        return wallet
    wallet = Wallet(user_id=user_id, balance=0, currency="NGN")
    db.add(wallet)
    await db.commit()
    await db.refresh(wallet)
    log.info("Created wallet for user %s", user_id)
    return wallet


def tx_to_response(row: WalletTransaction) -> WalletTransactionResponse:
    tx_type = str(row.type).lower() if row.type else "deposit"
    status = str(row.status) if row.status else "Successful"
    return WalletTransactionResponse(
        id=str(row.id),
        type=tx_type,
        title=row.title or tx_type.capitalize(),
        amount=float(row.amount),
        is_positive=tx_type in POSITIVE_TYPES,
        status=status,
        created_at=row.created_at,
    )


@router.get("/summary", response_model=WalletSummaryResponse)
async def get_wallet_summary(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        wallet = await get_or_create_wallet(user_id, db)
        return WalletSummaryResponse(
            balance=float(wallet.balance),
            currency=wallet.currency or "NGN",
            has_wallet=True,
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error("Wallet summary failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to load wallet")


@router.get("/transactions", response_model=WalletTransactionsListResponse)
async def list_wallet_transactions(
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        wallet = await get_or_create_wallet(user_id, db)
        safe_limit = min(max(limit, 1), 100)
        result = await db.execute(
            select(WalletTransaction)
            .where(WalletTransaction.wallet_id == wallet.id)
            .order_by(WalletTransaction.created_at.desc())
            .limit(safe_limit)
        )
        rows = result.scalars().all()
        return WalletTransactionsListResponse(
            transactions=[tx_to_response(r) for r in rows],
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error("Wallet transactions failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to load transactions")
