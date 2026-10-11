
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from pwdlib import PasswordHash
from datetime import datetime, timedelta, timezone
import jwt
import os
from dotenv import load_dotenv

from database.connection import supabase

load_dotenv()

router = APIRouter()
password_hash = PasswordHash.recommended()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"


class UserRegister(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register(user: UserRegister):
    try:
        existing_user = supabase.table("users") \
            .select("id") \
            .eq("email", user.email) \
            .execute()

        if existing_user.data:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        hashed_password = password_hash.hash(user.password)

        response = supabase.table("users").insert({
            "email": user.email,
            "password_hash": hashed_password
        }).execute()

        return {
            "message": "Registration successful",
            "user_id": response.data[0]["id"]
        }

    except HTTPException:
        raise

    except Exception as e:
        print("REGISTRATION ERROR:", repr(e))
        raise HTTPException(
            status_code=500,
            detail="Registration failed. Check the VS Code terminal."
        )


@router.post("/login")
def login(user: UserLogin):

    response = supabase.table("users") \
        .select("id, email, password_hash") \
        .eq("email", user.email) \
        .execute()

    if not response.data:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    user_data = response.data[0]

    if not password_hash.verify(
        user.password,
        user_data["password_hash"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = jwt.encode(
        {
            "user_id": user_data["id"],
            "exp": datetime.now(timezone.utc) + timedelta(hours=2)
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user_data["id"]
    }
