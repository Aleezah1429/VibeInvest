import httpx
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from ..auth import User, GoogleAuthRequest

GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"

async def verify_google_token(id_token: str) -> dict:
    """
    Verify the Google ID token against Google's OAuth2 tokeninfo endpoint.
    Includes a robust mock verification fallback for offline hackathon testing.
    """
    # Simple check for mock/test tokens during local runs
    if id_token.startswith("mock-") or id_token == "google-test-token":
        return {
            "sub": "mock-google-id-123456",
            "email": "google.investor@gmail.com",
            "name": "Google Investor",
            "email_verified": True
        }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                GOOGLE_TOKEN_INFO_URL,
                params={"id_token": id_token}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Google Token Verification failed: {response.text}"
                )
                
            token_data = response.json()
            
            # Basic validation checks
            if not token_data.get("email_verified"):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Google account email is not verified."
                )
                
            return token_data
            
    except httpx.RequestError as e:
        # If internet/API request fails, provide a graceful mock fallback for hackathon demos
        print(f"Google API request error: {e}. Falling back to demo verification mode.")
        return None

async def authenticate_google_user(db: Session, req: GoogleAuthRequest) -> User:
    """
    Verifies a Google ID token and returns the corresponding User record.
    If the user does not exist, registers them automatically.
    """
    google_id = None
    email = None
    name = None
    
    # 1. Verify token
    token_info = await verify_google_token(req.id_token)
    
    if token_info:
        google_id = token_info.get("sub")
        email = token_info.get("email", "").strip().lower()
        name = token_info.get("name", "Google User").strip()
    else:
        # Fall back to client-supplied mock info if token verification was bypassed or offline
        if req.google_id and req.email:
            google_id = req.google_id
            email = req.email.strip().lower()
            name = (req.name or "Google User").strip()
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not verify Google token and no valid client-supplied fallback provided."
            )
            
    if not google_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incomplete Google user profile details obtained."
        )

    # 2. Check if user already exists with this google_id
    user = db.query(User).filter(User.google_id == google_id).first()
    if user:
        return user

    # 3. Check if user already exists with this email (e.g. manual signup with same email)
    user_by_email = db.query(User).filter(User.email == email).first()
    if user_by_email:
        # Link Google account to existing manual email account
        user_by_email.google_id = google_id
        db.commit()
        db.refresh(user_by_email)
        return user_by_email

    # 4. Create new user for Google sign-in
    new_user = User(
        name=name,
        email=email,
        google_id=google_id,
        hashed_password=None # Google authenticated users do not have a password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
