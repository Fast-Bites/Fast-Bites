import logging
import httpx
import jwt
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import settings

log = logging.getLogger(__name__)
security = HTTPBearer()

# Cache for Supabase JWT public key
_jwt_secret = None

async def get_supabase_jwt_secret():
    """Get Supabase JWT secret for verification"""
    global _jwt_secret
    if _jwt_secret:
        return _jwt_secret
    
    # For Supabase, use the service role key's JWT secret
    # The JWT secret is the same as the anon key's secret portion
    if not settings.SUPABASE_URL:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    # Extract project ref from URL
    # URL format: https://[project-ref].supabase.co
    project_ref = settings.SUPABASE_URL.replace("https://", "").split(".")[0]
    _jwt_secret = settings.SUPABASE_SERVICE_ROLE_KEY
    
    return _jwt_secret

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verify Supabase JWT token and return user data"""
    token = credentials.credentials
    
    if not token:
        log.error("No token provided")
        raise HTTPException(status_code=401, detail="No token provided")
    
    log.info(f"Verifying token: {token[:20]}...")
    
    try:
        # Decode without verification first to get the header
        unverified = jwt.decode(token, options={"verify_signature": False})
        log.info(f"Token payload: {unverified}")
        
        # For Supabase tokens, verify using the JWT secret
        # Supabase uses HS256 with the JWT secret from the project settings
        # The secret is derived from the project's JWT secret (found in API settings)
        
        # Actually verify the token
        # Supabase JWT tokens can be verified by calling the auth API
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.SUPABASE_URL}/auth/v1/user",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                log.error(f"Supabase auth failed: {response.status_code} - {response.text}")
                raise HTTPException(status_code=401, detail="Invalid token")
            
            user_data = response.json()
            log.info(f"Verified user: {user_data.get('email')}")
            return user_data
            
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        log.error(f"Invalid token: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        log.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

# Dependency to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    return await verify_token(credentials)

