import React, { useState, useEffect } from 'react';
import '../../styles/A-Dashboard.css';
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

const AdminDashboard = () => {
    const [chatUser, setChatUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5; // Define number of rows per page
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [to, setTo] = useState([]);
    
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
                let url = `${API_BASE_URL}patient/getAllPatientDetails`;
                console.log('Fetching:', url);
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ month: 9 })
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

    // Mock data
    const stats = [
        { title: "Today's Patients", value: 12, icon: <img src={Icon} alt="icon" style={{ width: 24, height: 24 }} /> },
        { title: 'Upcoming Appointments', value: 5, icon: <img src={Icon1} alt="icon" style={{ width: 24, height: 24 }} /> },
        { title: 'Doctors On Duty', value: 150, icon: <img src={Icon2} alt="icon" style={{ width: 24, height: 24 }} /> }
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

    const COLORS = ['#3671E7', '#0165Fc', '#FE8D28'];
    useEffect(() => {
        getPatients();
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
                                <h3>{stat.value}</h3>
                                <p>{stat.title}</p>
                            </div>
                        </div>
                    ))}
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
            <Chat to={to} setTo={setTo}/>
        </div>
    );
};
export default AdminDashboard;
