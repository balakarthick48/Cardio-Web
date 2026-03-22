// src/components/Sidebar.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";
import {
  FaUsers,
  FaRupeeSign,
  FaCog,
  FaSignOutAlt,
  FaChartLine,
  FaBuffer
} from "react-icons/fa";
import { Link, NavLink } from 'react-router-dom';
import { BiSolidCoinStack } from "react-icons/bi";
import HeartWhite from "../assets/images/WhiteHeart.png";
import Payroll from "../assets/images/Frame.png";
import Appointment from "../assets/images/Appoinment.png";
import Dashboard from "../assets/images/Dashboard.png";
import Admission from "../assets/images/Admission.png";
import FrontDesk from "../assets/images/Icon4.png";

const menuItems = [
  //  { key: "logo", icon: <img
  //             src={HeartWhite}
  //             style={{ width: '50px', height: '70px', marginBottom: '40px' }}
  //             alt="Cardio Doctor Logo"
  //             className="splash-logo"
  //           />,  path: "/" },
  // { key: "registerusers", icon: <FaUsers/>, label: "New Users", path: "/registerusers" },
  { key: "frontdesk", icon: <FaBuffer size={23} />, label: "FrontDesk", path: "/adminfrontdesk" },
  { key: "dashboard", icon: <img src={Dashboard} style={{ width: '20px', height: '20px' }} />, label: "Dashboard", path: "/doctordashboard" },
  { key: "appointment", icon: <img src={Appointment} style={{ width: '25px', height: '25px' }} />, label: "Appointment", path: "/appointment" },
  { key: "admission", icon: <img src={Admission} style={{ width: '25px', height: '25px' }} />, label: "Admission", path: "/doctoradmission" },
  { key: "patient", icon: <FaUsers size={20} />, label: "Patients", path: "/patientlist" },
  // { key: "financial", icon:  <FaRupeeSign size={20}/>   , label: "Financial", path: "/doctordashboard" },
  { key: "report", icon: <FaChartLine size={20} />, label: "Report", path: "/doctorreport" },
  { key: "inventory", icon: <BiSolidCoinStack size={20} />, label: "Inventory", path: "/schedule" },
  { key: "payroll", icon: <img src={Payroll} style={{ width: '30px', height: '25px' }} />, label: "Payroll", path: "/schedule" },
  { key: "settings", icon: <FaCog size={20} />, label: "Settings", path: "/settings" },
];
const Sidebar = () => {
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any auth tokens or user info if needed
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="sidebar">
      {/* <div  style={{fontweight: 'bold', color: '#fff', fontSize: 12, textAlign: 'center', marginBottom: 4}}> */}
      {/* <Link to="/dashboard"><img className="splash-logo" style={{ width: '50px', height: '70px', marginBottom: '40px' }} src={HeartWhite} alt="Cardio Doctor Logo" /> </Link> */}
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

      {/* <ul className="menu">
        <li>
          <img
            src={Dashboard}
            style={{ width: '25px', height: '25px' }}
          />
          <span>Dashboard</span>
        </li>
        <li>
             <img  src={Appointment}
            style={{ width: '30px', height: '30px' }} />         
            <span>Appointment</span>
        </li>
        <li>
          <FaUsers size={25}/>
          <span>Patients</span>
        </li>
        <li>
          <FaRupeeSign size={25} />
          <span>Financial</span>
        </li>
        <li>
          <BiSolidCoinStack size={30}/>
          <span>Inventory</span>
        </li>
        <li>
          <img
            src={Payroll}
            style={{ width: '30px', height: '30px' }}
          />
          <span>Payroll</span>
        </li>
        <li>
          <FaCog size={25}/>
          <span>Settings</span>
        </li>
      </ul> */}

      <div className="sidebar-menu" onClick={() => setShowLogout(true)} style={{ cursor: "pointer" }}>
        <FaSignOutAlt size={22} />
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

export default Sidebar;
