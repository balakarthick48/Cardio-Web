import React, { useState, useEffect } from 'react';
import '../../styles/D-Dashboard.css';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Profile from '../../components/Profile';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import API_BASE_URL from '../../config';
import { useLocation } from 'react-router-dom';

const DoctorAdmissionDetail = () => {
    const location = useLocation();
    const patientData = location.state?.patient || {};
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5; // Define number of rows per page
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showWorkingHours, setShowWorkingHours] = useState(false);
    const [doctorHours, setDoctorHours] = useState([]);
    

 const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d6d6d6",
    borderRadius: 6,
    marginTop: 5
};

const inputStyleSmall = {
    padding: "10px",
    border: "1px solid #d6d6d6",
    borderRadius: 6,
    width: "100%"
};

        const getDoctorHours = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}patient/doctor-working-hours?doctorId=5`;
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                // body: JSON.stringify({ month: 12 })
            };
            console.log('Requesting:', { url, options: requestOptions });
            const response = await fetch(url, requestOptions);
            const data = await response.json();
            console.log('Response:', { url, options: requestOptions, response: data });
            if (response.ok) {
                setDoctorHours(data.data);
            } else {
                setError(data.message || 'Failed to fetch patients detail');
            }
        } catch (err) {
            setError('Network erroaa');
        }
        setLoading(false);
    };

    useEffect(() => {
         getDoctorHours();
    }, []);
console.log('Patient Data:>>>', patientData.patientName);
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-section">
                <Header />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                            onClick={() => setShowWorkingHours(false)}
                            style={{
                                padding: '8px 14px',
                                borderRadius: 6,
                                border: showWorkingHours ? '1px solid #d6d6d6' : 'none',
                                background: showWorkingHours ? '#fff' : '#0a66ff',
                                color: showWorkingHours ? '#333' : '#fff',
                                cursor: 'pointer'
                            }}
                        >
                            Patient History
                        </button>

                        <button
                            onClick={() => setShowWorkingHours(true)}
                            style={{
                                padding: '8px 14px',
                                borderRadius: 6,
                                border: showWorkingHours ? 'none' : '1px solid #d6d6d6',
                                background: showWorkingHours ? '#0a66ff' : '#fff',
                                color: showWorkingHours ? '#fff' : '#333',
                                cursor: 'pointer'
                            }}
                        >
                            Doctor Working Hours
                        </button>
                    </div>
                </div>
                <div class="team-table-card">
                    {showWorkingHours && (
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            {/* <div style={{ color: '#0a66ff', fontWeight: 600, marginBottom: 6 }}></div> */}
                            <div
                                style={{
                                    padding: 14,
                                    borderRadius: 8,
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ color: '#0a66ff', fontSize: 15, fontWeight: 700 }}>Total {doctorHours.totalWorkingHours}</div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Patient Profile Section */}
                <div
                    style={{
                        background: '#fff',
                        padding: 20,
                        borderRadius: 12,
                        marginTop: 20,
                        width: '95%',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}
                >
                    {/* Patient Photo + Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <img src="https://i.pravatar.cc/140" alt="Patient" style={{ width: 90, height: 90, borderRadius: '50%' }} />

                        <div>
                            <div style={{ fontSize: 22, fontWeight: '600' }}>{patientData.patientName || 'N/A'}</div>
                            <div style={{ color: '#707070', marginTop: 4 }}>{patientData.packageType}</div>
                            <div style={{ marginTop: 4, color: '#0a66ff', fontWeight: '600' }}>[DRS25154]</div>
                        </div>
                    </div>

                    {/* Personal Details */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr 1fr',
                            marginTop: 25,
                            rowGap: 15
                        }}
                    >
                        <div>
                            <strong>Gender :</strong> {patientData.gender}
                        </div>
                        <div>
                            <strong>Date :</strong> {patientData.slotDate}
                        </div>
                        <div>
                            <strong>Amount :</strong> Rs.500
                        </div>
                        <div>
                            <strong>Doctor Name :</strong> {patientData.doctorName}
                        </div>

                        <div>
                            <strong>Apply Mode :</strong> Online
                        </div>
                        <div>
                            <strong>Check-In :</strong> 9:00 AM
                        </div>
                        <div>
                            <strong>Apply For :</strong> {patientData.bookingFor}
                        </div>
                        <div>
                            <strong>Payment :</strong> UPI/Paid
                        </div>

                        <div>
                            <strong>Check-Out :</strong> 10:00 AM
                        </div>
                        <div>
                            <strong>Reason :</strong> {patientData.problem} 
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginTop: 25 }}>
                        <strong>Description :</strong>
                        <p style={{ marginTop: 8, lineHeight: 1.6 }}>
                            The patient is diagnosed with a medical condition requiring timely evaluation and treatment to prevent further
                            complications. Symptoms indicate underlying disease progression that needs continuous monitoring and care.
                        </p>
                    </div>

                    <hr style={{ marginTop: 20, marginBottom: 20 }} />

                    {/* Contact Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div>
                            <strong>Email ID :</strong> xyz@gmail.com
                        </div>
                        <div>
                            <strong>Contact Number :</strong> +91 98567 56421
                        </div>
                        <div>
                            <strong>Address :</strong> No. 9, ABC Street, REW Nagar, Chennai - 600052
                        </div>
                    </div>
                </div>

            </div>
            {/* <Profile /> */}
        </div>
    );
};
export default DoctorAdmissionDetail;
