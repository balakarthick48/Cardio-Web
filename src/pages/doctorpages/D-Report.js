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

const DoctorReport = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5; // Define number of rows per page
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [patients, setPatients] = useState([]);
    const [eachmonthpatients, setEachMonthPatients] = useState([]);
    const [todayappointments, setTodayAppointments] = useState([]);
    const [upcomingAppointment, setUpcomingAppointment] = useState([]);
    const [emergencyAppointment, setEmergencyAppointment] = useState([]);

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
            let url = `${API_BASE_URL}patient/getallpatientdetailsAll`;
            console.log('Fetching:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
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
                headers: { 'Content-Type': 'application/json' },
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
        { title: "Today's Patients", value: todayappointments.length, icon: <img src={Icon1} alt="icon" style={{ width: 28, height: 28 }} /> },
        { title: 'Upcoming Appointments', value: upcomingAppointment.length, icon: <img src={Icon} alt="icon" style={{ width: 28, height: 28 }} /> },
        { title: 'Total Consults', value: 150, icon: <img src={Icon3} alt="icon" style={{ width: 28, height: 28 }} /> }
    ];
    const dataline = [
        {
            date: '2000-01',
            uv: 4000,
            pv: 2400,
            amt: 2400
        },
        {
            date: '2000-02',
            uv: 3000,
            pv: 1398,
            amt: 2210
        },
        {
            date: '2000-03',
            uv: 2000,
            pv: 9800,
            amt: 2290
        },
        {
            date: '2000-04',
            uv: 2780,
            pv: 3908,
            amt: 2000
        },
        {
            date: '2000-05',
            uv: 1890,
            pv: 4800,
            amt: 2181
        },
        {
            date: '2000-06',
            uv: 2390,
            pv: 3800,
            amt: 2500
        },
        {
            date: '2000-07',
            uv: 3490,
            pv: 4300,
            amt: 2100
        },
        {
            date: '2000-08',
            uv: 4000,
            pv: 2400,
            amt: 2400
        },
        {
            date: '2000-09',
            uv: 3000,
            pv: 1398,
            amt: 2210
        },
        {
            date: '2000-10',
            uv: 2000,
            pv: 9800,
            amt: 2290
        },
        {
            date: '2000-11',
            uv: 2780,
            pv: 3908,
            amt: 2000
        },
        {
            date: '2000-12',
            uv: 1890,
            pv: 4800,
            amt: 2181
        }
    ];

    const monthTickFormatter = (tick) => {
        const date = new Date(tick);

        return date.getMonth() + 1;
    };

    const renderQuarterTick = (tickProps) => {
        const { x, y, payload, width, visibleTicksCount } = tickProps;
        const { value, offset } = payload;
        const date = new Date(value);
        const month = date.getMonth();
        const quarterNo = Math.floor(month / 3) + 1;
        const isMidMonth = month % 3 === 1;

        if (month % 3 === 1) {
            return <text x={x + width / visibleTicksCount / 2 - offset} y={y - 4} textAnchor="middle">{`Q${quarterNo}`}</text>;
        }

        const isLast = month === 11;

        if (month % 3 === 0 || isLast) {
            const pathX = Math.floor(isLast ? x - offset + width / visibleTicksCount : x - offset) + 0.5;

            return <path d={`M${pathX},${y - 4}v${-35}`} stroke="red" />;
        }
        return null;
    };

    useEffect(() => {
        getPatients();
        getUpcomingAppointment();
        getEmergencyAppointment();
        getTodayAppointment();
        getPatientsEachmonth();
    }, []);
    console.log('!!!!!:', emergencyAppointment);
    console.log('upcoming...:', upcomingAppointment);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-section">
                <Header />
                {/* <div className="container">
                    <div className="appointmentN-card">
                        <div className="appointment-info">
                            <p className="appointment-type">Current Appointment</p>
                            <h3 className="appointment-name">
                                Suresh D. <span className="appointment-id">(DRM0515)</span>
                            </h3>
                        </div>

                        <div className="appointment-status">
                            <span className="status">Ongoing</span>
                        </div>

                        <div className="appointment-time">6:00 PM - 6:30 PM</div>
                    </div>

                    <div className="appointmentN-card">
                        <div className="appointment-info">
                            <p className="appointment-type">Next Appointment</p>
                            <h3 className="appointment-name">
                                {upcomingAppointment[0]?.patientName} <span className="appointment-id"></span>
                            </h3>
                        </div>

                        <div className="appointment-status">
                            <button className="action-btn">Accept</button>
                            <button className="action-btn">Reschedule</button>
                        </div>

                        <div className="appointment-time">
                            {upcomingAppointment[0]?.createdAt
                                ? 
                                  new Date(upcomingAppointment[0].createdAt).toLocaleString('en-GB', {
                                      timeZone: 'UTC'
                                  })
                                : ''}
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
                            <button className="action-btn">Accept</button>
                            <button className="action-btn">Reschedule</button>
                        </div>
                        <div className="appointment-time">
                            {emergencyAppointment[0]?.createdAt
                                ? 
                                  new Date(emergencyAppointment[0].createdAt).toLocaleString('en-GB', {
                                      timeZone: 'UTC'
                                  })
                                : ''}
                        </div>
                    </div>
                </div> */}
                {/* <h2 style={{textAlign:'start', padding:10}}>Overview Cards</h2> */}
                {/* <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card new-style">
                            <div className="stat-header">
                                <div className="stat-icon-circle">{stat.icon}</div>
                                <select className="stat-dropdown">
                                    <option>Monthly</option>
                                    <option>Weekly</option>
                                    <option>Yearly</option>
                                </select>
                            </div>
                            <div className="stat-body">
                                <p className="stat-title">{stat.title}</p>
                                <h3 className="stat-value">{stat.value}</h3>
                            </div>
                            <div className="stat-footer">
                                <span className="stat-trend"></span>
                            </div>
                        </div>
                    ))}
                </div> */}
                <div className="chart-sections">
                    <h2 style={{ textAlign: 'start', padding: 10 }}>Patient Visit</h2>
                    <ResponsiveContainer width="150%" height={350}>
                        <BarChart
                            width={100}
                            height={400}
                            data={dataline}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickFormatter={monthTickFormatter} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                                tick={renderQuarterTick}
                                height={1}
                                scale="band"
                                xAxisId="quarter"
                            />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="pv" fill="#8884d8" />
                            <Bar dataKey="uv" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
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
                                                        <div>
                                                            <div>{row.patientName}</div>
                                                            {/* <div className="username">{row.username}</div> */}
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
export default DoctorReport;
