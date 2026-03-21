import React, { useState, useEffect } from 'react';
import '../../styles/D-Dashboard.css';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Profile from '../../components/Profile';
import Icon from '../../assets/images/Icon.png';
import Icon1 from '../../assets/images/Icon1.png';
import Icon2 from '../../assets/images/Icon2.png';
import Icon3 from '../../assets/images/Icon3.png';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API_BASE_URL from '../../config';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';

const AdminPatientList = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10; // Define number of rows per page
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [patients, setPatients] = useState([]);
    const [eachmonthpatients, setEachMonthPatients] = useState([]);
    const [todayappointments, setTodayAppointments] = useState([]);
    const [upcomingAppointment, setUpcomingAppointment] = useState([]);
    const [emergencyAppointment, setEmergencyAppointment] = useState([]);
    
    // Month and Year filter states
    const [selectedMonth, setSelectedMonth] = useState([]);
    const [selectedYear, setSelectedYear] = useState([]);

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
        // Only fetch if both month and year are selected
        if (!selectedMonth || !selectedYear) {
            setPatients([]);
            return;
        }
        
        setLoading(true);
        setError('');
        try {
            // let url = `${API_BASE_URL}patient/getAllPatientDetails`;
            let url = `${API_BASE_URL}patient/getallpatientdetailsAll?month=${selectedMonth}&year=${selectedYear}`;
            console.log('FetchingLLLLL:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
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
    }, [selectedMonth, selectedYear]);
    console.log('!!!!!:', emergencyAppointment);
    console.log('upcoming...:', upcomingAppointment);

    return (
        <div className="dashboard-layout">
            <AdminSidebar />
            <div className="main-section">
                <AdminHeader />
                
                {/* Month and Year Filter */}
                <div style={{
                    padding: '15px 20px',
                    background: '#fff',
                    margin: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    <label style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>Select Month:</label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => {
                            setSelectedMonth(e.target.value);
                            setCurrentPage(1); // Reset to first page
                        }}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            backgroundColor: '#fff'
                        }}
                    >
                        <option value="">-- Select Month --</option>
                        <option value="01">January</option>
                        <option value="02">February</option>
                        <option value="03">March</option>
                        <option value="04">April</option>
                        <option value="05">May</option>
                        <option value="06">June</option>
                        <option value="07">July</option>
                        <option value="08">August</option>
                        <option value="09">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                    </select>

                    <label style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>Select Year:</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => {
                            setSelectedYear(e.target.value);
                            setCurrentPage(1); // Reset to first page
                        }}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            backgroundColor: '#fff'
                        }}
                    >
                        <option value="">-- Select Year --</option>
                        {[2024, 2025, 2026, 2027, 2028].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

                    {loading && <span style={{ color: '#0a66ff', fontWeight: '500', fontSize: '14px' }}>Loading...</span>}
                </div>

                <div class="team-table-card">
                    <div class="team-table-header">
                        <span class="team-table-title">
                            Patient Data
                            <span class="team-table-chip">{patients.length} Patients</span>
                        </span>
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
                                <th>Mobile Number</th>
                                <th>Email address</th>
                                <th>City</th>
                                <th>Problems</th>
                                {/* <th>History</th> */}
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
                                            <div
      style={{ color: "#2563eb", cursor: "pointer", fontWeight: "600" }}
      onClick={() =>
        navigate("/patient-detail", {
          state: {
            patientId: row.id,
            name: row.patientName,
            email: row.email,
            mobile: row.mobileNumber,
            address: row.address
          }
        })
      }
    >
      {row.patientName}
    </div>
                                        </div>
                                    </td>
                                    <td>{row.gender}</td>
                                    <td>{row.mobileNumber}</td>
                                    <td>{row.email}</td>
                                    <td>{row.city}</td>
                                    <td>{row.problem}</td>
                                    {/* <td>{row.history}</td> */}
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
            <Profile />
        </div>
    );
};
export default AdminPatientList;
