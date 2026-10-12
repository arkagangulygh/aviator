
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import "../Booking.css";
import { logout } from "../Logout";
const API_URL = "https://flightfinder-d0ze.onrender.com";

function ConfirmBookings() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const flightNumber = searchParams.get("flight_number");
    const flightId = searchParams.get("flight_id");
    const adults = Number(searchParams.get("adults") || 1);
    const children = Number(searchParams.get("children") || 0);

    const passengerCount = adults + children;

    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loadingSeats, setLoadingSeats] = useState(true);
    const [seatError, setSeatError] = useState("");
    const [confirming, setConfirming] = useState(false);
    const [confirmationError, setConfirmationError] = useState("");
    const [bookingResults, setBookingResults] = useState([]);

    // Fetch the latest seat availability.
    const fetchSeats = useCallback(async () => {
        const params = new URLSearchParams({
            flight_number: flightNumber || "",
        });

        const response = await fetch(
            `${API_URL}/seats?${params.toString()}`
        );

        let data;

        try {
            data = await response.json();
        } catch {
            data = {};
        }

        if (!response.ok) {
            throw new Error(
                data.detail || `Unable to load seats (${response.status}).`
            );
        }

        const seatList = Array.isArray(data)
            ? data
            : Array.isArray(data.data)
                ? data.data
                : Array.isArray(data.seats)
                    ? data.seats
                    : [];

        setSeats(
            seatList.map((seat) => ({
                ...seat,
                seatNumber: seat.seats_number,
                isBooked:
                    seat.is_booked === true ||
                    seat.is_booked === 1 ||
                    seat.is_booked === "true",
            }))
        );

        const bookedSeatNumbers = seatList
            .filter(
                (seat) =>
                    seat.is_booked === true ||
                    seat.is_booked === 1 ||
                    seat.is_booked === "true"
            )
            .map((seat) => seat.seats_number);

        setSelectedSeats((previousSeats) =>
            previousSeats.filter(
                (seatNumber) =>
                    !bookedSeatNumbers.includes(seatNumber)
            )
        );

        return seatList;
    }, [flightNumber]);

    // Load seats when the page opens.
    useEffect(() => {
        let isActive = true;

        async function getSeats() {
            setLoadingSeats(true);
            setSeatError("");

            try {
                await fetchSeats();
            } catch (error) {
                if (isActive) {
                    setSeatError(
                        error.message || "Unable to load seat availability."
                    );
                }
            } finally {
                if (isActive) {
                    setLoadingSeats(false);
                }
            }
        }

        if (flightNumber) {
            getSeats();
        } else {
            setSeatError("No flight number was provided.");
            setLoadingSeats(false);
        }

        return () => {
            isActive = false;
        };
    }, [flightNumber, fetchSeats]);

    // Select or deselect a seat.
    function handleSeatClick(seat) {
        if (seat.isBooked || confirming) return;

        setConfirmationError("");

        setSelectedSeats((previousSeats) => {
            if (previousSeats.includes(seat.seatNumber)) {
                return previousSeats.filter(
                    (seatNumber) => seatNumber !== seat.seatNumber
                );
            }

            if (previousSeats.length >= passengerCount) {
                return previousSeats;
            }

            return [...previousSeats, seat.seatNumber];
        });
    }

    // Confirm selected seats through FastAPI.
    async function handleConfirmBooking() {
        if (
            !flightId ||
            flightId === "undefined" ||
            flightId === "null"
        ) {
            setConfirmationError(
                "Flight ID is missing. Return to the booking page and select your flight again."
            );
            return;
        }

        if (selectedSeats.length !== passengerCount) {
            setConfirmationError(
                `Please select ${passengerCount} seat(s).`
            );
            return;
        }

        const token = localStorage.getItem("access_token");

        if (!token) {
            setConfirmationError(
                "Please log in again before confirming your booking."
            );
            return;
        }

        setConfirming(true);
        setConfirmationError("");
        setBookingResults([]);

        const results = [];

        try {
            for (const seatNumber of selectedSeats) {
                const params = new URLSearchParams({
                    flight_id: String(flightId),
                    seats_number: seatNumber,
                });

                const response = await fetch(
                    `${API_URL}/confirm-booking?${params.toString()}`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                // Read the response safely, even if it isn't JSON.
                let data;

                try {
                    data = await response.json();
                } catch {
                    data = {};
                }

                // Debug information for diagnosing failed requests.
                console.log("Booking API status:", response.status);
                console.log(
    "Booking API response:",
    JSON.stringify(data, null, 2)
);

                if (!response.ok) {
                    if (response.status === 409) {
                        throw new Error(
                            `Seat ${seatNumber} has already been booked. Please select another seat.`
                        );
                    }

                    if (
                        response.status === 401 ||
                        response.status === 403
                    ) {
                        throw new Error(
                            "Login session expired or authorization failed. Please log in again."
                        );
                    }

                    const detail = data.detail;

                    throw new Error(
                        typeof detail === "string"
                            ? detail
                            : detail
                                ? JSON.stringify(detail)
                                : `Booking failed with status ${response.status}.`
                    );
                }

                results.push(data);
                setBookingResults([...results]);
            }

            setSelectedSeats([]);
        } catch (error) {
            console.error("Booking confirmation error:", error);

            const partialBookingMessage =
                results.length > 0
                    ? " Some seats were already confirmed. Check your bookings before retrying."
                    : "";

            setConfirmationError(
                (error.message || "Could not save booking.") +
                    partialBookingMessage
            );
        } finally {
            // Refresh availability so booked seats appear unavailable.
            try {
                await fetchSeats();
                setSeatError("");
            } catch (error) {
                console.error("Seat refresh error:", error);

                setSeatError(
                    "Booking attempt finished, but seat availability could not be refreshed. Reload the page."
                );
            }

            setConfirming(false);
        }
    }

    return (
        <div className="booking-page">
            <nav className="booking-navbar">
                <h2 className="booking-brand">
                    <span className="booking-brand-icon">✈</span>
                    FlightFinder
                </h2>
                
                <a href="/my-bookings" className="mybook-home-link">
                    My Bookings
                </a>
                <button className="logout-btn" onClick={logout}>Logout</button>

            </nav>

            <main className="booking-container">
                <header className="booking-heading">
                    <span className="booking-eyebrow">
                        ALMOST READY FOR TAKEOFF
                    </span>

                    <h1>
                        Choose your <span>seats.</span>
                    </h1>

                    <p>
                        Select a seat for each passenger on your flight.
                    </p>
                </header>

                {/* Flight and passenger summary */}
                <section className="booking-flight-card">
                    <div className="booking-card-heading">
                        <div>
                            <span className="booking-section-label">
                                YOUR FLIGHT
                            </span>

                            <h2>{flightNumber || "Selected flight"}</h2>
                        </div>
                    </div>

                    <div className="booking-passenger-list">
                        <div className="booking-passenger-row">
                            <div className="booking-passenger-description">
                                <span className="booking-passenger-icon">
                                    ♙
                                </span>

                                <div>
                                    <strong>Passengers</strong>
                                    <span>
                                        {adults} adult(s), {children} child(ren)
                                    </span>
                                </div>
                            </div>

                            <strong>{passengerCount} seat(s)</strong>
                        </div>
                    </div>
                </section>

                {/* Seat selection */}
                <section className="booking-passenger-card">
                    <div className="booking-card-heading">
                        <div>
                            <span className="booking-section-label">
                                SEAT SELECTION
                            </span>

                            <h2>Pick your seats</h2>
                        </div>

                        <span className="booking-badge">
                            {selectedSeats.length}/{passengerCount} selected
                        </span>
                    </div>

                    <div className="seat-legend">
                        <span>
                            <i className="seat-legend-box seat-available"></i>
                            Available
                        </span>

                        <span>
                            <i className="seat-legend-box seat-selected"></i>
                            Selected
                        </span>

                        <span>
                            <i className="seat-legend-box seat-booked"></i>
                            Booked
                        </span>
                    </div>

                    {loadingSeats && (
                        <p className="seat-status">
                            Loading available seats...
                        </p>
                    )}

                    {seatError && (
                        <div className="booking-error">
                            <strong>Unable to load seats</strong>
                            <p>{seatError}</p>
                        </div>
                    )}

                    {!loadingSeats && !seatError && (
                        <div className="seat-map">
                            <div className="seat-cockpit">
                                ✈ FRONT OF AIRCRAFT
                            </div>

                            <div className="seat-grid">
                                {seats.map((seat) => (
                                    <button
                                        key={
                                            seat.seat_id ??
                                            seat.id ??
                                            seat.seatNumber
                                        }
                                        type="button"
                                        className={[
                                            "seat-button",
                                            selectedSeats.includes(
                                                seat.seatNumber
                                            )
                                                ? "seat-button-selected"
                                                : "",
                                            seat.isBooked
                                                ? "seat-button-booked"
                                                : "",
                                        ].join(" ")}
                                        disabled={
                                            seat.isBooked || confirming
                                        }
                                        onClick={() =>
                                            handleSeatClick(seat)
                                        }
                                        aria-label={`Seat ${seat.seatNumber}`}
                                    >
                                        {seat.seatNumber}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="booking-passenger-note">
                        Choose one seat per passenger.
                    </p>
                </section>

                {/* Selected seat summary */}
                <section className="booking-fare-card">
                    <div className="booking-card-heading">
                        <div>
                            <span className="booking-section-label">
                                YOUR SELECTION
                            </span>

                            <h2>Selected seats</h2>
                        </div>
                    </div>

                    <div className="booking-fare-list">
                        <div className="booking-fare-row">
                            <span>Flight</span>
                            <strong>{flightNumber || "—"}</strong>
                        </div>

                        <div className="booking-fare-row">
                            <span>Seats</span>
                            <strong>
                                {selectedSeats.length
                                    ? selectedSeats.join(", ")
                                    : "None selected"}
                            </strong>
                        </div>

                        <div className="booking-fare-row">
                            <span>Seats remaining</span>
                            <strong>
                                {Math.max(
                                    0,
                                    passengerCount - selectedSeats.length
                                )}
                            </strong>
                        </div>
                    </div>
                </section>

                {/* Booking errors */}
                {confirmationError && (
                    <div className="booking-error">
                        <strong>Booking not completed</strong>
                        <p>{confirmationError}</p>
                    </div>
                )}

                {/* Confirmation references */}
                {bookingResults.length > 0 && (
                    <section className="booking-flight-card">
                        <span className="booking-section-label">
                            CONFIRMATION
                        </span>

                        <h2>Booking confirmation</h2>

                        {bookingResults.map((booking) => (
                            <div
                                className="booking-fare-row"
                                key={booking.booking_reference}
                            >
                                <span>Seat {booking.seats_number}</span>

                                <strong>
                                    {booking.booking_reference}
                                </strong>
                            </div>
                        ))}
                    </section>
                )}

                {/* Actions */}
                <div className="booking-continue-section">
                    <button
                        type="button"
                        className="booking-select-seats-btn"
                        disabled={
                            loadingSeats ||
                            !!seatError ||
                            confirming ||
                            selectedSeats.length !== passengerCount
                        }
                        onClick={handleConfirmBooking}
                    >
                        {confirming
                            ? "Confirming..."
                            : "Confirm Booking"}

                        {!confirming && <span> →</span>}
                    </button>

                    <button
                        type="button"
                        className="booking-back-btn"
                        disabled={confirming}
                        onClick={() => navigate(-1)}
                    >
                        ← Back to booking
                    </button>
                </div>

                <footer className="booking-footer">
                    <span>✈ FlightFinder</span>
                    <span>Every journey begins somewhere.</span>
                </footer>
            </main>
        </div>
    );
}

export default ConfirmBookings;
