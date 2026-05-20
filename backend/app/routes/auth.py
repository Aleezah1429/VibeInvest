from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db import get_session
from ..auth import (
    UserSignUp,
    UserSignIn,
    GoogleAuthRequest,
    TokenResponse,
    UserResponse,
)
from ..services.auth import signup_user, login_user, create_access_token
from ..services.google_auth import authenticate_google_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

def _to_user_response(user) -> UserResponse:
    """Helper function to map a User DB instance to a UserResponse schema."""
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        created_at=user.created_at
    )

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserSignUp, db: Session = Depends(get_session)):
    """API endpoint to register a new user manually."""
    # 1. Register the user via the auth service
    user = signup_user(db, user_data)
    
    # 2. Issue a secure signed session token
    token = create_access_token(data={"sub": user.id})
    
    # 3. Return the token and user details
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=_to_user_response(user)
    )

@router.post("/signin", response_model=TokenResponse)
def signin(credentials: UserSignIn, db: Session = Depends(get_session)):
    """API endpoint to authenticate user manual credentials."""
    # 1. Validate credentials via the auth service
    user = login_user(db, credentials)
    
    # 2. Issue a secure signed session token
    token = create_access_token(data={"sub": user.id})
    
    # 3. Return the token and user details
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=_to_user_response(user)
    )

@router.post("/google", response_model=TokenResponse)
async def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_session)):
    """API endpoint to authenticate Google accounts via OAuth ID Tokens."""
    # 1. Verify token and authenticate/register the user
    user = await authenticate_google_user(db, request)
    
    # 2. Issue a secure signed session token
    token = create_access_token(data={"sub": user.id})
    
    # 3. Return the token and user details
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=_to_user_response(user)
    )
