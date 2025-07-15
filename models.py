from sqlalchemy import Column, Integer, String, Date,DateTime,func
from database import Base
# from sqlalchemy import Column, DateTime, func

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100))
    phone_number = Column(String(20))
    hashed_password = Column(String(100), nullable=False)
    role = Column(String(10), default="user")
    created_at = Column(DateTime, default=func.now())

class UPITransaction(Base):
    __tablename__ = "upi_transaction"
    Upi_Transaction_Id = Column(String(50), primary_key=True, index=True)
    Date = Column(Date)
    Sender_Bank = Column(String(50))
    Reciever_bank = Column(String(50))
    Amount_transferd = Column(Integer)
    Purpose = Column(String(45))
    Gender = Column(String(10))
    Payment_app = Column(String(45))
    Payment_Gateway = Column(String(45))
    Device_type = Column(String(45))
    Age = Column(Integer)
    Status = Column(String(45))
    Sender_Name = Column(String(45))
    Receiver_Name = Column(String(45))
