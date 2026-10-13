import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../flights.css";
import { logout } from "../Logout";
const airportCoordinates = {
  CCU: [22.6547, 88.4467],
  BOM: [19.0896, 72.8656],
  DEL: [28.5562, 77.1000],
  BLR: [13.1986, 77.7066],
  MAA: [12.9941, 80.1709],
  HYD: [17.2403, 78.4294],
  DXB: [25.2532, 55.3657],
  AUH: [24.4330, 54.6511],
  DOH: [25.2731, 51.6081],
  RUH: [24.9576, 46.6988],
  JED: [21.6796, 39.1565],
  LHR: [51.4700, -0.4543],
  CDG: [49.0097, 2.5479],
  FRA: [50.0379, 8.5622],
  AMS: [52.3105, 4.7683],
  FCO: [41.8003, 12.2389],
  MAD: [40.4983, -3.5676],
  ZRH: [47.4581, 8.5555],
  IST: [41.2753, 28.7519],
};

const airportOptions = [
  { code: "CCU", city: "Kolkata", name: "Netaji Subhash Chandra Bose International Airport" },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj International Airport" },
  { code: "DEL", city: "Delhi", name: "Indira Gandhi International Airport" },
  { code: "BLR", city: "Bengaluru", name: "Kempegowda International Airport" },
  { code: "MAA", city: "Chennai", name: "Chennai International Airport" },
  { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi International Airport" },
  { code: "DXB", city: "Dubai", name: "Dubai International Airport" },
  { code: "AUH", city: "Abu Dhabi", name: "Zayed International Airport" },
  { code: "DOH", city: "Doha", name: "Hamad International Airport" },
  { code: "RUH", city: "Riyadh", name: "King Khalid International Airport" },
  { code: "JED", city: "Jeddah", name: "King Abdulaziz International Airport" },
  { code: "LHR", city: "London", name: "Heathrow Airport" },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle Airport" },
  { code: "FRA", city: "Frankfurt", name: "Frankfurt Airport" },
  { code: "AMS", city: "Amsterdam", name: "Amsterdam Airport Schiphol" },
  { code: "FCO", city: "Rome", name: "Leonardo da Vinci–Fiumicino Airport" },
  { code: "MAD", city: "Madrid", name: "Adolfo Suárez Madrid–Barajas Airport" },
  { code: "ZRH", city: "Zurich", name: "Zurich Airport" },
  { code: "IST", city: "Istanbul", name: "Istanbul Airport" },
];

const airlineLogoCodes = {
  "Cathay Pacific": "CX",
  "Thomas Cook": "TC",
  Indigo: "6E",
  "Air india": "AI",
  "Air India": "AI",
  "Air India Express": "IX",
  "Akasa Air": "QP",
  Spicejet: "SG",
  "Alliance Air": "9I",
  Emirates: "EK",
  "Qatar Airways": "QR",
  "Singapore Airlines": "SQ",
  Lufthansa: "LH",
  "British Airways": "BA",
};

function AirportAutocomplete({ label, placeholder, onSelect }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredAirports = airportOptions.filter((airport) =>
    `${airport.city} ${airport.name} ${airport.code}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );

  function chooseAirport(airport) {
    setQuery(`${airport.city} (${airport.code})`);
    onSelect(airport.code);
    setIsOpen(false);
  }

  return (
    <div className="input-group airport-autocomplete">
      <label>{label}</label>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        required
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onChange={(event) => {
          setQuery(event.target.value);
          onSelect("");
          setIsOpen(true);
        }}
      />

      {isOpen && query.trim() !== "" && (
        <div className="airport-suggestions">
          {filteredAirports.length > 0 ? (
            filteredAirports.map((airport) => (
              <button
                type="button"
                className="airport-option"
                key={airport.code}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => chooseAirport(airport)}
              >
                <span className="airport-option-icon" aria-hidden="true">
                  ✈
                </span>
                <span className="airport-option-details">
                  <strong>{airport.city}</strong>
                  <small>{airport.name}</small>
                </span>
                <span className="airport-option-code">{airport.code}</span>
              </button>
            ))
          ) : (
            <p className="airport-no-results">No matching airport found.</p>
          )}
        </div>
      )}
    </div>
  );
}

function FitRouteBounds({ route }) {
  const map = useMap();

  useEffect(() => {
    if (route.length === 2) {
      map.fitBounds(route, { padding: [40, 40] });
    }
  }, [map, route]);

  return null;
}

function AirlineLogo({ airline }) {
  const [imageFailed, setImageFailed] = useState(false);
  const normalizedAirline = (airline || "").trim();

  const matchingAirlineName = Object.keys(airlineLogoCodes).find(
    (name) => name.toLowerCase() === normalizedAirline.toLowerCase()
  );

  const logoCode =
    airlineLogoCodes[normalizedAirline] ||
    (matchingAirlineName ? airlineLogoCodes[matchingAirlineName] : null);

  const initials = normalizedAirline
    ? normalizedAirline
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : "✈";

  return (
    <div className="airline-logo-wrap">
      {!imageFailed && logoCode ? (
        <img
          className="airline-logo"
          src={`https://images.kiwi.com/airlines/64/${logoCode}.png`}
          alt={`${normalizedAirline} logo`}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span
          className="airline-logo-fallback"
          aria-label={`${normalizedAirline} initials`}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

function Flights() {
  const navigate=useNavigate()
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const sourceCode = source.trim().toUpperCase();
  const destinationCode = destination.trim().toUpperCase();
  const sourceCoordinates = airportCoordinates[sourceCode];
  const destinationCoordinates = airportCoordinates[destinationCode];

  const route =
    sourceCoordinates && destinationCoordinates
      ? [sourceCoordinates, destinationCoordinates]
      : [];

  async function searchFlights(event) {
    event.preventDefault();

    if (!sourceCode || !destinationCode) {
      setError(
        "Please select both departure and destination airports from the suggestions."
      );
      setFlights([]);
      setSearched(false);
      return;
    }

    if (sourceCode === destinationCode) {
      setError("Departure and destination airports must be different.");
      setFlights([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError("");
    setFlights([]);
    setSearched(false);

    try {
      const params = new URLSearchParams({
        source: sourceCode,
        destination: destinationCode,
        date,
      });

      const response = await fetch(
        `https://flightfinder-d0ze.onrender.com/flights?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to search flights.");
      }

      if (data.message) {
        setFlights([]);
      } else if (Array.isArray(data)) {
        setFlights(data);
      } else {
        setFlights([]);
      }

      setSearched(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flights-page">
      <nav className="navbar">
        <h2>✈ FlightFinder</h2>
        <span>Explore the world, one flight at a time.</span>
        
        <a href="/my-bookings" className="mybook-home-link">
        My Bookings
        </a>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </nav>

      <section className="flight-hero">
        <div className="hero-heading">
          <span className="hero-tag">YOUR JOURNEY STARTS HERE</span>
          <h1>
            Where will you <span>fly next?</span>
          </h1>
          <p>Discover routes, compare fares, and plan your next adventure.</p>
        </div>

        <form className="search-form" onSubmit={searchFlights}>
          <AirportAutocomplete
            label="FROM"
            placeholder="Search city or airport..."
            onSelect={setSource}
          />

          <AirportAutocomplete
            label="TO"
            placeholder="Search city or airport..."
            onSelect={setDestination}
          />

          <div className="input-group">
            <label htmlFor="departure-date">DEPARTURE DATE</label>
            <input
              id="departure-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>

          <button className="search-button" type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search Flights →"}
          </button>
        </form>

        {error && <p className="flight-error">{error}</p>}
        {loading && <p className="flight-status">Finding your flights...</p>}
      </section>

      {searched && !loading && !error && (
        <main className="flight-content">
          <section className="route-section">
            <div className="section-heading">
              <div>
                <span className="section-eyebrow">YOUR ROUTE</span>
                <h2>Explore your journey</h2>
              </div>
              <span className="route-badge">
                {sourceCode} → {destinationCode}
              </span>
            </div>

            {route.length === 2 ? (
              <div className="route-map">
                <MapContainer
                  key={`${sourceCode}-${destinationCode}`}
                  center={[
                    (sourceCoordinates[0] + destinationCoordinates[0]) / 2,
                    (sourceCoordinates[1] + destinationCoordinates[1]) / 2,
                  ]}
                  zoom={5}
                  scrollWheelZoom={true}
                  className="world-map"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Polyline
                    positions={route}
                    pathOptions={{
                      color: "#2563eb",
                      weight: 4,
                      opacity: 0.85,
                      dashArray: "8 10",
                    }}
                  />

                  <CircleMarker
                    center={sourceCoordinates}
                    radius={8}
                    pathOptions={{
                      color: "#ffffff",
                      weight: 3,
                      fillColor: "#16a34a",
                      fillOpacity: 1,
                    }}
                  >
                    <Tooltip permanent direction="top">
                      {sourceCode} · Departure
                    </Tooltip>
                  </CircleMarker>

                  <CircleMarker
                    center={destinationCoordinates}
                    radius={8}
                    pathOptions={{
                      color: "#ffffff",
                      weight: 3,
                      fillColor: "#ef4444",
                      fillOpacity: 1,
                    }}
                  >
                    <Tooltip permanent direction="top">
                      {destinationCode} · Destination
                    </Tooltip>
                  </CircleMarker>

                  <FitRouteBounds route={route} />
                </MapContainer>
              </div>
            ) : (
              <div className="map-notice">
                <h3>Map coordinates not added yet</h3>
                <p>
                  The route map currently supports selected airport codes. We
                  can add coordinates for {sourceCode} and {destinationCode} to
                  display this route.
                </p>
              </div>
            )}
          </section>

          <section className="results-section">
            <div className="section-heading">
              <div>
                <span className="section-eyebrow">FLIGHT OPTIONS</span>
                <h2>Available flights</h2>
              </div>
              <span className="results-count">
                {flights.length} {flights.length === 1 ? "flight" : "flights"}
              </span>
            </div>

            {flights.length === 0 ? (
              <div className="empty-results">
                <span className="empty-plane">✈</span>
                <h3>No flights found</h3>
                <p>Try another date or airport route.</p>
              </div>
            ) : (
              <div className="flight-list">
                {flights.map((flight, index) => (
                  <article
                    className="flight-card"
                    key={`${flight.FlightNo}-${index}`}
                  >
                    <div className="airline-info">
                      <AirlineLogo airline={flight.airline} />
                      <div>
                        <h3>{flight.airline}</h3>
                        <p>{flight.FlightNo}</p>
                      </div>
                    </div>

                    <div className="flight-route">
                      <strong>{flight.source}</strong>
                      <span className="flight-line">
                        <span />
                        ✈
                        <span />
                      </span>
                      <strong>{flight.destination}</strong>
                    </div>

                    <div className="flight-price">
                      <span>PRICE / PERSON</span>
                      <h3>
                        ₹{Number(flight.price).toLocaleString("en-IN")}
                      </h3>
                    </div>

                    <button
                      className="select-flight-button"
                      type="button"
                      onClick={() =>
                        navigate(
                            `/booking?flight_number=${encodeURIComponent(
                                flight.FlightNo
                            )}&source=${encodeURIComponent(
                                flight.source
                            )}&destination=${encodeURIComponent(
                                flight.destination
                            )}`
                        )
                    }
                    >
                      Select Flight →
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      <footer className="flights-footer">
        <span>✈ FlightFinder</span>
        <span>Find your route. Begin your journey.</span>
      </footer>
    </div>
  );
}

export default Flights;