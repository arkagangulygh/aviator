
import traceback
from fastapi import APIRouter, Depends, HTTPException
from uuid import uuid4

from database.connection import supabase
from core.security import get_current_user

router = APIRouter()


# Calculate booking fare
@router.get("/booking")
def get_booking(flight_number: str, adults: int, children: int):

    if adults < 0 or children < 0 or adults + children == 0:
        raise HTTPException(
            status_code=400,
            detail="Enter a valid passenger count"
        )

    flight = supabase.table("flights") \
        .select("*") \
        .eq("flight_number", flight_number) \
        .execute()

    if not flight.data:
        raise HTTPException(
            status_code=404,
            detail="Flight not found"
        )

    flight_data = flight.data[0]
    airline_id = flight_data["airline_id"]

    airline_namee = supabase.table("airlines") \
        .select("name") \
        .eq("id", airline_id) \
        .execute()

    airline_name = airline_namee.data[0]["name"]

    adult_price = float(flight_data["price"])
    child_price = adult_price * 2 / 3

    total_price = (adults * adult_price) + (children * child_price)

    final_response = {
        "flight_id": flight_data["id"],
        "flight_number": flight_data["flight_number"],
        "airline": airline_name,
        "source": flight_data["source_airport_id"],
        "destination": flight_data["destination_airport_id"],
        "departure_date": flight_data["departure_date"],
        "departure_time": flight_data["departure_time"],
        "arrival_date": flight_data["arrival_date"],
        "arrival_time": flight_data["arrival_time"],
        "price": flight_data["price"],
        "adults": adults,
        "children": children,
        "adult_price": adult_price,
        "child_price": child_price,
        "total_price": total_price
    }

    return final_response


@router.post("/confirm-booking")
def confirmbooking(
    flight_id: int,
    seats_number: str,
    current_user=Depends(get_current_user)
):
    seat_id = supabase.table("flight_seats") \
        .select("id") \
        .eq("flight_id", flight_id) \
        .eq("seats_number", seats_number) \
        .execute()

    if not seat_id.data:
        raise HTTPException(
            status_code=404,
            detail="Seat not found"
        )

    actual_seat_id = seat_id.data[0]["id"]

    # Mark the seat booked only if it is still available
    response = supabase.table("flight_seats") \
        .update({"is_booked": True}) \
        .eq("id", actual_seat_id) \
        .eq("is_booked", False) \
        .select("id") \
        .execute()

    if not response.data:
        raise HTTPException(
            status_code=409,
            detail="Seat is already booked"
        )

    booking_reference = str(uuid4())

    try:
        booking = supabase.table("bookings").insert({
            "user_id": current_user["id"],
            "flight_id": flight_id,
            "seat_id": actual_seat_id,
            "booking_reference": booking_reference,
            "status": "CONFIRMED"
        }).execute()

        if not booking.data:
            raise Exception("Booking insert returned no data")

    except Exception as e:
        # Print the actual error in Render Logs
        print(
            "CONFIRM BOOKING INSERT ERROR:",
            repr(e),
            flush=True
        )
        traceback.print_exc()

        # Restore the seat if the booking insert failed
        try:
            supabase.table("flight_seats") \
                .update({"is_booked": False}) \
                .eq("id", actual_seat_id) \
                .execute()
        except Exception as rollback_error:
            print(
                "SEAT ROLLBACK ERROR:",
                repr(rollback_error),
                flush=True
            )
            traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Could not save booking"
        )

    return {
        "message": "Booking confirmed",
        "seats_number": seats_number,
        "booking_reference": booking_reference,
        "user_id": current_user["id"]
    }



