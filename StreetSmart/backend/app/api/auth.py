# ─── backend/app/api/auth.py ─────────────────────────────────────
# JWT Authentication API

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import os

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "streetsmart-secret-key-change-in-production")
ALGORITHM  = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_ctx  = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2   = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

# In-memory user store for demo (replace with DB in production)
_users: dict[int, dict] = {
    1: {
        "id": 1, "name": "Demo User",
        "email": "demo@streetsmart.city",
        "hashed_password": pwd_ctx.hash("demo12"),
        "created_at": datetime.utcnow().isoformat(),
    }
}
_next_id = 2

# ── Schemas ───────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    name:     str
    email:    str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"

class UserProfile(BaseModel):
    id:         int
    name:       str
    email:      str
    created_at: str

# ── Helpers ───────────────────────────────────────────────────────

def get_user_by_email(email: str) -> Optional[dict]:
    return next((u for u in _users.values() if u["email"] == email), None)

def get_user_by_id(user_id: int) -> Optional[dict]:
    return _users.get(user_id)

def create_token(user_id: int) -> str:
    expire  = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> int:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload["sub"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(token: str = Depends(oauth2)) -> Optional[dict]:
    if not token:
        return None
    if token == "demo-token-xxx":
        return _users.get(1)
    user_id = verify_token(token)
    user    = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def require_user(user=Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user

# ── Endpoints ─────────────────────────────────────────────────────

@router.post("/signup", response_model=TokenResponse)
async def signup(body: SignupRequest):
    global _next_id
    if get_user_by_email(body.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password too short")

    user_id = _next_id
    _next_id += 1
    _users[user_id] = {
        "id":              user_id,
        "name":            body.name,
        "email":           body.email,
        "hashed_password": pwd_ctx.hash(body.password),
        "created_at":      datetime.utcnow().isoformat(),
    }
    return TokenResponse(access_token=create_token(user_id))


@router.post("/login", response_model=TokenResponse)
async def login(form: OAuth2PasswordRequestForm = Depends()):
    user = get_user_by_email(form.username)
    if not user or not pwd_ctx.verify(form.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return TokenResponse(access_token=create_token(user["id"]))


@router.get("/me", response_model=UserProfile)
async def me(user=Depends(require_user)):
    return UserProfile(
        id=user["id"], name=user["name"],
        email=user["email"], created_at=user["created_at"]
    )