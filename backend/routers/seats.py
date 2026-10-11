
from fastapi import APIRouter, Depends, HTTPException

from database.connection import supabase
from core.security import get_current_user

router = APIRouter()


# Get seats for a flight
@router.get("/seats")
def get_seats(flight_number: str):

    flight = supabase.table("flights") \
        .select("id") \
        .eq("flight_number", flight_number) \
        .execute()

    if not flight.data:
        raise HTTPException(
            status_code=404,
            detail="Flight not found"
        )

    flight_id = flight.data[0]["id"]

    seats = supabase.table("flight_seats") \
        .select("id, seats_number, is_booked") \
        .eq("flight_id", flight_id) \
        .order("seats_number") \
        .execute()

    final_response = []

    for seat in seats.data:
        final_response.append({
            "seat_id": seat["id"],
            "seats_number": seat["seats_number"],
            "is_booked": seat["is_booked"]
        })

    return final_response


# Check whether a seat is available
@router.post("/select-seats")
def select_seats(
    seat_id: int,
    current_user=Depends(get_current_user)
):

    seatnumber = supabase.table("flight_seats") \
        .select("id, seats_number, is_booked") \
        .eq("id", seat_id) \
        .execute()

    if not seatnumber.data:
        raise HTTPException(
            status_code=404,
            detail="Seat not found"
        )

    if seatnumber.data[0]["is_booked"]:
        raise HTTPException(
            status_code=409,
            detail="Seat is already booked"
        )

    return {
        "message": "Seat is available for selection",
        "seat_id": seatnumber.data[0]["id"],
        "seats_number": seatnumber.data[0]["seats_number"]
    }
