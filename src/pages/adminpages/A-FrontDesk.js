import React, { useState, useEffect } from 'react';
import '../../styles/D-Dashboard.css';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import '../../styles/A-FrontDesk.css';
import Profile from '../../components/Profile';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import API_BASE_URL from '../../config';
import { useNavigate } from 'react-router-dom';
import appimg from '../../assets/images/App-B.png';
import apps1img from '../../assets/images/Apps1.png';
import apps2img from '../../assets/images/Apps2.png';
import apps3img from '../../assets/images/Apps3.png';
import inv1img from '../../assets/images/Inv1.png';
import inv2img from '../../assets/images/Inv2.png';
import inv3img from '../../assets/images/Inv3.png';
import inv4img from '../../assets/images/Inv4.png';
import inv5img from '../../assets/images/Inv5.png';
import inv6img from '../../assets/images/Inv6.png';
import Asset1 from '../../assets/images/Asset1.png';
import Asset2 from '../../assets/images/Asset2.png';
import Asset3 from '../../assets/images/Asset3.png';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';

const AdminFrontDesk = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [patients, setPatients] = useState([]);
    const [doctorHours, setDoctorHours] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('August');

    const getPatients = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}doctor/appointments/doctor?doctorId=5`;
            console.log('Fetching:', url);
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
            setError('Network error');
        }
        setLoading(false);
    };

    const getDoctorHours = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}patient/doctor-working-hours?doctorId=5`;
            console.log('Fetching:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('doctor hours response:', data);
            if (response.ok) {
                setDoctorHours(data.data);
            } else {
                setError(data.message || 'Failed to fetch doctor hours');
            }
        } catch (err) {
            setError('Network error');
        }
        setLoading(false);
    };

    useEffect(() => {
        getPatients();
        getDoctorHours();
    }, []);

    // other UI --------
    // Sample data for dashboard metrics
    // const dashboardData = {
    //     appointments: {
    //         total: 100,
    //         patients: 50,
    //         representatives: 20
    //     },
    //     billReceipt: {
    //         collectedAmount: 20000,
    //         paidAmount: 10000,
    //         balanceAmount: 10000
    //     },
    //     inventory: {
    //         totalPR: 50,
    //         prPending: 10,
    //         prApproved: 5,
    //         totalPO: 50,
    //         totalInward: 10,
    //         totalBills: 5
    //     },
    //     accounts: {
    //         dueAmount: 50,
    //         notDue: 10,
    //         totalPayable: 5
    //     },
    //     assets: [
    //         { name: 'Laptop', quantity: 4, price: 25000, total: 100000 },
    //         { name: 'ECG', quantity: 1, price: 125000, total: 125000 },
    //         { name: 'X-Ray', quantity: 1, price: 50000, total: 50000 }
    //     ]
    // };

    // const StatCard = ({ icon, label, value, color = '#0a66ff' }) => (
    //     <div style={{
    //         display: 'flex',
    //         alignItems: 'center',
    //         gap: 12,
    //         padding: '12px 0'
    //     }}>
    //         <div style={{
    //             fontSize: 24,
    //             color: color,
    //             width: 40,
    //             height: 40,
    //             display: 'flex',
    //             alignItems: 'center',
    //             justifyContent: 'center',
    //             background: `${color}15`,
    //             borderRadius: 8
    //         }}>
    //             {icon}
    //         </div>
    //         <div>
    //             <div style={{ fontSize: 12, color: '#666' }}>{label}</div>
    //             <div style={{ fontSize: 20, fontWeight: 'bold', color: '#222' }}>{value}</div>
    //         </div>
    //     </div>
    // );

    // const DashboardCard = ({ title, children, style = {} }) => (
    //     <div style={{
    //         background: '#fff',
    //         borderRadius: 12,
    //         padding: 20,
    //         boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    //         border: '1px solid #e8e8e8',
    //         ...style
    //     }}>
    //         <h3 style={{ margin: '0 0 18px 0', color: '#222', fontSize: 16, fontWeight: 600 }}>
    //             {title}
    //         </h3>
    //         {children}
    //     </div>
    // );
    // other UI --------

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-section">
                <Header />
                
                {/* other UI -------- */}
                {/* <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                        <DashboardCard title="Appointment Booking">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{ margin: 0, color: '#666', fontSize: 14 }}>Schedule new appointments</p>
                                    <button style={{
                                        marginTop: 12,
                                        padding: '8px 16px',
                                        background: '#0a66ff',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        fontSize: 14
                                    }}>
                                        View Slot
                                    </button>
                                </div>
                                <div style={{ fontSize: 80, opacity: 0.1 }}>📅</div>
                            </div>
                        </DashboardCard>

                        <DashboardCard title="Appointments">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
                                        style={{
                                            padding: '6px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: 6,
                                            background: '#fff',
                                            cursor: 'pointer',
                                            fontSize: 12
                                        }}>
                                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => 
                                            <option key={m}>{m}</option>
                                        )}
                                    </select>
                                </div>
                                <button style={{
                                    padding: '6px 12px',
                                    border: '1px solid #ddd',
                                    background: '#fff',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontSize: 12
                                }}>
                                    Today
                                </button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-around', gap: 16 }}>
                                <StatCard icon="📋" label="Total Appointments" value={dashboardData.appointments.total} />
                                <StatCard icon="👤" label="Total Patients" value={dashboardData.appointments.patients} />
                                <StatCard icon="👥" label="Total Representatives" value={dashboardData.appointments.representatives} />
                            </div>
                        </DashboardCard>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                        <DashboardCard title="Inventory">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                                <div style={{ padding: '12px', background: '#f0f7ff', borderRadius: 8 }}>
                                    <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Total PR</div>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0a66ff' }}>{dashboardData.inventory.totalPR}</div>
                                </div>
                                <div style={{ padding: '12px', background: '#fff8f0', borderRadius: 8 }}>
                                    <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>PR Pending</div>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff9800' }}>{dashboardData.inventory.prPending}</div>
                                </div>
                                <div style={{ padding: '12px', background: '#f0f8f0', borderRadius: 8 }}>
                                    <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>PR Approved</div>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#4caf50' }}>{dashboardData.inventory.prApproved}</div>
                                </div>
                                <div style={{ padding: '12px', background: '#f0f7ff', borderRadius: 8 }}>
                                    <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Total PO</div>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0a66ff' }}>{dashboardData.inventory.totalPO}</div>
                                </div>
                                <div style={{ padding: '12px', background: '#fff8f0', borderRadius: 8 }}>
                                    <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Total Inward</div>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff9800' }}>{dashboardData.inventory.totalInward}</div>
                                </div>
                                <div style={{ padding: '12px', background: '#f0f8f0', borderRadius: 8 }}>
                                    <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Total Bills</div>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#4caf50' }}>{dashboardData.inventory.totalBills}</div>
                                </div>
                            </div>
                        </DashboardCard>

                        <DashboardCard title="Bill Receipt (Total)">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
                                    style={{
                                        padding: '6px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: 6,
                                        background: '#fff',
                                        cursor: 'pointer',
                                        fontSize: 12
                                    }}>
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => 
                                        <option key={m}>{m}</option>
                                    )}
                                </select>
                                <button style={{
                                    padding: '6px 12px',
                                    border: '1px solid #ddd',
                                    background: '#fff',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontSize: 12
                                }}>
                                    Today
                                </button>
                            </div>
                            <div>
                                <StatCard icon="💰" label="Total Collected Amount" value={`₹ ${dashboardData.billReceipt.collectedAmount.toLocaleString()}`} color="#4caf50" />
                                <StatCard icon="💳" label="Total Amount Paid" value={`₹ ${dashboardData.billReceipt.paidAmount.toLocaleString()}`} color="#2196f3" />
                                <StatCard icon="⚖️" label="Balance Amount" value={`₹ ${dashboardData.billReceipt.balanceAmount.toLocaleString()}`} color="#f44336" />
                            </div>
                        </DashboardCard>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <DashboardCard title="Accounts">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                                <div style={{ padding: '12px', background: '#f0f7ff', borderRadius: 8 }}>
                                    <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Due Amount</div>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0a66ff' }}>{dashboardData.accounts.dueAmount}</div>
                                </div>
                                <div style={{ padding: '12px', background: '#fff8f0', borderRadius: 8 }}>
                                    <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Not Due</div>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff9800' }}>{dashboardData.accounts.notDue}</div>
                                </div>
                                <div style={{ padding: '12px', background: '#f0f8f0', borderRadius: 8 }}>
                                    <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Total Payable</div>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#4caf50' }}>{dashboardData.accounts.totalPayable}</div>
                                </div>
                            </div>
                        </DashboardCard>

                        <DashboardCard title="Assets">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {dashboardData.assets.map((asset, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px',
                                        background: '#f9f9f9',
                                        borderRadius: 8,
                                        borderLeft: '3px solid #0a66ff'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#222', marginBottom: 4 }}>{asset.name}</div>
                                            <div style={{ fontSize: 12, color: '#666' }}>
                                                Qty: {asset.quantity} | Price: ₹ {asset.price.toLocaleString()}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 16, fontWeight: 'bold', color: '#4caf50' }}>
                                            ₹ {asset.total.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </DashboardCard>
                    </div> */}
                {/* other UI -------- */}
                <div className="dashboard-content">
                    {/* Row 1 */}
                    <div className="grid-row">
                        <div className="card booking-card">
                            <div>
                                <h3>Appointment Booking</h3>
                                <button className="primary-btn">View Slot</button>
                            </div>
                            <img src={appimg} alt="booking" />
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h3>Appointments</h3>
                                <span>August | Today</span>
                            </div>

                            <div className="stats-row">
                                <div className="stat-box">
                                    <img src={apps1img} alt="booking" />
                                    <p>Total Appointments</p>
                                    <h2>100</h2>
                                </div>
                                <div className="stat-box">
                                    <img src={apps2img} alt="booking" />
                                    <p>Total Patients</p>
                                    <h2>50</h2>
                                </div>
                                <div className="stat-box">
                                    <img src={apps3img} alt="booking" />
                                    <p>Total Representatives</p>
                                    <h2>20</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid-row">
                        <div className="card">
                            <h3>Inventory</h3>
                            <div className="stats-grid">
                                <div className="mini-box">
                                    <img src={inv1img} alt="booking" className="booking-img" />Total PR <span>50</span></div>
                                <div className="mini-box warning">
                                    <img src={inv2img} alt="booking" className="booking-img" />PR Pending <span>10</span></div>
                                <div className="mini-box success">
                                    <img src={inv3img} alt="booking" className="booking-img" />PR Approved <span>05</span></div>
                                <div className="mini-box">
                                    <img src={inv4img} alt="booking" className="booking-img" />Total PO <span>50</span></div>
                                <div className="mini-box">
                                    <img src={inv5img} alt="booking" className="booking-img" />Total Inward <span>10</span></div>
                                <div className="mini-box success">
                                    <img src={inv6img} alt="booking" className="booking-img" />Total Bills <span>05</span></div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h3>Bill Receipt (Total)</h3>
                                <span>August | Today</span>
                            </div>

                            <div className="bill-list">
                                <p>Total Collected Amount <b className="green">₹ 20,000</b></p>
                                <p>Total Amount Paid <b className="blue">₹ 10,000</b></p>
                                <p>Balance Amount <b className="red">₹ 10,000</b></p>
                            </div>
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="grid-row">
                        <div className="card">
                            <h3>Accounts</h3>
                            <div className="stats-grid">
                                <div className="mini-box">
                                    <img src={inv1img} alt="booking" className="booking-img" />Due Amount <span>50</span></div>
                                <div className="mini-box warning">
                                    <img src={inv2img} alt="booking" className="booking-img" />Not Due <span>10</span></div>
                                <div className="mini-box success">
                                    <img src={inv3img} alt="booking" className="booking-img" />Total Payable <span>05</span></div>
                            </div>
                        </div>

                        <div className="card">
                            <h3>Assets</h3>
                            <ul className="asset-list">
                                <div className="stats-grid">
                                    <img src={Asset1} alt="booking" className="booking-img" />Laptop (4) <li><span>50</span> <span className="green">₹ 1,00,000</span></li></div>
                                <div className="stats-grid">
                                    <img src={Asset2} alt="booking" className="booking-img" />ECG (01) <li><span>50</span> <span className="green">₹ 1,00,000</span></li></div>
                                <div className="stats-grid">
                                    <img src={Asset3} alt="booking" className="booking-img" />X-Ray (01) <li><span>50</span> <span className="green">₹ 1,00,000</span></li></div>
                                {/* <img src={Asset1} alt="booking" className="booking-img"/><li>Laptop (04) <span className="green">₹ 1,00,000</span></li>
            <li>ECG (01) <span className="green">₹ 1,25,000</span></li>
            <li>X-Ray (01) <span className="green">₹ 50,000</span></li> */}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminFrontDesk;