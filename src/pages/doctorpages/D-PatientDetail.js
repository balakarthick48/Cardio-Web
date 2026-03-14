import React, { useEffect, useState, useRef } from 'react';
import '../../styles/D-PatientDetail.css';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import API_BASE_URL from '../../config';
import Pad from '../../assets/images/pad.png';
import { use } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import ImageUploading from 'react-images-uploading';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import SpeechToTextModal from '../../components/SpeechToTextModal';
import { useLocation } from 'react-router-dom';
import addIcon from '../../assets/images/add-icon.png';
import editIcon from '../../assets/images/edit-icon.png';
import downloadIcon from '../../assets/images/download.png';
import ConfirmationModal from '../../components/ConfirmationModal';

const PatientTabListModel = [
    { index: 0, name: 'profile', displayTitle: 'Profile' },
    { index: 1, name: 'vital', displayTitle: 'Vital Signs' },
    { index: 2, name: 'family history', displayTitle: 'Family Medical History' },
    { index: 3, name: 'prescription', displayTitle: 'Prescription' },
    { index: 4, name: 'present', displayTitle: 'Present Symptoms' },
    { index: 5, name: 'meeting process', displayTitle: 'Meeting Process' },
    { index: 6, name: 'diagnostic', displayTitle: 'Diagnostic Investigation' }
];
const PatientDoseDropdownModel = [
    { index: 0, value: 'after_food', displayTitle: 'After Food' },
    { index: 1, value: 'before_food', displayTitle: 'Before Food' },
];

const PatientEatingTypeDropdownModel = [
    { index: 0, value: 'normal', displayTitle: 'Normal' },
    { index: 1, value: 'chewing', displayTitle: 'Chewing' },
];

