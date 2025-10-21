import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Admindashboard from './pages/adminpages/A-Dashboard'
import Doctordashboard from './pages/doctorpages/D-Dashboard'
import Appointment from './pages/doctorpages/Appointment'
import Login from './pages/cardiodoctorauth/Login'
import ForgotPassword from './pages/cardiodoctorauth/ForgotPassword'
import OtpVerification from './pages/cardiodoctorauth/OtpVerification'
import CreatePassword from './pages/cardiodoctorauth/CreatePassword'
import PatientDetail from "./pages/doctorpages/D-PatientDetail";
import Settings from "./pages/doctorpages/Settings";
import AdminLogin from "./pages/cardioadminauth/AdminLogin";
import AdminOtpVerification from "./pages/cardioadminauth/AdminOtpVerification";
import AdminCreatePassword from "./pages/cardioadminauth/AdminCreatePassword";
import AdminDashboard from "./pages/adminpages/A-Dashboard";  
import AdminAppointment from "./pages/adminpages/A-Appointment";  
import AdminPatientDetail from "./pages/adminpages/A-PatientDetail";  

function App() {
  return (
    <div className="App">
      <Router>
      <Routes>
        <Route path="/" element={<Login />} />
         <Route path="/doctor-forgotpassword" element={<ForgotPassword />} />
        <Route path="/doctor-otp" element={<OtpVerification />} />
        <Route path="/doctordashboard" element={<Doctordashboard />} />
        {/* <Route path="/doctor-createpassword" element={<CreatePassword />} /> */}
        <Route path="/createpassword" element={<CreatePassword />} />
        <Route path="/appointment" element={<Appointment />} />
        <Route path="/patient-detail" element={<PatientDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/admin-otp" element={<AdminOtpVerification />} />
        <Route path="/admin-createpassword" element={<AdminCreatePassword />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/adminappointment" element={<AdminAppointment />} />
        <Route path="/adminpatient-detail" element={<AdminPatientDetail />} /> 
      </Routes>
      </Router>
    </div>
  );
}

export default App;
