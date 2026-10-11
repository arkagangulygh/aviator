
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

# Locate the .env file in the backend folder
BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError(
        "Missing SUPABASE_URL or SUPABASE_KEY. Check backend/.env"
    )

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
