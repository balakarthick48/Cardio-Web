import React, { useState, useMemo, useEffect } from 'react';
import '../../styles/A-Dashboard.css';
import { ToastContainer, toast } from 'react-toastify';
import ChatPanel from '../../components/ChatPanel';
import Chat from '../../components/Chat';
import Profile from '../../components/Profile';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import AdminHeader from '../../components/AdminHeader';
import AdminSidebar from '../../components/AdminSidebar';
import Icon from '../../assets/images/Icon.png';
import Icon1 from '../../assets/images/Icon1.png';
import Icon2 from '../../assets/images/Icon2.png';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Cell, Pie, PieChart, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API_BASE_URL from '../../config';

function toMinutes(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
}
function fromMinutes(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function format12(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = ((h + 11) % 12) + 1;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

// Calendar Picker Component
function CalendarPicker({ slotDate, setSlotDate }) {
    const [currentMonth, setCurrentMonth] = React.useState(new Date(slotDate));

    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const days = [];
    const firstDay = getFirstDayOfMonth(currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth);
    const daysInPrevMonth = getDaysInMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

    // Previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
        days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push({ day: i, isCurrentMonth: true });
    }

    // Next month's days
    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let i = 1; i <= totalCells - days.length; i++) {
        days.push({ day: i, isCurrentMonth: false });
    }

    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

    const handleDayClick = (day) => {
        const year = currentMonth.getFullYear();
        const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
        const date = String(day).padStart(2, '0');
        const dateStr = `${year}-${month}-${date}`;
        setSlotDate(dateStr);
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div
            style={{
                width: 320,
                background: '#fff',
                border: '1px solid #dfe7ff',
                borderRadius: 12,
                padding: 20,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
        >
            {/* Header with month/year and navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <button
                    onClick={prevMonth}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: 18,
                        cursor: 'pointer',
                        color: '#0a66ff'
                    }}
                >
                    ←
                </button>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1e3a8a' }}>
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </div>
                <button
                    onClick={nextMonth}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: 18,
                        cursor: 'pointer',
                        color: '#0a66ff'
                    }}
                >
                    →
                </button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
                {dayNames.map((day) => (
                    <div key={day} style={{ textAlign: 'center', fontWeight: 600, fontSize: 12, color: '#666' }}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar days */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                {days.map((d, idx) => {
                    const isToday = new Date().toISOString().slice(0, 10) === `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
                    const isSelected = slotDate === `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;

                    return (
                        <button
                            key={idx}
                            onClick={() => d.isCurrentMonth && handleDayClick(d.day)}
                            disabled={!d.isCurrentMonth}
                            style={{
                                aspectRatio: '1',
                                border: isSelected ? '2px solid #0a66ff' : '1px solid #e0e0e0',
                                background: isSelected ? '#0a66ff' : isToday ? '#e3f2fd' : d.isCurrentMonth ? '#fff' : '#f9f9f9',
                                color: isSelected ? '#fff' : !d.isCurrentMonth ? '#bbb' : '#333',
                                fontWeight: isSelected || isToday ? 600 : 400,
                                fontSize: 12,
                                borderRadius: 6,
                                cursor: d.isCurrentMonth ? 'pointer' : 'default'
                            }}
                        >
                            {d.day}
                        </button>
                    );
                })}
            </div>

            {/* Selected date display */}
            <div style={{ marginTop: 16, padding: 10, background: '#f0f4ff', borderRadius: 6, textAlign: 'center', fontSize: 12, color: '#0a66ff', fontWeight: 600 }}>
                Selected: {slotDate}
            </div>
        </div>
    );
}
export default function AdminDashboard({ start = '10:00', end = '22:00', interval = 30, onChange = () => {} }) {
    const [selected, setSelected] = useState(null);
    const [slotDate, setSlotDate] = useState(new Date().toISOString().slice(0, 10)); // NEW
    const [chatUser, setChatUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5; // Define number of rows per page
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [to, setTo] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [createslot, setCreateslot] = useState([]);
    const [todayappointments, setTodayAppointments] = useState([]);
    const slots = useMemo(() => {
        const startMin = toMinutes(start);
        const endMin = toMinutes(end);
        const arr = [];
        for (let t = startMin; t <= endMin; t += interval) {
            arr.push(fromMinutes(t));
        }
        return arr;
    }, [start, end, interval]);

    const handleSelect = (time) => {
        setSelected(time);
        onChange(time); // parent callback
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
                    // setTodayAppointments(Array.isArray(data) ? data : []);
                    setTodayAppointments(data.data);
                } else {
                    setError(data.message || 'Failed to fetch patients detail');
                }
            } catch (err) {
                setError('Network erroaa');
            }
            setLoading(false);
        };

    const getCreateSlot = async (slotDateParam, slotTimeParam) => {
        if (!slotDateParam || !slotTimeParam) {
            setError('Select a date and time first');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // let url = `${API_BASE_URL}admin/create-slot`;
            let url = `${API_BASE_URL}patient/create-slot`;
            const slotTimeNormalized = slotTimeParam && slotTimeParam.length === 5 ? `${slotTimeParam}:00` : slotTimeParam;
            const body = {
                // doctorId: 2, slotDate
                slotDate: slotDateParam, // e.g. "2025-10-21" (YYYY-MM-DD)
                // slotTime: slotTimeParam, // e.g. "10:30"
                slotTime: slotTimeNormalized, // e.g. "10:30",
                // durationMinutes: interval,
                // packageType: "in_person"
            };
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( body )
            });
            console.log('body,,,,:', body);
            console.log('Response status:', response.status);
            console.log('??body:', response.body);
            console.log('url:', url);
            const data = await response.json();
            if (response.ok) {
                setCreateslot(data);
                toast.success(data.message);
            } else {
                setCreateslot([]);
                setError(data.message || 'Failed');
            }
            // console.log('prescriptions___', data.existingMedicines);
        } catch (err) {
            setError('Network error');
        }
        setLoading(false);
    };
    // Mock data
    const stats = [
        // { title: "Total Patients", value: dashboardData ? dashboardData.total_consults : 0, icon: <img src={Icon} alt="icon" style={{ width: 24, height: 24 }} /> }, 
        { title: "Total Patients", value: patients.length, icon: <img src={Icon} alt="icon" style={{ width: 24, height: 24 }} /> }, 
        { title: "Today's Appointments", value: todayappointments.length, icon: <img src={Icon1} alt="icon" style={{ width: 24, height: 24 }} /> },
        // { title: "Today's Appointments", value: dashboardData ? dashboardData.today_patients : 0, icon: <img src={Icon1} alt="icon" style={{ width: 24, height: 24 }} /> },
        { title: 'Doctors On Duty', value: "Active", icon: <img src={Icon2} alt="icon" style={{ width: 24, height: 24 }} /> }
        // { title: 'Total Consults', value: 150, icon: <img src={Icon1} alt="icon" style={{width: 24, height: 24}} /> }
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

    const renderColorfulLegendText = (value, entry) => {
        return <span style={{ color: '#596579', fontWeight: 500, padding: '10px' }}>{value}</span>;
    };

    const data = [
        { name: 'Excellent', value: 400, fill: '#3671E7' },
        { name: 'Good', value: 300, fill: '#0165Fc' },
        { name: 'Poor', value: 300, fill: '#FE8D28' }
    ];

     const getDashboardData = async () => {
            setLoading(true);
        setError('');
        try {
            // Extract month and year from selectedMonth (format: 'YYYY-MM')
            // let month = '';
            // let year = '';
            // console.log('Selected,, month/year:', month, year);
            // if (selectedMonth && selectedMonth.includes('-')) {
            //     [year, month] = selectedMonth.split('-');
            //     console.log('Selected month/year:', month, year);
            // } else {
            //     // fallback to current month/year if not set
            //     const now = new Date();
            //     year = now.getFullYear().toString();
            //     month = String(now.getMonth() + 1).padStart(2, '0');
            // }
                // let url = `${API_BASE_URL}patient/dashboard/monthly-counts?month=${month}&year=${year}`;
                let url = `${API_BASE_URL}patient/dashboard/monthly-counts?month=2&year=2026`;
                console.log('Fetchingdashboard:', url);
                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('dashboard data:', data);
                if (response.ok) {
                    setDashboardData(data.data);
                } else {
                    setError(data.message || 'Failed to fetch dashboard data');
                }
            } catch (err) {
                setError('Network erroaa');
            }
            setLoading(false);
        };
    const COLORS = ['#3671E7', '#0165Fc', '#FE8D28'];
    useEffect(() => {
        getPatients();
        getCreateSlot();
        getTodayAppointment();
        getDashboardData();
    }, []);

    return (
        <div className="dashboard-layout">
            <AdminSidebar />
            <div className="main-section">
                <AdminHeader />
                <h2 style={{ textAlign: 'start', padding: 10 }}>Overview Cards</h2>
                <div className="stats-grida">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="stat-content">
                                <div className="stat-icon">{stat.icon}</div>
                                <p>{stat.title}</p>
                                <h3>{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>
                <h2 style={{ textAlign: 'start', padding: 10 }}>Slot Create</h2>
                <div style={{ display: 'flex', gap: 24, margin: '16px auto', maxWidth: '1200px', justifyContent: 'center', padding: '0 20px' }}>
                    {/* Left side: Time slots */}
                    <div style={{ flex: 1, minWidth: 400 }}>
                        <h3 style={{ marginTop: 0, color: '#333', fontSize: 16 }}>Select Time Slot</h3>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: 12,
                                maxWidth: 500
                            }}
                        >
                            {slots.map((t) => {
                                const isSelected = selected === t;
                                const disabled = false;
                                return (
                                    <button
                                        key={t}
                                        onClick={() => !disabled && handleSelect(t)}
                                        disabled={disabled}
                                        aria-pressed={isSelected}
                                        style={{
                                            padding: '12px 8px',
                                            borderRadius: 8,
                                            border: isSelected ? 'none' : '1px solid #dfe7ff',
                                            background: isSelected ? '#0a66ff' : disabled ? '#f2f4f7' : '#fff',
                                            color: isSelected ? '#fff' : disabled ? '#9aa6b2' : '#222',
                                            fontWeight: isSelected ? 700 : 600,
                                            fontSize: 14,
                                            cursor: disabled ? 'not-allowed' : 'pointer',
                                            boxShadow: isSelected ? '0 6px 14px rgba(10,102,255,0.16)' : 'none'
                                        }}
                                    >
                                        {format12(t)}
                                    </button>
                                );
                            })}
                        </div>

                        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                            <button
                                onClick={() => getCreateSlot(slotDate, selected)}
                                style={{
                                    background: '#0a66ff',
                                    color: '#fff',
                                    padding: '12px 48px',
                                    borderRadius: 8,
                                    border: 'none',
                                    cursor: !selected || loading ? 'not-allowed' : 'pointer',
                                    fontSize: 16,
                                    fontWeight: 600
                                }}
                            >
                               {loading ? 'Processing...' : 'Book Appointment'}
                            </button>
                        </div>
                    </div>

                    {/* Right side: Calendar */}
                    <CalendarPicker slotDate={slotDate} setSlotDate={setSlotDate} />
                </div>
                <div className="chart-sections">
                    <h2 style={{ textAlign: 'start', padding: 10 }}>Graphs/Charts</h2>
                    <ResponsiveContainer width="80%" height={300}>
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
                <div className="chart-section">
                    <h2 style={{ textAlign: 'start', padding: 10 }}>Doctor Performance</h2>
                    <PieChart width={800} height={400}>
                        <Legend
                            height={36}
                            iconType="box"
                            layout="vertical"
                            verticalAlign="middle"
                            iconSize={10}
                            padding={5}
                            formatter={renderColorfulLegendText}
                        />
                        <Pie
                            data={data}
                            cx={120}
                            cy={200}
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
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
                                <th>Hostory</th>
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
                                    <td>{row.history}</td>
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
            <Chat to={to} setTo={setTo} />
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
        </div>
    );
}
