import React, { useState, useEffect } from 'react';
import '../../styles/D-Dashboard.css';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Profile from '../../components/Profile';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import API_BASE_URL from '../../config';
import { useNavigate } from 'react-router-dom';

const DoctorAdmission = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10; // Define number of rows per page
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [patients, setPatients] = useState([]);
    const [doctorHours, setDoctorHours] = useState([]);
    const [showWorkingHours, setShowWorkingHours] = useState(false);

    const handleViewDetails = (patientData) => {
        navigate('/doctoradmissiondetail', { state: { patient: patientData } });
    };

    // Pagination + Search logic
    const filteredUsers = patients.filter(
        (user) => user.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || user.mobileNumber?.toString().includes(searchTerm)
    );

    //pagination logic
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredUsers.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

        const getPatients = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}doctor/appointments/doctor?doctorId=5`;
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
                setPatients(data.data);
            } else {
                setError(data.message || 'Failed to fetch patients detail');
            }
        } catch (err) {
            setError('Network erroaa');
        }
        setLoading(false);
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

    // const getPatients = async () => {
    //     setLoading(true);
    //     setError('');
    //     try {
    //         let url = `${API_BASE_URL}patient/getAllPatientDetails`;
    //         console.log('Fetching:', url);
    //         const response = await fetch(url, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ month: 12 })
    //         });
    //         console.log('Response status:', response.status);
    //         const data = await response.json();
    //         console.log('patients response:', data);
    //         if (response.ok) {
    //             setPatients(data.data);
    //         } else {
    //             setError(data.message || 'Failed to fetch patients detail');
    //         }
    //     } catch (err) {
    //         setError('Network erroaa');
    //     }
    //     setLoading(false);
    // };

    //     setLoading(true);
    //     setError('');
    //     try {
    //         let url = `${API_BASE_URL}doctor/getpatientWithEachMonth`;
    //         console.log('Fetching:', url);
    //         const response = await fetch(url, {
    //             method: 'GET',
    //             headers: { 'Content-Type': 'application/json' },
    //         });
    //         console.log('Response status:', response.status);
    //         const data = await response.json();
    //         console.log('patientseachmonth response:', data);
    //         if (response.ok) {
    //             setEachMonthPatients(data.data);
    //         } else {
    //             setError(data.message || 'Failed to fetch patients detail');
    //         }
    //     } catch (err) {
    //         setError('Network erroaa');
    //     }
    //     setLoading(false);
    // };

    function getPagination(current, total) {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    }

    useEffect(() => {
        getPatients();
        getDoctorHours();
    }, []);
console.log('doctorHours:', doctorHours);

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
                    <div class="team-table-header">
                        <span class="team-table-title">
                            Patient Data
                            <span class="team-table-chip">{patients.length} Patients</span>
                        </span>
                        {showWorkingHours && (
                            <div style={{ width: '70%', display: 'flex', justifyContent: 'center' }}>
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
                        <input
                            type="text"
                            placeholder="Search by Name or Mobile..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                            style={{
                                padding: '6px 10px',
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                                marginLeft: 'auto'
                            }}
                        />
                    </div>
                    <table class="team-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Gender</th>
                                <th>Apply Mode</th>
                                <th>Date</th>
                                <th>Time</th>
                                {/* <th>Apply For</th> */}
                                <th>Reason</th>
                                <th>Option</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRows.map((row, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div className="table-avatar">
                                            <span className="avatar" style={{ backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)` }}>
                                                {row.patientName ? row.patientName[0] : ''}
                                            </span>
                                            <div>
                                                <div>{row.patientName}</div>
                                                {/* <div className="username">{row.username}</div> */}
                                            </div>
                                        </div>
                                    </td>
                                    <td>{row.gender}</td>
                                    <td>{row.packageType}</td>
                                    <td>{row.slotDate}</td>
                                    <td>{row.slotTime}</td>
                                    {/* <td>{row.problem}</td> */}
                                    <td>{row.problem}</td>
                                    <td>
                                    <button
                            onClick={() => handleViewDetails(row)}
                            style={{
                                background: '#f2f2f2',
                                color: '#0a66ff',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: 4,
                                cursor: 'pointer'
                            }}
                        >
                            View Details
                        </button>
                    </td>
                                    {/* <td>{row.address?.city || ''}</td>
                  <td>{row.dob || '-'}</td>
                  <td>{row.certificate || '-'}</td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination" style={{ marginTop: 50, justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">
                            <FaArrowLeft style={{ verticalalign: 'middle' }} />
                            Previous
                        </button>

                        {getPagination(currentPage, totalPages).map((page, index) => (
                            <button
                                key={index}
                                onClick={() => typeof page === 'number' && handlePageChange(page)}
                                className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                                disabled={page === '...'}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="pagination-btn"
                        >
                            Next <FaArrowRight style={{ verticalalign: 'middle', bottom: '10px' }} />
                        </button>
                    </div>
                </div>
            </div>
            {/* <Profile /> */}
        </div>
    );
};
export default DoctorAdmission;
