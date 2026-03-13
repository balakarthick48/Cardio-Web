import React, { useState, useEffect } from 'react';
import '../../styles/D-Dashboard.css';
import Sidebar from '../../components/Sidebar';
import AdminSidebar from '../../components/AdminSidebar';
import Header from '../../components/Header';
import Profile from '../../components/Profile';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import API_BASE_URL from '../../config';
import { ToastContainer, toast } from 'react-toastify';

const AdminOnSpot = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5; // Define number of rows per page
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showWorkingHours, setShowWorkingHours] = useState(false);

    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];
    const currentYear = new Date().getFullYear();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [selectedYear] = useState(currentYear);
    const [selectedDate, setSelectedDate] = useState(null);
    const durations = ['Morning', 'Afternoon', 'Night'];
    const timesByDuration = {
        Morning: ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
        Afternoon: ['12:00', '12:30', '13:00', '13:30', '14:00', '15:00', '15:30', '16:00', '16:30', '17:00'],
        Night: ['18:00', '18:30', '19:00', '19:30', '20:00', '21:00']
    };
    const [selectedDuration, setSelectedDuration] = useState(durations[0]);
    const [selectedTime, setSelectedTime] = useState(null);
    const [isEmergency, setIsEmergency] = useState(false);

    const getDaysInMonth = (month, year) => {
        return new Date(year, month, 0).getDate(); // month is 1-12 here
    };
    const daysForSelectedMonth = Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1);

    const initialFormData = {
        patientName: '',
        email: '',
        mobileNumber: '',
        password: '',
        bloodGroup: '',
        gender: '',
        maritalStatus: '',
        address: '',
        emergencyName: '',
        emergencyRelationship: '',
        emergencyMobile: ''
    };

    const initialFormData1 = {
        slotId: '',
        bookingFor: '',
        problem: '',
        patientId: '',
        doctorId: '',
        packageType: '',
        duration_minute: ''
    };

    const [formData, setFormData] = useState(initialFormData);
    const [formData1, setFormData1] = useState(initialFormData1);
    const [dob, setDob] = useState({ date: '', month: '', year: '' });
    const [age, setAge] = useState('');
    const [spotRegister, setSpotReister] = useState(null);

    const resetForm = () => {
        setFormData(initialFormData);
        setDob({ date: '', month: '', year: '' });
        setAge('');
        // reset any other local state if needed
    };

    // Form state for all inputs
    // const [formData, setFormData] = useState({
    //     patientName: '',
    //     email: '',
    //     mobileNumber: '',
    //     password: '',
    //     bloodGroup: '',
    //     gender: '',
    //     maritalStatus: '',
    //     address: '',
    //     emergencyName: '',
    //     emergencyRelationship: '',
    //     emergencyMobile: ''
    // });
    // Calculate age from DOB
    const calculateAge = (date, month, year) => {
        if (!date || !month || !year) {
            setAge('');
            return;
        }

        const dobDate = new Date(year, month - 1, date); // month is 0-indexed
        const today = new Date();

        if (dobDate > today) {
            setAge('Invalid');
            return;
        }

        let calculatedAge = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
            calculatedAge--;
        }

        setAge(calculatedAge.toString());
    };

    const handleDobChange = (field, value) => {
        // validate input
        let numValue = parseInt(value) || '';

        if (field === 'date' && numValue && (numValue < 1 || numValue > 31)) {
            return;
        }
        if (field === 'month' && numValue && (numValue < 1 || numValue > 12)) {
            return;
        }
        if (field === 'year' && value.length > 4) {
            return;
        }

        const updatedDob = { ...dob, [field]: value };
        setDob(updatedDob);
        calculateAge(updatedDob.date, updatedDob.month, updatedDob.year);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

     // Handle form input changes
    const handleInputChange1 = (e) => {
        const { name, value } = e.target;
        setFormData1((prev) => ({
            ...prev,
            [name]: value
        }));
    };
    // Format DOB to YYYY-MM-DD format
    const formatDateOfBirth = () => {
        if (!dob.date || !dob.month || !dob.year) {
            return '';
        }
        const month = String(dob.month).padStart(2, '0');
        const date = String(dob.date).padStart(2, '0');
        return `${dob.year}-${month}-${date}`;
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #d6d6d6',
        borderRadius: 6,
        marginTop: 5
    };

    const inputStyleSmall = {
        padding: '10px',
        border: '1px solid #d6d6d6',
        borderRadius: 6,
        width: '100%'
    };

    const getPatientRegister = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}patient/register-patient`;
            // url = 'https://mocki.io/v1/a5a086db-eb2d-40e6-98af-1181da3215af'
            const body = {
                patientName: formData.patientName,
                email: formData.email,
                mobileNumber: formData.mobileNumber,
                password: formData.password,
                bloodGroup: formData.bloodGroup,
                gender: formData.gender,
                dateOfBirth: formatDateOfBirth(),
                maritalStatus: formData.maritalStatus,
                address: formData.address,
                emergencyName: formData.emergencyName,
                emergencyRelationship: formData.emergencyRelationship,
                emergencyMobile: formData.emergencyMobile
            };
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            console.log('bodyyyy:', body);
            console.log('Response status...:', response.status);
            console.log('??body:...', response.body);
            console.log('url:...', url);
            const data = await response.json();
            if (response.ok) {
                setSpotReister(data);
                toast.success(data.message);
                resetForm();
            } else {
                setSpotReister([]);
                setError(data.message || 'Failed');
                toast.error(data.message || 'Failed');
            }
            // console.log('prescriptions___', data.existingMedicines);
        } catch (err) {
            setError('Network error');
        }
        setLoading(false);
    };

    const getOnspotSlot = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}patient/bookappointment-patient`;

            // Build slotId from selected date/time if not provided in formData1
            let slotIdValue = formData1.slotId || formData1.slotid || '';
            if (!slotIdValue && selectedDate && selectedTime) {
                const mm = String(selectedMonth).padStart(2, '0');
                const dd = String(selectedDate).padStart(2, '0');
                // Use a simple datetime string; backend may parse as needed
                // slotIdValue = `${selectedYear}-${mm}-${dd} ${selectedTime}`;
                slotIdValue = `${selectedYear}-${mm}-${dd}`;
            }

            const body = {
                // slotId: slotIdValue,
                bookingFor: formData1.bookingFor,
                problem: formData1.problem,
                patientId: formData1.patientId,
                doctorId: 5,
                packageType: "offline",
                duration_minute: 30,
                isEmergency: isEmergency ? 1 : 0,
                appointmentDate: slotIdValue, // send the constructed datetime as appointmentDate
                appointmentTime: selectedTime // send selected time separately if needed by backend
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            console.log('bodyyyy:::', body);
            console.log('Responsestatusslot', response.status);
            console.log('bodyspot:"...', response.body);
            console.log('url,,..', url);
            const data = await response.json();
            if (response.ok) {
                setSpotReister(data);
                toast.success(data.message);
                resetForm();
            } else {
                setSpotReister([]);
                setError(data.message || 'Failed');
                toast.error(data.message || 'Failed');
            }
            // console.log('prescriptions___', data.existingMedicines);
        } catch (err) {
            setError('Network error');
        }
        setLoading(false);
    };

    useEffect(() => {}, []);

    return (
        <div className="dashboard-layout">
            <AdminSidebar />
            <div className="main-section">
                <div style={{ padding: 30 }}>
                    <h2 style={{ fontWeight: 600 }}>On-Spot Register</h2>

                    <div
                        style={{
                            display: 'flex',
                            marginTop: 30,
                            gap: 40,
                            alignItems: 'flex-start'
                        }}
                    >
                        {/* LEFT SIDE FORM */}
                        <div style={{ flex: 1 }}>
                            {/* Patient Name + Gender */}
                            <div style={{ display: 'flex', gap: 40 }}>
                                <div style={{ flex: 1 }}>
                                    <label>Patient Name</label>
                                    <input
                                        type="text"
                                        name="patientName"
                                        value={formData.patientName}
                                        onChange={handleInputChange}
                                        placeholder="Enter Patient Name"
                                        style={inputStyle}
                                    />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <label>Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleInputChange} style={inputStyle}>
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Email + DOB */}
                            <div style={{ display: 'flex', gap: 40, marginTop: 20 }}>
                                <div style={{ flex: 1 }}>
                                    <label>Email Id</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter Email ID"
                                        style={inputStyle}
                                    />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <label>Date of Birth</label>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <input
                                            type="number"
                                            placeholder="DD"
                                            min="1"
                                            max="31"
                                            value={dob.date}
                                            onChange={(e) => handleDobChange('date', e.target.value)}
                                            style={inputStyleSmall}
                                        />
                                        <input
                                            type="number"
                                            placeholder="MM"
                                            min="1"
                                            max="12"
                                            value={dob.month}
                                            onChange={(e) => handleDobChange('month', e.target.value)}
                                            style={inputStyleSmall}
                                        />
                                        <input
                                            type="number"
                                            placeholder="YYYY"
                                            value={dob.year}
                                            onChange={(e) => handleDobChange('year', e.target.value)}
                                            style={inputStyleSmall}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Age"
                                            value={age}
                                            readOnly
                                            style={{ ...inputStyleSmall, backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                                        />
                                        {/* <input type="text" placeholder="Date" style={inputStyleSmall} />
                        <input type="text" placeholder="Month" style={inputStyleSmall} />
                        <input type="text" placeholder="Year" style={inputStyleSmall} />
                        <input type="text" placeholder="Age" style={inputStyleSmall} /> */}
                                    </div>
                                </div>
                            </div>

                            {/* Mobile + Address */}
                            <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
                                <div style={{ flex: 1 }}>
                                    <label>Mobile Number</label>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        {/* <input type="text" placeholder="Enter Mobile Number" value="+91" style={{ width: 70, ...inputStyle }}  /> */}
                                        <input
                                            type="tel"
                                            name="mobileNumber"
                                            value={formData.mobileNumber}
                                            onChange={handleInputChange}
                                            placeholder="Enter Mobile Number"
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <label>Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Enter Address"
                                        style={{ ...inputStyle, height: 70 }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
                                <div style={{ flex: 0.5 }}>
                                    <label>Marital Status</label>
                                    <select
                                        name="maritalStatus"
                                        value={formData.maritalStatus}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #d6d6d6',
                                            borderRadius: 6,
                                            marginTop: 5
                                        }}
                                    >
                                        <option value="">Select</option>
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                    </select>
                                </div>
                            </div>

                            {/* Blood + Password */}
                            <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
                                <div style={{ flex: 1 }}>
                                    <label>Blood Group</label>
                                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} style={inputStyle}>
                                        <option value="">Select</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                    </select>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter Password"
                                        style={inputStyle}
                                    />{' '}
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <h3 style={{ marginTop: 30 }}>Emergency Contact</h3>

                            <div style={{ display: 'flex', gap: 40, marginTop: 10 }}>
                                <div style={{ flex: 1 }}>
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        name="emergencyName"
                                        value={formData.emergencyName}
                                        onChange={handleInputChange}
                                        placeholder="Enter Name"
                                        style={inputStyle}
                                    />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <label>Relationship with Patient</label>
                                    <input
                                        type="text"
                                        name="emergencyRelationship"
                                        value={formData.emergencyRelationship}
                                        onChange={handleInputChange}
                                        placeholder="Enter Relationship"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: 20, flex: 1 }}>
                                <label>Mobile Number</label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {/* <input type="text" value="+91" style={{ width: 70, ...inputStyle }} readOnly /> */}
                                    <input
                                        type="tel"
                                        name="emergencyMobile"
                                        value={formData.emergencyMobile}
                                        onChange={handleInputChange}
                                        placeholder="Enter Mobile Number"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={getPatientRegister}
                                disabled={loading}
                                style={{
                                    marginTop: 30,
                                    padding: '12px 20px',
                                    background: '#0a66ff',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    width: 150,
                                    cursor: 'pointer'
                                }}
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>

                        {/* RIGHT SIDE DIVIDER */}
                        <div
                            style={{
                                width: 1,
                                background: '#d6d6d6',
                                height: '100%'
                            }}
                        ></div>

                        {/* RIGHT SIDE FORM */}
                        <div style={{ flex: 1 }}>
                            <h3>On-Spot Register</h3>
                            <div style={{ display: 'flex', gap: 40, marginTop: 10 }}>
                                <div style={{ flex: 1 }}>
                                    <label>Enter ID</label>
                                    <input
                                        type="text"
                                        name="patientId"
                                        value={formData1.patientId}
                                        onChange={handleInputChange1}
                                        placeholder="Enter Patient Id"
                                        style={inputStyle}
                                    />
                                   
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ marginTop: 20 }}>Apply For</label>
                                        <select name="bookingFor" value={formData1.bookingFor} onChange={handleInputChange1} style={inputStyle}>
                                        <option>Select</option>
                                        <option>myself</option>
                                        <option>Care Taker</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 40, marginTop: 10 }}>
                                <div style={{ flex: 1 }}>
                                    <label>Problem</label>
                                    <input
                                        type="text"
                                        name="problem"
                                        value={formData1.problem}
                                        onChange={handleInputChange1}
                                        placeholder="Enter Problem"
                                        style={inputStyle}
                                    />
                                </div>
                            {/* Emergency Checkbox */}
                            <div style={{  display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                                <input
                                    type="checkbox"
                                    id="isEmergency"
                                    checked={isEmergency}
                                    onChange={(e) => setIsEmergency(e.target.checked)}
                                    style={{ marginTop: 2, cursor: 'pointer' }}
                                />
                                <label htmlFor="isEmergency" style={{ fontWeight: 600, cursor: 'pointer', marginTop: -3 }}>
                                    Emergency
                                </label>
                            </div>
                                {/* <div style={{ flex: 1 }}>
                                    <label>Doctor ID</label>
                                    <input
                                        type="text"
                                        name="doctorid"
                                        value={formData1.doctorid}
                                        onChange={handleInputChange1}
                                        placeholder="Enter Doctor Id"
                                        style={inputStyle}
                                    />
                                </div> */}
                            </div>

                            {/* Booking Box */}
                            <div
                                style={{
                                    marginTop: 30,
                                    border: '1px solid #e8e8e8',
                                    borderRadius: 12,
                                    padding: 20
                                }}
                            >
                                <h4>Booking Appointment</h4>

                                {/* <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                                    <div>Date</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <span>August</span> ▼
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
                                    {['27', '28', '29', '30', '01', '02', '03', '04'].map((d, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: '10px 14px',
                                                borderRadius: 8,
                                                border: '1px solid #d6d6d6',
                                                background: i === 0 ? '#0a66ff' : '#fff',
                                                color: i === 0 ? '#fff' : '#000',
                                                fontWeight: i === 0 ? 600 : 400,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {d}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginTop: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Time</span>
                                        <span>Select Duration ▼</span>
                                    </div>

                                    <div
                                        style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 10,
                                            marginTop: 15
                                        }}
                                    >
                                        {['7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM'].map(
                                            (t, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        padding: '10px 14px',
                                                        borderRadius: 8,
                                                        border: '1px solid #d6d6d6',
                                                        background: i === 2 || i === 4 ? '#0a66ff' : '#f4f4f4',
                                                        color: i === 2 || i === 4 ? '#fff' : '#000',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {t}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div> */}

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}>
                                    <div style={{ fontWeight: 600 }}>Date</div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) => {
                                                setSelectedMonth(Number(e.target.value));
                                                setSelectedDate(null);
                                            }}
                                            style={{ padding: '8px 10px', borderRadius: 6 }}
                                        >
                                            {monthNames.map((m, idx) => (
                                                <option key={m} value={idx + 1}>
                                                    {m} {selectedYear}
                                                </option>
                                            ))}
                                        </select>
                                        <span style={{ color: '#888' }}>▼</span>
                                    </div>
                                </div>

                                {/* Date Pills (dynamic for selected month) */}
                                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                                    {daysForSelectedMonth.map((d) => {
                                        const isSelected = selectedDate === d && selectedMonth === new Date().getMonth() + 1;
                                        return (
                                            <div
                                                key={d}
                                                onClick={() => setSelectedDate(d)}
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: 8,
                                                    border: selectedDate === d ? '1px solid #0a66ff' : '1px solid #d6d6d6',
                                                    background: selectedDate === d ? '#0a66ff' : '#fff',
                                                    color: selectedDate === d ? '#fff' : '#000',
                                                    fontWeight: selectedDate === d ? 700 : 400,
                                                    cursor: 'pointer',
                                                    minWidth: 44,
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {String(d).padStart(2, '0')}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Duration selector + times */}
                                <div style={{ marginTop: 18 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: 600 }}>Time</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <select
                                                value={selectedDuration}
                                                onChange={(e) => {
                                                    setSelectedDuration(e.target.value);
                                                    setSelectedTime(null);
                                                }}
                                                style={{ padding: '8px 10px', borderRadius: 6 }}
                                            >
                                                <option value="">Select Duration</option>
                                                {durations.map((d) => (
                                                    <option key={d} value={d}>
                                                        {d}
                                                    </option>
                                                ))}
                                            </select>
                                            <span style={{ color: '#888' }}>▼</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                                        {(timesByDuration[selectedDuration] || []).map((t) => (
                                            <div
                                                key={t}
                                                onClick={() => setSelectedTime(t)}
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: 8,
                                                    border: selectedTime === t ? '1px solid #0a66ff' : '1px solid #d6d6d6',
                                                    background: selectedTime === t ? '#0a66ff' : '#f4f4f4',
                                                    color: selectedTime === t ? '#fff' : '#000',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {t}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Book Button */}
                            <button
                                onClick={getOnspotSlot}
                                disabled={loading}
                                style={{
                                    marginTop: 20,
                                    padding: '12px 20px',
                                    background: '#0a66ff',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    width: '50%',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Booking...' : 'Book Appointment'}
                            </button>
                        </div>
                    </div>
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
        </div>
    );
};
export default AdminOnSpot;
