import React, { useState, useEffect } from 'react';
import '../../styles/D-Dashboard.css';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Profile from '../../components/Profile';
import CenteredLoader from '../../components/CenteredLoader';
import { fetchAppointmentHistory } from '../../api/appointmentHistoryApi';
import Icon from '../../assets/images/Icon.png';
import Icon1 from '../../assets/images/Icon1.png';
import Icon2 from '../../assets/images/Icon2.png';
import Icon3 from '../../assets/images/Icon3.png';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API_BASE_URL from '../../config';
import { useNavigate } from 'react-router-dom';
import DateValues from '../../configs/dateValues';

const styles = {
    filterContainer: {
        padding: '20px 16px',
        background: '#fff',
        margin: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        contentAlign: 'center',
    },
    filterLabel: {
        marginTop: '0px !important',
        fontSize: '14px !important',
        color: '#666 !important',
        fontWeight: '500 !important',
    },
    filterSelect: {
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '14px',
        cursor: 'pointer',
        backgroundColor: '#fff',
    },
    loadingText: {
        color: '#0a66ff',
        fontWeight: '500',
        fontSize: '14px',
    },
    searchInput: {
        padding: '6px 10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        marginLeft: 'auto',
    },
    patientName: {
        color: '#2563eb',
        cursor: 'pointer',
        fontWeight: '600',
    },
    paginationContainer: {
        marginTop: 50,
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
    },
    paginationIcon: {
        verticalalign: 'middle',
    },
    appointmentHistoryTitle: {
        margin: '24px 20px 8px',
    },
    appointmentHistoryText: {
        margin: '0 20px',
        color: '#4b5563',
    },
    errorMessage: {
        color: 'red',
        textAlign: 'center',
        margin: '20px',
    },
    teamTableCard: {
        margin: '20px',
    },
    tableHeaderActions: {
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    itemsPerPageContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    viewActionButton: {
        background: '#f2f2f2',
        color: '#0a66ff',
        border: 'none',
        cursor: 'pointer',
    },
    noDataText: {
        textAlign: 'center',
        padding: '20px',
    },
    searchInputNoMargin: {
        padding: '6px 10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        marginLeft: 0,
        width: '250px',
    },
};

const PatientList = () => {
    const navigate = useNavigate();
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const date30DaysAgo = thirtyDaysAgo.toISOString().split('T')[0];

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [patients, setPatients] = useState([]);
    const [eachmonthpatients, setEachMonthPatients] = useState([]);
    const [todayappointments, setTodayAppointments] = useState([]);
    const [upcomingAppointment, setUpcomingAppointment] = useState([]);
    const [emergencyAppointment, setEmergencyAppointment] = useState([]);
    const [activeTab, setActiveTab] = useState('patientHistory');
    const [fromDate, setFromDate] = useState(date30DaysAgo);
    const [toDate, setToDate] = useState(today);
    const [searchPatient, setSearchPatient] = useState('');
    const [appointmentHistory, setAppointmentHistory] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Month and Year filter states
    const [selectedMonth, setSelectedMonth] = useState(DateValues.onLoadDefaultMonth);
    const [selectedYear, setSelectedYear] = useState(DateValues.currentYear.toString());

    // Pagination + Search logic
    const filteredUsers = patients.filter(
        (user) => user.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || user.mobileNumber?.toString().includes(searchTerm)
    );

    //pagination logic
    const indexOfLastRow = currentPage * itemsPerPage;
    const indexOfFirstRow = indexOfLastRow - itemsPerPage;
    const currentRows = filteredUsers.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const searchedAppointmentHistory = appointmentHistory.filter((item) => {
        const lowercasedFilter = searchPatient.toLowerCase();
        return (
            item.patient_name?.toLowerCase().includes(lowercasedFilter) ||
            item.phone_number?.includes(lowercasedFilter) ||
            item.patient_id?.toString().includes(lowercasedFilter)
        );
    });

    const totalHistoryPages = Math.ceil(searchedAppointmentHistory.length / itemsPerPage);
    const currentHistoryRows = searchedAppointmentHistory.slice(indexOfFirstRow, indexOfLastRow);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleViewAction = (item) => {
        console.log('View action for item:', item);
        navigate("/patient-detail", {
            state: {
                patientId: item.patient_id,
                name: item.patient_name,
                email: item.email,
                mobile: item.phone_number,
                address: item.address
            }
        })
    };

    const handleSegmentChange = (segment) => {
        setActiveTab(segment);
        setCurrentPage(1);
        updateSegmentDataIfRequired(segment);
    };

    const updateSegmentDataIfRequired = (segment) => {
        switch (segment) {
            case 'patientHistory':
                console.log('Updating patient history data if required...');
                getPatients();
                break;
            case 'appointmentHistory':
                getAppointmentHistory();
                break;
            default:
                break;
        }
    };

    const getAppointmentHistory = async (btnAction = false) => {
        // Skip if we already have data
        if (appointmentHistory.length > 0 && !btnAction) {
            return;
        }

        try {
            setLoading(true);
            setError('');
            const data = await fetchAppointmentHistory({
                fromDate,
                toDate,
            });
            setAppointmentHistory(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch appointment history');
        } finally {
            setLoading(false);
        }
    };

    const getPatients = async () => {
        // Only fetch if both month and year are selected

        setLoading(true);
        setError('');
        try {
            // let url = `${API_BASE_URL}patient/getAllPatientDetails`;
            let url = `${API_BASE_URL}patient/getallpatientdetailsAll?month=${selectedMonth}&year=${selectedYear}`;
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
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
            <Sidebar />
            <div className="main-section">
                <Header />
                <div className="dp-tab-bar">
                    <button
                        className={`dp-tab ${activeTab === 'patientHistory' ? 'active' : ''}`}
                        onClick={() => handleSegmentChange('patientHistory')}
                    >
                        Patient History
                    </button>
                    <button
                        className={`dp-tab ${activeTab === 'appointmentHistory' ? 'active' : ''}`}
                        onClick={() => handleSegmentChange('appointmentHistory')}
                    >
                        Appointment History
                    </button>
                </div>

                {activeTab === 'patientHistory' && (
                    <>
                        {/* Month and Year Filter */}
                        <div style={styles.filterContainer}>
                            <div>
                                <label style={styles.filterLabel}>Select Month:</label>
                            </div>
                            <select
                                value={selectedMonth}
                                onChange={(e) => {
                                    setSelectedMonth(e.target.value);
                                    setCurrentPage(1); // Reset to first page
                                }}
                                style={styles.filterSelect}
                            >
                                <option value="">-- Select Month --</option>
                                {DateValues.months.map((month) => (
                                    <option key={month.value} value={month.value}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>

                            <div>
                                <label style={styles.filterLabel}>Select Year:</label>
                            </div>
                            <select
                                value={selectedYear}
                                onChange={(e) => {
                                    setSelectedYear(e.target.value);
                                    setCurrentPage(1); // Reset to first page
                                }}
                                style={styles.filterSelect}
                            >
                                <option value="">-- Select Year --</option>
                                {DateValues.years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            {loading && <span style={styles.loadingText}>Loading...</span>}
                        </div>

                        <div className="team-table-card">
                            <div className="team-table-header">
                                <span className="team-table-title">
                                    Patient Data
                                    <span className="team-table-chip">{patients.length} Patients</span>
                                </span>
                                <div style={styles.tableHeaderActions}>
                                    <input
                                        type="text"
                                        placeholder="Search by Name or Mobile..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1); // Reset to first page on search
                                        }}
                                        style={styles.searchInputNoMargin}
                                    />
                                </div>
                            </div>
                            <table className="team-table">
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
                                                        style={styles.patientName}
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
                            <div className="pagination" style={styles.paginationContainer}>
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">
                                    <FaArrowLeft style={styles.paginationIcon} />
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
                                    Next <FaArrowRight style={styles.paginationIcon} />
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'appointmentHistory' && (
                    <>
                        <div className="appointment-history-section">
                            <div className="appointment-history-filters">
                                <div className="appointment-history-field">
                                    <label>From Date</label>
                                    <input
                                        type="date"
                                        max={today}
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </div>
                                <div className="appointment-history-field">
                                    <label>To Date</label>
                                    <input
                                        type="date"
                                        max={today}
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </div>
                                <div className="appointment-history-field">
                                    <label>Search Patient</label>
                                    <input
                                        type="text"
                                        placeholder="Name, Phone number, ID"
                                        value={searchPatient}
                                        onChange={(e) => {
                                            setSearchPatient(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                                <button
                                    className="appointment-history-search-btn"
                                    onClick={() => {
                                        setCurrentPage(1);
                                        setAppointmentHistory([]);
                                        getAppointmentHistory(true);
                                    }}
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                        {loading && <CenteredLoader />}
                        {!loading && error && <div className="error-message" style={styles.errorMessage}>{error}</div>}
                        {!loading && !error && (
                            <div className="team-table-card" style={styles.teamTableCard}>
                                <div className="team-table-header" style={{ gap: 6 }}>
                                    <span className="team-table-title">Completed patient History</span>
                                    <div>
                                        <label htmlFor="items-per-page-history" style={styles.filterLabel}> Total: </label>
                                        <span className="team-table-chip">{appointmentHistory.length}</span>
                                    </div>

                                    <div style={styles.tableHeaderActions}>
                                        <div style={styles.itemsPerPageContainer}>
                                            <div>
                                                <label htmlFor="items-per-page-history" style={styles.filterLabel}>Show:</label>
                                            </div>
                                            <select
                                                id="items-per-page-history"
                                                value={itemsPerPage}
                                                onChange={(e) => {
                                                    setItemsPerPage(Number(e.target.value));
                                                    setCurrentPage(1);
                                                }}
                                                style={styles.filterSelect}
                                            >
                                                <option value={1}>1 item</option>
                                                <option value={5}>5 items</option>
                                                <option value={10}>10 items</option>
                                                <option value={25}>25 items</option>
                                                <option value={50}>50 items</option>
                                                <option value={100}>100 items</option>
                                                <option value={200}>200 items</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                {currentHistoryRows.length > 0 ? (
                                    <>
                                        <table className="team-table">
                                            <thead>
                                                <tr>
                                                    <th>Patient ID</th>
                                                    <th>Patient Name</th>
                                                    <th>Appoint Date</th>
                                                    <th>Appoint Type</th>
                                                    <th>Slot Time</th>
                                                    <th>Check-In</th>
                                                    <th>Check-Out</th>
                                                    <th>Problem</th>
                                                    <th>Phone Number</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentHistoryRows.map((item, idx) => (
                                                    <tr key={item.appointment_id || idx}>
                                                        <td>{item.patient_id}</td>
                                                        <td>{item.patient_name}</td>
                                                        <td>{item.appointment_date}</td>
                                                        <td>{item.appointment_type}</td>
                                                        <td>{item.slot_time}</td>
                                                        <td>{item.check_in || '-'}</td>
                                                        <td>{item.check_out || '-'}</td>
                                                        <td>{item.problem}</td>
                                                        <td>{item.phone_number}</td>
                                                        <td>
                                                            <button
                                                                onClick={() => handleViewAction(item)} style={styles.viewActionButton}
                                                            >
                                                                View
                                                            </button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="pagination" style={styles.paginationContainer}>
                                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">
                                                <FaArrowLeft style={styles.paginationIcon} /> Previous
                                            </button>
                                            {getPagination(currentPage, totalHistoryPages).map((page, index) => (
                                                <button key={index} onClick={() => typeof page === 'number' && handlePageChange(page)} className={`pagination-btn ${page === currentPage ? 'active' : ''}`} disabled={page === '...'}>{page}</button>
                                            ))}
                                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalHistoryPages} className="pagination-btn">
                                                Next <FaArrowRight style={styles.paginationIcon} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <p style={styles.noDataText}>No completed appointments found for the selected date range.</p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
            <Profile />
        </div>
    );
};
export default PatientList;
