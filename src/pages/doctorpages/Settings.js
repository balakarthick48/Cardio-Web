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
    const [appointment, setAppointment] = useState([]);
    const [patients, setPatients] = useState([]);
     const rawEmail = localStorage.getItem('resetEmail') || '';
    const name = rawEmail.split('@')[0].replace(/[0-9]/g, '').trim();
    
        const getRatings = async (e) => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}doctor/averageRating`;
            const body = {};
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            };
            console.log('Requesting:', { url, body });
            const response = await fetch(url, requestOptions);
            const data = await response.json();
            console.log('Response:', { url, body, response: data });
            if (response.ok) {
          setRatings(data.averageRating);
            } else {
                setError(data.averageRating || 'Failed');
            }
        } catch (err) {
            setError('Network error');
        }
        setLoading(false);
    };

        const getAppointment = async () => {
            setLoading(true);
            setError('');
            try {
                let url = `${API_BASE_URL}doctor/getappointments`;
                const requestOptions = {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                };
                console.log('Requesting:', { url, options: requestOptions });
                const response = await fetch(url, requestOptions);
                const data = await response.json();
                console.log('Response:', { url, options: requestOptions, response: data });
                if (response.ok) {
                    setAppointment(Array.isArray(data.data) ? data.data : []);
                } else {
                    setError(data.message || 'Failed to fetch patients detail');
                }
            } catch (err) {
                setError('Network erroaa');
            }
            setLoading(false);
        };

            const getPatients = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}patient/getallpatientdetailsAll`;
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            };
            console.log('Requesting:', { url, options: requestOptions });
            const response = await fetch(url, requestOptions);
            const data = await response.json();
            console.log('Response:', { url, options: requestOptions, response: data });
            if (response.ok) {
                setPatients(data.data);
            } else {
                setError(data.message || 'Failed to fetch patients detail');
            }
        } catch (err) {
            setError('Network erroaa');
        }
        setLoading(false);
    };

    useEffect(() => {        
        getRatings(); 
        getAppointment();
        getPatients();
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
            <div className="settings-profile-name">Dr. {name} M.D</div>
            <div className="settings-profile-role">Cardiologist</div>
          </div>
        </div>
        <div className="settings-profile-stats">
          <div className="settings-profile-stat">
            <div className="settings-profile-stat-label">Appointments</div>
            <div className="settings-profile-stat-value">{appointment.length}</div>
          </div>
          <div className="settings-profile-divider" />
          <div className="settings-profile-stat">
            <div className="settings-profile-stat-label">Total Patients</div>
            <div className="settings-profile-stat-value">{patients.length}</div>
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