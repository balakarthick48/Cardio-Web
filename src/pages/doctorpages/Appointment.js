import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import ChatPanel from '../../components/ChatPanel';
import '../../styles/Appointment.css';
import '../../styles/Profile.css';
import AppointmentCard from '../../components/Card';
import API_BASE_URL from '../../config';
import Profile from '../../components/Profile';
import Chat from '../../components/Chat';
import App1 from '../../assets/images/App1.png';
import App2 from '../../assets/images/App2.png';
import App3 from '../../assets/images/App3.png';
import Avatar1 from '../../assets/images/Avatar1.png';
import Avatar2 from '../../assets/images/Avatar2.png';
import Vector from '../../assets/images/Vector.png';
import Vector1 from '../../assets/images/Vector1.png';
import Vector2 from '../../assets/images/Vector2.png';

const Appoinment = () => {
    const [chatUser, setChatUser] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [appointmentslot, setAppointmentslot] = useState([]);
    const [todayappointments, setTodayAppointments] = useState([]);
    const [cancelappointments, setCancelAppointments] = useState([]);
    const [appointment, setAppointment] = useState([]);
    const [updatefinalstatus, setUpdateFinalStatus] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCard, setSelectedCard] = useState(null);
    const [selectedCardTime, setSelectedCardTime] = useState(''); // NEW
    const [to, setTo] = useState([]);
    const [updateappointment, setUpdateappointment] = useState([]);
    const [checkin, setCheckin] = useState([]);
    const [emergencyAppointment, setEmergencyAppointment] = useState([]);
    
    // New state for date/month filtering
const [filterType, setFilterType] = useState('monthly'); // 'daily' or 'monthly'
const [selectedDate, setSelectedDate] = useState(''); // Format: YYYY-MM-DD
const [selectedMonth, setSelectedMonth] = useState(''); // Format: YYYY-MM

