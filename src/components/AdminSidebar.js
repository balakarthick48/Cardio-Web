// src/components/Sidebar.js
import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";
import {
  FaUsers,
  FaRupeeSign,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import {Link, NavLink} from 'react-router-dom';
import { BiSolidCoinStack  } from "react-icons/bi";
import HeartWhite from "../assets/images/WhiteHeart.png";
import Payroll from "../assets/images/Frame.png";
import Appointment from "../assets/images/Appoinment.png";
import Dashboard from "../assets/images/Dashboard.png";

const menuItems = [
  { key: "dashboard", icon: <img src={Dashboard} style={{ width: '20px', height: '20px' }} />, label: "Dashboard", path: "/admindashboard" },
  { key: "appointment", icon:  <img  src={Appointment} style={{ width: '25px', height: '25px' }} />   , label: "Appointment", path: "/adminappointment" },
  { key: "patient", icon:  <FaUsers size={20}/>   , label: "Patients", path: "/adminpatient-detail" },
  { key: "financial", icon:  <FaRupeeSign size={20}/>   , label: "Financial", path: "/schedule" },
  { key: "inventory", icon:  <BiSolidCoinStack size={20}/>   , label: "Inventory", path: "/schedule" },
  { key: "payroll", icon:  <img src={Payroll} style={{ width: '30px', height: '25px' }}/>  , label: "Payroll", path: "/schedule" },
//   { key: "settings", icon:  <FaCog size={20}/>   , label: "Settings", path: "/settings" },
];
const AdminSidebar = () => {
     const [showLogout, setShowLogout] = useState(false);
     const navigate = useNavigate();

       const handleLogout = () => {
    // Clear any auth tokens or user info if needed
    localStorage.clear();
    navigate("/adminlogin");
  };

  return (
    <div className="sidebar">
        <div className="sidebar-logo">
       <img
            src={HeartWhite}
            style={{ width: '50px', height: '70px', marginBottom: '10px' }}
            alt="Cardio Doctor Logo"
            className="splash-logo"
          />
      </div>
  <nav className="sidebar-menu">
      {menuItems.map((item) => (
            // <li key={item.key}>
              <NavLink
               key={item.key}
                to={item.path}
                className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}>
               <div className="sidebar-icon">{item.icon}</div>
            <div className="sidebar-label">{item.label}</div>
              </NavLink>
      // </li>
      ))}
  </nav>

      <div className="sidebar-menu"onClick={() => setShowLogout(true)} style={{ cursor: "pointer" }}>
        <FaSignOutAlt size={22}/>
        <span>Logout</span>
      </div>
    {showLogout && (
        <div className="logout-popup">
          <div className="logout-popup-content">
            <p>Do you want to logout?</p>
            <div className="logout-popup-actions">
              <button className="cancel-btn" onClick={() => setShowLogout(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleLogout}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default AdminSidebar;
