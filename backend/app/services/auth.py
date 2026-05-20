import os
import hashlib
import secrets
import hmac
import base64
import json
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from ..auth import User, UserSignUp, UserSignIn

# JWT-like signature configuration
SECRET_KEY = os.getenv("SECRET_KEY", "vibeinvest-super-secure-hmac-jwt-key-2026")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 Hours

def hash_password(password: str) -> str:
    """Hash a password using PBKDF2 with SHA-256 and a secure unique salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"{salt}:{key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored PBKDF2 salt and hash."""
    try:
        salt, stored_key_hex = hashed_password.split(':')
        key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return hmac.compare_digest(key.hex(), stored_key_hex)
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Generate a secure JWT-like token. It base64-encodes the JSON payload 
    and appends a custom HMAC-SHA256 signature to prevent tampering.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire.timestamp()})
    
    # Base64 encode the payload
    payload_json = json.dumps(to_encode)
    payload_b64 = base64.urlsafe_b64encode(payload_json.encode('utf-8')).decode('utf-8').rstrip('=')
    
    # Compute signature
    signature = hmac.new(
        SECRET_KEY.encode('utf-8'),
        payload_b64.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return f"{payload_b64}.{signature}"

def verify_access_token(token: str) -> Optional[dict]:
    """Verify a custom signed access token and return the decoded payload."""
    try:
        parts = token.split('.')
        if len(parts) != 2:
            return None
        payload_b64, signature = parts
        
        # Verify signature
        expected_signature = hmac.new(
            SECRET_KEY.encode('utf-8'),
            payload_b64.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_signature):
            return None
            
        # Decode payload
        # Pad base64 string
        missing_padding = len(payload_b64) % 4
        if missing_padding:
            payload_b64 += '=' * (4 - missing_padding)
            
        payload_json = base64.urlsafe_b64decode(payload_b64.encode('utf-8')).decode('utf-8')
        payload = json.loads(payload_json)
        
        # Check expiration
        if payload.get("exp") and datetime.utcnow().timestamp() > payload["exp"]:
            return None
            
        return payload
    except Exception:
        return None

def signup_user(db: Session, user_data: UserSignUp) -> User:
    """Create and save a new user record in the database."""
    email_lower = user_data.email.strip().lower()
    
    # Check if user already exists
    existing = db.query(User).filter(User.email == email_lower).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
        
    # Create new User
    db_user = User(
        name=user_data.name.strip(),
        email=email_lower,
        hashed_password=hash_password(user_data.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def login_user(db: Session, credentials: UserSignIn) -> User:
    """Authenticate email and password credentials, returning the user."""
    email_lower = credentials.email.strip().lower()
    
    # Fetch User
    db_user = db.query(User).filter(User.email == email_lower).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No account found with this email. Please sign up."
        )
        
    if not db_user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account was registered via Google Sign-In. Please sign in with Google."
        )
        
    # Verify password
    if not verify_password(credentials.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please try again."
        )
        
    return db_user
