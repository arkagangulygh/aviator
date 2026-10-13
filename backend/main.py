
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi import FastAPI


from routers import auth,flights,bookings,seats

load_dotenv()




app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://flighttfinderr.vercel.app/"
        "https://flighttfinderr-mrdvc9615-arkagangulyghs-projects.vercel.app/"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router)
app.include_router(flights.router)
app.include_router(bookings.router)
app.include_router(seats.router)

