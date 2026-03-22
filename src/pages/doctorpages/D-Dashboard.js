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
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Doctordashboard = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5; // Define number of rows per page
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [patients, setPatients] = useState([]);
    const [totalAppointment, setTotalAppointment] = useState([]);
    const [eachmonthpatients, setEachMonthPatients] = useState([]);
    const [todayappointments, setTodayAppointments] = useState([]);
    const [upcomingAppointment, setUpcomingAppointment] = useState([]);
    const [emergencyAppointment, setEmergencyAppointment] = useState([]);
    const [updateappointment, setUpdateappointment] = useState([]);
    const [appointment, setAppointment] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [filterType, setFilterType] = useState('monthly'); // 'daily' or 'monthly'
    const [selectedDate, setSelectedDate] = useState(''); // Format: YYYY-MM-DD
    const [selectedMonth, setSelectedMonth] = useState(''); // Format: YYYY-MM
    const [selectedYear, setSelectedYear] = useState('');

    // Format date to DD.MM.YYYY for display
    const formatDateDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    // Format month to MMM YYYY for display
    const formatMonthDisplay = (monthString) => {
        if (!monthString) return '';
        const [year, month] = monthString.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[parseInt(month) - 1]}${year}`;
    };

    // Format time from slotTime (HH:MM:SS) or fallback to slotDate
    const formatTimeDisplay = (timeString, slotDate) => {
        if (timeString) {
            // return HH:MM from HH:MM:SS
            return timeString.slice(0, 5);
        }
        if (!slotDate) return '';
        try {
            return new Date(slotDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
        } catch (err) {
            return '';
        }
    };

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
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
            // let url = `${API_BASE_URL}patient/getAllPatientDetails`;
            let url = `${API_BASE_URL}patient/getallpatientdetailsAll`;
            console.log('Fetching:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
                // body: JSON.stringify({ month: 12 })
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

    const getPatientsEachmonth = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}doctor/getpatientWithEachMonth`;
            console.log('Fetching:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('patientseachmonth response:', data);
            if (response.ok) {
                setEachMonthPatients(data.data);
            } else {
                setError(data.message || 'Failed to fetch patients detail');
            }
        } catch (err) {
            setError('Network erroaa');
        }
        setLoading(false);
    };

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
                console.log('Emergency Appointments:', data.emergencyAppointments);
            } else {
                setError(data.message || 'Failed to fetch emergencyAppointment detail');
            }
        } catch (err) {
            setError('Network erroaa');
        }
        setLoading(false);
    };


    const getTodayAppointment = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}patient/TodayAppointments`;
            console.log('Fetching:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Resp status:', response.status);
            const data = await response.json();
            console.log('todayAppointmen!!... response:', data);
            if (response.ok) {
                setTodayAppointments(Array.isArray(data) ? data : []);
            } else {
                setError(data.message || 'Failed to fetch patients detail');
            }
        } catch (err) {
            setError('Network erroaa');
        }
        setLoading(false);
    };

    const getUpdateappointment = async (appointmentId, status) => {
        if (!appointmentId || !status) return;
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}admin/update-appointment-status`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId, status })
            });
            const data = await response.json();
            if (response.ok) {
                setUpdateappointment(data);
                toast.success(data.message || `Appointment., ${status}d`);
                getAppointment();
                // setSelectedCard(null);
                // setSelectedCardTime('');
            } else {
                setUpdateappointment([]);
                toast.error(data.message || 'Failed to update appointment//');
                setError(data.message || 'Failed');
            }
            // console.log('prescriptions___', data.existingMedicines);
        } catch (err) {
            toast.error('Network error');
            setError('Network error');
        }
        setLoading(false);
    };

    const getAppointment = async () => {
        setLoading(true);
        setError('');
        try {
            // let url = `${API_BASE_URL}doctor/getappointments`; //allapointment
            let url = `${API_BASE_URL}patient/getappointments`;
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

        const getTotalAppointment = async (month, year) => {
            setLoading(true);
            setError('');
            try {
                // Ensure month is 2-digit string
                let monthStr = month;
                let yearStr = year;
                if (month && typeof month === 'string' && month.includes('-')) {
                    // If month is in YYYY-MM format
                    const parts = month.split('-');
                    yearStr = parts[0];
                    monthStr = parts[1];
                }
                if (monthStr && monthStr.length === 1) monthStr = '0' + monthStr;
                let url = `${API_BASE_URL}patient/appointments/date_month?month=${monthStr || ''}&year=${yearStr || ''}`;
                console.log('Fetchingtotal:', url);
                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('appointment...total:', data);
                if (response.ok) {
                    setTotalAppointment(Array.isArray(data.data) ? data.data : []);
                } else {
                    setError(data.message || 'Failed to fetch patients detail');
                }
            } catch (err) {
                setError('Network erroaa');
            }
            setLoading(false);
        };

    const getDashboardData = async () => {
            setLoading(true);
        setError('');
        // try {
        //     let month = '';
        //     let year = '';
        //     console.log('Selected,, month/year:', month, year);
        //     if (selectedMonth && selectedMonth.includes('-')) {
        //         [year, month] = selectedMonth.split('-');
        //         console.log('Selected month/year:', month, year);
        //     } else {
        //         // fallback to current month/year if not set
        //         const now = new Date();
        //         year = now.getFullYear().toString();
        //         month = String(now.getMonth() + 1).padStart(2, '0');
        //     }
        //         let url = `${API_BASE_URL}patient/dashboard/monthly-counts?month=${month}&year=${year}&date=${selectedDate}`;
        //         console.log('Fetchingdashboard:', url);
        //         const response = await fetch(url, {
        //             method: 'GET',
        //             headers: { 'Content-Type': 'application/json' }
        //         });
        //         console.log('Response status:', response.status);
        //         const data = await response.json();
        //         console.log('dashboard data:', data);
        //         if (response.ok) {
        //             setDashboardData(data.data);
        //         } else {
        //             setError(data.message || 'Failed to fetch dashboard data');
        //         }
        //     } 
        try {
            let url = '';
            
            if (filterType === 'daily' && selectedDate) {
                // Daily mode: only pass date
                url = `${API_BASE_URL}patient/dashboard/monthly-counts?date=${selectedDate}`;
            } else if (filterType === 'monthly') {
                // Monthly mode: only pass month and year
                let month = '';
                let year = '';
                if (selectedMonth && selectedMonth.includes('-')) {
                    [year, month] = selectedMonth.split('-');
                } else {
                    // fallback to current month/year if not set
                    const now = new Date();
                    year = now.getFullYear().toString();
                    month = String(now.getMonth() + 1).padStart(2, '0');
                }
                url = `${API_BASE_URL}patient/dashboard/monthly-counts?month=${month}&year=${year}`;
            } else {
                // No valid filter, skip API call
                setLoading(false);
                return;
            }
            
            console.log('Fetching:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
             console.log('Response status:', response.status);
                 const data = await response.json();
                 console.log('dashboard data///:', data);
            if (response.ok) {
                    setDashboardData(data.data);
                 } else {
                setError(data.message || 'Failed to fetch patients detail');
            }
        }
            catch (err) {
                setError('Network erroaa');
            }
            setLoading(false);
        };

    const handlePackageTypeClick = (appointment) => {
        if (appointment?.packageType === 'video call' && appointment?.zoomMeetingUrl) {
            // Redirect to Zoom meeting URL
            window.open(appointment.zoomMeetingUrl, '_blank');
        } else {
            // Navigate to patient detail page for in-person
            navigate("/patient-detail", {
                state: {
                    patientId: appointment?.id,
                    name: appointment?.patientName,
                    email: appointment?.email,
                    mobile: appointment?.mobileNumber,
                    address: appointment?.address
                }
            });
        }
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
    // Mock data
const stats = [
        {
            title: "Cancelled Count",
            value: dashboardData ? dashboardData.cancelled_count : 0,
            icon: <img src={Icon1} alt="icon" style={{ width: 28, height: 28 }} />
        },
        {
            title: 'Rescheduled Count',
            value: dashboardData ? dashboardData.reschedule_count : 0,
            icon: <img src={Icon} alt="icon" style={{ width: 28, height: 28 }} />
        },
        { title: 'Total Consults', value:dashboardData ? dashboardData.total_consults : 0, icon: <img src={Icon3} alt="icon" style={{ width: 28, height: 28 }} /> },
        {
            title: "Video Call Count",
            value: dashboardData ? dashboardData.video_call_count : 0,
            icon: <img src={Icon1} alt="icon" style={{ width: 28, height: 28 }} />
        },
        {
            title: 'In-Person Count',
            value: dashboardData ? dashboardData.in_person_count : 0,
            icon: <img src={Icon} alt="icon" style={{ width: 28, height: 28 }} />
        },
        { title: 'Emergency Count', value:dashboardData ? dashboardData.emergency_count : 0, icon: <img src={Icon3} alt="icon" style={{ width: 28, height: 28 }} /> }
    ];

    useEffect(() => {
        getPatients();
        getUpcomingAppointment();
        getEmergencyAppointment();
        getTodayAppointment();
        getPatientsEachmonth();
        getDashboardData();
        // Set today's date as default
        setSelectedDate(getTodayDate());
        setSelectedMonth(new Date().toISOString().slice(0, 7)); // YYYY-MM
    }, []);

    // // Update dashboard data when selectedMonth changes
    // useEffect(() => {
    //     if (selectedMonth) {
    //         getDashboardData();
    //     }
    // }, [selectedMonth]);

    // Update total appointments when month or year changes
    // useEffect(() => {
    //     if (selectedMonth) {
    //         const [year, month] = selectedMonth.split('-');
    //         setSelectedYear(year);
    //         getTotalAppointment(month, year);
    //         getDashboardData();
    //     }
    // }, [selectedMonth, filterType]);
        console.log('dashboardData:', dashboardData);

        useEffect(() => {
            if (filterType === 'daily' && selectedDate) {
                getDashboardData();
            } else if (filterType === 'monthly' && selectedMonth) {
                getDashboardData();
            }
        }, [selectedDate, selectedMonth, filterType]);
    console.log('!!!!!:', emergencyAppointment);
    console.log('upcoming...:', upcomingAppointment);
    console.log('Filter Type///:', filterType, 'Selected Date:', selectedDate, 'Selected Month:', selectedMonth);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-section">
                <Header />
                <div className="container">
                    {/* Current Appointment */}
                    <div className="appointmentN-card">
                        <div className="appointment-info">
                            <p className="appointment-type">Current Appointment</p>
                            <h3 className="appointment-name">
                                {upcomingAppointment[0]?.patientName} <span className="appointment-id"></span>
                            </h3>
                        </div>
                        <div className="appointment-status">
                            <button className="action-btn" onClick={() => handlePackageTypeClick(upcomingAppointment[0])}>
                                {upcomingAppointment[0]?.packageType}
                            </button>
                        </div>
                        <div className="appointment-status">
                            <span className="status">Ongoing</span>
                        </div>

                        <div className="appointment-time">
                            {upcomingAppointment[0]?.slotDate ? (
                                <>
                                    <div>{formatDateDisplay(upcomingAppointment[0].slotDate)}</div>
                                    <div style={{ fontSize: 13, color: '#f1f0f0' }}>
                                        {formatTimeDisplay(upcomingAppointment[0]?.slotTime, upcomingAppointment[0].slotDate)}
                                    </div>
                                </>
                            ) : (
                                ''
                            )}
                        </div>
                    </div>

                    {/* Next Appointment */}
                    <div className="appointmentN-card">
                        <div className="appointment-info">
                            <p className="appointment-type">Next Appointment</p>
                            <h3 className="appointment-name">
                                {upcomingAppointment[1]?.patientName} <span className="appointment-id"></span>
                            </h3>
                        </div>
                        <div className="appointment-status">
                            <button className="action-btn" onClick={() => handlePackageTypeClick(upcomingAppointment[1])}>
                                {upcomingAppointment[1]?.packageType}
                            </button>
                        </div>
                        <div className="appointment-status">
                            <button className="action-btn" onClick={() => getUpdateappointment(upcomingAppointment[1]?.Id, 'accept')}
                                disabled={loading}>
                                {loading ? 'Processing...' : 'Accept'}
                            </button>
                            <button className="action-btn" onClick={() => getUpdateappointment(upcomingAppointment[1]?.Id, 'reschedule')}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Reschedule'}
                            </button>
                        </div>

                        <div className="appointment-time">
                            {upcomingAppointment[1]?.slotDate ? (
                                <>
                                    <div>{formatDateDisplay(upcomingAppointment[1].slotDate)}</div>
                                    <div style={{ fontSize: 13, color: '#f1f0f0' }}>
                                        {formatTimeDisplay(upcomingAppointment[1]?.slotTime, upcomingAppointment[1].slotDate)}
                                    </div>
                                </>
                            ) : (
                                ''
                            )}
                        </div>
                    </div>

                    <div className="appointmentE-card">
                        <div className="appointment-info">
                            <p className="appointment-type">Emergency Appointment ({emergencyAppointment.length} in queue)</p>
                            <h3 className="appointment-name">
                                {emergencyAppointment[0]?.patientName} <span className="appointment-id"></span>
                            </h3>
                        </div>
                        <div className="appointment-status">
                            <button className="action-btn" onClick={() => handlePackageTypeClick(emergencyAppointment[0])}>
                                {emergencyAppointment[0]?.packageType}
                            </button>
                        </div>
                        <div className="appointment-status">
                            <button className="action-btn" onClick={() => getUpdateappointment(upcomingAppointment[0]?.Id, 'accept')}
                                disabled={loading}>
                                {loading ? 'Processing...' : 'Accept'}
                            </button>
                            <button className="action-btn" onClick={() => getUpdateappointment(upcomingAppointment[0]?.Id, 'reschedule')}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Reschedule'}
                            </button>
                        </div>
                        {/* <div className="appointment-time">{emergencyAppointment[0]?.createdAt}</div> */}
                        <div className="appointment-time">
                            {emergencyAppointment[0]?.slotDate ? (
                                <>
                                    <div>{formatDateDisplay(emergencyAppointment[0].slotDate)}</div>
                                    <div style={{ fontSize: 13, color: '#f1f0f0' }}>
                                        {formatTimeDisplay(emergencyAppointment[0]?.slotTime, emergencyAppointment[0].slotDate)}
                                    </div>
                                </>
                            ) : (
                                ''
                            )}
                        </div>
                    </div>
                </div>
                {/* <h2 style={{textAlign:'start', padding:10}}>Overview Cards</h2> */}
                {/* Filter Controls */}
                <div style={{
                    padding: '20px',
                    background: '#fff',
                    margin: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    {/* Filter Type Toggle */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => {
                                setFilterType('daily');
                                setSelectedDate(getTodayDate());
                            }}
                            style={{
                                padding: '8px 16px',
                                background: filterType === 'daily' ? '#0a66ff' : '#f0f0f0',
                                color: filterType === 'daily' ? '#fff' : '#666',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '14px',
                                transition: 'all 0.3s'
                            }}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => {
                                setFilterType('monthly');
                                setSelectedMonth(new Date().toISOString().slice(0, 7));
                            }}
                            style={{
                                padding: '8px 16px',
                                background: filterType === 'monthly' ? '#0a66ff' : '#f0f0f0',
                                color: filterType === 'monthly' ? '#fff' : '#666',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '14px',
                                transition: 'all 0.3s'
                            }}
                        >
                            Monthly
                        </button>
                    </div>

                    {/* Date Input (for Daily) */}
                    {filterType === 'daily' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>Select Date:</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            />
                            <span style={{ fontSize: '14px', color: '#0a66ff', fontWeight: '600' }}>
                                {formatDateDisplay(selectedDate)}
                            </span>
                        </div>
                    )}

                    {/* Month Input (for Monthly) */}
                    {filterType === 'monthly' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>Select Month:</label>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            />
                            <span style={{ fontSize: '14px', color: '#0a66ff', fontWeight: '600' }}>
                                {formatMonthDisplay(selectedMonth)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card new-style">
                            <div className="stat-header">
                                <div className="stat-icon-circle">{stat.icon}</div>
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '12px', color: '#666' }}>
                                        {filterType === 'daily' ? formatDateDisplay(selectedDate) : formatMonthDisplay(selectedMonth)}
                                    </span>
                                </div>
                            </div>
                            <div className="stat-body">
                                <p className="stat-title">{stat.title}</p>
                                <h3 className="stat-value">{stat.value}</h3>
                            </div>
                            <div className="stat-footer">
                                <span className="stat-trend">{/* Add your trend icon here */}</span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
            <Profile />
        </div>
    );
};
export default Doctordashboard;
