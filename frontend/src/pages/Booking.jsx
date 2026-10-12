
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    Tooltip,
    useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "../Booking.css";
import { logout } from "../Logout";

const API_URL = "https://flightfinder-d0ze.onrender.com";

// Airport coordinates reused from Flights.jsx
const airportCoordinates = {
    CCU: [22.6547, 88.4467],
    BOM: [19.0896, 72.8656],
    DEL: [28.5562, 77.1],
    BLR: [13.1986, 77.7066],
    MAA: [12.9941, 80.1709],
    HYD: [17.2403, 78.4294],
    DXB: [25.2532, 55.3657],
    AUH: [24.433, 54.6511],
    DOH: [25.2731, 51.6081],
    RUH: [24.9576, 46.6988],
    JED: [21.6796, 39.1565],
    LHR: [51.47, -0.4543],
    CDG: [49.0097, 2.5479],
    FRA: [50.0379, 8.5622],
    AMS: [52.3105, 4.7683],
    FCO: [41.8003, 12.2389],
    MAD: [40.4983, -3.5676],
    ZRH: [47.4581, 8.5555],
    IST: [41.2753, 28.7519],
};

const airportOptions = [
    {
        code: "CCU",
        city: "Kolkata",
        name: "Netaji Subhash Chandra Bose International Airport",
    },
    {
        code: "BOM",
        city: "Mumbai",
        name: "Chhatrapati Shivaji Maharaj International Airport",
    },
    {
        code: "DEL",
        city: "Delhi",
        name: "Indira Gandhi International Airport",
    },
    {
        code: "BLR",
        city: "Bengaluru",
        name: "Kempegowda International Airport",
    },
    {
        code: "MAA",
        city: "Chennai",
        name: "Chennai International Airport",
    },
    {
        code: "HYD",
        city: "Hyderabad",
        name: "Rajiv Gandhi International Airport",
    },
    {
        code: "DXB",
        city: "Dubai",
        name: "Dubai International Airport",
    },
    {
        code: "AUH",
        city: "Abu Dhabi",
        name: "Zayed International Airport",
    },
    {
        code: "DOH",
        city: "Doha",
        name: "Hamad International Airport",
    },
    {
        code: "RUH",
        city: "Riyadh",
        name: "King Khalid International Airport",
    },
    {
        code: "JED",
        city: "Jeddah",
        name: "King Abdulaziz International Airport",
    },
    {
        code: "LHR",
        city: "London",
        name: "Heathrow Airport",
    },
    {
        code: "CDG",
        city: "Paris",
        name: "Charles de Gaulle Airport",
    },
    {
        code: "FRA",
        city: "Frankfurt",
        name: "Frankfurt Airport",
    },
    {
        code: "AMS",
        city: "Amsterdam",
        name: "Amsterdam Airport Schiphol",
    },
    {
        code: "FCO",
        city: "Rome",
        name: "Leonardo da Vinci–Fiumicino Airport",
    },
    {
        code: "MAD",
        city: "Madrid",
        name: "Adolfo Suárez Madrid–Barajas Airport",
    },
    {
        code: "ZRH",
        city: "Zurich",
        name: "Zurich Airport",
    },
    {
        code: "IST",
        city: "Istanbul",
        name: "Istanbul Airport",
    },
];

const airlineLogoCodes = {
    Indigo: "6E",
    IndiGo: "6E",
    "Air India": "AI",
    Emirates: "EK",
    "Qatar Airways": "QR",
    Lufthansa: "LH",
    "British Airways": "BA",
    "Cathay Pacific": "CX",
    "Singapore Airlines": "SQ",
    "Etihad Airways": "EY",
    "Air France": "AF",
    KLM: "KL",
    "Turkish Airlines": "TK",
    Vistara: "UK",
    SpiceJet: "SG",
    AirAsia: "AK",
};

function formatPrice(price) {
    const amount = Number(price);

    if (!Number.isFinite(amount)) return "—";

    return amount.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
    });
}

