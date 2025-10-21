import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "../App.css";
import Header from "../components/Header.js";
import Sidebar from "../components/Sidebar.js";
import CardioAdmin from "../pages/CardioAdmin";
import Login from "../pages/cardioDoctorAuth/Login";
import ForgotPassword from "../pages/cardioDoctorAuth/ForgotPassword";
import OtpVerification from "../pages/cardioDoctorAuth/OtpVerification";
import CreatePassword from "../pages/cardioDoctorAuth/CreatePassword";
import CardiAdminDashboard from "../pages/CardiAdminDashboard";
import CardioAppointment from "../pages/CardioAppointment";
import CardioDoctorAppointment from "../pages/CardioDoctorAppointment";
import CardioDoctorDashboard from "../pages/CardioDoctorDashboard";
import CardioDoctorInventory from "../pages/CardioDoctorInventory";

function AppRoutes() {
  return (
    <Router>
      <div className="main-layout">
        <div className="content">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/doctor-forgot-password" element={<ForgotPassword />} />
        <Route path="/doctor-otp" element={<OtpVerification />} />
        <Route path="/doctor-create-password" element={<CreatePassword />} />
        <Route path="/dashboard" element={<CardiAdminDashboard />} />
        <Route path="/appointments" element={<CardioAppointment />} />
        <Route path="/doctor-appointments" element={<CardioDoctorAppointment />} />
        <Route path="/doctor-dashboard" element={<CardioDoctorDashboard />} />
        <Route path="/doctor-inventory" element={<CardioDoctorInventory />} />
      </Routes>
      </div>
      </div>
    </Router>
  );
}

export default AppRoutes;
