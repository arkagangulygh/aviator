
import os
import jwt

from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from database.connection import supabase

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"

security = HTTPBearer()


# Verify our custom login token
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        token_data = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = token_data.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        response = supabase.table("users") \
            .select("id, email") \
            .eq("id", user_id) \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        return response.data[0]

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )
