
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Flights from "./pages/Flights";
import Booking from "./pages/Booking";
import Confirmbookings from "./pages/Confirmbookings";
import MyBookings from "./pages/MyBookings";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/flights" element={<Flights />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/confirmbookings" element={<Confirmbookings />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