export default function PatientDetail() {
    const location = useLocation();
    const { patientId, email, mobile, address, name } = location.state || {};
    // const patientIdFromState = location.state?.patientId || null;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [prescriptions, setPrescriptions] = useState([]);
    const [meetingprocess, setMeetingprocess] = useState([]);
    const [patients, setPatients] = useState([]);
    const maxNumber = 69;
    const [activeTab, setActiveTab] = useState('profile');
    const [images, setImages] = React.useState([]);

    const [meetingIdInput, setMeetingIdInput] = useState('');
    const [patientIdInput, setPatientIdInput] = useState('');
    const [languageOption, setLanguageOption] = useState('en'); // 'en' or 'ta'
    // New state for the modal
    const [isSpeechModalOpen, setIsSpeechModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [prescriptionToDelete, setPrescriptionToDelete] = useState(null); // store index

    const [activeSpeechField, setActiveSpeechField] = useState(null);

    const [familyHistory, setFamilyHistory] = useState([]);
    const [vitalSignsData, setVitalSignsData] = useState(false);
    const [addSymptomsData, setaddSymptomsData] = useState(false);
    const [addInvestigationData, setaddInvestigationData] = useState(false);
    const [insertvitalSigns, setInsertVitalSigns] = useState({
        temperature: '',
        heartRate: '',
        bloodPressure: '',
        respiratoryRate: '',
        age: '',
        height: '',
        weight: '',
        bmi: ''
    });
    // Add these state variables after the existing ones in the component:

    // Family Medical History state
    // start empty — will be filled from API when editing
    const [familyHistoryData, setFamilyHistoryData] = useState([]);
    const [isEditingFamilyHistory, setIsEditingFamilyHistory] = useState(false);
    const [newFamilyEntry, setNewFamilyEntry] = useState({
        condition_name: '',
        family_member: '',
        status: ''
    });
    const [editingFamilyIdx, setEditingFamilyIdx] = useState(null);
    // const [listening, setListening] = useState(false);

    // Present Symptoms state
    const [selectedDate, setSelectedDate] = useState('');
    const [symptomsData, setSymptomsData] = useState(null);
    const [isEditingSymptoms, setIsEditingSymptoms] = useState(false);
    const [symptomsFormData, setSymptomsFormData] = useState({
        chiefComplaint: '',
        onsetDurationSeverity: '',
        associatedSymptoms: '',
        consultingDoctor: '',
        aggravatingRelievingFactor: '',
        nextVisitDate: ''
    });
    const [isEditingInvestigation, setIsEditingInvestigation] = useState(false);
    const [investigationData, setInvestigationData] = useState(null);
    const [investigationFormData, setInvestigationFormData] = useState({
        investigationType: '',
        description: '',
        associatedSymptoms: '',
        report_file: '',
        recordDate: '',
        report_file_url: ''
    });

    // Local inputs for new investigation entry
    const [investigationTypeInput, setInvestigationTypeInput] = useState('');
    const [investigationDescriptionInput, setInvestigationDescriptionInput] = useState('');

    useEffect(() => {
        // populate local inputs when form data is loaded from API
        if (investigationFormData && investigationFormData[0]) {
            setInvestigationTypeInput(investigationFormData[0].investigationType || '');
            setInvestigationDescriptionInput(investigationFormData[0].description || '');
        }
    }, [investigationFormData]);

    const handleSubmitInvestigation = () => {
        const payload = {
            investigationType: investigationTypeInput,
            description: investigationDescriptionInput,
            report_file: images && images.length > 0 ? images[images.length - 1].data_url : (investigationFormData && investigationFormData[0]?.report_file) || ''
        };
        insertInvestigation(payload);
    };
    const startListening = (fieldName) => {
        setActiveSpeechField(fieldName);
        setIsSpeechModalOpen(true);
    };

    const handleTranscript = (transcript) => {
        if (!activeSpeechField) return;

        if (activeSpeechField.startsWith('symptoms.')) {
            const field = activeSpeechField.replace('symptoms.', '');
            setSymptomsFormData(prev => ({ ...prev, [field]: transcript }));
        } else {
            setNewPrescription(prev => {
                const updated = { ...prev };

                if (activeSpeechField === "medicineName") {
                    updated.medicineName = transcript;
                } else if (activeSpeechField.startsWith("frequency.")) {
                    const key = activeSpeechField.split(".")[1];
                    updated.frequency = {
                        ...prev.frequency,
                        [key]: transcript
                    };
                }
                return updated;
            });
        }

        setIsSpeechModalOpen(false);
        setActiveSpeechField(null);
    };

    ////////############//////

    // Handle add/edit family history entry
    const handleAddFamilyHistory = () => {
        if (!newFamilyEntry.condition_name || !newFamilyEntry.family_member || !newFamilyEntry.status) {
            toast.error('Please fill all fields');
            return;
        }

        if (editingFamilyIdx !== null) {
            // Update existing entry
            const updated = [...familyHistoryData];
            updated[editingFamilyIdx] = newFamilyEntry;
            setFamilyHistoryData(updated);
            setEditingFamilyIdx(null);
            toast.success('Family history updated successfully');
        } else {
            // Add new entry
            setFamilyHistoryData(prev => [
                ...prev,
                { ...newFamilyEntry }
            ]);
            toast.success('Family history added successfully');
        }

        setNewFamilyEntry({ condition_name: '', family_member: '', status: '' });
        setIsEditingFamilyHistory(false);
    };

    // Handle edit family history entry
    const handleEditFamilyHistory = (idx) => {
        setNewFamilyEntry(familyHistoryData[idx]);
        setEditingFamilyIdx(idx);
        setIsEditingFamilyHistory(true);
    };

    // Handle delete family history entry
    const handleDeleteFamilyHistory = (idx) => {
        const updated = familyHistoryData.filter((_, i) => i !== idx);
        setFamilyHistoryData(updated);
        toast.success('Entry deleted');
    };

    // Handle cancel editing
    const handleCancelEditingFamilyHistory = () => {
        setNewFamilyEntry({ condition_name: '', family_member: '', status: '' });
        setEditingFamilyIdx(null);
        setIsEditingFamilyHistory(false);
    };

    const onChange = (imageList, addUpdateIndex) => {
        // data for submit
        console.log(imageList, addUpdateIndex);
        setImages(imageList);
    };

    // section refs for PDF capture
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const profileRef = useRef(null);
    const vitalRef = useRef(null);
    const familyHistoryRef = useRef(null);
    const prescriptionRef = useRef(null);
    const presentRef = useRef(null);
    const diagnosticRef = useRef(null);
    const combinedRef = useRef(null);
    const headerRef = useRef(null);
    const medicineNameInputRef = useRef(null);

    const formatFrequency = (freqObj) => {
        if (!freqObj || typeof freqObj !== 'object') return '-';

        const labels = [];
        if (freqObj.BF) labels.push('BF');
        if (freqObj.AF) labels.push('AF');

        return labels.length ? labels.join(', ') : '-';
    };

    const exportHeaderAndSection = async (sectionRef, filename = 'section.pdf') => {
        setIsExportingPDF(true);
        try {
            if (!headerRef?.current || !sectionRef?.current) return;

            // create off-screen wrapper
            const wrapper = document.createElement('div');
            wrapper.style.position = 'absolute';
            wrapper.style.left = '-9999px';
            wrapper.style.top = '0';
            wrapper.style.background = '#fff';
            // copy computed width to keep layout similar (fallback)
            const width = Math.max(headerRef.current.offsetWidth || 800, sectionRef.current.offsetWidth || 800);
            wrapper.style.width = width + 'px';
            wrapper.style.padding = '12px';

            // clone header + section
            const headerClone = headerRef.current.cloneNode(true);
            const sectionClone = sectionRef.current.cloneNode(true);

            // remove any interactive elements that should not appear (pdf buttons / nav)
            headerClone.querySelectorAll('.pdf-btn').forEach((el) => el.remove());
            sectionClone.querySelectorAll('.pdf-btn').forEach((el) => el.remove());
            // also remove nav buttons if accidentally included
            headerClone.querySelectorAll('button').forEach((b) => {
                if (b.textContent && /Profile|Vital|Prescription|Present|Diagnostic/i.test(b.textContent)) b.remove();
            });

            // If it's the prescription PDF, remove the last row from the table body
            if (filename === 'Prescription.pdf') {
                const tableBody = sectionClone.querySelector('.prescription-table tbody');
                if (tableBody && tableBody.lastElementChild) {
                    // This removes the input row before generating the PDF
                    tableBody.removeChild(tableBody.lastElementChild);
                }
            }

            wrapper.appendChild(headerClone);
            wrapper.appendChild(sectionClone);
            document.body.appendChild(wrapper);

            // capture
            const canvas = await html2canvas(wrapper, { scale: 2, useCORS: true, allowTaint: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(filename);

            // cleanup
            document.body.removeChild(wrapper);
        } catch (err) {
            console.error('exportHeaderAndSection error', err);
            toast.error('Failed to export PDF');
        } finally {
            setIsExportingPDF(false);
        }
    };

    const exportSectionToPDF = async (ref, filename = 'section.pdf') => {
        setIsExportingPDF(true); // Set to true when starting export
        if (!ref?.current) return;

        // hide any export buttons inside target before capture
        const pdfButtons = ref.current.querySelectorAll('.pdf-btn');
        pdfButtons.forEach((b) => (b.style.display = 'none'));

        try {
            const canvas = await html2canvas(ref.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(filename);
        } catch (err) {
            console.error('PDF export error', err);
            toast.error('Failed to export PDF');
        } finally {
            // restore visibility
            pdfButtons.forEach((b) => (b.style.display = 'inline-block'));
        }
        setIsExportingPDF(false); // Reset after export
    };

    const [newPrescription, setNewPrescription] = useState({
        medicineName: '',
        quantity: 1,
        frequency: { F: '', A: '', E: '', N: '' },
        dosageTiming: 'after_food',
        eatingType: 'normal'
    });
    const [editingIdx, setEditingIdx] = useState(null);

    const isPrescriptionUnchanged =
        editingIdx !== null &&
        prescriptions[editingIdx] &&
        newPrescription.medicineName === prescriptions[editingIdx].medicine_name &&
        String(newPrescription.quantity) === String(prescriptions[editingIdx].quantity) &&
        newPrescription.frequency.F === prescriptions[editingIdx].frequency_F &&
        newPrescription.frequency.A === prescriptions[editingIdx].frequency_A &&
        newPrescription.frequency.E === prescriptions[editingIdx].frequency_E &&
        newPrescription.frequency.N === prescriptions[editingIdx].frequency_N &&
        newPrescription.dosageTiming === prescriptions[editingIdx].dosageTiming &&
        newPrescription.eatingType === prescriptions[editingIdx].eatType;

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
        const prescriptionToEdit = prescriptions[idx];
        if (!prescriptionToEdit) return;
        setEditingIdx(idx);
        setNewPrescription({
            medicineName: prescriptionToEdit.medicine_name,
            quantity: prescriptionToEdit.quantity,
            frequency: {
                F: prescriptionToEdit.frequency_F,
                A: prescriptionToEdit.frequency_A,
                E: prescriptionToEdit.frequency_E,
                N: prescriptionToEdit.frequency_N
            },
            dosageTiming: prescriptionToEdit.dosageTiming,
            eatingType: prescriptionToEdit.eatType,
        });
        setTimeout(() => {
            medicineNameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            medicineNameInputRef.current?.focus();
        }, 0);
    };

    const handleRemovePrescription = async (idx) => {
        setPrescriptionToDelete(idx);
        setIsConfirmModalOpen(true);
    };

    const confirmRemovePrescription = async () => {
        if (prescriptionToDelete === null) return;

        const prescriptionToRemove = prescriptions[prescriptionToDelete];
        if (!prescriptionToRemove) {
            setIsConfirmModalOpen(false);
            setPrescriptionToDelete(null);
            return;
        }

        const body = {
            patientId: patientId,
            prescriptionId: prescriptionToRemove.prescription_id,
        };
        const bodyJSON = JSON.stringify(body);
        try {
            let url = `${API_BASE_URL}con/remove-prescription`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: bodyJSON,
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(data.message);
                getPrescriptions();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error('Network error');
        } finally {
            // Close modal and reset state
            setIsConfirmModalOpen(false);
            setPrescriptionToDelete(null);
        }
    };

    const handleCancelEditPrescription = () => {
        setEditingIdx(null);
        setNewPrescription({
            medicineName: '',
            quantity: '',
            frequency: { F: '', A: '', E: '', N: '' },
            dosageTiming: 'after_food',
            eatingType: 'normal'
        });
    };


    const getPrescriptions = async (e) => {
        if (!loading) {
            setLoading(true);
        }
        setError('');
        try {
            let url = `${API_BASE_URL}con/upsert-prescriptions`;
            // url = 'https://mocki.io/v1/a5a086db-eb2d-40e6-98af-1181da3215af'
            const body = JSON.stringify({ patientId: patientId })
            console.log('prescriptions url:', url, 'body', body);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body
            });
            const data = await response.json();
            console.log('prescriptionsrespon######:', data);
            if (response.ok && Array.isArray(data.existingMedicines)) {
                setPrescriptions(data.existingMedicines);
            } else {
                setPrescriptions([]);
                setError(data.message || 'Failed');
            }
            console.log('prescriptions___', data.existingMedicines);
            setLoading(false);
        } catch (err) {
            setError('Network error');
            setLoading(false);
        }
    };

    const getMeetingProcess1 = async () => {
        if (!meetingIdInput || !patientIdInput) {
            setError('Please enter Meeting ID and Patient ID');
            return;
        }
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}admin/process-meeting`;
            // url = 'https://mocki.io/v1/a5a086db-eb2d-40e6-98af-1181da3215af'
            console.log('process meeting url:', url);
            const meetingId = String(meetingIdInput).trim();
            const patientId = String(patientIdInput).trim();
            const body = {
                meetingId,
                language: languageOption,
                patientId,
                doctorId: 5
            };
            console.log('process meeting payload:', body);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            console.log('Response statusmeeting:', response.status);
            const data = await response.json();
            console.log('meetingprocess response??????<<<<:', data);
            console.log('mMPMSGGG>>>>>>:', data.message);
            if (response.ok) {
                setMeetingprocess(data);
                toast.success(data.message);
            } else {
                setMeetingprocess([]);
                setError(data.message || 'Failed');
            }
            console.log('Meetingprocess==___', data);
        } catch (err) {
            setError('Network error');
        }
        setLoading(false);
    };

    const getMeetingProcess = async () => {
        if (!meetingIdInput || !patientIdInput) {
            setError('Please enter Meeting ID and Patient ID');
            return;
        }
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}patient/meeting-details?meetingId=${encodeURIComponent(meetingIdInput)}&patientId=${encodeURIComponent(patientIdInput)}&language=${encodeURIComponent(languageOption)}`;
            console.log('process meeting url:', url);
            // const meetingId = String(meetingIdInput).trim();
            // const patientId = String(patientIdInput).trim();
            // const body = {
            //     meetingId,
            //     language: languageOption,
            //     patientId,
            //     doctorId: 5
            // };
            // console.log('process meeting payload:', body);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                // body: JSON.stringify(body)
            });
            console.log('Response statusmeeting:', response.status);
            const data = await response.json();
            console.log('meetingprocess response??????<<<<:', data);
            console.log('mMPMSGGG>>>>>>:', data.message);
            if (response.ok) {
                setMeetingprocess(data);
                toast.success(data.message);
            } else {
                setMeetingprocess([]);
                setError(data.message || 'Failed');
            }
            console.log('Meetingprocess==___', data);
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
                patientId: patientId,
                prescription: [
                    {
                        medicineName: newPrescription.medicineName,
                        quantity: newPrescription.quantity,
                        frequency: {
                            F: newPrescription.frequency.F,
                            A: newPrescription.frequency.A,
                            E: newPrescription.frequency.E,
                            N: newPrescription.frequency.N
                        },
                        dosageTiming: newPrescription.dosageTiming,
                        eatType: newPrescription.eatingType
                    }
                ]
            };
            const bodyJSON = JSON.stringify(body)
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: bodyJSON
            });
            console.log('update prescription url:', url, 'body', bodyJSON);
            const data = await response.json();
            // Update prescriptions table with latest data from API
            if (response.ok) {
                getPrescriptions();
                setEditingIdx(null);
                setNewPrescription({
                    medicineName: '',
                    quantity: '',
                    frequency: { F: '', A: '', E: '', N: '' },
                    dosageTiming: 'after_food',
                    eatingType: 'normal'
                });
            } else {
                setError(data.message || 'Failed');
                setLoading(false);
            }
        } catch (err) {
            setError('Network error');
            setLoading(false);
        }
    };

    // const getPatients = async () => {
    //     setLoading(true);
    //     setError('');
    //     try {
    //         let url = `${API_BASE_URL}patient/getAllPatientDetails`;
    //         console.log('Fetching:', url);
    //         const response = await fetch(url, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ month: 9 })
    //         });
    //         console.log('Response status:', response.status);
    //         const data = await response.json();
    //         console.log('patients response:', data);
    //         if (response.ok) {
    //             setPatients(data.data);
    //         } else {
    //             setError(data.message || 'Failed to fetch patients detail');
    //         }
    //     } catch (err) {
    //         setError('Network erroaa');
    //     }
    //     setLoading(false);
    // };

    const getPatients = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}patient/getallpatientdetailsAll`;
            console.log('FetchingLLLLL:', url);
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
            setError('Network erroaa');
        }
        setLoading(false);
    };
    const getfamilyHistory = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}patient/family-history-get?patientId=${patientId}`;
            console.log('FetchingFHHHH:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Response FH....:', response.status);
            const data = await response.json();
            console.log('family history response:', data);
            if (response.ok) {
                setFamilyHistory(data.data);
            } else {
                setError(data.message || 'Failed to fetch family history');
            }
        } catch (err) {
            setError('Network error');
        }
        setLoading(false);
    };

    //     const insertFamilyHistory = async () => {
    //         if (!familyHistoryData || familyHistoryData.length === 0) {
    //     toast.error('Please add at least one family history record');
    //     setLoading(false);
    //     return;
    // }

    //         setLoading(true);
    //         setError('');
    //         try {
    //             let url = `${API_BASE_URL}patient/family-history`;
    //             console.log('insertFHurl:', url);
    //             const body = {
    //                 patientId: patientId,
    //                 records: familyHistoryData.map((item) => ({
    //                     condition_name: item.condition_name,
    //                     family_member: item.family_member,
    //                     status: item.status
    //                 }))
    //             };
    //             console.log('family history payload:', body);
    //             const response = await fetch(url, {
    //                 method: 'POST',
    //                 headers: { 'Content-Type': 'application/json' },
    //                 body: JSON.stringify(body)
    //             });
    //             console.log('insertfamily:', response.status);
    //             // const data = await response.json();
    //             let data;

    // try {
    //     data = await response.json();
    // } catch {
    //     data = { message: "Server response not JSON" };
    // }
    //             console.log('family history insertt response:', data);
    //             if (response.ok) {
    //                 toast.success(data.message || 'Family history updated successfully');
    //                 setIsEditingFamilyHistory(data);
    //                 // getfamilyHistory();
    //             } else {
    //                 setError(data.message || 'Failed to update family history');
    //                 toast.error(data.message || 'Failed to update');
    //             }
    //         } catch (err) {
    //             setError('Network error');
    //             toast.error('Network error');
    //         }
    //         setLoading(false);
    //     };

    const insertFamilyHistory = async (records = familyHistoryData) => {
        if (!records || records.length === 0) {
            toast.error('Please add at least one family history record');
            return;
        }

        setLoading(true);

        try {
            const body = {
                patientId: Number(patientId),
                records: [
                    {
                        condition_name: newFamilyEntry.condition_name,
                        family_member: newFamilyEntry.family_member,
                        status: newFamilyEntry.status
                    }
                ]
            };

            console.log("Payload///:", body);

            const response = await fetch(
                `${API_BASE_URL}patient/family-history`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                }
            );

            let data;
            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (response.ok) {
                toast.success('Family history updated successfully');
                getfamilyHistory();
                setIsEditingFamilyHistory(false);
            } else {
                console.error(data);
                toast.error(data.message || 'Failed to update');
            }
        } catch (err) {
            console.error(err);
            toast.error('Network error');
        }

        setLoading(false);
    };
    console.log("familyHistoryData||||:", familyHistoryData);

    const getInsertVitalSigns = async () => {
        setLoading(true);

        try {
            const body = {
                patientId: Number(patientId),
                temperature: vitalSigns.temperature,
                heartRate: vitalSigns.heartRate,
                bloodPressure: `${vitalSigns.bloodPressure.systolic || ''}/${vitalSigns.bloodPressure.diastolic || ''}`,
                respiratoryRate: vitalSigns.respiratoryRate,
                age: basicData.age,
                height: basicData.height,
                weight: basicData.weight,
                bmi: basicData.bmi

            };

            console.log("Payload####:", body);

            const response = await fetch(
                `${API_BASE_URL}patient/vitals-basic`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                }
            );

            let data;
            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (response.ok) {
                toast.success('Vital signs updated successfully');
                setInsertVitalSigns(false);
            } else {
                console.error(data);
                toast.error(data.message || 'Failed to update');
            }
        } catch (err) {
            console.error(err);
            toast.error('Network error');
        }

        setLoading(false);
    };

    const getVitalSignsData = async (date) => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}patient/vitals-basic-get?patientId=${patientId}`;
            console.log('vitals url:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('vitals Response status:', response.status);
            const data = await response.json();
            console.log('vitals response:', data);

            if (response.ok && data.data) {
                console.log('<<<<<<>>>>//', response);
                setVitalSignsData(data.data);
            } else {
                setVitalSignsData(null);
            }
        } catch (err) {
            console.error('Error fetching vital signs:', err);
            setVitalSignsData(null);
            setError('Network error');
        }
        setLoading(false);
    };

    // Get symptoms data from API
    const getSymptomsData = async (date) => {
        if (!date) {
            setSymptomsData(null);
            return;
        }

        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}patient/symptoms-get?patientId=${patientId}&date=${date}`;
            console.log('symptoms url:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('symptoms Response status:', response.status);
            const data = await response.json();
            console.log('symptoms response:', data);
            //     if (response.ok && data) {
            //     console.log('<<<<<<>>>>//', response);    
            //     setSymptomsData(data);
            //     console.log('symptdataaa', data);
            //                 } else {
            //     setSymptomsData(null);
            // }
            if (response.ok && data.data) {
                setSymptomsData(data.data);
                setSymptomsFormData({
                    chiefComplaint: data.data[0].chief_complaint || '',
                    onsetDurationSeverity: data.data[0].onset_duration_severity || '',
                    associatedSymptoms: data.data[0].associated_symptoms || '',
                    consultingDoctor: data.data[0].consulting_doctor || '',
                    aggravatingRelievingFactor: data.data[0].aggravating_relief_factor || '',
                    nextVisitDate: data.data[0].next_visit_date || ''
                });
                console.log('<<<<<<>>>>//', symptomsData);

                setIsEditingSymptoms(false);
            } else {
                setSymptomsData(null);
                setSymptomsFormData({
                    chiefComplaint: '',
                    onsetDurationSeverity: '',
                    associatedSymptoms: '',
                    consultingDoctor: '',
                    aggravatingRelievingFactor: '',
                    nextVisitDate: ''
                });
            }
        } catch (err) {
            console.error('Error fetching symptoms:', err);
            setSymptomsData(null);
            setError('Network error');
        }
        setLoading(false);
    };
    console.log('symptomsData???...', symptomsData);

    const insertSymptoms = async (symptomsFormData) => {
        setLoading(true);

        try {
            const body = {
                // appoinment_id: symptomsData[0].appointment_id || 0, 
                appoinment_id: '',
                patient_id: Number(patientId),
                chief_complaint: symptomsFormData.chiefComplaint || '',
                onset_duration_severity: symptomsFormData.onsetDurationSeverity || '',
                associated_symptoms: symptomsFormData.associatedSymptoms || '',
                consulting_doctor: symptomsFormData.consultingDoctor || '',
                aggravating_relief_factor: symptomsFormData.aggravatingRelievingFactor || '',
                next_visit_date: symptomsFormData.nextVisitDate || ''
            };

            console.log("Payloadsymptoms:", body);

            const response = await fetch(
                `${API_BASE_URL}patient/symptoms`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                }
            );

            let data;
            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (response.ok) {
                toast.success('Symptoms updated successfully');
                setaddSymptomsData(false);
            } else {
                console.error(data);
                toast.error(data.message || 'Failed to update');
            }
        } catch (err) {
            console.error(err);
            setError('Network error');
        }

        setLoading(false);
    };

    const getInvestigationData = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}patient/investigation-get?patientId=${patientId}`;
            console.log('investigation url:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('investigation Response status:', response.status);
            const data = await response.json();
            console.log('investiation response:', data);
            if (response.ok && data.data) {
                setInvestigationData(data.data);
                setInvestigationFormData({
                    investigationType: data.data[0].investigationType || '',
                    description: data.data[0].description || '',
                    associatedSymptoms: data.data[0].associated_symptoms || '',
                    report_file: data.data[0].report_file || '',
                    recordDate: data.data[0].recordDate || '',
                    report_file_url: data.data[0].report_file_url || ''
                });

                setIsEditingInvestigation(false);
            } else {
                setInvestigationData(null);
                setInvestigationFormData({
                    investigationType: '',
                    description: '',
                    associatedSymptoms: '',
                    report_file: '',
                    recordDate: '',
                    report_file_url: ''
                });
            }
        } catch (err) {
            console.error('Error fetching symptoms:', err);
            setSymptomsData(null);
            setError('Network error');
        }
        setLoading(false);
    };
    console.log('investigationData???...', investigationData);

    const dataURLtoFile = (dataurl, filename) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: mime });
    };

    const insertInvestigation = async (investigationFormData) => {
        setLoading(true);

        try {
            const formData = new FormData();

            formData.append("patientId", Number(patientId));
            formData.append("investigationType", investigationFormData.investigationType);
            formData.append("description", investigationFormData.description);

            // ✅ attach image as file
            if (investigationFormData.report_file) {
                const file = dataURLtoFile(
                    investigationFormData.report_file,
                    "report.png"
                );
                formData.append("report", file);
            }
            console.log("Payloadinvestigation..**:", formData);
            const response = await fetch(
                `${API_BASE_URL}patient/investigation-post`,
                {
                    method: "POST",
                    body: formData, // ❗ NO JSON.stringify
                }
            );

            const data = await response.json();

            if (response.ok) {
                toast.success("Investigation updated successfully");
                setaddInvestigationData(false);
            } else {
                toast.error(data.message || "Failed");
            }
        } catch (err) {
            toast.error("Network error");
        }

        setLoading(false);
    };
    //     const insertInvestigation = async (investigationFormData) => {
    //     setLoading(true);

    //     try {
    //         const formData = new FormData();
    //         formData.append('patientId', Number(patientId));
    //         formData.append('investigationType', investigationFormData.investigationType || '');
    //         formData.append('description', investigationFormData.description || '');

    //         // Convert base64 data URL to Blob for file upload
    //         if (investigationFormData.report_file) {
    //             const dataUrl = investigationFormData.report_file;
    //             const arr = dataUrl.split(',');
    //             const mime = arr[0].match(/:(.*?);/)[1];
    //             const bstr = atob(arr[1]);
    //             let n = bstr.length;
    //             const u8arr = new Uint8Array(n);
    //             while (n--) {
    //                 u8arr[n] = bstr.charCodeAt(n);
    //             }
    //             const blob = new Blob([u8arr], { type: mime });
    //             formData.append('report', blob, 'investigation_image.png');
    //         }

    //         console.log("Payloadinvestigation..**:", formData);

    //         const response = await fetch(
    //             `${API_BASE_URL}patient/investigation`,
    //             {
    //                 method: 'POST',
    //                 headers: { 'Content-Type': 'application/json' },
    //                 body: JSON.stringify(formData)
    //             }
    //         );

    //         let data;
    //         try {
    //             data = await response.json();
    //         } catch {
    //             data = {};
    //         }

    //         if (response.ok) {
    //             toast.success('Investigation updated successfully');
    //             setaddInvestigationData(false);
    //         } else {
    //             console.error(data);
    //             toast.error(data.message || 'Failed to update');
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         toast.error('Network error');
    //     }

    //     setLoading(false);
    // };
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
        // Fetch latest data and update both vitalSigns and basicData after save
        // getVitalSignsData().then(() => {
        //     if (vitalSignsData && Array.isArray(vitalSignsData) && vitalSignsData.length > 0) {
        //         const latest = vitalSignsData[0];
        //         setVitalSigns(prev => ({
        //             ...prev,
        //             age: latest.age || '',
        //             height: latest.height || '',
        //             weight: latest.weight || '',
        //             bmi: latest.bmi || ''
        //         }));
        //         setBasicData({
        //             age: latest.age || '',
        //             height: latest.height || '',
        //             weight: latest.weight || '',
        //             bmi: latest.bmi || ''
        //         });
        //     }
        // });
    };

    const pickField = (obj, keys = []) => {
        if (!obj) return null;
        for (let k of keys) {
            if (obj[k]) return obj[k];
        }
        // try nested `data` object
        if (obj.data) {
            for (let k of keys) {
                if (obj.data[k]) return obj.data[k];
            }
        }
        return null;
    };

    // const renderSection = (title, value) => {
    //     if (value === null || value === undefined) return null;
    //     let content = '';
    //     if (typeof value === 'string') content = value;
    //     else if (Array.isArray(value)) content = value.join(', ');
    //     else content = JSON.stringify(value, null, 2);

    //     return (
    //         <div style={{ marginTop: 12 }}>
    //             <h4 style={{ margin: '6px 0', fontSize: 16 }}>{title}</h4>
    //             <div style={{ background: '#fff', padding: 12, borderRadius: 6, border: '1px solid #e6eefc', whiteSpace: 'pre-wrap' }}>
    //                 {content}
    //             </div>
    //         </div>
    //     );
    // };
    const titleize = (key = '') =>
        key
            .replace(/([A-Z])/g, ' $1')
            .replace(/[_\-]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())
            .trim();
    // prescription working 9.11
    //     const renderSection = (title, value) => {
    //         if (value === null || value === undefined) return null;

    //         // Prescription handled separately when it's an array/object of medicines
    //         if (title.toLowerCase().includes('prescription')) {
    //             return renderPrescriptionSection(title, value);
    //         }

    //         // If string -> render as paragraph under heading
    //         if (typeof value === 'string') {
    //             return (
    //                 <div style={{ marginTop: 18 }}>
    //                     <h4 style={{ color: '#0a66ff', marginBottom: 12 }}>{title}</h4>
    //                     <div style={{ background: '#fff', padding: 16, borderRadius: 6, lineHeight: 1.6, color:'#333' }}>
    //                         {value}
    //                     </div>
    //                 </div>
    //             );
    //         }
    //  if (Array.isArray(value)) {
    //             return (
    //                 <div style={{ marginTop: 18 }}>
    //                     <h4 style={{ color: '#0a66ff', marginBottom: 12 }}>{title}</h4>
    //                     <div style={{ background: '#fff', padding: 16, borderRadius: 6, color:'#333' }}>
    //                         {value.map((v, i) => (
    //                             <p key={i} style={{ marginBottom: 8 }}>{typeof v === 'string' ? v : JSON.stringify(v)}</p>
    //                         ))}
    //                     </div>
    //                 </div>
    //             );
    //         }

    //         // If object -> render left-right key/value rows similar to screenshot
    //         if (typeof value === 'object') {
    //             const rows = Object.entries(value)
    //                 // filter out empty/null
    //                 .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
    //                 .map(([k, v]) => ({ key: titleize(k), value: v }));

    //             if (rows.length === 0) return null;
    //  return (
    //                 <div style={{ marginTop: 18 }}>
    //                     <h4 style={{ color: '#0a66ff', marginBottom: 12 }}>{title}</h4>
    //                     <div style={{ background: '#fff', padding: 12, borderRadius: 6 }}>
    //                         {rows.map((r, idx) => (
    //                             <div key={idx} style={{ display: 'flex', padding: '12px 0', borderBottom: idx < rows.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
    //                                 <div style={{ width: 220, color: '#666', fontWeight: 600 }}>{r.key} :</div>
    //                                 <div style={{ flex: 1, color: '#333', lineHeight: 1.6 }}>
    //                                     {Array.isArray(r.value) ? r.value.join(', ') : typeof r.value === 'object' ? JSON.stringify(r.value, null, 2) : r.value}
    //                                 </div>
    //                             </div>
    //                         ))}
    //                     </div>
    //                 </div>
    //             );
    //         }

    //         return null;
    //     };

    // const renderSection = (title, value) => {
    //     if (value === null || value === undefined) return null;

    //     // Prescription section handled separately
    //     if (title.toLowerCase().includes('prescription')) {
    //         return renderPrescriptionSection(title, value);
    //     }

    //     // For symptoms array
    //     if (Array.isArray(value)) {
    //         return (
    //             <div style={{ marginTop: 18 }}>
    //                 <h4 style={{ color: '#0a66ff', marginBottom: 12 }}>{title}</h4>
    //                 <div style={{ background: '#fff', padding: 16, borderRadius: 6, color: '#333' }}>
    //                     {value.map((item, i) => (
    //                         <p key={i} style={{ marginBottom: 8 }}>
    //                             • {typeof item === 'string' ? item : JSON.stringify(item)}
    //                         </p>
    //                     ))}
    //                 </div>
    //             </div>
    //         );
    //     }

    //     // For remedies object
    //     if (title === 'Remedies' && Array.isArray(value)) {
    //         return (
    //             <div style={{ marginTop: 18 }}>
    //                 <h4 style={{ color: '#0a66ff', marginBottom: 12 }}>{title}</h4>
    //                 <div style={{ background: '#fff', padding: 16, borderRadius: 6, color: '#333' }}>
    //                     {value.map((remedy, i) => (
    //                         <div key={i} style={{ marginBottom: 12 }}>
    //                             {remedy.medicine && (
    //                                 <p><strong>Medicine:</strong> {remedy.medicine.join(', ')}</p>
    //                             )}
    //                             {remedy.dosage && (
    //                                 <p><strong>Dosage:</strong> {remedy.dosage.join(', ')}</p>
    //                             )}
    //                             {remedy.purpose && (
    //                                 <p><strong>Purpose:</strong> {remedy.purpose.join(', ')}</p>
    //                             )}
    //                         </div>
    //                     ))}
    //                 </div>
    //             </div>
    //         );
    //     }

    //     // For simple string/text sections (like Follow Up)
    //     if (typeof value === 'string' || Array.isArray(value)) {
    //         const content = Array.isArray(value) ? value.join('\n') : value;
    //         return (
    //             <div style={{ marginTop: 18 }}>
    //                 <h4 style={{ color: '#0a66ff', marginBottom: 12 }}>{title}</h4>
    //                 <div style={{ background: '#fff', padding: 16, borderRadius: 6, lineHeight: 1.6, color: '#333' }}>
    //                     {content}
    //                 </div>
    //             </div>
    //         );
    //     }

    //     // For any other object types
    //     return (
    //         <div style={{ marginTop: 18 }}>
    //             <h4 style={{ color: '#0a66ff', marginBottom: 12 }}>{title}</h4>
    //             <div style={{ background: '#fff', padding: 16, borderRadius: 6, color: '#333' }}>
    //                 <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
    //                     {JSON.stringify(value, null, 2)}
    //                 </pre>
    //             </div>
    //         </div>
    //     );
    // };
    const renderValue = (val) => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'string' || typeof val === 'number') return val;
        if (Array.isArray(val)) return val.map(renderValue).join(', ');
        if (typeof val === 'object') {
            return Object.entries(val)
                .map(([k, v]) => `${k}: ${renderValue(v)}`)
                .join(', ');
        }
        return '';
    };
    const renderSection = (title, value) => {
        if (value === null || value === undefined) return null;

        // Prescription section
        if (title.toLowerCase().includes('prescription')) {
            return renderPrescriptionSection(title, value);
        }

        // Symptoms section
        if (title === 'Symptoms') {
            const symptoms = Array.isArray(value) ? value : [value];
            return (
                <div style={{ marginTop: 18 }}>
                    <h4 style={{ color: '#0066ff', marginBottom: 12 }}>{title}</h4>
                    <div style={{ background: '#fff', padding: 16, borderRadius: 6 }}>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontWeight: 600, color: '#444', marginBottom: 8 }}>Chief Complaint:</div>
                            {/* <div style={{ color: '#333', lineHeight: 1.5 }}>{symptoms.join(', ')}</div> */}
                            <div style={{ color: '#333', lineHeight: 1.5 }}>
                                {symptoms.map((s, i) => (
                                    <div key={i}>{renderValue(s)}</div>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontWeight: 600, color: '#444', marginBottom: 8 }}>Onset, Duration, Severity:</div>
                            <div style={{ color: '#333', lineHeight: 1.5 }}>
                                Started 3 days ago, Lasts for 2-3 hr Moderate to severe pain
                            </div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, color: '#444', marginBottom: 8 }}>Associated Symptoms:</div>
                            <div style={{ color: '#333', lineHeight: 1.5 }}>
                                {/* {value.associated || 'No associated symptoms'} */}
                                {/* {typeof value.associated === 'object'
                                    ? JSON.stringify(value.associated)
                                    : value.associated || 'No associated symptoms'} */}
                                {renderValue(value.associated) || 'No associated symptoms'}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Remedies section
        if (title === 'Remedies') {
            const remedies = Array.isArray(value) ? value : [value];
            return (
                <div style={{ marginTop: 18 }}>
                    <h4 style={{ color: '#0066ff', marginBottom: 12 }}>{title}</h4>
                    <div style={{ background: '#fff', padding: 16, borderRadius: 6 }}>
                        {remedies.map((remedy, idx) => (
                            <div key={idx} style={{ marginBottom: idx < remedies.length - 1 ? 16 : 0 }}>
                                {remedy.medicine && (
                                    <div style={{ marginBottom: 12 }}>
                                        <div style={{ fontWeight: 600, color: '#222' }}>
                                            {/* {Array.isArray(remedy.medicine) ? remedy.medicine.join(', ') : remedy.medicine} */}
                                            {Array.isArray(remedy.medicine)
                                                ? remedy.medicine.join(', ')
                                                : typeof remedy.medicine === 'string'
                                                    ? remedy.medicine
                                                    : JSON.stringify(remedy.medicine)}
                                        </div>
                                        <div style={{ marginTop: 4, color: '#444' }}>
                                            {/* <div>Dosage: {Array.isArray(remedy.dosage) ? remedy.dosage.join(', ') : remedy.dosage}</div>
                                            <div>Purpose: {Array.isArray(remedy.purpose) ? remedy.purpose.join(', ') : remedy.purpose}</div> */}
                                            <div>
                                                Dosage:{' '}
                                                {Array.isArray(remedy.dosage)
                                                    ? remedy.dosage.join(', ')
                                                    : typeof remedy.dosage === 'string'
                                                        ? remedy.dosage
                                                        : JSON.stringify(remedy.dosage)}
                                            </div>
                                            <div>
                                                Purpose:{' '}
                                                {Array.isArray(remedy.purpose)
                                                    ? remedy.purpose.join(', ')
                                                    : typeof remedy.purpose === 'string'
                                                        ? remedy.purpose
                                                        : JSON.stringify(remedy.purpose)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Follow Up section
        if (title === 'Follow Up') {
            const followUp = Array.isArray(value) ? value[0] : value;
            return (
                <div style={{ marginTop: 18 }}>
                    <h4 style={{ color: '#0066ff', marginBottom: 12 }}>{title}</h4>
                    <div style={{ background: '#fff', padding: 16, borderRadius: 6 }}>
                        <div style={{ fontWeight: 600, color: '#444', marginBottom: 8 }}>Next visit Date:</div>
                        <div style={{ color: '#333', lineHeight: 1.5 }}>
                            {/* {followUp || 'Not scheduled'} */}
                            {/* {typeof followUp === 'object' ? JSON.stringify(followUp) : followUp || 'Not scheduled'} */}
                            {renderValue(followUp) || 'Not scheduled'}
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    const renderPrescriptionSection = (title, value) => {
        // normalize to array of meds
        let meds = [];
        if (!value) meds = [];
        else if (Array.isArray(value)) meds = value;
        else if (typeof value === 'object') {
            // if passed object has prescriptions key
            meds = value.prescriptions || value.prescription || value.medications || [value];
            if (!Array.isArray(meds)) meds = [meds];
        } else {
            return renderSection(title, String(value));
        }

        if (meds.length === 0) return null;

        return (
            <div style={{ marginTop: 18 }}>
                <h4 style={{ color: '#0a66ff', marginBottom: 12 }}>{title}</h4>
                <div style={{ background: '#fff', padding: 12, borderRadius: 6 }}>
                    {meds.map((m, i) => {
                        const medName = m.medicineName || m.medicine_name || m.name || m.medicine || 'Medicine';
                        const qty = m.quantity || m.qty || m.count || '-';
                        const freq = m.frequency || { F: m.frequency_F, A: m.frequency_A, E: m.frequency_E, N: m.frequency_N } || {};
                        return (
                            <div key={i} style={{ padding: '12px 0', borderBottom: i < meds.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                                <div style={{ fontWeight: 700, color: '#222' }}>{medName}</div>
                                {/* <div style={{ marginTop: 6, color: '#444' }}>
                                    <span style={{ marginRight: 18 }}>
                                        Quantity: <b>{qty}</b>
                                    </span>
                                    <span style={{ marginRight: 8 }}>
                                        F: <b>{freq.F ?? freq.FrequencyF ?? 0}</b>
                                    </span>
                                    <span style={{ marginRight: 8 }}>
                                        A: <b>{freq.A ?? freq.FrequencyA ?? 0}</b>
                                    </span>
                                    <span style={{ marginRight: 8 }}>
                                        E: <b>{freq.E ?? freq.FrequencyE ?? 0}</b>
                                    </span>
                                    <span style={{ marginRight: 8 }}>
                                        N: <b>{freq.N ?? freq.FrequencyN ?? 0}</b>
                                    </span>
                                </div> */}
                                <div style={{ marginTop: 6, color: '#444' }}>
                                    <span style={{ marginRight: 16 }}>
                                        Quantity: <b>{qty}</b>
                                    </span>

                                    <span style={{ marginRight: 12 }}>
                                        F: <b>{formatFrequency(freq.F)}</b>
                                    </span>

                                    <span style={{ marginRight: 12 }}>
                                        A: <b>{formatFrequency(freq.A)}</b>
                                    </span>

                                    <span style={{ marginRight: 12 }}>
                                        E: <b>{formatFrequency(freq.E)}</b>
                                    </span>

                                    <span style={{ marginRight: 12 }}>
                                        N: <b>{formatFrequency(freq.N)}</b>
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    console.log('meetingprocess?<>><><', meetingprocess);
    console.log('Symptoms((())):', meetingprocess?.summary?.symptoms);
    console.log('<<<<<<>>>>', symptomsData);
    console.log('familyHistory((())):', familyHistory);
    // console.log('vitalSignsData+++++:', vitalSignsData[0]?.temperature);
    useEffect(() => {
        getPrescriptions();
        getPatients();
        getfamilyHistory();
        getMeetingProcess();
        getVitalSignsData();
        insertSymptoms();
        getInvestigationData();
    }, []);

    // useEffect(() => {
    //   const SpeechRecognition =
    //     window.SpeechRecognition || window.webkitSpeechRecognition;

    //   if (!SpeechRecognition) {
    //     alert("Speech Recognition not supported");
    //     return;
    //   }

    //   const recognition = new SpeechRecognition();
    //   recognition.continuous = false;
    //   recognition.lang = "en-US";

    //   recognition.onresult = (event) => {
    //     const transcript = event.results[0][0].transcript;

    //     if (!activeField) return;

    //     setNewPrescription((prev) => {
    //       if (activeField.includes(".")) {
    //         const [parent, child] = activeField.split(".");
    //         return {
    //           ...prev,
    //           [parent]: {
    //             ...prev[parent],
    //             [child]: transcript,
    //           },
    //         };
    //       }

    //       return {
    //         ...prev,
    //         [activeField]: transcript,
    //       };
    //     });
    //   };

    //   recognition.onend = () => {
    //     setListening(false);
    //     setActiveField(null);
    //   };

    //   recognitionRef.current = recognition;

    //   return () => recognition.stop();
    // }, [activeField]);

    // const startListening = (fieldName) => {
    //   if (listening) return;
    //   if (!recognitionRef.current) return;

    //   setActiveField(fieldName);
    //   setListening(true);
    //   recognitionRef.current.start();
    // };
    // const stopListening = () => {
    //   if (!recognitionRef.current) return;

    //   recognitionRef.current.stop();
    //   setListening(false);
    //   setActiveField(null);
    // };

    // console.log('prescriptions///', prescriptions);

    const downloadUI = (title, ref, filename) => {
        return (
            <div style={{ flexDirection: 'row', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Prescription</h3>
                <button
                    className="pdf-btn"
                    title={title}
                    // onClick={() => exportSectionToPDF(prescriptionRef, 'Prescription.pdf')}
                    onClick={() => exportHeaderAndSection(ref, filename)}
                    style={{
                        ...styles.pdfBtn
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 24 }}>
                        <div>
                            <label>Download</label>
                        </div>
                        <img src={downloadIcon} alt="Download" style={{ width: 16, height: 16 }} />
                    </div>
                </button>
            </div>
        )
    }

    const renderProfileUI = () => {
        return (
            <div
                className="patient-section"
                style={styles.profileSectionContainer}
                ref={profileRef}
            >
                <div
                    style={styles.profileCard}
                >
                    {/* PDF download button (hidden while generating PDF) */}
                    <button
                        className="pdf-btn"
                        title="Download profile as PDF"
                        // onClick={() => exportSectionToPDF(combinedRef, 'Profile.pdf')}
                        onClick={() => exportHeaderAndSection(profileRef, 'Profile.pdf')}
                        style={styles.pdfBtn}
                    >
                        ⤓
                    </button>
                    <div style={styles.profileCardHeader}>
                        <div
                            style={styles.profileAvatarWrapper}
                        >
                            <img
                                src={patients[0]?.avatar || 'https://i.ibb.co/2cX0dQr/avatar.png'}
                                alt="avatar"
                                style={styles.profileAvatar}
                            />
                        </div>

                        <div style={styles.flex1}>
                            <div
                                style={styles.profileNameContainer}
                            >
                                <div>
                                    <h2 style={styles.patientName}>
                                        {name || 'Peter Thomas'}
                                    </h2>
                                    <div style={styles.patientSubDetail}>
                                        {patients[0]?.applyMode || 'Inperson'}
                                    </div>
                                    <div style={styles.marginTop8}>
                                        <a style={styles.patientCode}>
                                            [{patients[0]?.patientCode || 'DRS25154'}]
                                        </a>
                                    </div>
                                </div>
                                {/* optional small logo on the right if needed */}
                                <div style={styles.profileHeaderActions} />
                            </div>

                            <hr style={styles.divider} />

                            <div style={styles.contactDetails}>
                                <div style={styles.flex1}>
                                    <div style={styles.contactItem}>
                                        Email ID : {email || 'xyz@gmail.com'}
                                    </div>
                                    {/* <div style={{ marginBottom: 8 }}>{patients[0]?.email || 'xyz@gmail.com'}</div> */}
                                    <div style={styles.contactItem}>
                                        Contact Number : {mobile || '+91 98567 56421'}
                                    </div>
                                    {/* <div style={{ marginBottom: 8 }}>{patients[0]?.mobileNumber || '+91 98567 56421'}</div> */}
                                    <div style={styles.contactItem}>Address : {address}</div>
                                </div>

                                {/* <div style={{ flex: 1 }}>
                                            <div style={{ marginBottom: 8, color: '#7a869a', fontWeight: 600 }}>Address :</div>
                                            <div style={{ marginBottom: 8 }}>
                                                {patients[0]?.address || 'No. 9,ABC Street, NEW Nagar, Chennai-600052'}
                                            </div>
                                        </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderVitalUI = () => {
        return (
            <div>
                <div className="patient-section grid-2" ref={vitalRef} style={styles.relative}>

                    <button
                        className="pdf-btn"
                        title="Download vital as PDF"
                        // onClick={() => exportSectionToPDF(vitalRef, 'vital.pdf')}
                        onClick={() => exportHeaderAndSection(vitalRef, 'VitalSigns.pdf')}
                        style={{
                            position: 'absolute',
                            border: 'none',
                            ...styles.pdfBtn
                        }}
                    >
                        ⤓
                    </button>
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
                                        onChange={e => setVitalSigns(prev => ({ ...prev, temperature: e.target.value }))}
                                        style={styles.inputSmall}
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
                                        onChange={e => setVitalSigns(prev => ({ ...prev, heartRate: e.target.value }))}
                                        style={styles.inputSmall}
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
                                        onChange={e => setVitalSigns(prev => ({ ...prev, bloodPressure: { ...prev.bloodPressure, systolic: e.target.value } }))}
                                        style={styles.inputExtraSmall}
                                    />
                                    /
                                    <input
                                        value={vitalSigns.bloodPressure.diastolic}
                                        onChange={e => setVitalSigns(prev => ({ ...prev, bloodPressure: { ...prev.bloodPressure, diastolic: e.target.value } }))}
                                        style={styles.inputExtraSmall}
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
                                        onChange={e => setVitalSigns(prev => ({ ...prev, respiratoryRate: e.target.value }))}
                                        style={styles.inputSmall}
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
                        <p>
                            Age :{' '}
                            {basicediting.section === 'basic' && basicediting.field === 'age' ? (
                                <>
                                    <input
                                        value={basicData.age}
                                        onChange={e => setBasicData(prev => ({ ...prev, age: e.target.value }))}
                                        style={styles.inputSmall}
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
                                        onChange={e => setBasicData(prev => ({ ...prev, height: e.target.value }))}
                                        style={styles.inputSmall}
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
                                        onChange={e => setBasicData(prev => ({ ...prev, weight: e.target.value }))}
                                        style={styles.inputSmall}
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
                                        onChange={e => setBasicData(prev => ({ ...prev, bmi: e.target.value }))}
                                        style={styles.inputSmall}
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
                        <button className="done-btn" onClick={getInsertVitalSigns}>Done</button>
                    </div>

                </div>
                <div style={styles.vitalsSummaryContainer}>
                    <div style={styles.vitalsSummaryWrapper}>
                        <div style={styles.vitalsSummaryCard}>
                            <div style={styles.vitalsSummaryHeader}>
                                <span style={styles.vitalsSummaryTitle}>Vital Signs :</span>
                                <span style={styles.vitalsSummaryTitle}>Basic Data :</span>
                            </div>
                            <div style={styles.vitalsSummaryContent}>
                                <div style={styles.flex1}>
                                    <div style={styles.vitalItem}>Temperature : <span style={styles.vitalValue}>{vitalSignsData[0]?.temperature} ℃</span></div>
                                    <div style={styles.vitalItem}>Heart Rate : <span style={styles.vitalValue}>{vitalSignsData[0]?.heartRate} bpm</span></div>
                                    <div style={styles.vitalItem}>Blood Pressure : <span style={styles.vitalValue}>{vitalSignsData[0]?.bloodPressure} mmHg</span></div>
                                    <div style={styles.vitalItem}>Respiratory Rate : <span style={styles.vitalValue}>{vitalSignsData[0]?.respiratoryRate} per minute</span></div>
                                </div>
                                <div style={styles.flex1}>
                                    <div style={styles.vitalItem}>Age : <span style={styles.vitalValueBold}>{vitalSignsData[0]?.age} Years</span></div>
                                    <div style={styles.vitalItem}>Height : <span style={styles.vitalValue}>{vitalSignsData[0]?.height} CM(s)</span></div>
                                    <div style={styles.vitalItem}>Weight : <span style={styles.vitalValue}>{vitalSignsData[0]?.weight} KG</span></div>
                                    <div style={styles.vitalItem}>BMI : <span style={styles.vitalValueBold}>{vitalSignsData[0]?.bmi}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Medical History */}
                {/* <div className="patient-section">
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
                        </div> */}
            </div>
        )
    }

    const renderFamilyHistoryUI = () => {
        return (
            <div className="patient-section" ref={familyHistoryRef} style={styles.relative}>
                {/* PDF Button */}
                <button
                    className="pdf-btn"
                    title="Download Family Medical History as PDF"
                    onClick={() => exportHeaderAndSection(familyHistoryRef, 'FamilyMedicalHistory.pdf')}
                    style={{
                        position: 'absolute',
                        right: 12,
                        top: 12,
                        border: 'none',
                        background: '#0a66ff',
                        color: '#fff',
                        padding: '6px 8px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(10,102,255,0.15)'
                    }}
                >
                    ⤓
                </button>

                {!isEditingFamilyHistory ? (
                    <>
                        {/* Display Mode - Table View */}
                        <h3 style={styles.sectionTitle}>Family Medical History</h3>
                        <table
                            style={styles.historyTable}
                        >
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.tableTh}>Conditions</th>
                                    <th style={styles.tableTh}>
                                        Family Members
                                    </th>
                                    <th style={styles.tableTh}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(familyHistory && familyHistory.length > 0 ? familyHistory : []).map((item, idx) => (
                                    <tr key={idx} style={styles.tableRow}>
                                        <td style={styles.tableTd}>{item.condition_name}</td>
                                        <td style={styles.tableTd}>{item.family_member}</td>
                                        <td style={styles.tableTd}>{item.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={styles.actionButtonsContainer}>
                            <button
                                onClick={() => {
                                    // Initialize edit mode with API data
                                    setFamilyHistoryData(familyHistory && familyHistory.length > 0 ? [...familyHistory] : []);
                                    setNewFamilyEntry({ condition_name: '', family_member: '', status: '' });
                                    setEditingFamilyIdx(null);
                                    setIsEditingFamilyHistory(true);
                                }}
                                style={styles.editButton}
                            >
                                Edit
                            </button>
                            <button
                                style={styles.updateButton}
                            >
                                Update
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Edit Mode - Form View */}
                        <h3 style={styles.sectionTitle}>Family Medical History</h3>

                        <div
                            style={styles.formGrid3}
                        >
                            {/* Conditions Input */}
                            <div>
                                <label
                                    style={styles.formLabel}
                                >
                                    Conditions
                                </label>
                                <input
                                    type="text"
                                    value={newFamilyEntry.condition_name}
                                    onChange={(e) => setNewFamilyEntry({ ...newFamilyEntry, condition_name: e.target.value })}
                                    placeholder="Enter Here..."
                                    style={styles.formInput}
                                />
                            </div>

                            {/* Family Members Input */}
                            <div>
                                <label
                                    style={styles.formLabel}
                                >
                                    Family Members
                                </label>
                                <input
                                    type="text"
                                    value={newFamilyEntry.family_member}
                                    onChange={(e) => setNewFamilyEntry({ ...newFamilyEntry, family_member: e.target.value })}
                                    placeholder="Enter Here..."
                                    style={styles.formInput}
                                />
                            </div>

                            {/* Status Dropdown */}
                            <div>
                                <label
                                    style={styles.formLabel}
                                >
                                    Status
                                </label>
                                <div style={styles.inputWithButton}>
                                    <select
                                        value={newFamilyEntry.status}
                                        onChange={(e) => setNewFamilyEntry({ ...newFamilyEntry, status: e.target.value })}
                                        style={styles.formSelect}
                                    >
                                        <option value="">Select</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                    <button
                                        onClick={handleAddFamilyHistory}
                                        style={styles.addEntryButton}
                                        title={editingFamilyIdx !== null ? 'Update entry' : 'Add entry'}
                                    >
                                        {editingFamilyIdx !== null ? '✓' : '+'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Current Entries List */}
                        {Array.isArray(familyHistoryData) && familyHistoryData.length > 0 && (
                            <div style={styles.marginBottom24}>
                                <h4 style={styles.currentEntriesTitle}>Current Entries</h4>
                                <table
                                    style={styles.historyTable}
                                >
                                    <thead>
                                        <tr style={styles.tableHeader}>
                                            <th style={styles.tableTh}>
                                                Conditions
                                            </th>
                                            <th style={styles.tableTh}>
                                                Family Members
                                            </th>
                                            <th style={styles.tableTh}>
                                                Status
                                            </th>
                                            <th style={styles.tableThCenter}>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {familyHistoryData.map((item, idx) => (
                                            <tr key={idx} style={styles.tableRow}>
                                                <td style={styles.tableTd}>{item.condition_name}</td>
                                                <td style={styles.tableTd}>{item.family_member}</td>
                                                <td style={styles.tableTd}>{item.status}</td>
                                                <td style={styles.tableTdCenter}>
                                                    <button
                                                        onClick={() => handleEditFamilyHistory(idx)}
                                                        style={styles.editTableButton}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteFamilyHistory(idx)}
                                                        style={styles.deleteTableButton}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={styles.actionButtonsContainerCenter}>
                            <button
                                onClick={handleCancelEditingFamilyHistory}
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={insertFamilyHistory}
                                disabled={loading}
                                style={{ ...styles.updateButtonLarge, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
                            >
                                {loading ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        )
    }
    const renderPrescriptionUI = () => {
        return (
            <div className="patient-section" ref={prescriptionRef} style={{ position: 'relative' }}>
                {downloadUI('Download Prescription as PDF', prescriptionRef, 'Prescription.pdf')}
                <table className="prescription-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Medicine Name</th>
                            <th>Quantity</th>
                            <th>Forenoon</th>
                            <th>Afternoon</th>
                            <th>Evening</th>
                            <th>Night</th>
                            <th>Dose Timing</th>
                            <th>Eating Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prescriptions.length !== 0 && prescriptions.map((med, idx) => (
                            <tr key={med.id || idx}>
                                <td><div className='tdDiv'>{idx + 1 < 10 ? `0${idx + 1}.` : `${idx + 1}.`}</div></td>
                                {/* <td>{idx + 1 < 10 ? `0${idx + 1}.` : `${idx + 1}.`}</td> */}
                                <td> <div className='tdDiv'>{med.medicine_name}</div></td>
                                <td><div className='tdDiv'>{med.quantity}</div></td>
                                <td><div className='tdDiv'>{med.frequency_F}</div></td>
                                <td><div className='tdDiv'>{med.frequency_A}</div></td>
                                <td><div className='tdDiv'>{med.frequency_E}</div></td>
                                <td><div className='tdDiv'>{med.frequency_N}</div></td>
                                <td><div className='tdDiv'>{med.dosageTiming}</div></td>
                                <td><div className='tdDiv'>{med.eatType}</div></td>
                                <td style={styles.tableCellAction}>
                                    <button
                                        onClick={() => handleEditPrescription(idx)}
                                        disabled={editingIdx !== null}
                                        style={
                                            {
                                                ...styles.presEditButton,
                                                cursor: editingIdx !== null ? 'not-allowed' : 'pointer',
                                                opacity: editingIdx !== null ? 0.5 : 1,
                                            }
                                        }
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleRemovePrescription(idx)}
                                        disabled={editingIdx !== null}
                                        style={
                                            {
                                                ...styles.removeTableButton,
                                                cursor: editingIdx !== null ? 'not-allowed' : 'pointer',
                                                opacity: editingIdx !== null ? 0.5 : 1,
                                            }
                                        }
                                    >
                                        Remove
                                    </button>

                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td><div className='tdDivPlain'>{editingIdx !== null ? editingIdx + 1 : prescriptions.length + 1}</div></td>
                            <td style={{ padding: '8px' }}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <input
                                        ref={medicineNameInputRef}
                                        value={newPrescription.medicineName}
                                        // value={listening && activeField === 'medicineName' ? text : newPrescription.medicineName}
                                        onChange={(e) => handlePrescriptionChange(e, 'medicineName')}
                                        placeholder="Medicine Name"
                                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                    />
                                    <button className='micBtn' onClick={() => startListening('medicineName')}>🎤</button>
                                </div>
                            </td>
                            <td style={{ padding: '8px' }}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <select
                                        value={newPrescription.quantity}
                                        onChange={(e) => handlePrescriptionChange(e, 'quantity')}
                                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                    >
                                        {Array.from({ length: 60 }, (_, i) => i + 1).map((num) => (
                                            <option key={num} value={num}>
                                                {num}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </td>
                            <td style={{ padding: '8px' }}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <select
                                        value={newPrescription.frequency.F}
                                        onChange={(e) => handlePrescriptionChange(e, 'frequency', 'F')}
                                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                    >
                                        {Array.from({ length: newPrescription.quantity }, (_, i) => i + 1).map((num) => (
                                            <option key={num} value={num}>
                                                {num}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </td>

                            <td style={{ padding: '8px' }}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <select
                                        value={newPrescription.frequency.A}
                                        onChange={(e) => handlePrescriptionChange(e, 'frequency', 'A')}
                                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                    >
                                        {Array.from({ length: newPrescription.quantity }, (_, i) => i + 1).map((num) => (
                                            <option key={num} value={num}>
                                                {num}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </td>
                            <td style={{ padding: '8px' }}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <select
                                        value={newPrescription.frequency.E}
                                        onChange={(e) => handlePrescriptionChange(e, 'frequency', 'E')}
                                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                    >
                                        {Array.from({ length: newPrescription.quantity }, (_, i) => i + 1).map((num) => (
                                            <option key={num} value={num}>
                                                {num}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </td>
                            <td style={{ padding: '8px' }}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <select
                                        value={newPrescription.frequency.N}
                                        onChange={(e) => handlePrescriptionChange(e, 'frequency', 'N')}
                                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                    >
                                        {Array.from({ length: newPrescription.quantity }, (_, i) => i + 1).map((num) => (
                                            <option key={num} value={num}>
                                                {num}
                                            </option>
                                        ))}
                                    </select>

                                </div>
                            </td>
                            <td style={{ padding: '8px' }}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <select
                                        value={newPrescription.dosageTiming}
                                        onChange={(e) => handlePrescriptionChange(e, 'dosageTiming')}
                                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                    >
                                        {PatientDoseDropdownModel.sort((a, b) => a.index - b.index).map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.displayTitle}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </td>
                            <td style={{ padding: '8px' }}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <select
                                        value={newPrescription.eatingType}
                                        onChange={(e) => handlePrescriptionChange(e, 'eatingType')}
                                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                    >
                                        {PatientEatingTypeDropdownModel.sort((a, b) => a.index - b.index).map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.displayTitle}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </td>
                            <td style={{ padding: '8px', verticalAlign: 'middle' }}>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {editingIdx !== null && (
                                        <>
                                            <button
                                                onClick={handleUpdatePrescription}
                                                disabled={isPrescriptionUnchanged}
                                                style={{
                                                    ...styles.updatePrescriptionButton,
                                                    background: isPrescriptionUnchanged ? '#ccc' : '#0070f3',
                                                    border: `1px solid ${isPrescriptionUnchanged ? '#ccc' : '#0070f3'}`,
                                                    cursor: isPrescriptionUnchanged ? 'not-allowed' : 'pointer',
                                                }}
                                            >
                                                Update
                                            </button>
                                            <button
                                                style={styles.presCancelButton}
                                                onClick={handleCancelEditPrescription}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                    {editingIdx === null && (
                                        <button
                                            style={styles.addButton}
                                            onClick={handleUpdatePrescription}
                                        >
                                            Add
                                        </button>
                                    )}

                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                {prescriptions.length === 0 && (
                    <div style={styles.centerContent}>
                        <label style={styles.noDataLabel}>
                            No prescriptions found.
                        </label>
                        <label style={styles.noDataLabel}>
                            Please add prescription details to display here.
                        </label>
                    </div>
                )}
            </div>
        )
    }

    const renderMeetingProcessUI = () => {
        return (
            <div className="patient-section" style={styles.marginTop24}>
                <h3>Meeting Process</h3>
                <div style={styles.meetingProcessControls}>
                    <div>
                        <label style={styles.smallLabel}>Meeting ID</label>
                        <input
                            type="text"
                            value={meetingIdInput}
                            onChange={(e) => setMeetingIdInput(e.target.value)}
                            placeholder="Enter meeting ID"
                            style={styles.smallInput}
                        />
                    </div>
                    <div>
                        <label style={styles.smallLabel}>Patient ID</label>
                        <input
                            type="text"
                            value={patientIdInput}
                            onChange={(e) => setPatientIdInput(e.target.value)}
                            placeholder="Enter patient id"
                            style={styles.smallInput}
                        />
                    </div>
                    <div>
                        <label style={styles.smallLabel}>Language</label>
                        <select
                            value={languageOption}
                            onChange={(e) => setLanguageOption(e.target.value)}
                            style={styles.smallSelect}
                        >
                            <option value="en">en</option>
                            <option value="ta">ta</option>
                        </select>
                    </div>
                    <div style={styles.meetingProcessActions}>
                        <button
                            onClick={getMeetingProcess}
                            disabled={loading}
                            style={{
                                ...styles.processButton,
                                background: loading ? '#ccc' : '#0a66ff',
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {loading ? 'Processing...' : 'Process'}
                        </button>
                        <button
                            onClick={() => {
                                setMeetingIdInput('');
                                setPatientIdInput('');
                                setLanguageOption('en');
                                setError('');
                            }}
                            style={styles.resetButton}
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {error && <div style={styles.errorText}>{error}</div>}
                {meetingprocess && meetingprocess.data ? (
                    <div style={styles.marginTop24}>
                        {/* Remedies Section */}
                        <div style={styles.marginBottom24}>
                            <h4 style={styles.subSectionTitle}>Remedies</h4>
                            {Array.isArray(meetingprocess.data.remedies) && meetingprocess.data.remedies.length > 0 ? (
                                <ul style={styles.list}>
                                    {meetingprocess.data.remedies.map((remedy, idx) => (
                                        <li key={idx} style={styles.listItem}>
                                            <b>Medicine:</b> {remedy.medicine} <br />
                                            <b>Dosage:</b> {remedy.dosage} <br />
                                            <b>Purpose:</b> {remedy.purpose}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div style={styles.noDataText}>No remedies found</div>
                            )}
                        </div>

                        {/* Tests Section */}
                        <div style={styles.marginBottom24}>
                            <h4 style={styles.subSectionTitle}>Tests</h4>
                            {Array.isArray(meetingprocess.data.tests) && meetingprocess.data.tests.length > 0 ? (
                                <ul style={styles.list}>
                                    {meetingprocess.data.tests.map((test, idx) => (
                                        <li key={idx}>{test}</li>
                                    ))}
                                </ul>
                            ) : (
                                <div style={{ color: '#888' }}>No tests found</div>
                            )}
                        </div>

                        {/* Follow Ups Section */}
                        <div style={styles.marginBottom24}>
                            <h4 style={styles.subSectionTitle}>Follow Ups</h4>
                            {Array.isArray(meetingprocess.data.follow_ups) && meetingprocess.data.follow_ups.length > 0 ? (
                                <ul style={styles.list}>
                                    {meetingprocess.data.follow_ups.map((follow, idx) => (
                                        <li key={idx}>{follow}</li>
                                    ))}
                                </ul>
                            ) : (
                                <div style={{ color: '#888' }}>No follow ups found</div>
                            )}
                        </div>

                        {/* Other Section */}
                        <div style={styles.marginBottom24}>
                            <h4 style={styles.subSectionTitle}>Other</h4>
                            {Array.isArray(meetingprocess.data.other) && meetingprocess.data.other.length > 0 ? (
                                <ul style={styles.list}>
                                    {meetingprocess.data.other.map((other, idx) => (
                                        <li key={idx}>{other}</li>
                                    ))}
                                </ul>
                            ) : (
                                <div style={{ color: '#888' }}>No other notes found</div>
                            )}
                        </div>

                        {/* Prescription Section */}
                        <div style={styles.marginBottom24}>
                            <h4 style={styles.subSectionTitle}>Prescription</h4>
                            {meetingprocess.data.prescription && Array.isArray(meetingprocess.data.prescription.prescription) && meetingprocess.data.prescription.prescription.length > 0 ? (
                                <table style={styles.summaryTable}>
                                    <thead>
                                        <tr style={styles.summaryTableHeader}>
                                            <th style={styles.summaryTableTh}>Medicine Name</th>
                                            <th style={styles.summaryTableTh}>Quantity</th>
                                            <th style={styles.summaryTableTh}>Frequency</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {meetingprocess.data.prescription.prescription.map((item, idx) => (
                                            <tr key={idx}>
                                                <td style={styles.summaryTableTd}>{item.medicineName}</td>
                                                <td style={styles.summaryTableTd}>{item.quantity}</td>
                                                <td style={styles.summaryTableTd}>
                                                    {item.frequency && typeof item.frequency === 'object' ? (
                                                        <div>
                                                            {Object.entries(item.frequency).map(([freqKey, freqVal]) => (
                                                                <div key={freqKey} style={styles.marginBottom4}>
                                                                    <b>{freqKey}:</b> AF: {freqVal.AF}, BF: {freqVal.BF}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={styles.noDataText}>No prescription found</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={styles.noDataFound}>
                        No data found
                    </div>
                )}
            </div>
        )
    }

    const renderDiagnosticUI = () => {
        return (
            <div className="diagnostic-section" ref={diagnosticRef} style={styles.diagnosticSection}>
                <button
                    className="pdf-btn"
                    title="Download Diagnostic as PDF"
                    onClick={() => exportHeaderAndSection(diagnosticRef, 'Diagnostic.pdf')}
                    style={{
                        position: 'absolute',
                        right: 12,
                        top: 12,
                        border: 'none',
                        background: '#0a66ff',
                        color: '#fff',
                        padding: '6px 8px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(10,102,255,0.15)'
                    }}
                >
                    ⤓
                </button>
                <h2 style={styles.diagnosticTitle}>Diagnostic Investigation</h2>

                <div style={styles.searchContainer}>
                    <input
                        type="search"
                        placeholder="Search"
                        style={styles.searchInput}
                    />
                </div>

                <div style={styles.diagnosticContent}>
                    <div style={styles.flex1}>
                        {/* Investigation inputs on left side */}
                        <div style={styles.investigationFormCard}>
                            <h4 style={styles.marginTop0}>Add Investigation</h4>
                            <div style={styles.formGrid1}>
                                <div>
                                    <label style={styles.smallLabel}>Investigation Type</label>
                                    <input
                                        value={investigationTypeInput}
                                        onChange={(e) => setInvestigationTypeInput(e.target.value)}
                                        placeholder="e.g. ECG"
                                        style={styles.smallInput}
                                    />
                                </div>

                                <div>
                                    <label style={styles.smallLabel}>Description</label>
                                    <textarea
                                        value={investigationDescriptionInput}
                                        onChange={(e) => setInvestigationDescriptionInput(e.target.value)}
                                        placeholder="Short description..."
                                        rows={3}
                                        style={styles.textarea}
                                    />
                                </div>

                                <div style={styles.formActions}>
                                    <button
                                        onClick={() => { setInvestigationTypeInput(''); setInvestigationDescriptionInput(''); setImages([]); }}
                                        style={styles.resetButtonSmall}
                                    >
                                        Reset
                                    </button>

                                    <button
                                        onClick={handleSubmitInvestigation}
                                        style={styles.saveButtonSmall}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>

                        <h4 style={styles.marginTop0}>Imaging :</h4>
                        <p style={styles.pMuted}>A patient's chief complaint is the primary reason</p>
                    </div>

                    <div style={styles.imageUploaderContainer}>
                        <ImageUploading multiple value={images} onChange={onChange} maxNumber={maxNumber} dataURLKey="data_url">
                            {({
                                imageList,
                                onImageUpload,
                                onImageRemoveAll,
                                onImageUpdate,
                                onImageRemove,
                                isDragging,
                                dragProps
                            }) => (
                                <div style={styles.imageUploaderWrapper}>
                                    {/* single image preview area (show latest image if any) */}
                                    <div
                                        style={styles.imagePreviewArea}
                                        onClick={onImageUpload}
                                        {...dragProps}
                                    >
                                        {imageList.length > 0 ? (
                                            <img
                                                src={imageList[imageList.length - 1].data_url}
                                                alt="preview"
                                                style={styles.imagePreview}
                                            />
                                        ) : (
                                            <div style={styles.imageDropText}>Click or drop an image here</div>
                                        )}
                                    </div>

                                    {/* thumbnails + actions */}
                                    <div style={styles.thumbnailContainer}>
                                        {imageList.map((image, index) => (
                                            <div
                                                key={index}
                                                style={styles.thumbnail}
                                            >
                                                <img src={image.data_url} alt="" style={styles.thumbnailImg} />
                                                <div style={styles.thumbnailActions}>
                                                    <div style={styles.thumbnailDate}>{new Date().toLocaleDateString()}</div>
                                                    <div style={styles.thumbnailButtons}>
                                                        <button
                                                            onClick={() => onImageUpdate(index)}
                                                            title="Edit"
                                                            style={styles.editIconButton}
                                                        >
                                                            ✎
                                                        </button>
                                                        <button
                                                            onClick={() => onImageRemove(index)}
                                                            title="Remove"
                                                            style={styles.deleteIconButton}
                                                        >
                                                            🗑
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* control row */}
                                    <div style={styles.imageUploaderControls}>
                                        <button
                                            onClick={onImageUpload}
                                            style={{
                                                ...styles.uploadButton,
                                                background: isDragging ? '#e6f0ff' : '#fff',
                                            }}
                                        >
                                            Upload
                                        </button>

                                        <button
                                            onClick={onImageRemoveAll}
                                            style={styles.removeAllButton}
                                        >
                                            Remove all
                                        </button>
                                    </div>
                                </div>
                            )}
                        </ImageUploading>
                    </div>
                </div>
                {/* show investigationData entries below imaging area */}
                {Array.isArray(investigationData) && investigationData.length > 0 ? (
                    <div style={styles.marginTop20}>
                        <h3 style={styles.investigationListTitle}>Investigations</h3>
                        <div style={styles.investigationList}>
                            {investigationData.map((item, idx) => (
                                <div
                                    key={item.id || idx}
                                    style={styles.investigationItem}
                                >
                                    <div style={styles.flex1}>
                                        <div style={styles.investigationItemTitle}>
                                            {item.investigationType || 'N/A'}
                                        </div>
                                        <div style={styles.investigationItemDescription}>{item.description || 'No description'}</div>
                                        <div style={styles.investigationItemDate}>Date: {item.recordDate || item.record_date || 'N/A'}</div>
                                    </div>

                                    <div style={styles.investigationItemImageContainer}>
                                        {item.report_file_url ? (
                                            <a href={item.report_file_url} target="_blank" rel="noreferrer">
                                                <img
                                                    src={item.report_file_url}
                                                    alt="report"
                                                    style={styles.investigationItemImage}
                                                />
                                            </a>
                                        ) : (
                                            <div style={styles.noFileText}>No file</div>
                                        )}

                                        {/* <div style={{ marginTop: 8 }}>
                                                    <button
                                                        onClick={() => alert('Edit investigation: implement edit handler as needed')}
                                                        style={styles.editInvestigationButton}
                                                    >
                                                        Edit
                                                    </button>
                                                </div> */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={styles.noDataText}>No diagnostic investigations found</div>
                )}
            </div>
        )
    }

/**
 * Renders the present symptoms UI section.
 * This section displays a date picker to select the date of the symptoms,
 * a button to download the present symptoms as a PDF,
 * and a table to display the symptoms data.
 * There are also two modes: view mode and edit mode.
 * In view mode, the symptoms data is displayed in a table.
 * In edit mode, the symptoms data is displayed in a form.
 * The form allows the user to edit the symptoms data and save the changes.
 */
    const renderPresentUI = () => {
        return (
            <div className="patient-section" ref={presentRef} style={styles.relative}>
                <button
                    className="pdf-btn"
                    title="Download Present Symptoms as PDF"
                    onClick={() => exportHeaderAndSection(presentRef, 'PresentSymptoms.pdf')}
                    style={{
                        position: 'absolute',
                        right: 12,
                        top: 12,
                        border: 'none',
                        background: '#0a66ff',
                        color: '#fff',
                        padding: '6px 8px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(10,102,255,0.15)'
                    }}
                >
                    ⤓
                </button>

                <h3 style={styles.sectionTitle}>Present Symptoms</h3>

                {/* Date Picker */}
                <div style={styles.datePickerContainer}>
                    <div style={styles.datePickerWrapper}>
                        <label style={styles.formLabel}>
                            Select Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                getSymptomsData(e.target.value);
                            }}
                            style={styles.formInput}
                        />
                    </div>
                </div>

                {/* Loading State */}
                {loading && <div style={styles.loadingText}>Loading symptoms data...</div>}

                {/* Error State */}
                {/* {error && <div style={{ padding: 12, background: '#ffebee', borderRadius: 6, color: '#c62828', marginBottom: 20 }}>{error}</div>} */}

                {/* No Data State */}
                {selectedDate && !symptomsData && !loading && (
                    <div style={styles.noDataContainer}>
                        <p style={styles.noDataText}>No symptoms data available for the selected date</p>
                    </div>
                )}

                {/* View Mode - Display symptoms data */}
                {symptomsData && !isEditingSymptoms && (
                    <>
                        <div style={styles.symptomsGrid}>
                            {/* Left Column */}
                            <div>
                                <div style={styles.marginBottom20}>
                                    <label style={styles.symptomLabel}>Chief Complaint</label>
                                    <p style={styles.symptomValue}>
                                        {symptomsData[0].chief_complaint || 'N/A'}
                                    </p>
                                </div>

                                <div style={styles.marginBottom20}>
                                    <label style={styles.symptomLabel}>Onset, Duration, Severity</label>
                                    <p style={styles.symptomValue}>
                                        {symptomsData[0].onset_duration_severity || 'N/A'}
                                    </p>
                                </div>

                                <div style={styles.marginBottom20}>
                                    <label style={styles.symptomLabel}>Associated Symptoms</label>
                                    <p style={styles.symptomValue}>
                                        {symptomsData[0].associated_symptoms || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div>
                                <div style={styles.marginBottom20}>
                                    <label style={styles.symptomLabel}>Consulting Doctor</label>
                                    <p style={styles.symptomValue}>
                                        {symptomsData[0].consulting_doctor || 'N/A'}
                                    </p>
                                </div>

                                <div style={styles.marginBottom20}>
                                    <label style={styles.symptomLabel}>Aggravating / Relieving Factor</label>
                                    <p style={styles.symptomValue}>
                                        {symptomsData[0].aggravating_relief_factor || 'N/A'}
                                    </p>
                                </div>

                                <div style={styles.marginBottom20}>
                                    <label style={styles.symptomLabel}>Next visit Date</label>
                                    <p style={styles.symptomValue}>
                                        {symptomsData[0].next_visit_date || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={styles.actionButtonsContainer}>
                            <button
                                onClick={() => setIsEditingSymptoms(true)}
                                style={styles.editButton}
                            >
                                Edit
                            </button>
                        </div>
                    </>
                )}

                {/* Edit Mode - Edit symptoms data */}
                {symptomsData && isEditingSymptoms && (
                    <>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 16,
                            marginBottom: 24,
                            padding: 20,
                            background: '#f9f9f9',
                            borderRadius: 8
                        }}>
                            {/* Chief Complaint */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    fontWeight: 500,
                                    color: '#333',
                                    fontSize: 14
                                }}>
                                    Chief Complaint
                                </label>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <textarea
                                        value={symptomsFormData.chiefComplaint}
                                        onChange={(e) => setSymptomsFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                                        placeholder="Enter Here..."
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: 6,
                                            fontSize: 14,
                                            boxSizing: 'border-box',
                                            fontFamily: 'inherit',
                                            minHeight: 80,
                                            resize: 'vertical'
                                        }}
                                    />
                                    <button onClick={() => startListening('symptoms.chiefComplaint')} title="Speak" style={{ padding: 8, borderRadius: 6, border: 'none', background: '#0a66ff', color: '#fff', fontSize: 18, cursor: 'pointer' }}>🎤</button>
                                </div>
                            </div>

                            {/* Onset, Duration, Severity */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    fontWeight: 500,
                                    color: '#333',
                                    fontSize: 14
                                }}>
                                    Onset, Duration, Severity
                                </label>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <textarea
                                        value={symptomsFormData.onsetDurationSeverity}
                                        onChange={(e) => setSymptomsFormData(prev => ({ ...prev, onsetDurationSeverity: e.target.value }))}
                                        placeholder="Enter Here..."
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: 6,
                                            fontSize: 14,
                                            boxSizing: 'border-box',
                                            fontFamily: 'inherit',
                                            minHeight: 80,
                                            resize: 'vertical'
                                        }}
                                    />
                                    <button onClick={() => startListening('symptoms.onsetDurationSeverity')} title="Speak" style={{ padding: 8, borderRadius: 6, border: 'none', background: '#0a66ff', color: '#fff', fontSize: 18, cursor: 'pointer' }}>🎤</button>
                                </div>
                            </div>

                            {/* Associated Symptoms */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    fontWeight: 500,
                                    color: '#333',
                                    fontSize: 14
                                }}>
                                    Associated Symptoms
                                </label>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <textarea
                                        value={symptomsFormData.associatedSymptoms}
                                        onChange={(e) => setSymptomsFormData(prev => ({ ...prev, associatedSymptoms: e.target.value }))}
                                        placeholder="Enter Here..."
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: 6,
                                            fontSize: 14,
                                            boxSizing: 'border-box',
                                            fontFamily: 'inherit',
                                            minHeight: 80,
                                            resize: 'vertical'
                                        }}
                                    />
                                    <button onClick={() => startListening('symptoms.associatedSymptoms')} title="Speak" style={{ padding: 8, borderRadius: 6, border: 'none', background: '#0a66ff', color: '#fff', fontSize: 18, cursor: 'pointer' }}>🎤</button>
                                </div>
                            </div>

                            {/* Consulting Doctor */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    fontWeight: 500,
                                    color: '#333',
                                    fontSize: 14
                                }}>
                                    Consulting Doctor
                                </label>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <textarea
                                        value={symptomsFormData.consultingDoctor}
                                        onChange={(e) => setSymptomsFormData(prev => ({ ...prev, consultingDoctor: e.target.value }))}
                                        placeholder="Enter Here..."
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: 6,
                                            fontSize: 14,
                                            boxSizing: 'border-box',
                                            fontFamily: 'inherit',
                                            minHeight: 80,
                                            resize: 'vertical'
                                        }}
                                    />
                                    <button onClick={() => startListening('symptoms.consultingDoctor')} title="Speak" style={{ padding: 8, borderRadius: 6, border: 'none', background: '#0a66ff', color: '#fff', fontSize: 18, cursor: 'pointer' }}>🎤</button>
                                </div>
                            </div>

                            {/* Aggravating / Relieving Factor */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    fontWeight: 500,
                                    color: '#333',
                                    fontSize: 14
                                }}>
                                    Aggravating / Relieving Factor
                                </label>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <textarea
                                        value={symptomsFormData.aggravatingRelievingFactor}
                                        onChange={(e) => setSymptomsFormData(prev => ({ ...prev, aggravatingRelievingFactor: e.target.value }))}
                                        placeholder="Enter Here..."
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: 6,
                                            fontSize: 14,
                                            boxSizing: 'border-box',
                                            fontFamily: 'inherit',
                                            minHeight: 80,
                                            resize: 'vertical'
                                        }}
                                    />
                                    <button onClick={() => startListening('symptoms.aggravatingRelievingFactor')} title="Speak" style={{ padding: 8, borderRadius: 6, border: 'none', background: '#0a66ff', color: '#fff', fontSize: 18, cursor: 'pointer' }}>🎤</button>
                                </div>
                            </div>

                            {/* Next visit Date */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    fontWeight: 500,
                                    color: '#333',
                                    fontSize: 14
                                }}>
                                    Next visit Date
                                </label>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <textarea
                                        value={symptomsFormData.nextVisitDate}
                                        onChange={(e) => setSymptomsFormData(prev => ({ ...prev, nextVisitDate: e.target.value }))}
                                        placeholder="Enter Here..."
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: 6,
                                            fontSize: 14,
                                            boxSizing: 'border-box',
                                            fontFamily: 'inherit',
                                            minHeight: 80,
                                            resize: 'vertical'
                                        }}
                                    />
                                    <button onClick={() => startListening('symptoms.nextVisitDate')} title="Speak" style={{ padding: 8, borderRadius: 6, border: 'none', background: '#0a66ff', color: '#fff', fontSize: 18, cursor: 'pointer' }}>🎤</button>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button
                                onClick={() => setIsEditingSymptoms(false)}
                                style={{
                                    padding: '12px 32px',
                                    background: '#fff',
                                    border: '1px solid #ddd',
                                    color: '#333',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: 14
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => insertSymptoms(symptomsFormData)}
                                disabled={loading}
                                style={{
                                    padding: '12px 32px',
                                    background: loading ? '#7aa7ff' : '#0a66ff',
                                    border: 'none',
                                    color: '#fff',
                                    borderRadius: 6,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontWeight: 600,
                                    fontSize: 14,
                                    opacity: loading ? 0.85 : 1
                                }}
                            >
                                {loading ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        )
    }

    return (
        <div className="patient-profile">
            <Sidebar />
            {/* Patient Header */}
            <div className="main-section">
                <Header />
                <div ref={combinedRef} style={styles.relative}>
                    {' '}
                    {/* Combined ref */}
                    {/* <div className="patient-header" style={{ margin: '20px 0', padding: '10px' }}> */}
                    <div ref={headerRef} className="patient-header" style={styles.patientHeader}>
                        <div className="patient-contact">
                            <h1 style={styles.hospitalName}>Doctor Hospital</h1>
                            <p>
                                {/* <b>Address:</b> */}
                                {address}
                            </p>
                            <p>
                                <b>Email ID:</b> {email}
                            </p>
                            <p>
                                <b>Contact Number:</b> {mobile}
                            </p>
                        </div>
                        <div>
                            <p>Gstin:2748939333030</p>
                            <img src={Pad} style={styles.headerPadImage} alt="patient" className="patient-avatar" />
                        </div>
                    </div>
                    {/* TAB NAV */}
                    <div style={styles.tabsContainer}>
                        {PatientTabListModel.sort((a, b) => a.index - b.index).map((tab) => {
                            const active = activeTab === tab.name;
                            return (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    style={{
                                        ...styles.tabButton,
                                        ...(active ? styles.activeTab : styles.inactiveTab),
                                        ...(isExportingPDF ? { display: 'none' } : {})
                                    }}
                                >
                                    {tab.displayTitle}
                                </button>
                            );
                        })}
                    </div>
                    {/* PROFILE SECTION */}
                    {/* {activeTab === 'profile' && (
                    <div className="patient-section">
                        <div style={{ maxWidth: 980, margin: '0 auto', background: '#fff', padding: 18, borderRadius: 8 }}>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                <img
                                    src="https://i.ibb.co/2cX0dQr/avatar.png"
                                    alt="avatar"
                                    style={{ width: 82, height: 82, borderRadius: 8 }}
                                />
                                <div>
                                    <h3 style={{ margin: 0 }}>{patients[0]?.patientName || '—'}</h3>
                                    <div style={{ color: '#777' }}>{patients[0]?.email || ''}</div>
                                    <div style={{ color: '#777' }}>{patients[0]?.mobileNumber || ''}</div>
                                    <div style={{ color: '#777', marginTop: 8 }}>{patients[0]?.address || ''}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )} */}
                </div>
                {activeTab === 'profile' && (
                    renderProfileUI()
                )}

                {/* Vital Signs + Basic Data */}
                {activeTab === 'vital' && (
                    renderVitalUI()
                )}

                {/* Family History */}
                {activeTab === 'family history' && (
                    renderFamilyHistoryUI()
                )}

                {/* Prescription */}
                {activeTab === 'prescription' && ( // This block seems to be duplicated, I will refactor the second one.
                    renderPrescriptionUI()
                )}
                {/* <div className="patient-section" style={styles.marginTop140}>
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
                {/* {activeTab === 'prescription' && (
                    <div className="patient-section" style={styles.marginTop140}>
                        <h3>Add Prescriptions</h3>
                        <table
                            className="prescription-table"
                            style={styles.prescriptionTable}
                        >
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Medicine Name</th>
                                    <th>Quantity</th>
                                    <th>Forenoon</th>
                                    <th>Afternoon</th>
                                    <th>Evening</th>
                                    <th>Night</th>
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
                                    <td><div className='tdDivPlain'>{editingIdx !== null ? editingIdx + 1 : prescriptions.length + 1}</div></td>
                                    <td style={{ padding: '8px' }}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <input
                                                value={newPrescription.medicineName}
                                                // value={listening && activeField === 'medicineName' ? text : newPrescription.medicineName}
                                                onChange={(e) => handlePrescriptionChange(e, 'medicineName')}
                                                placeholder="Medicine Name"
                                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                            />
                                            <button className='micBtn' onClick={() => startListening('medicineName')}>🎤</button>
                                        </div>
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <select
                                                value={newPrescription.quantity}
                                                onChange={(e) => handlePrescriptionChange(e, 'quantity')}
                                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                            >
                                                {Array.from({ length: 60 }, (_, i) => i + 1).map((num) => (
                                                    <option key={num} value={num}>
                                                        {num}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <input
                                                value={newPrescription.frequency.F}
                                                onChange={(e) => handlePrescriptionChange(e, 'frequency', 'F')}
                                                placeholder="F"
                                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                            /><button className='micBtn' onClick={() => startListening('frequency.F')}>🎤</button>
                                        </div>
                                    </td>

                                    <td style={{ padding: '8px' }}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <input
                                                value={newPrescription.frequency.A}
                                                onChange={(e) => handlePrescriptionChange(e, 'frequency', 'A')}
                                                placeholder="A"
                                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                            /><button className='micBtn' onClick={() => startListening('frequency.A')}>🎤</button>
                                        </div>
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <input
                                                value={newPrescription.frequency.E}
                                                onChange={(e) => handlePrescriptionChange(e, 'frequency', 'E')}
                                                placeholder="E"
                                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                            /><button className='micBtn' onClick={() => startListening('frequency.E')}>🎤</button>
                                        </div>
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <input
                                                value={newPrescription.frequency.N}
                                                onChange={(e) => handlePrescriptionChange(e, 'frequency', 'N')}
                                                placeholder="N"
                                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                            /><button className='micBtn' onClick={() => startListening('frequency.N')}>🎤</button>
                                        </div>
                                    </td>
                                    <td style={{ padding: '8px', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {editingIdx !== null && (
                                                <>
                                                    <button
                                                        onClick={handleUpdatePrescription}
                                                        disabled={isPrescriptionUnchanged}
                                                        style={{
                                                            background: isPrescriptionUnchanged ? '#ccc' : '#0070f3',
                                                            borderColor: isPrescriptionUnchanged ? '#ccc' : '#0070f3',
                                                            border: '1px solid',
                                                            borderRadius: 6,
                                                            color: '#fff',
                                                            cursor: isPrescriptionUnchanged ? 'not-allowed' : 'pointer',
                                                            padding: '8px 14px',
                                                        }}
                                                    >
                                                        Update
                                                    </button>
                                                    <button
                                                        style={{
                                                            background: '#fff',
                                                            color: '#0070f3',
                                                            borderRadius: 6,
                                                            borderColor: '#0070f3',
                                                            border: '1px solid #0070f3',
                                                            padding: '8px 14px',
                                                        }}
                                                        onClick={handleCancelEditPrescription}
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                            {editingIdx === null && (
                                                <button
                                                    style={styles.addButton}
                                                    onClick={handleUpdatePrescription}
                                                >
                                                    Add
                                                </button>
                                            )}

                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )} */}
                {activeTab === 'meeting process' && (
                    renderMeetingProcessUI()
                )}
                {activeTab === 'diagnostic' && (
                    renderDiagnosticUI()
                )}
                {activeTab === 'present' && (
                    renderPresentUI()
                )}

            </div>
            <SpeechToTextModal
                isOpen={isSpeechModalOpen}
                onClose={() => {
                    setIsSpeechModalOpen(false);
                    setActiveSpeechField(null);
                }}
                onTranscript={handleTranscript}
                fieldName={activeSpeechField}
            />
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => {
                    setIsConfirmModalOpen(false);
                    setPrescriptionToDelete(null);
                }}
                onConfirm={confirmRemovePrescription}
                title="Confirm Deletion"
                message="Are you sure you want to remove this prescription?"
            />
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
        </div >
    );
}

const styles = {
    relative: { position: 'relative' },
    patientHeader: { margin: '8px 0 18px', padding: '14px 10px' },
    hospitalName: { color: '#2563eb' },
    headerPadImage: { marginLeft: '20px' },
    tabsContainer: { display: 'flex', justifyContent: 'center', gap: 0, margin: '18px 0' },
    tabButton: { padding: '8px 14px', borderRadius: 0, cursor: 'pointer', display: 'inline-block' },
    activeTab: { border: 'none', background: '#0a66ff', color: '#fff', boxShadow: '0 2px 6px rgba(10,102,255,0.15)' },
    inactiveTab: { border: '1px solid #dfe7ff', background: '#fff', color: '#333', boxShadow: 'none' },
    profileSectionContainer: { display: 'flex', justifyContent: 'center', paddingTop: 6 },
    profileCard: { position: 'relative', width: 760, background: '#fff', borderRadius: 8, boxShadow: '0 6px 18px rgba(11,45,90,0.06)', padding: 22, border: '1px solid rgba(10,102,255,0.06)' },
    pdfBtn: { right: 12, top: 12, border: 'none', background: '#0a66ff', color: '#fff', padding: '6px 8px', borderRadius: 4, cursor: 'pointer', boxShadow: '0 2px 6px rgba(10,102,255,0.15)' },
    profileCardHeader: { display: 'flex', alignItems: 'center', gap: 20 },
    profileAvatarWrapper: { flex: '0 0 96px', display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' },
    profileAvatar: { width: 96, height: 96, borderRadius: '50%', marginBottom: '100px', border: '4px solid #f3f7ff' },
    flex1: { flex: 1 },
    profileNameContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
    patientName: { margin: 0, fontSize: 22, color: '#111', fontWeight: 700 },
    patientSubDetail: { color: '#7a869a', marginTop: 6, fontSize: 14 },
    marginTop8: { marginTop: 8 },
    patientCode: { color: '#0a66ff', fontWeight: 700, fontSize: 13, textDecoration: 'none' },
    profileHeaderActions: { flex: '0 0 120px', textAlign: 'right' },
    divider: { border: 'none', borderTop: '2px solid #000000', margin: '16px 0' },
    contactDetails: { display: 'flex', gap: 30, color: '#444', fontSize: 14 },
    contactItem: { marginBottom: 8, fontWeight: 400 },
    inputSmall: { width: 60 },
    inputExtraSmall: { width: 40 },
    vitalsSummaryContainer: { display: 'flex', justifyContent: 'center', margin: '24px 0' },
    vitalsSummaryWrapper: { display: 'flex', gap: 24, flexWrap: 'wrap', width: '100%', maxWidth: 1200 },
    vitalsSummaryCard: { border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 24, minWidth: 320, flex: '1 1 320px', maxWidth: 400 },
    vitalsSummaryHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
    vitalsSummaryTitle: { color: '#1976d2', fontWeight: 600, fontSize: 16 },
    vitalsSummaryContent: { display: 'flex', justifyContent: 'space-between', gap: 24 },
    vitalItem: { marginBottom: 8, color: '#333' },
    vitalValue: { color: '#1976d2' },
    vitalValueBold: { color: '#1976d2', fontWeight: 600 },
    sectionTitle: { marginTop: 0, marginBottom: 20 },
    historyTable: { width: '100%', borderCollapse: 'collapse', marginBottom: 20, border: '1px solid #e0e0e0' },
    tableHeader: { background: '#f5f5f5', borderBottom: '2px solid #ddd' },
    tableTh: { padding: 12, textAlign: 'left', fontWeight: 600, color: '#333' },
    tableRow: { borderBottom: '1px solid #e0e0e0' },
    tableTd: { padding: 12, color: '#333' },
    actionButtonsContainer: { display: 'flex', gap: 12, justifyContent: 'flex-start' },
    editButton: { padding: '10px 24px', background: '#fff', border: '2px solid #00bcd4', color: '#00bcd4', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
    updateButton: { padding: '10px 24px', background: '#0a66ff', border: 'none', color: '#fff', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
    formGrid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24, padding: 20, background: '#f9f9f9', borderRadius: 8 },
    formLabel: { display: 'block', marginBottom: 8, fontWeight: 500, color: '#333', fontSize: 14 },
    formInput: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit' },
    inputWithButton: { display: 'flex', gap: 8, alignItems: 'center' },
    formSelect: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, flex: 1, fontFamily: 'inherit' },
    addEntryButton: { width: 36, height: 36, borderRadius: '50%', background: '#0a66ff', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    marginBottom24: { marginBottom: 24 },
    currentEntriesTitle: { marginBottom: 12, color: '#333' },
    tableThCenter: { padding: 12, textAlign: 'center', fontWeight: 600, color: '#333' },
    tableTdCenter: { padding: 12, textAlign: 'center' },
    editTableButton: { padding: '6px 12px', background: '#fff', border: '1px solid #0a66ff', color: '#0a66ff', borderRadius: 4, cursor: 'pointer', marginRight: 8, fontSize: 12, fontWeight: 500 },
    deleteTableButton: { padding: '6px 12px', background: '#fff', border: '1px solid #f44336', color: '#f44336', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 500 },
    actionButtonsContainerCenter: { display: 'flex', gap: 12, justifyContent: 'center' },
    cancelButton: { padding: '12px 32px', background: '#fff', border: '1px solid #ddd', color: '#333', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
    presCancelButton: {
        background: '#fff',
        color: '#0070f3',
        borderRadius: 6,
        border: '1px solid #0070f3',
        padding: '8px 12px',
        minWidth: '80px',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
    },
    updateButtonLarge: { padding: '12px 32px', background: '#0a66ff', border: 'none', color: '#fff', borderRadius: 6, fontWeight: 600, fontSize: 14 },
    presEditButton: { padding: '8px 12px', minWidth: '80px', textAlign: 'center', background: '#fff', border: '1px solid #0a66ff', color: '#0a66ff', borderRadius: 6, cursor: 'pointer', marginRight: 8, fontSize: 14, fontWeight: 500 },
    marginTop140: { marginTop: 140 },
    prescriptionTable: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 900 },
    tableCellPadding: { padding: '8px' },
    inputWithButtonSmall: { display: 'flex', gap: 6 },
    tableInput: { width: '100%', padding: '8px', boxSizing: 'border-box' },
    micButton: { height: 24, width: 24, marginTop: 12 },
    tableSelect: { width: '100%', padding: '8px', boxSizing: 'border-box' },
    tableCellAction: { padding: '8px', verticalAlign: 'middle' },
    cancelEditButton: { background: '#fff', color: '#0070f3', borderRadius: 6, border: '1px solid #0070f3', padding: '8px 14px' },
    addButton: { background: '#0070f3', color: '#fff', borderRadius: 6, padding: '8px 12px', minWidth: '80px', textAlign: 'center', border: '1px solid #0070f3', cursor: 'pointer', fontSize: 14, fontWeight: 500 },
    marginTop24: { marginTop: 24 },
    meetingProcessControls: { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
    smallLabel: { display: 'block', fontSize: 13, marginBottom: 6 },
    smallInput: { padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc' },
    smallSelect: { padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc' },
    meetingProcessActions: { display: 'flex', alignItems: 'flex-end', gap: 8 },
    processButton: { color: '#fff', padding: '10px 18px', borderRadius: 6, border: 'none' },
    resetButton: { background: '#fff', border: '1px solid #dfe7ff', padding: '10px 14px', borderRadius: 6, cursor: 'pointer' },
    errorText: { color: '#b00020', marginTop: 12 },
    subSectionTitle: { color: '#1976d2', marginBottom: 8 },
    list: { paddingLeft: 20 },
    listItem: { marginBottom: 8 },
    noDataText: { color: '#888' },
    summaryTable: { width: '100%', borderCollapse: 'collapse', marginBottom: 12 },
    summaryTableHeader: { background: '#f5f5f5' },
    summaryTableTh: { padding: 8, border: '1px solid #e0e0e0' },
    summaryTableTd: { padding: 8, border: '1px solid #e0e0e0' },
    marginBottom4: { marginBottom: 4 },
    noDataFound: { marginTop: 24, color: '#888', textAlign: 'center', fontSize: '1.1rem', padding: '40px 0' },
    diagnosticSection: { padding: 24, position: 'relative' },
    diagnosticTitle: { color: '#1e73ff', marginBottom: 12 },
    searchContainer: { display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 },
    searchInput: { flex: 1, borderRadius: 24, padding: '12px 18px', border: '1px solid #d7e3ff', outline: 'none' },
    diagnosticContent: { display: 'flex', gap: 24, alignItems: 'flex-start' },
    investigationFormCard: { background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #e6eefc', marginBottom: 12 },
    marginTop0: { marginTop: 0 },
    formGrid1: { display: 'grid', gridTemplateColumns: '1fr', gap: 12 },
    textarea: { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', resize: 'vertical' },
    formActions: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
    resetButtonSmall: { background: '#fff', border: '1px solid #f0f0f0', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' },
    saveButtonSmall: { background: '#0a66ff', color: '#fff', padding: '8px 12px', borderRadius: 6, border: 'none', cursor: 'pointer' },
    pMuted: { color: '#666', lineHeight: 1.6 },
    imageUploaderContainer: { width: 220 },
    imageUploaderWrapper: { display: 'flex', flexDirection: 'column', gap: 12 },
    imagePreviewArea: { borderRadius: 8, padding: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 140, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    imagePreview: { maxWidth: '100%', maxHeight: 160, borderRadius: 6 },
    imageDropText: { color: '#9aaae6' },
    thumbnailContainer: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
    thumbnail: { width: 120, borderRadius: 8, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.06)', overflow: 'hidden' },
    thumbnailImg: { width: '100%', height: 80, objectFit: 'cover' },
    thumbnailActions: { padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    thumbnailDate: { fontSize: 12, color: '#777' },
    thumbnailButtons: { display: 'flex', gap: 8 },
    editIconButton: { border: 'none', background: 'transparent', cursor: 'pointer', color: '#1e73ff' },
    deleteIconButton: { border: 'none', background: 'transparent', cursor: 'pointer', color: '#ff4d4f' },
    imageUploaderControls: { display: 'flex', left: 10, gap: 10, alignItems: 'center' },
    uploadButton: { border: '1px dashed #cfe0ff', padding: '8px 5px', borderRadius: 8, cursor: 'pointer' },
    removeAllButton: { background: '#fff', border: '1px solid #f0f0f0', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' },
    marginTop20: { marginTop: 20 },
    investigationListTitle: { marginTop: 8, marginBottom: 12, color: '#1e73ff' },
    investigationList: { display: 'flex', flexDirection: 'column', gap: 12 },
    investigationItem: { display: 'flex', gap: 12, alignItems: 'flex-start', padding: 12, border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff' },
    investigationItemTitle: { fontWeight: 700, color: '#111', fontSize: 15 },
    investigationItemDescription: { color: '#666', marginTop: 6 },
    investigationItemDate: { marginTop: 8, color: '#444', fontSize: 13 },
    investigationItemImageContainer: { width: 160, textAlign: 'right' },
    investigationItemImage: { width: 140, height: 110, objectFit: 'contain', borderRadius: 6, border: '1px solid #f0f0f0' },
    noFileText: { color: '#999' },
    datePickerContainer: { marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-end' },
    datePickerWrapper: { flex: 1, maxWidth: 300 },
    loadingText: { padding: 12, background: '#e3f2fd', borderRadius: 6, color: '#1976d2', marginBottom: 20 },
    noDataContainer: { padding: 40, textAlign: 'center', background: '#f5f5f5', borderRadius: 8, marginBottom: 20 },
    symptomsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 },
    marginBottom20: { marginBottom: 20 },
    symptomLabel: { display: 'block', fontWeight: 600, color: '#333', marginBottom: 4, fontSize: 14 },
    symptomValue: { margin: 0, padding: '10px 0', color: '#666', lineHeight: 1.6 },
    centerContent: { alignContent: 'center', justifyContent: 'center' },
    noDataLabel: { textAlign: 'center', color: '#555', fontStyle: 'italic', width: '100%', display: 'block', marginTop: 20 },
    prescriptionTableWrapper: {
        maxHeight: '400px', // Set a max height for scrolling
        overflowY: 'auto', // Enable vertical scrolling
        border: '1px solid #e0e0e0', // Optional: add a border to the scrolling area
        borderRadius: 8,
        marginBottom: 20,
        background: '#fff',
    },
    stickyTableHeader: { position: 'sticky', top: 0, backgroundColor: '#f5f5f5', zIndex: 1, padding: '12px', textAlign: 'left', fontWeight: 600, color: '#333' },
    addPrescriptionButton: { background: '#0070f3', color: '#fff', borderRadius: 6, padding: '8px 14px', border: 'none', cursor: 'pointer' },
    removeTableButton: { background: '#fff', color: '#f44336', borderRadius: 6, padding: '8px 12px', minWidth: '80px', textAlign: 'center', border: '1px solid #f44336', cursor: 'pointer', fontSize: 14, fontWeight: 500 },
    updatePrescriptionButton: {
        borderRadius: 6,
        color: '#fff',
        padding: '8px 12px',
        minWidth: '80px',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 500,
    },
};
