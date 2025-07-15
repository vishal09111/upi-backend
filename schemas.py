from pydantic import BaseModel
from typing import Optional
from datetime import date

# ===== User Schemas =====

class UserCreate(BaseModel):
    username: str
    email: Optional[str]
    phone_number: Optional[str]
    password: str
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    username: str
    password: str

# ===== UPI Transaction Schemas =====

class UPITransactionCreate(BaseModel):
    Upi_Transaction_Id: str
    Date: date
    Sender_Bank: str
    Reciever_bank: str
    Amount_transferd: int
    Purpose: str
    Gender: str
    Payment_app: str
    Payment_Gateway: str
    Device_type: str
    Age: int
    Status: str
    # Sender_Name: str
    Receiver_Name: str


class UserOut(BaseModel):
    username: str
    role: str
    created_at: date
    class Config:
        orm_mode = True 

class UPITransactionOut(UPITransactionCreate):
      Sender_Name: str
      class Config:
        orm_mode = True   # <- replaces orm_mode