function formatDate(date) {
    if (!date) return "—";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatTime(time) {
    if (!time) return "—";

    const parts = time.split(":");

    if (parts.length < 2) return time;

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
        return time;
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

// The map now receives coordinates for the selected flight.
function BookingMap({
    departurePosition,
    arrivalPosition,
    sourceCode,
    destinationCode,
}) {
    const map = useMap();

    useEffect(() => {
        if (departurePosition && arrivalPosition) {
            map.fitBounds(
                [departurePosition, arrivalPosition],
                { padding: [40, 40] }
            );
        }
    }, [map, departurePosition, arrivalPosition]);

    return (
        <>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={departurePosition}>
                <Tooltip permanent direction="top">
                    {sourceCode} · Departure
                </Tooltip>
            </Marker>

            <Marker position={arrivalPosition}>
                <Tooltip permanent direction="top">
                    {destinationCode} · Destination
                </Tooltip>
            </Marker>

            <Polyline
                positions={[departurePosition, arrivalPosition]}
                pathOptions={{
                    color: "#2563eb",
                    weight: 4,
                    dashArray: "8 8",
                }}
            />
        </>
    );
}

function Booking() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const flightnumber = searchParams.get("flight_number");

    // These codes are passed from Flights.jsx when a flight is selected.
    const sourceCode = (
        searchParams.get("source") || ""
    ).trim().toUpperCase();

    const destinationCode = (
        searchParams.get("destination") || ""
    ).trim().toUpperCase();

    const sourceAirport = airportOptions.find(
        (airport) => airport.code === sourceCode
    );

    const destinationAirport = airportOptions.find(
        (airport) => airport.code === destinationCode
    );

    const departurePosition = airportCoordinates[sourceCode];
    const arrivalPosition = airportCoordinates[destinationCode];

    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [flightDetails, setFlightDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [logoError, setLogoError] = useState(false);

    useEffect(() => {
        if (!flightnumber) {
            setFlightDetails(null);
            setError(
                "No flight number was provided. Please select a flight first."
            );
            return;
        }

        const controller = new AbortController();

        async function getFlightDetails() {
            setLoading(true);
            setError("");

            try {
                const params = new URLSearchParams({
                    flight_number: flightnumber,
                    adults: String(adults),
                    children: String(children),
                });

                const response = await fetch(
                    `${API_URL}/booking?${params.toString()}`,
                    { signal: controller.signal }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || "Unable to fetch flight details."
                    );
                }

                setFlightDetails(data);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setFlightDetails(null);
                    setError(err.message || "Something went wrong.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        getFlightDetails();

        return () => controller.abort();
    }, [flightnumber, adults, children]);

    useEffect(() => {
        setLogoError(false);
    }, [flightDetails?.airline]);

    const airlineName = flightDetails?.airline || "Your airline";
    const logoCode = airlineLogoCodes[airlineName];

    const logoUrl = logoCode
        ? `https://images.kiwi.com/airlines/64/${logoCode}.png`
        : null;

    const sourceDisplay = sourceAirport
        ? `${sourceAirport.city} (${sourceAirport.code})`
        : flightDetails?.source != null
            ? `Airport ${flightDetails.source}`
            : "Departure";

    const destinationDisplay = destinationAirport
        ? `${destinationAirport.city} (${destinationAirport.code})`
        : flightDetails?.destination != null
            ? `Airport ${flightDetails.destination}`
            : "Arrival";

    const hasMapRoute = Boolean(
        departurePosition && arrivalPosition
    );

    return (
        <div className="booking-page">
            <nav className="booking-navbar">
                <h2 className="booking-brand">
                    <span className="booking-brand-icon">✈</span>
                    FlightFinder
                </h2>

                <div className="booking-nav-right">
                    <span className="booking-secure-label">
                        <span className="booking-secure-dot">●</span>
                        Your journey starts here
                    </span>
                    
                    <a href="/my-bookings" className="mybook-home-link">
                    My Bookings
                    </a>
                    <button className="logout-btn" onClick={logout}>Logout</button>
                </div>
            </nav>

            <main className="booking-container">
                <header className="booking-heading">
                    <span className="booking-eyebrow">
                        YOUR NEXT ADVENTURE
                    </span>

                    <h1>
                        Complete your <span>booking.</span>
                    </h1>

                    <p>
                        Review your flight, choose your passengers, and
                        check your fare before continuing.
                    </p>
                </header>

                {loading && (
                    <div className="booking-status">
                        <span className="booking-spinner"></span>
                        Updating your flight and fare details...
                    </div>
                )}

                {error && (
                    <div className="booking-error">
                        <strong>Unable to load booking details</strong>
                        <p>{error}</p>
                    </div>
                )}

                {!error && flightDetails && (
                    <>
                        <section className="booking-flight-card">
                            <div className="booking-card-heading">
                                <div>
                                    <span className="booking-section-label">
                                        FLIGHT SUMMARY
                                    </span>
                                    <h2>Your selected flight</h2>
                                </div>

                                <span className="booking-badge">
                                    {flightDetails.flight_number}
                                </span>
                            </div>

                            <div className="booking-airline-info">
                                <div className="booking-airline-logo">
                                    {logoUrl && !logoError && (
                                        <img
                                            src={logoUrl}
                                            alt={`${airlineName} logo`}
                                            onError={() => setLogoError(true)}
                                        />
                                    )}

                                    {(!logoUrl || logoError) && (
                                        <span className="booking-logo-fallback">
                                            {airlineName
                                                .split(" ")
                                                .map((word) => word[0])
                                                .join("")
                                                .slice(0, 3)
                                                .toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div className="booking-airline-text">
                                    <h3>{airlineName}</h3>
                                    <p>
                                        Flight {flightDetails.flight_number}
                                    </p>
                                </div>

                                <div className="booking-trip-tag">
                                    <span>✦</span> Selected flight
                                </div>
                            </div>

                            <div className="booking-journey">
                                <div className="booking-airport">
                                    <span className="booking-airport-label">
                                        FROM
                                    </span>

                                    <h3>{sourceDisplay}</h3>

                                    {sourceAirport && (
                                        <p>{sourceAirport.name}</p>
                                    )}

                                    <p className="booking-time">
                                        {formatTime(
                                            flightDetails.departure_time
                                        )}
                                    </p>

                                    <p>
                                        {formatDate(
                                            flightDetails.departure_date
                                        )}
                                    </p>
                                </div>

                                <div className="booking-route-visual">
                                    <span className="booking-route-caption">
                                        YOUR JOURNEY
                                    </span>

                                    <div className="booking-route-line">
                                        <span className="booking-plane-icon">
                                            ✈
                                        </span>
                                    </div>

                                    <span className="booking-route-caption">
                                        Flight route
                                    </span>
                                </div>

                                <div className="booking-airport booking-arrival">
                                    <span className="booking-airport-label">
                                        TO
                                    </span>

                                    <h3>{destinationDisplay}</h3>

                                    {destinationAirport && (
                                        <p>{destinationAirport.name}</p>
                                    )}

                                    <p className="booking-time">
                                        {formatTime(
                                            flightDetails.arrival_time
                                        )}
                                    </p>

                                    <p>
                                        {formatDate(
                                            flightDetails.arrival_date
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="booking-flight-meta">
                                <div className="booking-meta-item">
                                    <span>Departure</span>
                                    <strong>
                                        {formatDate(
                                            flightDetails.departure_date
                                        )}
                                    </strong>
                                </div>

                                <div className="booking-meta-item">
                                    <span>Arrival</span>
                                    <strong>
                                        {formatDate(
                                            flightDetails.arrival_date
                                        )}
                                    </strong>
                                </div>
                            </div>

                            {(!sourceAirport || !destinationAirport) && (
                                <p className="booking-airport-note">
                                    Airport names are shown when the selected
                                    airport codes are available.
                                </p>
                            )}
                        </section>

                        <section className="booking-map-section">
                            <div className="booking-map-heading">
                                <div>
                                    <span className="booking-section-label">
                                        YOUR ROUTE
                                    </span>

                                    <h2>Explore your journey</h2>

                                    <p>
                                        View your selected flight route on
                                        the interactive map.
                                    </p>
                                </div>

                                <span className="booking-map-pin">✈</span>
                            </div>

                            <div className="booking-map">
                                {hasMapRoute ? (
                                    <MapContainer
                                        key={`${sourceCode}-${destinationCode}`}
                                        center={[
                                            (departurePosition[0] +
                                                arrivalPosition[0]) / 2,
                                            (departurePosition[1] +
                                                arrivalPosition[1]) / 2,
                                        ]}
                                        zoom={5}
                                        scrollWheelZoom={false}
                                        style={{
                                            height: "100%",
                                            width: "100%",
                                        }}
                                    >
                                        <BookingMap
                                            departurePosition={departurePosition}
                                            arrivalPosition={arrivalPosition}
                                            sourceCode={sourceCode}
                                            destinationCode={destinationCode}
                                        />
                                    </MapContainer>
                                ) : (
                                    <div className="booking-map-note">
                                        <p>
                                            Route coordinates are not available
                                            for this flight. Please select a
                                            flight from the Flights page so its
                                            airport codes are passed here.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {hasMapRoute && (
                                <div className="booking-map-legend">
                                    <span>
                                        <span className="booking-legend-dot booking-departure-dot"></span>
                                        Departure
                                    </span>

                                    <span>
                                        <span className="booking-legend-dot booking-arrival-dot"></span>
                                        Destination
                                    </span>
                                </div>
                            )}

                            <p className="booking-map-note">
                                Map positions use the airport coordinates
                                configured in FlightFinder.
                            </p>
                        </section>

                        <section className="booking-passenger-card">
                            <div className="booking-card-heading">
                                <div>
                                    <span className="booking-section-label">
                                        TRAVELLERS
                                    </span>
                                    <h2>Who's flying?</h2>
                                </div>

                                <span className="booking-badge">
                                    {adults + children}{" "}
                                    {adults + children === 1
                                        ? "Passenger"
                                        : "Passengers"}
                                </span>
                            </div>

                            <div className="booking-passenger-list">
                                <div className="booking-passenger-row">
                                    <div className="booking-passenger-description">
                                        <span className="booking-passenger-icon">
                                            ♙
                                        </span>

                                        <div>
                                            <strong>Adults</strong>
                                            <span>Age 12 and above</span>
                                        </div>
                                    </div>

                                    <div className="booking-counter">
                                        <button
                                            type="button"
                                            aria-label="Remove an adult"
                                            disabled={adults <= 1 || loading}
                                            onClick={() =>
                                                setAdults(
                                                    Math.max(1, adults - 1)
                                                )
                                            }
                                        >
                                            −
                                        </button>

                                        <span>{adults}</span>

                                        <button
                                            type="button"
                                            aria-label="Add an adult"
                                            disabled={loading}
                                            onClick={() =>
                                                setAdults(adults + 1)
                                            }
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="booking-passenger-row">
                                    <div className="booking-passenger-description">
                                        <span className="booking-passenger-icon booking-child-icon">
                                            ♧
                                        </span>

                                        <div>
                                            <strong>Children</strong>
                                            <span>Under 12 years</span>
                                        </div>
                                    </div>

                                    <div className="booking-counter">
                                        <button
                                            type="button"
                                            aria-label="Remove a child"
                                            disabled={children <= 0 || loading}
                                            onClick={() =>
                                                setChildren(
                                                    Math.max(0, children - 1)
                                                )
                                            }
                                        >
                                            −
                                        </button>

                                        <span>{children}</span>

                                        <button
                                            type="button"
                                            aria-label="Add a child"
                                            disabled={loading}
                                            onClick={() =>
                                                setChildren(children + 1)
                                            }
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <p className="booking-passenger-note">
                                Your fare updates automatically when you
                                change the number of passengers.
                            </p>
                        </section>

                        <section className="booking-fare-card">
                            <div className="booking-card-heading">
                                <div>
                                    <span className="booking-section-label">
                                        PRICE BREAKDOWN
                                    </span>
                                    <h2>Your trip total</h2>
                                </div>

                                <span className="booking-fare-icon">₹</span>
                            </div>

                            <div className="booking-fare-list">
                                <div className="booking-fare-row">
                                    <span>
                                        Adult fare × {flightDetails.adults}
                                    </span>

                                    <strong>
                                        ₹
                                        {formatPrice(
                                            Number(flightDetails.adult_price) *
                                                Number(flightDetails.adults)
                                        )}
                                    </strong>
                                </div>

                                {Number(flightDetails.children) > 0 && (
                                    <div className="booking-fare-row">
                                        <span>
                                            Child fare ×{" "}
                                            {flightDetails.children}
                                        </span>

                                        <strong>
                                            ₹
                                            {formatPrice(
                                                Number(
                                                    flightDetails.child_price
                                                ) *
                                                    Number(
                                                        flightDetails.children
                                                    )
                                            )}
                                        </strong>
                                    </div>
                                )}

                                <hr className="booking-fare-divider" />

                                <div className="booking-fare-row booking-total-row">
                                    <div>
                                        <strong>Total fare</strong>

                                        <span className="booking-total-caption">
                                            {adults + children} passenger
                                            {adults + children !== 1
                                                ? "s"
                                                : ""}
                                        </span>
                                    </div>

                                    <strong className="booking-total-price">
                                        ₹
                                        {formatPrice(
                                            flightDetails.total_price
                                        )}
                                    </strong>
                                </div>
                            </div>

                            <div className="booking-fare-note">
                                <span className="booking-fare-check">✓</span>
                                Fare calculated by FlightFinder. The total
                                shown is returned by the booking API.
                            </div>
                        </section>
                    </>
                )}

                
<div className="booking-continue-section">
    <button
        type="button"
        className="booking-select-seats-btn"
        disabled={
            !flightDetails ||
            loading ||
            !!error ||
            flightDetails.flight_id == null
        }
        onClick={() => {
            const params = new URLSearchParams({
                flight_number: flightDetails.flight_number,
                source: sourceCode,
                destination: destinationCode,
                flight_id: String(flightDetails.flight_id),
                adults: String(adults),
                children: String(children),
            });

            navigate(`/confirmbookings?${params.toString()}`);
        }}
    >
        Select Seats <span>→</span>
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

export default Booking;
