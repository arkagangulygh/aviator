
import { useEffect, useState } from "react";
import "../MyBookings.css";
import { logout } from "../Logout";
const API_URL = "https://flightfinder-d0ze.onrender.com";

const airlineLogos = {
  "cathay pacific": "https://images.kiwi.com/airlines/64/CX.png",
  "thomas cook": "https://images.kiwi.com/airlines/64/MT.png",
  "indigo": "https://images.kiwi.com/airlines/64/6E.png",
  "air india": "https://images.kiwi.com/airlines/64/AI.png",
  "air india express": "https://images.kiwi.com/airlines/64/IX.png",
  "akasa air": "https://images.kiwi.com/airlines/64/QP.png",
  "spicejet": "https://images.kiwi.com/airlines/64/SG.png",
  "alliance air": "https://images.kiwi.com/airlines/64/9I.png",
  "emirates": "https://images.kiwi.com/airlines/64/EK.png",
  "qatar airways": "https://images.kiwi.com/airlines/64/QR.png",
  "singapore airlines": "https://images.kiwi.com/airlines/64/SQ.png",
  "lufthansa": "https://images.kiwi.com/airlines/64/LH.png",
  "british airways": "https://images.kiwi.com/airlines/64/BA.png",
};

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancelling, setCancelling] = useState("");

  async function fetchBookings() {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Please log in to view your bookings.");
        return;
      }

      const response = await fetch(`${API_URL}/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Could not fetch bookings (${response.status}).`);
      }

      setBookings(await response.json());
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  async function handleCancel(reference) {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setCancelling(reference);
      setMessage("");

      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/cancel-booking?booking_reference=${encodeURIComponent(reference)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not cancel booking.");
      }

      setMessage("Your booking was cancelled successfully.");
      await fetchBookings();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setCancelling("");
    }
  }

  if (loading) {
    return (
      <div className="mybook-page">
        <p>Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mybook-page">
        <p className="mybook-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="mybook-page">
      <header className="mybook-navbar">
        <a className="mybook-brand" href="/">
          <span>✈</span> FlightFinder
        </a>
        <a className="mybook-home-link" href="/">
          Home
        </a>
      </header>

      <main className="mybook-container">
        <div className="mybook-heading">
          <span className="mybook-eyebrow">YOUR JOURNEY, YOUR WAY</span>
          <h1>
            My Bookings<span>.</span>
          </h1>
          <p>All your trips, together in one place.</p>
        </div>

        {message && <div className="mybook-message">{message}</div>}

        <div className="mybook-count">
          <span>Your reservations</span>
          <span className="mybook-count-number">{bookings.length}</span>
        </div>

        {bookings.length === 0 ? (
          <div className="mybook-empty">
            <div className="mybook-empty-icon">✈</div>
            <h2>No bookings yet</h2>
            <p>Your next adventure is waiting to be booked.</p>
            <a href="/flights" className="mybook-explore-btn">
              Explore flights →
            </a>
          </div>
        ) : (
          <div className="mybook-list">
            {bookings.map((booking) => {
              const cancelled = booking.status !== "CONFIRMED";

              const normalizedAirline = (booking.airline || "")
                .trim()
                .toLowerCase()
                .replace(/\s+/g, " ");

              const logoUrl = airlineLogos[normalizedAirline];

              return (
                <article
                  className="mybook-card"
                  key={booking.booking_reference}
                >
                  <div className="mybook-card-top">
                    <div className="mybook-airline">
                      <div className="mybook-plane-icon">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={`${booking.airline} logo`}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span>✈</span>
                        )}
                      </div>

                      <div>
                        <h3>{booking.airline || "Your airline"}</h3>
                        <p>Flight {booking.flight_number}</p>
                      </div>
                    </div>

                    <span
                      className={`mybook-status ${
                        cancelled ? "cancelled" : ""
                      }`}
                    >
                      <span className="mybook-status-dot"></span>
                      {booking.status}
                    </span>
                  </div>

                  <div className="mybook-route">
                    <div className="mybook-location">
                      <span className="mybook-code">
                        {booking.source_code || "FROM"}
                      </span>
                      <span className="mybook-city">
                        {booking.source_city ||
                          booking.source_airport ||
                          "Departure"}
                      </span>
                    </div>

                    <div className="mybook-route-middle">
                      <span className="mybook-route-line"></span>
                      <span className="mybook-route-plane">✈</span>
                      <span className="mybook-route-label">YOUR FLIGHT</span>
                    </div>

                    <div className="mybook-location destination">
                      <span className="mybook-code">
                        {booking.destination_code || "TO"}
                      </span>
                      <span className="mybook-city">
                        {booking.destination_city ||
                          booking.destination_airport ||
                          "Arrival"}
                      </span>
                    </div>
                  </div>

                  <div className="mybook-divider"></div>

                  <div className="mybook-details">
                    <div>
                      <span className="mybook-detail-label">
                        BOOKING REFERENCE
                      </span>
                      <strong className="mybook-reference">
                        {booking.booking_reference}
                      </strong>
                    </div>

                    <div>
                      <span className="mybook-detail-label">SEAT</span>
                      <strong>{booking.seat || "—"}</strong>
                    </div>

                    <div>
                      <span className="mybook-detail-label">FARE</span>
                      <strong>
                        {booking.price != null
                          ? `₹${Number(booking.price).toLocaleString("en-IN")}`
                          : "—"}
                      </strong>
                    </div>
                  </div>

                  {!cancelled && (
                    <div className="mybook-card-actions">
                      <button
                        className="mybook-cancel-btn"
                        onClick={() =>
                          handleCancel(booking.booking_reference)
                        }
                        disabled={cancelling !== ""}
                      >
                        {cancelling === booking.booking_reference
                          ? "Cancelling..."
                          : "Cancel booking"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer className="mybook-footer">
        FlightFinder <span>·</span> Your journey begins here.
      </footer>
    </div>
  );
}

export default MyBookings;
