import React,{useState} from "react";
import "../styles/Header.css";
import Avatar from '../assets/images/Avatar1.png';
import { FaSearch, FaBell } from "react-icons/fa";
import { useLocation } from 'react-router-dom';


const pathToTitle = {
  "/admindashboard": "Dashboard",
  "/adminappointment": "Appointment",
  "/adminpatient-detail": "Patient",
//   "/doctordashboard": "Doctordashboard",
//   "/settings": "Settings"
};

const AdminHeader = ({  onUserAvatarClick, onAvatarClick }) => {
  const [showProfile, setShowProfile] = useState(false);
   const location = useLocation();
    const selectedTitle = pathToTitle[location.pathname] || "Dashboard";
      const userName = localStorage.getItem('resetEmail') || "User"; // Get from localStorage

  return (
    <header className="app-header">
      {/* Left Title */}
      <h2 className="header-title">{selectedTitle}</h2>

      {/* Center Search */}
      <div className="header-search">
        <input type="text" placeholder="Search" />
        <button className="search-btn">
          <FaSearch size={14} />
        </button>
      </div>

      {/* Right Side */}
      <div className="header-right">
        <button className="icon-btn"  onClick={onAvatarClick}>
          <FaBell className="bell-icon" />
        </button>
        <div className="user-profile">
          <span className="user-name">{userName}</span>
          <span className="role">Admin</span>
        </div>
        {/* <div className="avatar" onClick={() => setShowProfile((prev) => !prev)}>{userName.charAt(0)}</div> */}
                       <div style={{ marginRight: 14, cursor: 'pointer' }} onClick={onUserAvatarClick}>
 <div className="avatar" >{userName ? userName[0] : ''}</div> </div>
                {/* <div><img
  src={Avatar}
  alt="User"
  className="user-avatar"
  style={{ height: 40,width: 40}}
  onClick={onUserAvatarClick}
/></div> */}
      </div>
    </header>
  );
};

export default AdminHeader;
