import logging
import re
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.payment import PaymentCard, Deposit
from models.user import User
from routers.wallet import get_or_create_wallet
from schemas.payment import (
    PaymentCardCreate,
    PaymentCardResponse,
    DepositAccountResponse,
    DepositCreate,
    DepositResponse,
)
from services.jwt_auth import get_current_user
from services.wallet_deposit import ensure_deposit_account, complete_deposit

log = logging.getLogger(__name__)
router = APIRouter(prefix="/payments", tags=["payments"])


def card_brand(digits: str) -> str | None:
    if digits.startswith("4"):
        return "visa"
    if digits.startswith(("51", "52", "53", "54", "55")):
        return "mastercard"
    return None


@router.post("/cards", response_model=PaymentCardResponse)
async def create_payment_card(
    body: PaymentCardCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        digits = re.sub(r"\D", "", body.card_number)
        if len(digits) < 13:
            raise HTTPException(status_code=400, detail="Invalid card number")
        last_four = digits[-4:]
        card = PaymentCard(
            user_id=user_id,
            cardholder_name=body.cardholder_name.strip(),
            last_four=last_four,
            brand=card_brand(digits),
            exp_month=body.exp_month,
            exp_year=body.exp_year,
            save_details=body.save_details,
            is_default=False,
        )
        db.add(card)
        await db.commit()
        await db.refresh(card)
        return PaymentCardResponse(
            id=str(card.id),
            cardholder_name=card.cardholder_name,
            last_four=card.last_four,
            brand=card.brand,
            exp_month=int(card.exp_month),
            exp_year=int(card.exp_year),
            is_default=bool(card.is_default),
            created_at=card.created_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error("Create card failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to save card")


@router.get("/deposit-account", response_model=DepositAccountResponse)
async def get_deposit_account(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        user_id = UUID(current_user["id"])
        wallet = await get_or_create_wallet(user_id, db)
        row = await ensure_deposit_account(user_id, db)
        owner = row.owner_name
        u = await db.get(User, user_id)
        if u:
            owner = f"{u.first_name} {u.last_name}".strip() or owner
        return DepositAccountResponse(
            owner_name=owner,
            wallet_id=row.wallet_id or str(wallet.id)[:8].upper(),
            gateway=row.gateway,
            account_number=row.account_number,
            bank_name=row.bank_name,
            recipient_name=row.recipient_name,
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error("Deposit account failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to load deposit account")


@router.post("/deposits", response_model=DepositResponse)
async def create_deposit(
    body: DepositCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a deposit and credit the wallet (simulated payment confirmation)."""
    try:
        user_id = UUID(current_user["id"])
        method = body.method.lower()
        if method not in ("card", "bank"):
            raise HTTPException(status_code=400, detail="Use card or bank for deposits")
        if body.amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be greater than zero")

        wallet = await get_or_create_wallet(user_id, db)
        deposit = Deposit(
            user_id=user_id,
            wallet_id=wallet.id,
            method=method,
            amount=body.amount,
            status="pending",
            payment_card_id=UUID(body.payment_card_id) if body.payment_card_id else None,
        )
        db.add(deposit)
        await db.flush()

        wallet = await complete_deposit(deposit, wallet, db)

        return DepositResponse(
            id=str(deposit.id),
            status=str(deposit.status),
            method=str(deposit.method),
            amount=float(deposit.amount),
            balance=float(wallet.balance),
        )
    except HTTPException:
        raise
    except Exception as e:
        log.error("Create deposit failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to complete deposit")
