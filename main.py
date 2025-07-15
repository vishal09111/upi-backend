from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
import models, schemas
from database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Dict
# for power bi
from fastapi import Response
from models import UPITransaction 
from schemas import UPITransactionOut
from database import get_db
from typing import List
from models import User 
from schemas import UserOut


models.Base.metadata.create_all(bind=engine)

app = FastAPI()
@app.get("/")
def root():
    return {"message": "Welcome to the UPI Transaction API!"}

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# main.py (or wherever you define CORS)
origins = [
    "https://upi-frontend-lake.vercel.app",
    "https://upi-frontend-git-master-vishals-projects-3a0d8075.vercel.app",  # Add this
    "http://localhost:3000"
]



app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or replace "*" with ["http://localhost:3000"] for safety
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta=None):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(status_code=401, detail="Invalid credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user


@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if user.role == "admin" and user.username != "vishal":
        raise HTTPException(status_code=403, detail="Only Vishal can register as admin")
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed_pw = get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        phone_number=user.phone_number,
        hashed_password=hashed_pw,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    return {"message": "Registered successfully"}


@app.post("/login", response_model=Dict[str, str])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = create_access_token(data={"sub": user.username})
 
    # # response = JSONResponse(
    # #     content={"access_token": token, "token_type": "bearer"}
    # )
    
    # Set secure cookie for production
    # response.set_cookie(
    #     key="access_token",
    #     value=f"Bearer {token}",
    #     httponly=True,
    #     secure=True,  # Only send over HTTPS
    #     samesite="none",
    #     max_age=1800  # 30 minutes
    # )
    
    
    return {"access_token": token, "token_type": "bearer"}


@app.post("/upi/add", response_model=schemas.UPITransactionOut)
def add_upi_transaction(txn: schemas.UPITransactionCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    data = txn.dict()
    data["Sender_Name"] = user.username  # ensure current user is set
    db_txn = models.UPITransaction(**data)
    db.add(db_txn)
    db.commit()
    db.refresh(db_txn)
    return schemas.UPITransactionOut.from_orm(db_txn)


@app.get("/upi", response_model=list[schemas.UPITransactionOut])
def list_upi_transactions(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if user.role == "admin":
        return db.query(models.UPITransaction).all()
    return db.query(models.UPITransaction).filter(models.UPITransaction.Sender_Name == user.username).all()

@app.get("/upi-public", response_model=List[UPITransactionOut])
def get_all_transactions_public(db: Session = Depends(get_db)):
    return db.query(UPITransaction).all()


@app.get("/users-public", response_model=List[UserOut])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [UserOut.from_orm(user) for user in users]


@app.put("/upi/{transaction_id}", response_model=schemas.UPITransactionOut)
def update_transaction(transaction_id: str, txn_data: schemas.UPITransactionCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    txn = db.query(models.UPITransaction).filter(models.UPITransaction.Upi_Transaction_Id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if user.role != "admin" and txn.Sender_Name != user.username:
        raise HTTPException(status_code=403, detail="Unauthorized to update this transaction")
    for key, value in txn_data.dict().items():
        setattr(txn, key, value)
    db.commit()
    db.refresh(txn)
    return txn

# main.py
import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)

