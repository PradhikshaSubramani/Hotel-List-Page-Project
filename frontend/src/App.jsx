import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Notification from './components/Notification';
import HotelList from './pages/HotelList';
import HotelFormPage from './pages/HotelFormPage';
import HotelDetails from './pages/HotelDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminBookings from './pages/AdminBookings';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HotelList />} />
            <Route path="/add" element={<HotelFormPage />} />
            <Route path="/edit/:id" element={<HotelFormPage />} />
            <Route path="/hotels/:id" element={<HotelDetails />} />
            <Route path="/bookings" element={<AdminBookings />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
        <Footer />
        <Notification />
      </div>
    </Router>
  );
}

export default App;