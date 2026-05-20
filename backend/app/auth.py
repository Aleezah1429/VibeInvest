from datetime import datetime
import uuid
from typing import Optional
from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column
from pydantic import BaseModel, Field

from .db import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True, index=True)
    hashed_password: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    google_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

# Pydantic Schemas for validation and request parsing
class UserSignUp(BaseModel):
    name: str = Field(..., min_length=2)
    email: str = Field(...)
    password: str = Field(..., min_length=6)

class UserSignIn(BaseModel):
    email: str = Field(...)
    password: str = Field(...)

class GoogleAuthRequest(BaseModel):
    id_token: str = Field(...)
    name: Optional[str] = None
    email: Optional[str] = None
    google_id: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
