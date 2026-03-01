"""
ORANGE Platform — Auth Middleware
Validates Supabase JWT tokens.
"""

from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx
import logging

from app.config import get_settings

logger = logging.getLogger("orange.auth")

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Validate Supabase JWT token and extract user info.

    Uses Supabase's JWKS endpoint for key verification.
    """
    settings = get_settings()
    token = credentials.credentials

    try:
        # Fetch Supabase JWKS (cached in production)
        jwks_url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"
        async with httpx.AsyncClient() as client:
            resp = await client.get(jwks_url)
            jwks = resp.json()

        # Decode and verify token
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            audience="authenticated",
            issuer=f"{settings.supabase_url}/auth/v1",
        )

        user_id = payload.get("sub")
        email = payload.get("email")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: no user ID")

        return {
            "id": user_id,
            "email": email,
            "role": payload.get("role", "authenticated"),
            "metadata": payload.get("user_metadata", {}),
        }

    except JWTError as e:
        logger.warning(f"JWT validation failed: {e}")
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(
            status_code=401,
            detail="Authentication failed",
        )