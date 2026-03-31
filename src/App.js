import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import './App.css';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import Admindashboard from './pages/adminpages/A-Dashboard'
import Doctordashboard from './pages/doctorpages/D-Dashboard'
import Appointment from './pages/doctorpages/Appointment'
import Login from './pages/cardioDoctorAuth/Login'
import ForgotPassword from './pages/cardioDoctorAuth/ForgotPassword'
import OtpVerification from './pages/cardioDoctorAuth/OtpVerification'
import CreatePassword from './pages/cardioDoctorAuth/CreatePassword'
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

const AuthHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const cookie = Cookies.get('signInData');
    const { pathname } = location;

    // Public paths accessible to anyone
    const publicPaths = [
      '/',
      '/adminlogin',
      '/doctor-forgotpassword',
      '/doctor-otp',
      '/createpassword',
      '/admin-otp',
      '/admin-createpassword',
    ];

    // Paths for doctors, based on sidebar.js and route definitions
    const doctorPaths = [
      '/doctordashboard',
      '/appointment',
      '/doctoradmission',
      '/doctoradmissiondetail',
      '/patientlist',
      '/patient-detail',
      '/doctorreport',
      '/settings',
    ];

    // Paths for admins, based on AdminSidebar.js and route definitions
    const adminPaths = [
      '/admindashboard',
      '/adminappointment',
      '/adminpatient-detail',
      '/adminpatientlist',
      '/adminonspotregister',
      '/doctoronboardregister',
      '/adminfrontdesk',
    ];

    // Determine user role from cookie
    let userRole = null;
    if (cookie) {
      try {
        // IMPORTANT: Store your secret key in environment variables, not in the code.
        const secretKey = '7K9wN2mP5rB1xZ8q';
        const bytes = CryptoJS.AES.decrypt(cookie, secretKey);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

        if (decryptedData.startsWith('doctor+')) {
          userRole = 'doctor';
        } else if (decryptedData.startsWith('admin+')) {
          userRole = 'admin';
        } else {
          // Invalid cookie content, remove it.
          Cookies.remove('signInData');
        }
      } catch (e) {
        console.error("Failed to process auth cookie:", e);
        Cookies.remove('signInData');
      }
    }

    // --- REDIRECTION LOGIC ---

    if (userRole) {
      // --- User is LOGGED IN ---
      if (userRole === 'doctor') {
        // If a doctor is on a public login page OR an admin-only page, redirect to doctor dashboard
        if (publicPaths.includes(pathname) || adminPaths.includes(pathname)) {
          navigate('/doctordashboard', { replace: true });
        }
      } else if (userRole === 'admin') {
        // If an admin is on a public login page OR a doctor-only page, redirect to admin dashboard
        if (publicPaths.includes(pathname) || doctorPaths.includes(pathname)) {
          navigate('/admindashboard', { replace: true });
        }
      }
    } else {
      // --- User is NOT LOGGED IN ---
      // If user tries to access a protected route, redirect to the correct login page
      if (doctorPaths.includes(pathname)) {
        navigate('/', { replace: true }); // Doctor login
      } else if (adminPaths.includes(pathname)) {
        navigate('/adminlogin', { replace: true }); // Admin login
      }
    }
  }, [location.pathname, navigate]);

  return children;
};

function App() {
  return (
    <div className="App">
      <Router>
        <AuthHandler>
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
        </AuthHandler>
      </Router>
    </div>
  );
}

export default App;
