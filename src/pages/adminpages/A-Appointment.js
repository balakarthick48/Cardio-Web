import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import AdminHeader from '../../components/AdminHeader';
import AdminSidebar from '../../components/AdminSidebar';
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

const AdminAppoinment = () => {
    const [chatUser, setChatUser] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [appointmentslot, setAppointmentslot] = useState([]);
    const [todayappointments, setTodayAppointments] = useState([]);
    const [cancelappointments, setCancelAppointments] = useState([]);
    const [appointment, setAppointment] = useState([]);
    const [updateappointment, setUpdateappointment] = useState([]);
    const [checkin, setCheckin] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCard, setSelectedCard] = useState(null);
    const [selectedCardTime, setSelectedCardTime] = useState(''); // NEW
    const [to, setTo] = useState([]);

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
            // console.log('Fetching:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Response status:1', response.status);
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
            console.log('Response status:2', response.status);
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
            console.log('Response status:3', response.status);
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
            let url = `${API_BASE_URL}admin/check-in`;
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

    // Filter appointments by name or status
    const filteredAppointments = appointment.filter(
        (appt) =>
            appt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appt.appointmentStatus?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        getAppointmentSlot();
        getTodayAppointment();
        getTodayCancelAppointment();
        getAppointment();
    }, []);
    // console.log('*********', filteredAppointments);

    return (
        <div className="dashboard-layout">
            <AdminSidebar />
            <div className="main-section">
                <AdminHeader onAvatarClick={() => setShowProfile((prev) => !prev)} />
                <div className="stats-header">
                    <div className="stat-box">
                        <img src={App1} style={{ width: '30px', height: '30px' }} />
                        <h2>{appointment.length}</h2>
                        <p>Appointments Today</p>
                    </div>
                    <div className="stat-box urgent">
                        <img src={App2} style={{ width: '30px', height: '30px' }} />
                        <h2>02</h2>
                        <p>Urgent Today</p>
                    </div>
                    <div className="stat-box canceled">
                        <img src={App3} style={{ width: '30px', height: '30px' }} />
                        <h2>{cancelappointments}</h2>
                        <p>Canceled Today</p>
                    </div>
                </div>
                {/* Filters */}
                <div className="filters">
                    <h3>Today ({filteredAppointments.length} Appointments)</h3>
                    <div className="search-section">
                        <input type="text" placeholder="Search by ID..." />
                        <button className="calendar-btn">August</button>
                        <button className="calendar-btn">Tomorrow</button>
                    </div>
                </div>

                {/* Cards */}
                <div className="cards-container">
                    {filteredAppointments.map((appt) => {
                        //       <AppointmentCard key={appt.id} {...appt}
                        //       onAvatarClick={() =>
                        // setChatUser(chatUser && chatUser.id === appt.id ? null : appt) }/>
                        const statusIcon =
                            appt.appointmentStatus === 'accept'
                                ? Vector
                                : appt.appointmentStatus === 'cancel'
                                ? Vector1
                                : appt.appointmentStatus === 'reschedule'
                                ? Vector2
                                : null;

                        return (
                            <AppointmentCard
                                key={appt.appointmentId}
                                name={appt.patientName}
                                time={appt.slotTime}
                                date={new Date(appt.slotDate).toLocaleDateString()}
                                type={appt.packageType === 'in_person' ? 'Inperson' : appt.packageType}
                                status={appt.appointmentStatus}
                                avatar={<img src={Avatar1} alt="icon" style={{ width: 60, height: 60, borderRadius: 30 }} />}
                                // icons={[Vector, Vector1, Vector2]}
                                icons={statusIcon ? [statusIcon] : []}
                                // onAvatarClick={() =>
                                //   setChatUser(chatUser && chatUser.appointmentId === appt.appointmentId ? null : appt)
                                // }
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
                                                    id: appt.appointmentId,
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
                    })}
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
                                        <span className="status completed">Completed</span>
                                    </div>
                                </div>
                                {/* <div style={{ marginTop: 18 }}>
                                    <div style={{ color: '#888', fontSize: 14 }}>Booking Time</div>
                                    <div style={{ fontSize: 20, fontWeight: 700 }}>{selectedCard.slotTime}</div>
                                    <div style={{ color: '#888', fontSize: 14 }}>Check-In Time</div>
                                    <div style={{ fontSize: 20, fontWeight: 700 }}>{selectedCard.slotTime}</div>
                                    <div style={{ color: '#888', fontSize: 15 }}>
                                        {new Date(selectedCard.slotDate).toLocaleDateString()}
                                    </div>
                                </div> */}
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
                                    onClick={() => getCheckin(selectedCard.appointmentId)}
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
                                    onClick={() => getUpdateappointment(selectedCard.appointmentId, 'accept')}
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
                                    onClick={() => getUpdateappointment(selectedCard.appointmentId, 'reschedule')}
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'Reschedule'}
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
                                        setSelectedCardTime('');
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
            {/* {chatUser && (
    <ChatPanel user={chatUser} onClose={() => setChatUser(null)} />
  )} */}

            {/* {showProfile ? (
  <Profile onClose={() => setShowProfile(false)} />
) : (
  chatUser && <ChatPanel user={chatUser} onClose={() => setChatUser(null)} />
)} */}
        </div>
    );
};
export default AdminAppoinment;
