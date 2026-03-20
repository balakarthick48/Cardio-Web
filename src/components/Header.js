import React, { useState } from 'react';
import '../styles/Header.css';
import Avatar from '../assets/images/Avatar1.png';
import { FaSearch, FaBell } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const pathToTitle = {
    '/doctordashboard': 'Dashboard',
    '/appointment': 'Appointment',
    '/patient-detail': 'Patient',
    // "/doctordashboard": "Doctordashboard",
    '/doctoradmission': 'Admission',
    '/settings': 'Settings',
    '/doctorreport': 'Report',
    '/patientlist': 'Patients'
};

const Header = ({ onUserAvatarClick, onAvatarClick }) => {
    const [showProfile, setShowProfile] = useState(false);
    const location = useLocation();
    const selectedTitle = pathToTitle[location.pathname] || 'Dashboard';
    // const user = JSON.parse(localStorage.getItem(('resetEmail')));
    // const userName = user?.name || user?.email || localStorage.getItem('resetEmail') || 'User';

    // console.log('User Name:', userName);
    // console.log('Selected Title:', localStorage.getItem('resetEmail'));
    const userName = localStorage.getItem('userName') || localStorage.getItem('email') || localStorage.getItem('resetEmail') || "User";
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
                <button className="icon-btn" onClick={onAvatarClick}>
                    <FaBell className="bell-icon" />
                </button>
                <div className="user-profile">
                    <span className="user-name">{userName}</span>
                    <span className="role">Doctor</span>
                </div>
                {/* <div className="avatar" onClick={() => setShowProfile((prev) => !prev)}>{userName.charAt(0)}</div> */}
                <div style={{ marginRight: 14, cursor: 'pointer' }} onClick={onUserAvatarClick}>
                    <div className="avatar">{userName ? userName[0] : ''}</div>{' '}
                </div>
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

export default Header;
