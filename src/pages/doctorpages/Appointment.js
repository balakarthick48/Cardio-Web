import React, {useEffect, useState} from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
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

// const appointments = [

//   {
//     id: 1,
//     name: "Aarav Sharma",
//     time: "10:00 AM",
//     date: "22/08/2025",
//     type: "Inperson",
//     status: "Paid",
//     avatar: <img src={Avatar1} alt="icon" style={{width: 60, height: 60, borderRadius: 30}} /> ,
//     icons: [Vector, Vector1, Vector2] // Example icons
//   },
//   {
//     id: 2,
//     name: "Aniket Verma",
//     time: "10:30 AM",
//     date: "22/08/2025",
//     type: "Video",
//     status: "Pay",
//     avatar: <img src={Avatar2} alt="icon" style={{width: 60, height: 60, borderRadius: 30}} /> ,
//     icons: [Vector, Vector1, Vector2]
//   },
//   {
//     id: 3,
//     name: "Manish Kumar",
//     time: "11:00 AM",
//     date: "22/08/2025",
//     type: "Inperson",
//     status: "Check-In",
//     avatar: <img src={Avatar1} alt="icon" style={{width: 60, height: 60, borderRadius: 30}} /> ,
//     icons: [Vector, Vector1, Vector2]
//   },
//   {
//     id: 4,
//     name: "Arjun Mehta",
//     time: "11:30 AM",
//     date: "22/08/2025",
//     type: "Inperson",
//     status: "Progress",
//     avatar: <img src={Avatar2} alt="icon" style={{width: 60, height: 60, borderRadius: 30}} /> ,
//     icons: [Vector, Vector1, Vector2]
//   },
//   {
//     id: 5,
//     name: "Neha Pillai",
//     time: "12:00 PM",
//     date: "22/08/2025",
//     type: "Video",
//     status: "Next",
//     avatar: <img src={Avatar1} alt="icon" style={{width: 60, height: 60, borderRadius: 30}} /> ,
//     icons: [Vector, Vector1, Vector2]
//   },
//   {
//     id: 6,
//     name: "Vivek Mishra",
//     time: "12:30 PM",
//     date: "22/08/2025",
//     type: "Inperson",
//     status: "Next",
//     avatar: <img src={Avatar2} alt="icon" style={{width: 60, height: 60, borderRadius: 30}} /> ,
//     icons: [Vector, Vector1, Vector2]
//   },
// ];
const Appoinment = () => {
  const [chatUser, setChatUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointmentslot,setAppointmentslot] = useState([]);
  const [todayappointments, setTodayAppointments] = useState([]);
  const [cancelappointments, setCancelAppointments] = useState([]);
  const [appointment, setAppointment] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [to, setTo] = useState([]);

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

        // Filter appointments by name or status
  const filteredAppointments = appointment.filter(appt =>
    appt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appt.appointmentStatus?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
     getAppointmentSlot(); 
     getTodayAppointment();
     getTodayCancelAppointment();
     getAppointment();
    }, []);
console.log('*********',filteredAppointments);

      return (
    <div className="dashboard-layout">
            <Sidebar />
            <div className="main-section">
                <Header onAvatarClick={() => setShowProfile((prev) => !prev)} />
                <div className="stats-header">
      <div className="stat-box">
        <img
            src={App1}
            style={{ width: '30px', height: '30px' }}
          />
        <h2>{appointment.length}</h2>
        <p>Appointments Today</p>
      </div>
      <div className="stat-box urgent">
        <img
            src={App2}
            style={{ width: '30px', height: '30px' }}
          />
        <h2>02</h2>
        <p>Urgent Today</p>
      </div>
      <div className="stat-box canceled">
        <img
            src={App3}
            style={{ width: '30px', height: '30px' }}
          />
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
        {filteredAppointments.map((appt) => (
    //       <AppointmentCard key={appt.id} {...appt} 
    //       onAvatarClick={() =>
    // setChatUser(chatUser && chatUser.id === appt.id ? null : appt) }/>
   <AppointmentCard
  key={appt.appointmentId}
  name={appt.patientName}
  time={appt.slotTime}
  date={new Date(appt.slotDate).toLocaleDateString()}
  type={appt.packageType === "in_person" ? "Inperson" : appt.packageType}
  status={appt.appointmentStatus}
  avatar={<img src={Avatar1} alt="icon" style={{width: 60, height: 60, borderRadius: 30}} />}
  icons={[Vector, Vector1, Vector2]}
  // onAvatarClick={() =>
      //   setChatUser(chatUser && chatUser.appointmentId === appt.appointmentId ? null : appt)
      // }
  onClick={() => {
    setTo(prevTo => {
      const exists = prevTo.some(user => user.id === appt.patientId);
      if (exists) {
        // Remove if already selected
        return prevTo.filter(user => user.id !== appt.patientId);
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
        ))}
      </div>
    </div>
    {/* <Profile /> */}
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
export default Appoinment;