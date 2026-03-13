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
import PatientList from "./pages/doctorpages/D-PatientList";
import AdminPatientList from "./pages/adminpages/A-PatientList";
import Settings from "./pages/doctorpages/Settings";
import AdminLogin from "./pages/cardioadminauth/AdminLogin";
import AdminOtpVerification from "./pages/cardioadminauth/AdminOtpVerification";
import AdminCreatePassword from "./pages/cardioadminauth/AdminCreatePassword";
import AdminDashboard from "./pages/adminpages/A-Dashboard";  
import AdminAppointment from "./pages/adminpages/A-Appointment";  
import AdminPatientDetail from "./pages/adminpages/A-PatientDetail";  
import AdminOnSpot from "./pages/adminpages/A-OnSpotRegister";
import AdminFrontDesk from "./pages/adminpages/A-FrontDesk";
import DoctorAdmission from "./pages/doctorpages/D-Admission";
import DoctorAdmissionDetail from "./pages/doctorpages/D-AdmissonDetail";
import DoctorOnBoardRegister from "./pages/doctorpages/D-OnBoardRegister";
import DoctorReport from "./pages/doctorpages/D-Report";

function App() {
  return (
    <div className="App">
      <Router>
      <Routes>
        <Route path="/" element={<Login />} />
         <Route path="/doctor-forgotpassword" element={<ForgotPassword />} />
        <Route path="/doctor-otp" element={<OtpVerification />} />
        <Route path="/doctordashboard" element={<Doctordashboard />} />
        <Route path="/doctoradmission" element={<DoctorAdmission />} />
        <Route path="/doctoradmissiondetail" element={<DoctorAdmissionDetail />} />
        <Route path="/doctoronboardregister" element={<DoctorOnBoardRegister />} />
        <Route path="/adminonspotregister" element={<AdminOnSpot />} />
        <Route path="/doctorreport" element={<DoctorReport />} />
        <Route path="/patientlist" element={<PatientList />} />
        <Route path="/adminpatientlist" element={<AdminPatientList />} />
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
        <Route path="/adminfrontdesk" element={<AdminFrontDesk />} />
      </Routes>
      </Router>
    </div>
  );
}

export default App;
