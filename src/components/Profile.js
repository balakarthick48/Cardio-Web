import React, { useState, useEffect } from 'react';
import '../styles/Profile.css';
import { Cell, Pie, PieChart, Legend } from 'recharts';
import doctorimage from '../assets/images/Doctor.png';
import API_BASE_URL from '../config';
const renderColorfulLegendText = (value, entry) => {
    return <span style={{ color: '#596579', fontWeight: 500, padding: '10px' }}>{value}</span>;
};

const data = [
    { name: 'Excellent', value: 400, fill: '#3671E7' },
    { name: 'Good', value: 300, fill: '#150850ff' },
    { name: 'Poor', value: 100, fill: '#FE8D28' }
];

const COLORS = ['#3671E7', '#0165Fc', '#FE8D28'];

export default function Profile() {
    const [showProfile, setShowProfile] = useState(false);
    const [upcomingAppointment, setUpcomingAppointment] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [emergencyAppointment, setEmergencyAppointment] = useState([]);
    const [rating, setRatings] = useState([]);
    const [appointment, setAppointment] = useState([]);
    const [patients, setPatients] = useState([]);
    const userName = localStorage.getItem('resetEmail') || 'User'; // Get from localStorage
    const rawEmail = localStorage.getItem('resetEmail') || '';
    const name = rawEmail.split('@')[0].replace(/[0-9]/g, '').trim();

    const getUpcomingAppointment = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}doctor/upcomingAppointment-doctor`;
            console.log('Fetching:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('upcomingAppointment response:', data);
            if (response.ok) {
                setUpcomingAppointment(data.appointments);
            } else {
                setError(data.message || 'Failed to fetch upcomingAppointment detail');
            }
        } catch (err) {
            setError('Network erroaa');
        }
        setLoading(false);
    };

    const getEmergencyAppointment = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}admin/emergencyAppointment`;
            console.log('Fetching:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Response status E:', response.status);
            const data = await response.json();
            console.log('emergencyAppointment response:', data);
            if (response.ok) {
                setEmergencyAppointment(data.emergencyAppointments);
            } else {
                setError(data.message || 'Failed to fetch emergencyAppointment detail');
            }
        } catch (err) {
            setError('Network erroaa');
        }
        setLoading(false);
    };

    const getRatings = async (e) => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}doctor/averageRating`;
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

    const getAppointment = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}doctor/getappointments`;
            console.log('Fetching:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('appointment...:', data);
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
            console.log('Fetching:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                // body: JSON.stringify({ month: 9 })
            });
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('patients response:', data);
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
        getUpcomingAppointment();
        getEmergencyAppointment();
        getRatings();
        getAppointment();
        getPatients();
    }, []);

    return (
        <div className="profile-panel">
            <div className="profile-header">
                {/* <button className="close-btn" onClick={onClose}>×</button> */}
                <img src={doctorimage} alt="Doctor" className="profile-img" />
                {/* <h3>
                    Dr.{' '}
                    {userName
                        ?.split('@')[0] 
                        .replace(/[0-9]/g, '') 
                        .trim()}{' '}
                    M.D
                </h3> */}
                <h3>Dr.{name} M.D</h3>

                <p>Cardiologist</p>
            </div>

            <div className="profile-stats">
                <div>
                    <h4>{appointment.length}</h4>
                    <p>Appointments</p>
                </div>
                <div>
                    <h4>{patients.length}</h4>
                    <p>Total Patients</p>
                </div>
                <div>
                    <h4>{rating}</h4>
                    <p>Rating</p>
                </div>
            </div>

            <div className="upcoming">
                <h4>Upcoming Appointments</h4>
                {/* <p>
                    <b>August 20, 2025</b>
                </p> */}
                <ul>
                    <li>
                        {/* <b>8:30 PM - 9:00 PM</b> */}
                         {upcomingAppointment[0]?.patientName} — {upcomingAppointment[0]?.problem}
                    </li>
                    <li>
                        {/* <b>9:00 PM - 9:30 PM</b>  */}
                        {upcomingAppointment[1]?.patientName} — {upcomingAppointment[1]?.problem}
                    </li>
                </ul>
            </div>
            <div className="chart-section">
                <h4>Patient Satisfaction</h4>
                <div className="chart-wrapper">
                    <PieChart width={320} height={140}>
                        <Pie data={data} cx={100} cy={70} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>

                        <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            iconType="circle"
                            iconSize={10}
                            formatter={renderColorfulLegendText}
                        />
                    </PieChart>
                </div>
            </div>
        </div>
    );
}
