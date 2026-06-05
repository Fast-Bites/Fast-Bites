from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional


class PaymentCardCreate(BaseModel):
    cardholder_name: str
    card_number: str
    exp_month: int = Field(ge=1, le=12)
    exp_year: int = Field(ge=2020, le=2100)
    save_details: bool = True


class PaymentCardResponse(BaseModel):
    id: str
    cardholder_name: str
    last_four: str
    brand: Optional[str] = None
    exp_month: int
    exp_year: int
    is_default: bool
    created_at: datetime


class DepositAccountResponse(BaseModel):
    owner_name: str
    wallet_id: str
    gateway: str
    account_number: str
    bank_name: Optional[str] = None
    recipient_name: Optional[str] = None


class DepositCreate(BaseModel):
    method: str
    amount: float = Field(gt=0)
    payment_card_id: Optional[str] = None


class DepositResponse(BaseModel):
    id: str
    status: str
    method: str
    amount: float
    balance: float
