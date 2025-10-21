import React, { useEffect, useState } from 'react';
import '../../styles/D-PatientDetail.css';
import { ToastContainer, toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import AdminHeader from '../../components/AdminHeader';
import AdminSidebar from '../../components/AdminSidebar';
import API_BASE_URL from '../../config';
import ImageUploading from 'react-images-uploading';
import { use } from 'react';

export default function AdminPatientDetail() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [patientCreate, setPatientCreate] = useState([]);
    const [images, setImages] = React.useState([]);
    const maxNumber = 69;

    const onChange = (imageList, addUpdateIndex) => {
        // data for submit
        console.log(imageList, addUpdateIndex);
        setImages(imageList);
    };

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
            // console.log('prescriptions___', data.existingMedicines);
        } catch (err) {
            setError('Network error');
        }
        setLoading(false);
    };

    const getPatientsCreate = async (e) => {
        setLoading(true);
        setError('');
        try {
            const payload = {
                patient: { patientId: patients[0]?.id || 16 },
                vitals: {
                    dateOfRecord: new Date().toISOString().slice(0, 10),
                    temperature: vitalSigns.temperature,
                    heartRate: vitalSigns.heartRate,
                    bloodPressure: `${vitalSigns.bloodPressure.systolic}/${vitalSigns.bloodPressure.diastolic}`,
                    respiratoryRate: vitalSigns.respiratoryRate,
                    height: basicData.height,
                    weight: basicData.weight,
                    bmi: basicData.bmi
                },
                medicalHistory: {
                    hospitalName: hospitalization.nameofthehospital,
                    hospitalizationMonthYear: hospitalization.monthyear,
                    knownAllergies: hospitalization.Knownallergies,
                    currentMedications: hospitalization.currentmedications,
                    familyMedicalHistory: [
                        `Diabetic: ${familymedicalhistory.diabetic}`,
                        `Blood Pressure: ${familymedicalhistory.bloodPressure.systolic}/${familymedicalhistory.bloodPressure.diastolic}`,
                        `Cholesterol: ${familymedicalhistory.cholesterol}`,
                        `Thyroid: ${familymedicalhistory.thyroid}`
                    ].join(', '),
                    existingConditions: [
                        `Diabetic: ${existingcondition.diabetic}`,
                        `Blood Pressure: ${existingcondition.bloodPressure.systolic}/${existingcondition.bloodPressure.diastolic}`,
                        `Cholesterol: ${existingcondition.cholesterol}`,
                        `Thyroid: ${existingcondition.thyroid}`
                    ].join(', ')
                },
                prescriptions: [],
                // prescriptions: prescriptions.map((med, idx) => ({
                //     prescriptionId: med.id || idx + 1,
                //     medicineName: med.medicine_name,
                //     quantity: med.quantity,
                //     dosage: med.dosage || '',
                //     timeOfDay: med.timeOfDay || ''
                // })),
                diagnostics: {},
                presentSymptoms: {}, // Fill as needed
                dateOfDeclaration: {
                    dateOfEntry: new Date().toISOString().slice(0, 10),
                    recordedBy: 'Nurse Joy',
                    signature: 'Signed by patient'
                }
            };
            //image
            //      const dataURLtoFile = (dataurl, filename) => {
            //     if (!dataurl) return null;
            //     const arr = dataurl.split(',');
            //     const mime = arr[0].match(/:(.*?);/)[1];
            //     const bstr = atob(arr[1]);
            //     let n = bstr.length;
            //     const u8arr = new Uint8Array(n);
            //     while (n--) u8arr[n] = bstr.charCodeAt(n);
            //     return new File([u8arr], filename, { type: mime });
            // };

            // Prepare form-data
            const formData = new FormData();
            formData.append('data', JSON.stringify(payload));
            console.log('payload formdata<<<:', formData);
            //image
            //        for (let i = 0; i < images.length; i++) {
            //     const img = images[i];
            //     // ImageUploading usually provides img.file; fallback to data_url -> File
            //     const file = img.file || (img.data_url ? dataURLtoFile(img.data_url, `imaging-${i}.png`) : null);
            //     if (file) formData.append('imaging', file); // API will receive multiple 'imaging' entries
            // }

            const url = `${API_BASE_URL}admin/patient/create`;
            // url = 'https://mocki.io/v1/a5a086db-eb2d-40e6-98af-1181da3215af'
            const response = await fetch(url, {
                method: 'POST',
                // headers: { 'Content-Type': 'application/json' },
                body: formData
            });
            console.log('Payload sent:', payload);
            console.log('Response status:', response.status);
            console.log('??body:', response.body);
            console.log('url:', url);
            const data = await response.json();
            if (response.ok) {
                setPatientCreate(data);
                toast.success(data.message);
                console.log('patient create___', data);
            } else {
                setPatientCreate([]);
                toast.error(data.message);
                setError(data.message || 'Failed');
            }
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
            // console.log('Fetching:', url);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ month: 9 })
            });
            // console.log('Response status:', response.status);
            const data = await response.json();
            // console.log('patients response:', data);
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

    // Example state for Surgeries Undergone/Hospitalization, Family Medical History and Existing Conditions data
    const [hospitalization, setHospitalization] = useState({
        nameofthehospital: '',
        monthyear: '',
        Knownallergies: '',
        currentmedications: ''
    });

    const [familymedicalhistory, setFamilymedicalhistory] = useState({
        diabetic: '',
        bloodPressure: { systolic: '', diastolic: '' },
        cholesterol: '',
        thyroid: ''
    });

    const [existingcondition, setExistingcondition] = useState({
        diabetic: '',
        bloodPressure: { systolic: '', diastolic: '' },
        cholesterol: '',
        thyroid: ''
    });

    // Track which field is being edited
    const [editing, setEditing] = useState({ section: null, field: null });
    const [basicediting, setbasicEditing] = useState({ section: null, field: null });
    const [hospitalizationediting, setHospitalizationEditing] = useState({ section: null, field: null });
    const [familymedicalhistoryediting, setFamilyMedicalHistoryEditing] = useState({ section: null, field: null });
    const [existingconditionediting, setExistingConditionEditing] = useState({ section: null, field: null });

    // Example handler for vital signs
    const handleEdit = (section, field) => {
        setEditing({ section, field });
    };

    const handleBasicEdit = (section, field) => {
        setbasicEditing({ section, field });
    };

    const handleHospitalizationEdit = (section, field) => {
        setHospitalizationEditing({ section, field });
    };

    const handleFamilyMedicalHistoryEdit = (section, field) => {
        setFamilyMedicalHistoryEditing({ section, field });
    };

    const handleExistingConditionEdit = (section, field) => {
        setExistingConditionEditing({ section, field });
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

    const handleHospitalChange = (e, section, field) => {
        const value = e.target.value;
        if (section === 'hospital')
            setHospitalization((prev) => ({
                ...prev,
                [field]: value
            }));
    };

    const handleFamilyChange = (e, section, field, subfield) => {
        const value = e.target.value;
        if (section === 'family')
            if (field === 'bloodPressure') {
                setFamilymedicalhistory((prev) => ({
                    ...prev,
                    bloodPressure: {
                        ...prev.bloodPressure,
                        [subfield]: value
                    }
                }));
            } else {
                setFamilymedicalhistory((prev) => ({
                    ...prev,
                    [field]: value
                }));
            }
    };

    const handleExistingChange = (e, section, field, subfield) => {
        const value = e.target.value;
        if (section === 'existing')
            if (field === 'bloodPressure') {
                setExistingcondition((prev) => ({
                    ...prev,
                    bloodPressure: {
                        ...prev.bloodPressure,
                        [subfield]: value
                    }
                }));
            } else {
                setExistingcondition((prev) => ({
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

    const handleHospitalizationSave = () => {
        setHospitalizationEditing({ section: null, field: null });
    };

    const handleFamilyMedicalHistorySave = () => {
        setFamilyMedicalHistoryEditing({ section: null, field: null });
    };

    const handleExistingConditionSave = () => {
        setExistingConditionEditing({ section: null, field: null });
    };

    useEffect(() => {
        getPrescriptions();
        getPatients();
        getPatientsCreate();
    }, []);

    // console.log('prescriptions///', prescriptions);

    return (
        <div className="patient-profile">
            <AdminSidebar />
            {/* Patient Header */}
            <div className="main-section">
                <AdminHeader />
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
                <div>
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
                                        <input
                                            value={basicData.age}
                                            onChange={(e) => handleChange(e, 'basic', 'age')}
                                            style={{ width: 60 }}
                                        />{' '}
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
                                        <input
                                            value={basicData.bmi}
                                            onChange={(e) => handleChange(e, 'basic', 'bmi')}
                                            style={{ width: 60 }}
                                        />{' '}
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
                                    {' '}
                                    Name of the Hospital :{' '}
                                    {hospitalizationediting.section === 'hospital' &&
                                    hospitalizationediting.field === 'nameofthehospital' ? (
                                        <>
                                            <input
                                                value={hospitalization.nameofthehospital}
                                                onChange={(e) => handleHospitalChange(e, 'hospital', 'nameofthehospital')}
                                                style={{ width: 60 }}
                                            />{' '}
                                            <button onClick={handleHospitalizationSave}>Save</button>
                                        </>
                                    ) : (
                                        <>
                                            {hospitalization.nameofthehospital || '__'} °C{' '}
                                            <span
                                                className="edit"
                                                onClick={() => handleHospitalizationEdit('hospital', 'nameofthehospital')}
                                            >
                                                ✎
                                            </span>
                                        </>
                                    )}
                                </p>
                                <p>
                                    Month & Year :{' '}
                                    {hospitalizationediting.section === 'hospital' && hospitalizationediting.field === 'monthyear' ? (
                                        <>
                                            <input
                                                value={hospitalization.monthyear}
                                                onChange={(e) => handleHospitalChange(e, 'hospital', 'monthyear')}
                                                style={{ width: 60 }}
                                            />{' '}
                                            <button onClick={handleHospitalizationSave}>Save</button>
                                        </>
                                    ) : (
                                        <>
                                            {hospitalization.monthyear || '__'} °C{' '}
                                            <span className="edit" onClick={() => handleHospitalizationEdit('hospital', 'monthyear')}>
                                                ✎
                                            </span>
                                        </>
                                    )}
                                </p>
                                <p>
                                    Known Allergies :{' '}
                                    {hospitalizationediting.section === 'hospital' && hospitalizationediting.field === 'Knownallergies' ? (
                                        <>
                                            <input
                                                value={hospitalization.Knownallergies}
                                                onChange={(e) => handleHospitalChange(e, 'hospital', 'Knownallergies')}
                                                style={{ width: 60 }}
                                            />{' '}
                                            <button onClick={handleHospitalizationSave}>Save</button>
                                        </>
                                    ) : (
                                        <>
                                            {hospitalization.Knownallergies || '__'} °C{' '}
                                            <span className="edit" onClick={() => handleHospitalizationEdit('hospital', 'Knownallergies')}>
                                                ✎
                                            </span>
                                        </>
                                    )}
                                </p>
                                <p>
                                    Current Medications :{' '}
                                    {hospitalizationediting.section === 'hospital' &&
                                    hospitalizationediting.field === 'currentmedications' ? (
                                        <>
                                            <input
                                                value={hospitalization.currentmedications}
                                                onChange={(e) => handleHospitalChange(e, 'hospital', 'currentmedications')}
                                                style={{ width: 60 }}
                                            />{' '}
                                            <button onClick={handleHospitalizationSave}>Save</button>
                                        </>
                                    ) : (
                                        <>
                                            {hospitalization.currentmedications || '__'} °C{' '}
                                            <span
                                                className="edit"
                                                onClick={() => handleHospitalizationEdit('hospital', 'currentmedications')}
                                            >
                                                ✎
                                            </span>
                                        </>
                                    )}
                                </p>
                            </div>
                            <div className="card">
                                <h5>Family Medical History</h5>
                                <p>
                                    ☑ Diabetic :{' '}
                                    {familymedicalhistoryediting.section === 'family' &&
                                    familymedicalhistoryediting.field === 'diabetic' ? (
                                        <>
                                            <input
                                                value={familymedicalhistory.diabetic}
                                                onChange={(e) => handleFamilyChange(e, 'family', 'diabetic')}
                                                style={{ width: 60 }}
                                            />{' '}
                                            <button onClick={handleFamilyMedicalHistorySave}>Save</button>
                                        </>
                                    ) : (
                                        <>
                                            {familymedicalhistory.diabetic || '__'} °C{' '}
                                            <span className="edit" onClick={() => handleFamilyMedicalHistoryEdit('family', 'diabetic')}>
                                                ✎
                                            </span>
                                        </>
                                    )}
                                </p>
                                <p>
                                    ☑ Blood Pressure :{' '}
                                    {familymedicalhistoryediting.section === 'family' &&
                                    familymedicalhistoryediting.field === 'bloodPressure' ? (
                                        <>
                                            <input
                                                value={familymedicalhistory.bloodPressure.systolic}
                                                onChange={(e) => handleFamilyChange(e, 'family', 'bloodPressure', 'systolic')}
                                                style={{ width: 60 }}
                                            />
                                            /
                                            <input
                                                value={familymedicalhistory.bloodPressure.diastolic}
                                                onChange={(e) => handleFamilyChange(e, 'family', 'bloodPressure', 'diastolic')}
                                                style={{ width: 60 }}
                                            />{' '}
                                            mmHg<button onClick={handleFamilyMedicalHistorySave}>Save</button>
                                        </>
                                    ) : (
                                        <>
                                            {familymedicalhistory.bloodPressure.systolic || '__'} /{' '}
                                            {familymedicalhistory.bloodPressure.diastolic || '__'} mmHg{' '}
                                            <span
                                                className="edit"
                                                onClick={() => handleFamilyMedicalHistoryEdit('family', 'bloodPressure')}
                                            >
                                                ✎
                                            </span>
                                        </>
                                    )}
                                </p>
                                <p>
                                    ☑ Cholesterol :{' '}
                                    {familymedicalhistoryediting.section === 'family' &&
                                    familymedicalhistoryediting.field === 'cholesterol' ? (
                                        <>
                                            <input
                                                value={familymedicalhistory.cholesterol}
                                                onChange={(e) => handleFamilyChange(e, 'family', 'cholesterol')}
                                                style={{ width: 60 }}
                                            />{' '}
                                            <button onClick={handleFamilyMedicalHistorySave}>Save</button>
                                        </>
                                    ) : (
                                        <>
                                            {familymedicalhistory.cholesterol || '__'} °C{' '}
                                            <span className="edit" onClick={() => handleFamilyMedicalHistoryEdit('family', 'cholesterol')}>
                                                ✎
                                            </span>
                                        </>
                                    )}
                                </p>
                                <p>
                                    ☑ Thyroid :{' '}
                                    {familymedicalhistoryediting.section === 'family' && familymedicalhistoryediting.field === 'thyroid' ? (
                                        <>
                                            <input
                                                value={familymedicalhistory.thyroid}
                                                onChange={(e) => handleFamilyChange(e, 'family', 'thyroid')}
                                                style={{ width: 60 }}
                                            />{' '}
                                            <button onClick={handleFamilyMedicalHistorySave}>Save</button>
                                        </>
                                    ) : (
                                        <>
                                            {familymedicalhistory.thyroid || '__'} °C{' '}
                                            <span className="edit" onClick={() => handleFamilyMedicalHistoryEdit('family', 'thyroid')}>
                                                ✎
                                            </span>
                                        </>
                                    )}
                                </p>
                            </div>
                            <div className="card">
                                <h5>Existing Conditions</h5>
                                <p>
                                    ☑ Diabetic :{' '}
                                    {existingconditionediting.section === 'existing' && existingconditionediting.field === 'diabetic' ? (
                                        <>
                                            <input
                                                value={existingcondition.diabetic}
                                                onChange={(e) => handleExistingChange(e, 'existing', 'diabetic')}
                                                style={{ width: 60 }}
                                            />{' '}
                                            <button onClick={handleExistingConditionSave}>Save</button>
                                        </>
                                    ) : (
                                        <>
                                            {existingcondition.diabetic || '__'} °C{' '}
                                            <span className="edit" onClick={() => handleExistingConditionEdit('existing', 'diabetic')}>
                                                ✎
                                            </span>
                                        </>
                                    )}
                                </p>
                                <p>
                                    ☑ Blood Pressure :{' '}
                                    {existingconditionediting.section === 'existing' &&
                                    existingconditionediting.field === 'bloodPressure' ? (
                                        <>
                                            <input
                                                value={existingcondition.bloodPressure.systolic}
                                                onChange={(e) => handleExistingChange(e, 'existing', 'bloodPressure', 'systolic')}
                                                style={{ width: 60 }}
                                            />
                                            /
                                            <input
                                                value={existingcondition.bloodPressure.diastolic}
                                                onChange={(e) => handleExistingChange(e, 'existing', 'bloodPressure', 'diastolic')}
                                                style={{ width: 60 }}
                                            />{' '}
                                            <button onClick={handleExistingConditionSave}>Save</button>
                                        </>
                                    ) : (
                                        <>
                                            {existingcondition.bloodPressure.systolic || '__'} /{' '}
                                            {existingcondition.bloodPressure.diastolic || '__'} mmHg{' '}
                                            <span className="edit" onClick={() => handleExistingConditionEdit('existing', 'bloodPressure')}>
                                                ✎
                                            </span>
                                        </>
                                    )}
                                </p>
                                <p>
                                    ☑ Cholesterol :{' '}
                                    {existingconditionediting.section === 'existing' && existingconditionediting.field === 'cholesterol' ? (
                                        <>
                                            <input
                                                value={existingcondition.cholesterol}
                                                onChange={(e) => handleExistingChange(e, 'existing', 'cholesterol')}
                                                style={{ width: 60 }}
                                            />{' '}
                                            <button onClick={handleExistingConditionSave}>Save</button>
                                        </>
                                    ) : (
                                        <>
                                            {existingcondition.cholesterol || '__'} °C{' '}
                                            <span className="edit" onClick={() => handleExistingConditionEdit('existing', 'cholesterol')}>
                                                ✎
                                            </span>
                                        </>
                                    )}
                                </p>
                                <p>
                                    ☑ Thyroid :{' '}
                                    {existingconditionediting.section === 'existing' && existingconditionediting.field === 'thyroid' ? (
                                        <>
                                            <input
                                                value={existingcondition.thyroid}
                                                onChange={(e) => handleExistingChange(e, 'existing', 'thyroid')}
                                                style={{ width: 60 }}
                                            />{' '}
                                            <button onClick={handleExistingConditionSave}>Save</button>
                                        </>
                                    ) : (
                                        <>
                                            {existingcondition.thyroid || '__'} °C{' '}
                                            <span className="edit" onClick={() => handleExistingConditionEdit('existing', 'thyroid')}>
                                                ✎
                                            </span>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        style={{
                            background: '#0070f3',
                            color: '#fff',
                            borderRadius: 8,
                            padding: '10px 32px',
                            border: 'none',
                            fontSize: '1rem',
                            fontWeight: 500,
                            margin: '24px auto',
                            display: 'block'
                        }}
                        onClick={getPatientsCreate}
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit All Data'}
                    </button>
                    {/* {error && <div style={{ color: 'red', marginTop: 12, textAlign: 'center' }}>{error}</div>} */}
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
                {/* <div className="App">
                <ImageUploading multiple value={images} onChange={onChange} maxNumber={maxNumber} dataURLKey="data_url">
                    {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                        // write your building UI
                        <div className="upload__image-wrapper">
                            <button style={isDragging ? { color: 'red' } : undefined} onClick={onImageUpload} {...dragProps}>
                                Click or Drop here
                            </button>
                            &nbsp;
                            <button onClick={onImageRemoveAll}>Remove all images</button>
                            {imageList.map((image, index) => (
                                <div key={index} className="image-item">
                                    <img src={image['data_url']} alt="" width="100" />
                                    <div className="image-item__btn-wrapper">
                                        <button onClick={() => onImageUpdate(index)}>Update</button>
                                        <button onClick={() => onImageRemove(index)}>Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ImageUploading>
            </div> */}
                <div className="diagnostic-section" style={{ padding: 24 }}>
                    <h2 style={{ color: '#1e73ff', marginBottom: 12 }}>Diagnostic Investigation</h2>

                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                        <input
                            type="search"
                            placeholder="Search"
                            style={{
                                flex: 1,
                                borderRadius: 24,
                                padding: '12px 18px',
                                border: '1px solid #d7e3ff',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ marginTop: 0 }}>Imaging :</h4>
                            <p style={{ color: '#666', lineHeight: 1.6 }}>A patient's chief complaint is the primary reason</p>
                        </div>

                        <div style={{ width: 220 }}>
                            <ImageUploading multiple value={images} onChange={onChange} maxNumber={maxNumber} dataURLKey="data_url">
                                {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {/* single image preview area (show latest image if any) */}
                                        <div
                                            style={{
                                                borderRadius: 8,
                                                padding: 12,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                minHeight: 140,
                                                background: '#fff',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                            }}
                                            onClick={onImageUpload}
                                            {...dragProps}
                                        >
                                            {imageList.length > 0 ? (
                                                <img
                                                    src={imageList[imageList.length - 1].data_url}
                                                    alt="preview"
                                                    style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 6 }}
                                                />
                                            ) : (
                                                <div style={{ color: '#9aaae6' }}>Click or drop an image here</div>
                                            )}
                                        </div>

                                        {/* thumbnails + actions */}
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                            {imageList.map((image, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        width: 120,
                                                        borderRadius: 8,
                                                        background: '#fff',
                                                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                                                        overflow: 'hidden'
                                                    }}
                                                >
                                                    {/* <img src={image.data_url} alt="" style={{ width: '100%', height: 80, objectFit: 'cover' }} />
                  <div style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 12, color: '#777' }}>{new Date().toLocaleDateString()}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => onImageUpdate(index)}
                        title="Edit"
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#1e73ff'
                        }}
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => onImageRemove(index)}
                        title="Remove"
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#ff4d4f'
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </div> */}
                                                </div>
                                            ))}
                                        </div>

                                        {/* control row */}
                                        <div style={{ display: 'flex', left:10, gap: 10, alignItems: 'center' }}>
                                            <button
                                                onClick={onImageUpload}
                                                style={{
                                                    background: isDragging ? '#e6f0ff' : '#fff',
                                                    border: '1px dashed #cfe0ff',
                                                    padding: '8px 5px',
                                                    borderRadius: 8,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Upload
                                            </button>

                                            <button
                                                onClick={onImageRemoveAll}
                                                style={{
                                                    background: '#fff',
                                                    border: '1px solid #f0f0f0',
                                                    padding: '8px 12px',
                                                    borderRadius: 8,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Remove all
                                            </button>

                                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                                                {/* <button
                                                    className="btn-edit"
                                                    style={{
                                                        background: '#fff',
                                                        border: '1px solid #cfe0ff',
                                                        padding: '8px 20px',
                                                        borderRadius: 8,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Edit
                                                </button> */}
                                                <button
                                                    className="btn-update"
                                                    style={{
                                                        background: '#0a66ff',
                                                        color: '#fff',
                                                        padding: '8px 20px',
                                                        borderRadius: 8,
                                                        border: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </ImageUploading>
                        </div>
                    </div>
                </div>
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
        </div>
    );
}
