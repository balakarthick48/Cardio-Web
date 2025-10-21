import React, { useEffect, useState } from 'react';
import DoctorImg from '../../assets/images/Doctor.png'; // Update path as needed
import '../../styles/Settings.css';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import API_BASE_URL from '../../config';

export default function Settings() {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rating,setRatings] = useState([]);

        const getRatings = async (e) => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}doctor/averageRating`;
            // url = 'https://mocki.io/v1/a5a086db-eb2d-40e6-98af-1181da3215af'
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const data = await response.json();
            if (response.ok) {
          setRatings(data.averageRating);
            } else {
                setError(data.averageRating || 'Failed');
            }
            console.log(data.averageRating);
        } catch (err) {
            setError('Network error');
        }
        setLoading(false);
    };

    useEffect(() => {        
        getRatings(); 
         }, []);
console.log('@ratings',rating);
  return (
    <div className="settings-page">
      <Sidebar />
      <div className="main-content">
      <Header />
      <div className="settings-content">
    <div className="settings-profile-card">
      <div className="settings-profile-row">
        
        <div className="settings-profile-info">
          <img src={DoctorImg} alt="Doctor" className="settings-profile-avatar" />
          <div className="settings-profile-details">
            <div className="settings-profile-name">Dr. Sekar M.D</div>
            <div className="settings-profile-role">Cardiologist</div>
          </div>
        </div>
        <div className="settings-profile-stats">
          <div className="settings-profile-stat">
            <div className="settings-profile-stat-label">Appointments</div>
            <div className="settings-profile-stat-value">4250</div>
          </div>
          <div className="settings-profile-divider" />
          <div className="settings-profile-stat">
            <div className="settings-profile-stat-label">Total Patients</div>
            <div className="settings-profile-stat-value">1.2K</div>
          </div>
          <div className="settings-profile-divider" />
          <div className="settings-profile-stat">
            <div className="settings-profile-stat-label">Rating</div>
            <div className="settings-profile-stat-value"> {rating}</div>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
    </div>
  );
}