// console.log('selectedmonth1111111', selectedMonth);
// console.log('###@@@$$$', selectedCard);
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

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

    const formatToTimeInput = (t) => {
        if (!t) return '';
        const parts = t.toString().split(':');
        if (parts.length === 2) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
        if (parts.length >= 3) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
        return t;
    };

        const formatDateForApi = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const getAppointmentSlot = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}patient/appointmentSlot-patient`;
            console.log('Fetching:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('appointment... response:', data);
            if (response.ok) {
                setAppointmentslot(Array.isArray(data) ? data : []);
            } else {
                setError(data.message || 'Failed to fetch patients detail');
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
            let url = `${API_BASE_URL}doctor/TodayAppointments`;
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

    const getTodayCancelAppointment = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}doctor/TodaycancelAppointments`;
            console.log('Fetching:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('appointment>>>response:', data);
            if (response.ok) {
                setCancelAppointments(data.cancelledAppointments);
            } else {
                setError(data.message || 'Failed to fetch cancelledAppointments detail');
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
        const getUpdateappointment = async (appointmentId, status) => {
        if (!appointmentId || !status) return;
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}admin/update-appointment-status`;
            // url = 'https://mocki.io/v1/a5a086db-eb2d-40e6-98af-1181da3215af'
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
                setSelectedCard(null);
                setSelectedCardTime('');
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

        const getCheckin = async (appointmentId) => {
        if (!appointmentId) return;
        setLoading(true);
        setError('');
        try {
            const datePart = selectedCard?.slotDate ? formatDateForApi(selectedCard.slotDate) : formatDateForApi(new Date());
            const timePart = selectedCardTime || formatToTimeInput(selectedCard?.slotTime) || '00:00:00';
            const checkInDateTime = `${datePart} ${timePart}`; // "YYYY-MM-DD HH:MM:SS"
            // let url = `${API_BASE_URL}admin/check-in`;
            let url = `${API_BASE_URL}patient/check-in`;
            // url = 'https://mocki.io/v1/a5a086db-eb2d-40e6-98af-1181da3215af'
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appointmentId, checkInTime: checkInDateTime })
            });
            console.log('Response status:4', response.status);
            console.log('checkin payload}}}:', { appointmentId, checkInTime: checkInDateTime });
            const data = await response.json();
            // alert(data.message); // Show alert with the response message
            if (response.ok) {
                setCheckin(data);
                toast.success(data.message);
                setSelectedCard(null);
                setSelectedCardTime('');
                getAppointment(); // refresh appointments if you want
            } else {
                setCheckin([]);
                toast.error(data.message);
                setError(data.message || 'Failed');
            }
            // console.log('prescriptions___', data.existingMedicines);
        } catch (err) {
            setError('Network error');
        }
        setLoading(false);
    };

    const getAppointment = async () => {
        setLoading(true);
        setError('');
        try {
            let url = '';
            
            if (filterType === 'daily' && selectedDate) {
                // Daily mode: only pass date
                url = `${API_BASE_URL}patient/appointments/date_month?date=${selectedDate}`;
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
                url = `${API_BASE_URL}patient/appointments/date_month?month=${month}&year=${year}`;
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

    const getUpdateFinalStatus = async (patientId, slotId, status) => {
        if (!patientId || !slotId || !status) return;
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}doctor/update/finalStatus`;
            // url = 'https://mocki.io/v1/a5a086db-eb2d-40e6-98af-1181da3215af'
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId, slotId, status })
            });
            const data = await response.json();
            if (response.ok) {
                setUpdateFinalStatus(data);
                toast.success(data.message || `Appointment., ${status}d`);
                getAppointment();
                setSelectedCard(null);
                setSelectedCardTime('');
            } else {
                setUpdateFinalStatus([]);
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

    // Filter appointments by name or status
    const filteredAppointments = appointment.filter(
        (appt) =>
            appt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appt.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
console.log('appointment>>><<<', appointment);
    useEffect(() => {
        getAppointmentSlot();
        getTodayAppointment();
        getTodayCancelAppointment();
        getUpdateFinalStatus();
        getAppointment();
        getEmergencyAppointment();
        // Set today's date as default
        setSelectedDate(getTodayDate());
        setSelectedMonth(new Date().toISOString().slice(0, 7)); // YYYY-MM
    }, []);

    // Call getAppointment when selectedMonth changes and filterType is 'monthly', or selectedDate changes and filterType is 'daily'
    useEffect(() => {
        if (filterType === 'monthly' && selectedMonth) {
            getAppointment();
        } else if (filterType === 'daily' && selectedDate) {
            getAppointment();
        }
    }, [selectedMonth, filterType, selectedDate]);
    console.log('*********', filteredAppointments);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-section">
                <Header onAvatarClick={() => setShowProfile((prev) => !prev)} />
                <div className="stats-header">
                    <div className="stat-box">
                        <img src={App1} style={{ width: '30px', height: '30px' }} />
                        <h2>{appointment.length}</h2>
                        <p>Total appointments</p>
                    </div>
                    <div className="stat-box urgent">
                        <img src={App2} style={{ width: '30px', height: '30px' }} />
                        <h2>{emergencyAppointment.length}</h2>
                        <p>Emergency appointment</p>
                    </div>
                    <div className="stat-box canceled">
                        <img src={App3} style={{ width: '30px', height: '30px' }} />
                        <h2>{cancelappointments}</h2>
                        <p>Cancel appointment</p>
                    </div>
                </div>
                {/* Filters */}
                <div className="filters">
                    <h3>Today ({filteredAppointments.length} Appointments)</h3>
                    <div className="search-section">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                            }}
                            placeholder="Search by name"
                        />
                        {/* <button className="calendar-btn">August</button>
                        <button className="calendar-btn">Tomorrow</button> */}
                    </div>
                </div>
                
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

                {/* Cards */}
                <div className="cards-container">
                    {filteredAppointments.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#888', fontSize: '1.2rem', padding: '40px 0' }}>
                            No appointment Found
                        </div>
                    ) : (
                        filteredAppointments.map((appt) => {
                            const statusIcon =
                                appt.status === 'accept'
                                    ? Vector
                                    : appt.status === 'cancel'
                                    ? Vector1
                                    : appt.status === 'reschedule'
                                    ? Vector2
                                    : null;

                            return (
                                <AppointmentCard
                                    key={appt.id}
                                    name={appt.patientName}
                                    meetingid={appt.zoomMeetingId}
                                    meetingurl={appt.zoomMeetingUrl}
                                    time={appt.slotTime}
                                    date={new Date(appt.slotDate).toLocaleDateString()}
                                    type={appt.packageType === 'in_person' ? 'Inperson' : appt.packageType}
                                    status={appt.status}
                                    checkin={appt.check_in}
                                    avatar={<img src={Avatar1} alt="icon" style={{ width: 60, height: 60, borderRadius: 30 }} />}
                                    icons={statusIcon ? [statusIcon] : []}
                                    onDetailsClick={() => {
                                        setSelectedCard(appt);
                                        setSelectedCardTime(formatToTimeInput(appt.slotTime));
                                    }}
                                    onClick={() => {
                                        setTo((prevTo) => {
                                            const exists = prevTo.some((user) => user.id === appt.patientId);
                                            if (exists) {
                                                // Remove if already selected
                                                return prevTo.filter((user) => user.id !== appt.patientId);
                                            } else {
                                                // Add if not selected
                                                return [
                                                    ...prevTo,
                                                    {
                                                        id: appt.id,
                                                        name: appt.patientName,
                                                        email: appt.email || '',
                                                        avatar: Avatar1
                                                    }
                                                ];
                                            }
                                        });
                                    }}
                                />
                            );
                        })
                    )}
                    {selectedCard && (
                        <div className="popup-overlay">
                            <div className="popup-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <img src={Avatar1} alt="avatar" style={{ width: 60, height: 60, borderRadius: 30 }} />
                                    <div>
                                        <h3 style={{ margin: 0 }}>{selectedCard.patientName}</h3>
                                        <div style={{ color: '#888' }}>
                                            {selectedCard.packageType === 'in_person' ? 'Inperson' : selectedCard.packageType}
                                        </div>
                                        <span className="status completed">{selectedCard.status}</span>
                                    </div>
                                </div>
                                <div style={{ marginTop: 18 }}>
                                    <div style={{ color: '#888', fontSize: 14 }}>Booking Time</div>
                                    <div
                                        style={{ display: 'flex', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }}
                                    >
                                        <div style={{ fontSize: 22, fontWeight: 700 }}>{selectedCard.slotTime}</div>
                                        <div style={{ color: '#888', fontSize: 15 }}>
                                            {new Date(selectedCard.slotDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: 18 }}>
                                    <div style={{ color: '#888', fontSize: 14 }}>Check-In Time</div>
                                    <div
                                        style={{ display: 'flex', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }}
                                    >
                                        {/* <div style={{ fontSize: 22, fontWeight: 700 }}>{selectedCard.slotTime}</div> */}
                                        <input
                                            type="time"
                                            step="1"
                                            value={selectedCardTime}
                                            onChange={(e) => setSelectedCardTime(e.target.value)}
                                            style={{
                                                fontSize: 22,
                                                fontWeight: 700,
                                                border: 'none',
                                                background: 'transparent',
                                                outline: 'none'
                                            }}
                                        />
                                        <div style={{ color: '#888', fontSize: 15 }}>
                                            {new Date(selectedCard.slotDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    style={{
                                        marginTop: 24,
                                        background: '#0070f3',
                                        color: '#fff',
                                        borderRadius: 8,
                                        padding: '8px 32px',
                                        border: 'none',
                                        fontWeight: 500,
                                        fontSize: '1rem',
                                        marginRight: 12
                                    }}
                                    onClick={() => getCheckin(selectedCard.id)}
                                    disabled={loading}
                                >
                                    {loading ? 'Submitting...' : 'Confirm Check-In'}
                                </button>
                                <button
                                    style={{
                                        marginTop: 16,
                                        background: '#28a745',
                                        color: '#fff',
                                        borderRadius: 8,
                                        padding: '8px 20px',
                                        border: 'none',
                                        fontWeight: 500,
                                        fontSize: '0.95rem',
                                        marginRight: 12
                                    }}
                                    onClick={() => getUpdateappointment(selectedCard.id, 'accept')}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Accept'}
                                </button>

                                <button
                                    style={{
                                        marginTop: 16,
                                        background: '#ff9800',
                                        color: '#fff',
                                        borderRadius: 8,
                                        padding: '8px 20px',
                                        border: 'none',
                                        fontWeight: 500,
                                        fontSize: '0.95rem',
                                        marginRight: 12
                                    }}
                                    onClick={() => getUpdateappointment(selectedCard.id, 'reschedule')}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Reschedule'}
                                </button>
                                <button
                                    style={{
                                        marginTop: 16,
                                        background: '#cc1111ff',
                                        color: '#fff',
                                        borderRadius: 8,
                                        padding: '8px 20px',
                                        border: 'none',
                                        fontWeight: 500,
                                        fontSize: '0.95rem',
                                        marginRight: 12
                                    }}
                                    onClick={() => getUpdateFinalStatus(
                                        selectedCard?.patientId,
                                        selectedCard?.slotId, 
                                        'cancel'
                                    )}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Cancel Appointment'}
                                </button>
                                <button
                                    style={{
                                        marginTop: 24,
                                        background: '#0070f3',
                                        color: '#fff',
                                        borderRadius: 8,
                                        padding: '8px 32px',
                                        border: 'none',
                                        fontWeight: 500,
                                        fontSize: '1rem'
                                    }}
                                    // onClick={() => setSelectedCard(null)}
                                    onClick={() => {
                                        setSelectedCard(null);
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* <Profile /> */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <Chat to={to} setTo={setTo} />
        </div>
    );
};
export default Appoinment;
