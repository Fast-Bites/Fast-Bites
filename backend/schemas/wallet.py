from datetime import datetime
from pydantic import BaseModel
from typing import List


class WalletSummaryResponse(BaseModel):
    balance: float
    currency: str
    has_wallet: bool


class WalletTransactionResponse(BaseModel):
    id: str
    type: str
    title: str
    amount: float
    is_positive: bool
    status: str
    created_at: datetime


class WalletTransactionsListResponse(BaseModel):
    transactions: List[WalletTransactionResponse]
