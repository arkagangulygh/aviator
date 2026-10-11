
from fastapi import APIRouter, HTTPException
from datetime import date

from database.connection import supabase

router = APIRouter()


# Search flights
@router.get("/flights")
def get_flights(source: str, destination: str, date: date):

    source_airport_idd = supabase.table("airports") \
        .select("id") \
        .eq("code", source) \
        .execute()

    if not source_airport_idd.data:
        raise HTTPException(
            status_code=404,
            detail="Source airport not found"
        )

    source_airport_id = source_airport_idd.data[0]["id"]

    destination_airport_idd = supabase.table("airports") \
        .select("id") \
        .eq("code", destination) \
        .execute()

    if not destination_airport_idd.data:
        raise HTTPException(
            status_code=404,
            detail="Destination airport not found"
        )

    destination_airport_id = destination_airport_idd.data[0]["id"]

    airline_idd = supabase.table("flights") \
        .select("airline_id, price, flight_number") \
        .eq("source_airport_id", source_airport_id) \
        .eq("destination_airport_id", destination_airport_id) \
        .eq("departure_date", date) \
        .execute()

    final_response = []

    for airline_idd_single in airline_idd.data:
        airline_id = airline_idd_single["airline_id"]

        airline_namee = supabase.table("airlines") \
            .select("name") \
            .eq("id", airline_id) \
            .execute()

        airline_name = airline_namee.data[0]["name"]

        airline_price = airline_idd_single["price"]
        airline_number = airline_idd_single["flight_number"]

        final_response.append({
            "FlightNo": airline_number,
            "airline": airline_name,
            "source": source,
            "destination": destination,
            "price": airline_price
        })

    if len(final_response) == 0:
        return {"message": "No such flights found"}

    return final_response
