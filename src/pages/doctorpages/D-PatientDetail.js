import React, { useEffect, useState } from 'react';
import '../../styles/D-PatientDetail.css';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import API_BASE_URL from '../../config';
import { use } from 'react';

export default function PatientDetail() {
     const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    
    const [newPrescription, setNewPrescription] = useState({
        medicineName: '',
        quantity: '',
        frequency: { F: '', A: '', E: '', N: '' }
    });
    const [editingIdx, setEditingIdx] = useState(null);

    const handlePrescriptionChange = (e, field, freqField) => {
        const value = e.target.value;
        if (field === 'frequency') {
            setNewPrescription((prev) => ({
                ...prev,
                frequency: { ...prev.frequency, [freqField]: value }
            }));
        } else {
            setNewPrescription((prev) => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleEditPrescription = (idx) => {
        setEditingIdx(idx);
        setNewPrescription({
            medicineName: prescriptions[idx].medicine_name,
            quantity: prescriptions[idx].quantity,
            frequency: {
                F: prescriptions[idx].frequency_F,
                A: prescriptions[idx].frequency_A,
                E: prescriptions[idx].frequency_E,
                N: prescriptions[idx].frequency_N
            }
        });
    };

    const getPrescriptions = async (e) => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}con/upsert-prescriptions`;
            // url = 'https://mocki.io/v1/a5a086db-eb2d-40e6-98af-1181da3215af'
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId: 16 })
            });
            const data = await response.json();
            if (response.ok && Array.isArray(data.existingMedicines)) {
                setPrescriptions(data.existingMedicines);
            } else {
                setPrescriptions([]);
                setError(data.message || 'Failed');
            }
            console.log('prescriptions___', data.existingMedicines);
        } catch (err) {
            setError('Network error');
        }
        setLoading(false);
    };

    const handleUpdatePrescription = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}con/upsert-prescriptions`;
            const body = {
                patientId: 16,
                prescription: [
                    {
                        medicineName: newPrescription.medicineName,
                        quantity: newPrescription.quantity,
                        frequency: {
                            F: newPrescription.frequency.F,
                            A: newPrescription.frequency.A,
                            E: newPrescription.frequency.E,
                            N: newPrescription.frequency.N
                        }
                    }
                ]
            };
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
             const data = await response.json();
        // Update prescriptions table with latest data from API
        if (response.ok) {
            setEditingIdx(null);
            setNewPrescription({
                medicineName: '',
                quantity: '',
                frequency: { F: '', A: '', E: '', N: '' }
            });
        } else {
            setError(data.message || 'Failed');
        }
    } catch (err) {
        setError('Network error');
    }
    setLoading(false);
};

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

    // Example state for vital signs and basic data
    const [vitalSigns, setVitalSigns] = useState({
        temperature: '',
        heartRate: '',
        bloodPressure: { systolic: '', diastolic: '' },
        respiratoryRate: ''
    });

    const [basicData, setBasicData] = useState({
        age: '',
        height: '',
        weight: '',
        bmi: ''
    });

    // Track which field is being edited
    const [editing, setEditing] = useState({ section: null, field: null });
    const [basicediting, setbasicEditing] = useState({ section: null, field: null });

    // Example handler for vital signs
    const handleEdit = (section, field) => {
        setEditing({ section, field });
    };

    const handleBasicEdit = (section, field) => {
        setbasicEditing({ section, field });
    };

    const handleChange = (e, section, field, subfield) => {
        const value = e.target.value;
        if (section === 'vital') {
            if (field === 'bloodPressure') {
                setVitalSigns((prev) => ({
                    ...prev,
                    bloodPressure: {
                        ...prev.bloodPressure,
                        [subfield]: value
                    }
                }));
            } else {
                setVitalSigns((prev) => ({
                    ...prev,
                    [field]: value
                }));
            }
        } else if (section === 'basic') {
            setBasicData((prev) => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSave = () => {
        setEditing({ section: null, field: null });
    };

    const handleBasicSave = () => {
        setbasicEditing({ section: null, field: null });
    };

    useEffect(() => {
        getPrescriptions();
        getPatients();
    }, []);

    console.log('prescriptions///', prescriptions);
    return (
        <div className="patient-profile">
            <Sidebar />
            {/* Patient Header */}
            <div className="main-section">
                <Header />
                <div className="patient-header">
                    <div className="patient-info">
                        <img src="https://i.ibb.co/2cX0dQr/avatar.png" alt="patient" className="patient-avatar" />
                        <div>
                            <h2>{patients[0]?.patientName}</h2>
                            <p>[DRS25154]</p>
                        </div>
                        <div className="status-btns">
                            <button className="status processing">Processing</button>
                            <button className="status completed">Completed</button>
                        </div>
                    </div>
                    <div className="patient-contact">
                        <p>
                            <b>Email ID:</b> {patients[0]?.email}
                        </p>
                        <p>
                            <b>Contact Number:</b> {patients[0]?.mobileNumber}
                        </p>
                        <p>
                            <b>Address:</b> {patients[0]?.address}
                        </p>
                    </div>
                </div>

                {/* Vital Signs + Basic Data */}
                <div className="patient-section grid-2">
                    <div className="card">
                        <h4>Vital Signs :</h4>
                        {/* <p>Temperature : __ °C <span className="edit">✎</span></p>
          <p>Heart Rate : __ bpm <span className="edit">✎</span></p>
          <p>Blood Pressure : __ / __ mmHg <span className="edit">✎</span></p>
          <p>Respiratory Rate : __ per minute <span className="edit">✎</span></p> */}
                        <p>
                            Temperature :{' '}
                            {editing.section === 'vital' && editing.field === 'temperature' ? (
                                <>
                                    <input
                                        value={vitalSigns.temperature}
                                        onChange={(e) => handleChange(e, 'vital', 'temperature')}
                                        style={{ width: 60 }}
                                    />{' '}
                                    <button onClick={handleSave}>Save</button>
                                </>
                            ) : (
                                <>
                                    {vitalSigns.temperature || '__'} °C{' '}
                                    <span className="edit" onClick={() => handleEdit('vital', 'temperature')}>
                                        ✎
                                    </span>
                                </>
                            )}
                        </p>
                        <p>
                            Heart Rate :{' '}
                            {editing.section === 'vital' && editing.field === 'heartRate' ? (
                                <>
                                    <input
                                        value={vitalSigns.heartRate}
                                        onChange={(e) => handleChange(e, 'vital', 'heartRate')}
                                        style={{ width: 60 }}
                                    />{' '}
                                    <button onClick={handleSave}>Save</button>
                                </>
                            ) : (
                                <>
                                    {vitalSigns.heartRate || '__'} bpm{' '}
                                    <span className="edit" onClick={() => handleEdit('vital', 'heartRate')}>
                                        ✎
                                    </span>
                                </>
                            )}
                        </p>
                        <p>
                            Blood Pressure :{' '}
                            {editing.section === 'vital' && editing.field === 'bloodPressure' ? (
                                <>
                                    <input
                                        value={vitalSigns.bloodPressure.systolic}
                                        onChange={(e) => handleChange(e, 'vital', 'bloodPressure', 'systolic')}
                                        style={{ width: 40 }}
                                    />
                                    /
                                    <input
                                        value={vitalSigns.bloodPressure.diastolic}
                                        onChange={(e) => handleChange(e, 'vital', 'bloodPressure', 'diastolic')}
                                        style={{ width: 40 }}
                                    />{' '}
                                    mmHg <button onClick={handleSave}>Save</button>
                                </>
                            ) : (
                                <>
                                    {vitalSigns.bloodPressure.systolic || '__'} / {vitalSigns.bloodPressure.diastolic || '__'} mmHg{' '}
                                    <span className="edit" onClick={() => handleEdit('vital', 'bloodPressure')}>
                                        ✎
                                    </span>
                                </>
                            )}
                        </p>
                        <p>
                            Respiratory Rate :{' '}
                            {editing.section === 'vital' && editing.field === 'respiratoryRate' ? (
                                <>
                                    <input
                                        value={vitalSigns.respiratoryRate}
                                        onChange={(e) => handleChange(e, 'vital', 'respiratoryRate')}
                                        style={{ width: 60 }}
                                    />{' '}
                                    <button onClick={handleSave}>Save</button>
                                </>
                            ) : (
                                <>
                                    {vitalSigns.respiratoryRate || '__'} per minute{' '}
                                    <span className="edit" onClick={() => handleEdit('vital', 'respiratoryRate')}>
                                        ✎
                                    </span>
                                </>
                            )}
                        </p>
                    </div>
                    <div className="card">
                        <h4>Basic Data :</h4>
                        {/* <p>
                            Age : __ years <span className="edit">✎</span>
                        </p>
                        <p>
                            Height : __ cm(s) <span className="edit">✎</span>
                        </p>
                        <p>
                            Weight : __ kg(s) <span className="edit">✎</span>
                        </p>
                        <p>
                            BMI : __ <span className="edit">✎</span>
                        </p> */}
                        <p>
                            Age :{' '}
                            {basicediting.section === 'basic' && basicediting.field === 'age' ? (
                                <>
                                    <input value={basicData.age} onChange={(e) => handleChange(e, 'basic', 'age')} style={{ width: 60 }} />{' '}
                                    <button onClick={handleBasicSave}>Save</button>
                                </>
                            ) : (
                                <>
                                    {basicData.age || '__'} years{' '}
                                    <span className="edit" onClick={() => handleBasicEdit('basic', 'age')}>
                                        ✎
                                    </span>
                                </>
                            )}
                        </p>
                        <p>
                            Height :{' '}
                            {basicediting.section === 'basic' && basicediting.field === 'height' ? (
                                <>
                                    <input
                                        value={basicData.height}
                                        onChange={(e) => handleChange(e, 'basic', 'height')}
                                        style={{ width: 60 }}
                                    />{' '}
                                    <button onClick={handleBasicSave}>Save</button>
                                </>
                            ) : (
                                <>
                                    {basicData.height || '__'} cm(s){' '}
                                    <span className="edit" onClick={() => handleBasicEdit('basic', 'height')}>
                                        ✎
                                    </span>
                                </>
                            )}
                        </p>
                        <p>
                            Weight :{' '}
                            {basicediting.section === 'basic' && basicediting.field === 'weight' ? (
                                <>
                                    <input
                                        value={basicData.weight}
                                        onChange={(e) => handleChange(e, 'basic', 'weight')}
                                        style={{ width: 60 }}
                                    />{' '}
                                    <button onClick={handleBasicSave}>Save</button>
                                </>
                            ) : (
                                <>
                                    {basicData.weight || '__'} kg(s){' '}
                                    <span className="edit" onClick={() => handleBasicEdit('basic', 'weight')}>
                                        ✎
                                    </span>
                                </>
                            )}
                        </p>
                        <p>
                            BMI :{' '}
                            {basicediting.section === 'basic' && basicediting.field === 'bmi' ? (
                                <>
                                    <input value={basicData.bmi} onChange={(e) => handleChange(e, 'basic', 'bmi')} style={{ width: 60 }} />{' '}
                                    <button onClick={handleBasicSave}>Save</button>
                                </>
                            ) : (
                                <>
                                    {basicData.bmi || '__'}{' '}
                                    <span className="edit" onClick={() => handleBasicEdit('basic', 'bmi')}>
                                        ✎
                                    </span>
                                </>
                            )}
                        </p>
                        <button className="done-btn">Done</button>
                    </div>
                </div>

                {/* Medical History */}
                <div className="patient-section">
                    <h3>Medical History</h3>
                    <div className="grid-3">
                        <div className="card">
                            <h5>Surgeries Undergone/Hospitalization</h5>
                            <p>
                                Name of the Hospital : Nil <span className="edit">✎</span>
                            </p>
                            <p>
                                Month & Year : Nil <span className="edit">✎</span>
                            </p>
                            <p>
                                Known Allergies : Nil <span className="edit">✎</span>
                            </p>
                            <p>Current Medications : __</p>
                        </div>
                        <div className="card">
                            <h5>Family Medical History</h5>
                            <p>
                                ☑ Diabetic : 126 mg/dL <span className="edit">✎</span>
                            </p>
                            <p>
                                ☑ Blood Pressure : 120/80 mmHg <span className="edit">✎</span>
                            </p>
                            <p>
                                ☑ Cholesterol : 200 mg/dL <span className="edit">✎</span>
                            </p>
                            <p>
                                ☑ Thyroid : 1.8 ng/dL <span className="edit">✎</span>
                            </p>
                        </div>
                        <div className="card">
                            <h5>Existing Conditions</h5>
                            <p>
                                ☑ Diabetic : 126 mg/dL <span className="edit">✎</span>
                            </p>
                            <p>
                                ☑ Blood Pressure : 120/80 mmHg <span className="edit">✎</span>
                            </p>
                            <p>
                                ☑ Cholesterol : 200 mg/dL <span className="edit">✎</span>
                            </p>
                            <p>
                                ☑ Thyroid : 1.8 ng/dL <span className="edit">✎</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Prescription */}
                <div className="patient-section">
                    <h3>Prescription</h3>
                    <table className="prescription-table">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Medicine Name</th>
                                <th>Quantity</th>
                                <th>F</th>
                                <th>A</th>
                                <th>E</th>
                                <th>N</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prescriptions.map((med, idx) => (
                                <tr key={med.id || idx}>
                                    <td>{idx + 1 < 10 ? `0${idx + 1}.` : `${idx + 1}.`}</td>
                                    <td>{med.medicine_name}</td>
                                    <td>{med.quantity}</td>
                                    <td>{med.frequency_F}</td>
                                    <td>{med.frequency_A}</td>
                                    <td>{med.frequency_E}</td>
                                    <td>{med.frequency_N}</td>
                                </tr>
                            ))}
                        </tbody>
                        {/* <tbody>
                            <tr>
                                <td>01.</td>
                                <td>Amlodipine</td>
                                <td>10</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                            </tr>
                            <tr>
                                <td>02.</td>
                                <td>Ramipril</td>
                                <td>5</td>
                                <td>0.5</td>
                                <td>0.5</td>
                                <td>0</td>
                                <td>0.5</td>
                            </tr>
                            <tr>
                                <td>03.</td>
                                <td>Enalapril Oral Solution</td>
                                <td>2 (500ml)</td>
                                <td>1</td>
                                <td>1</td>
                                <td>-</td>
                                <td>-</td>
                            </tr>
                            <tr>
                                <td>04.</td>
                                <td>Ranolazine</td>
                                <td>8</td>
                                <td>1</td>
                                <td>1</td>
                                <td>1</td>
                                <td>2</td>
                            </tr>
                            <tr>
                                <td>05.</td>
                                <td>Furosemide</td>
                                <td>3</td>
                                <td>-</td>
                                <td>1</td>
                                <td>-</td>
                                <td>1</td>
                            </tr>
                            <tr>
                                <td>06.</td>
                                <td>Amiodarone</td>
                                <td>3</td>
                                <td>-</td>
                                <td>-</td>
                                <td>1</td>
                                <td>-</td>
                            </tr>
                        </tbody> */}
                    </table>
                </div>

                {/* <div className="patient-section" style={{ marginTop: 140 }}>
                    <h3>Add Prescription</h3>
                    <table className="prescription-table">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Medicine Name</th>
                                <th>Quantity</th>
                                <th>F</th>
                                <th>A</th>
                                <th>E</th>
                                <th>N</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prescriptions.map((med, idx) => (
                                <tr key={med.id || idx}>
                                    <td>{idx + 1 < 10 ? `0${idx + 1}.` : `${idx + 1}.`}</td>
                                    <td>{med.medicine_name}</td>
                                    <td>{med.quantity}</td>
                                    <td>{med.frequency_F}</td>
                                    <td>{med.frequency_A}</td>
                                    <td>{med.frequency_E}</td>
                                    <td>{med.frequency_N}</td>
                                </tr>
                            ))}
                        </tbody>
                     
                    </table>
                </div> */}
                <div className="patient-section" style={{ marginTop: 140 }}>
                    <h3>Add Prescription</h3>
                    <table className="prescription-table">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Medicine Name</th>
                                <th>Quantity</th>
                                <th>F</th>
                                <th>A</th>
                                <th>E</th>
                                <th>N</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prescriptions.map((med, idx) => (
                                <tr key={med.id || idx}>
                                    <td>{idx + 1 < 10 ? `0${idx + 1}.` : `${idx + 1}.`}</td>
                                    <td>{med.medicine_name}</td>
                                    <td>{med.quantity}</td>
                                    <td>{med.frequency_F}</td>
                                    <td>{med.frequency_A}</td>
                                    <td>{med.frequency_E}</td>
                                    <td>{med.frequency_N}</td>
                                    <td>
                                        <button onClick={() => handleEditPrescription(idx)}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td>{editingIdx !== null ? editingIdx + 1 : prescriptions.length + 1}</td>
                                <td>
                                    <input
                                        value={newPrescription.medicineName}
                                        onChange={(e) => handlePrescriptionChange(e, 'medicineName')}
                                        placeholder="Medicine Name"
                                    />
                                </td>
                                <td>
                                    <input
                                        value={newPrescription.quantity}
                                        onChange={(e) => handlePrescriptionChange(e, 'quantity')}
                                        placeholder="Quantity"
                                    />
                                </td>
                                <td>
                                    <input
                                        value={newPrescription.frequency.F}
                                        onChange={(e) => handlePrescriptionChange(e, 'frequency', 'F')}
                                        placeholder="F"
                                    />
                                </td>
                                <td>
                                    <input
                                        value={newPrescription.frequency.A}
                                        onChange={(e) => handlePrescriptionChange(e, 'frequency', 'A')}
                                        placeholder="A"
                                    />
                                </td>
                                <td>
                                    <input
                                        value={newPrescription.frequency.E}
                                        onChange={(e) => handlePrescriptionChange(e, 'frequency', 'E')}
                                        placeholder="E"
                                    />
                                </td>
                                <td>
                                    <input
                                        value={newPrescription.frequency.N}
                                        onChange={(e) => handlePrescriptionChange(e, 'frequency', 'N')}
                                        placeholder="N"
                                    />
                                </td>
                                <td>
                                    <button
                                        style={{
                                            background: '#0070f3',
                                            color: '#fff',
                                            borderRadius: 6,
                                            padding: '6px 18px',
                                            border: 'none'
                                        }}
                                        onClick={handleUpdatePrescription}
                                    >
                                        {editingIdx !== null ? 'Update' : 'Add'}
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