@router.get("/my-bookings")
def my_bookings(current_user=Depends(get_current_user)):

    user_id = current_user["id"]

    bookings = supabase.table("bookings") \
        .select("id, flight_id, seat_id, booking_reference, status, booked_at") \
        .eq("user_id", user_id) \
        .order("booked_at", desc=True) \
        .execute()

    final_response = []

    for booking in bookings.data:
        flight = supabase.table("flights") \
            .select(
                "flight_number, source_airport_id, "
                "destination_airport_id, departure_date, "
                "departure_time, arrival_date, arrival_time, "
                "price, airline_id"
            ) \
            .eq("id", booking["flight_id"]) \
            .execute()

        if not flight.data:
            continue

        flight_data = flight.data[0]

        airline_namee = supabase.table("airlines") \
            .select("name") \
            .eq("id", flight_data["airline_id"]) \
            .execute()

        source_airport_namee = supabase.table("airports") \
            .select("name, city, code") \
            .eq("id", flight_data["source_airport_id"]) \
            .execute()

        destination_airport_namee = supabase.table("airports") \
            .select("name, city, code") \
            .eq("id", flight_data["destination_airport_id"]) \
            .execute()

        seat_numberr = supabase.table("flight_seats") \
            .select("seats_number") \
            .eq("id", booking["seat_id"]) \
            .execute()

        airline_name = (
            airline_namee.data[0]["name"]
            if airline_namee.data else "Unknown"
        )

        source_airport_name = (
            source_airport_namee.data[0]
            if source_airport_namee.data else {}
        )

        destination_airport_name = (
            destination_airport_namee.data[0]
            if destination_airport_namee.data else {}
        )

        seats_number = (
            seat_numberr.data[0]["seats_number"]
            if seat_numberr.data else "Unknown"
        )

        final_response.append({
            "booking_reference": booking["booking_reference"],
            "status": booking["status"],
            "booked_at": booking["booked_at"],
            "flight_number": flight_data["flight_number"],
            "airline": airline_name,
            "source_airport": source_airport_name.get("name", "Unknown"),
            "source_city": source_airport_name.get("city", "Unknown"),
            "source_code": source_airport_name.get("code", "Unknown"),
            "destination_airport": destination_airport_name.get("name", "Unknown"),
            "destination_city": destination_airport_name.get("city", "Unknown"),
            "destination_code": destination_airport_name.get("code", "Unknown"),
            "departure_date": flight_data["departure_date"],
            "departure_time": flight_data["departure_time"],
            "arrival_date": flight_data["arrival_date"],
            "arrival_time": flight_data["arrival_time"],
            "seat": seats_number,
            "price": flight_data["price"]
        })

    return final_response


@router.post("/cancel-booking")
def cancel_booking(
    booking_reference: str,
    current_user=Depends(get_current_user)
):
    # Find this booking belonging to the logged-in user
    booking = supabase.table("bookings") \
        .select("id, flight_id, seat_id, status, booking_reference") \
        .eq("booking_reference", booking_reference) \
        .eq("user_id", current_user["id"]) \
        .execute()

    if not booking.data:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    booking_data = booking.data[0]

    if booking_data["status"] != "CONFIRMED":
        raise HTTPException(
            status_code=400,
            detail="Booking is not active or has already been cancelled"
        )

    # Mark the booking as cancelled
    cancelled_booking = supabase.table("bookings") \
        .update({"status": "CANCELLED"}) \
        .eq("id", booking_data["id"]) \
        .eq("user_id", current_user["id"]) \
        .eq("status", "CONFIRMED") \
        .execute()

    if not cancelled_booking.data:
        raise HTTPException(
            status_code=409,
            detail="Booking could not be cancelled"
        )

    # Release the seat
    released_seat = supabase.table("flight_seats") \
        .update({"is_booked": False}) \
        .eq("id", booking_data["seat_id"]) \
        .eq("flight_id", booking_data["flight_id"]) \
        .eq("is_booked", True) \
        .execute()

    if not released_seat.data:
        # Restore the booking status if releasing the seat failed
        supabase.table("bookings") \
            .update({"status": "CONFIRMED"}) \
            .eq("id", booking_data["id"]) \
            .execute()

        raise HTTPException(
            status_code=500,
            detail="Could not release the seat. Please try again."
        )

    return {
        "message": "Booking cancelled successfully",
        "booking_reference": booking_reference,
        "status": "CANCELLED",
        "seat_id": booking_data["seat_id"],
        "seat_released": True
    }