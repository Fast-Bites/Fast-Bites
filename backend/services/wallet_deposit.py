"""Credit wallet balance and record a transaction when a deposit is confirmed."""
import logging
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from models.payment import Deposit, DepositAccount
from models.user import User
from models.wallet import Wallet, WalletTransaction
from routers.wallet import get_or_create_wallet

log = logging.getLogger(__name__)


async def ensure_deposit_account(user_id: UUID, db: AsyncSession) -> DepositAccount:
    from sqlalchemy import select, or_

    result = await db.execute(
        select(DepositAccount)
        .where(
            DepositAccount.is_active == True,
            or_(DepositAccount.user_id == user_id, DepositAccount.user_id.is_(None)),
        )
        .order_by(DepositAccount.user_id.desc().nulls_last())
        .limit(1)
    )
    row = result.scalar_one_or_none()
    if row:
        return row

    wallet = await get_or_create_wallet(user_id, db)
    user = await db.get(User, user_id)
    owner = "Wallet owner"
    if user:
        owner = f"{user.first_name} {user.last_name}".strip() or owner

    account_number = str(wallet.id).replace("-", "")[:10]
    row = DepositAccount(
        user_id=user_id,
        owner_name=owner,
        wallet_id=str(wallet.id)[:8].upper(),
        gateway="Fast Bites",
        account_number=account_number,
        bank_name="Virtual transfer",
        recipient_name="FAST BITES",
        is_active=True,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    log.info("Created virtual deposit account for user %s", user_id)
    return row


async def complete_deposit(deposit: Deposit, wallet: Wallet, db: AsyncSession) -> Wallet:
    status = str(deposit.status).lower() if deposit.status else ""
    if status == "successful":
        return wallet

    amount = float(deposit.amount)
    wallet.balance = float(wallet.balance or 0) + amount
    deposit.status = "successful"

    method = str(deposit.method).lower()
    title = "Bank transfer" if method == "bank" else "Card deposit" if method == "card" else "Deposit"

    tx = WalletTransaction(
        wallet_id=wallet.id,
        user_id=deposit.user_id,
        type="deposit",
        amount=amount,
        status="Successful",
        title=title,
        deposit_id=deposit.id,
        created_at=datetime.now(timezone.utc),
    )
    db.add(tx)
    await db.commit()
    await db.refresh(wallet)
    await db.refresh(deposit)
    log.info("Completed deposit %s: +₦%s for user %s", deposit.id, amount, deposit.user_id)
    return wallet
