import React, { useEffect, useState, useRef } from 'react';
import '../../styles/D-PatientDetail.css';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import API_BASE_URL from '../../config';
import Pad from '../../assets/images/pad.png';
import { ToastContainer, toast } from 'react-toastify';
import ImageUploading from 'react-images-uploading';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import SpeechToTextModal from '../../components/SpeechToTextModal';
import { useLocation } from 'react-router-dom';
import { FREQUENCY_OPTIONS } from '../../configs/prescriptionConstants';
import downloadIcon from '../../assets/images/download.png';
import ConfirmationModal from '../../components/ConfirmationModal';
import { PatientStyles } from '../../styles/D-PatientDetail.styles.js';
import { setCompleteAppointment } from '../../api/patientCheckoutComplete';
import URLConfigEnum, { getApiUrl } from '../../configs/urlConfig';

const PatientTabListModel = [
    { index: 0, name: 'profile', displayTitle: 'Profile' },
    { index: 1, name: 'vital', displayTitle: 'Vital Signs' },
    { index: 2, name: 'family history', displayTitle: 'Family Medical History' },
    { index: 3, name: 'prescription', displayTitle: 'Prescription' },
    { index: 4, name: 'present', displayTitle: 'Symptoms' },
    { index: 5, name: 'meeting process', displayTitle: 'Meeting Process' },
    { index: 6, name: 'diagnostic', displayTitle: 'Diagnostic Investigation' },
    { index: 8, name: 'preview', displayTitle: 'Preview' },
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
    const { patientId, email, mobile, address, name, appointmentId, packageType } = location.state || {};
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
    const [activeSpeechField, setActiveSpeechField] = useState(null);
    const [isCheckoutConfirmModalOpen, setIsCheckoutConfirmModalOpen] = useState(false);

    const [familyHistory, setFamilyHistory] = useState([]);

    const [groupedPrescriptions, setGroupedPrescriptions] = useState({});
    const [selectedPrescriptionDate, setSelectedPrescriptionDate] = useState(null);
    const [prescriptionToDelete, setPrescriptionToDelete] = useState(null); // store index

    const [groupedInvestigations, setGroupedInvestigations] = useState({});
    const [groupedSymptoms, setGroupedSymptoms] = useState({});
    const [selectedInvestigationDate, setSelectedInvestigationDate] = useState(null);

    const [vitalSignsData, setVitalSignsData] = useState([]);
    const [selectedVitalSign, setselectedVitalSign] = useState(null);

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
    const [selectedSymptomDate, setSelectedSymptomDate] = useState('');
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

    const [generalNextVisitDate, setGeneralNextVisitDate] = useState('');

    // Local inputs for new investigation entry
    const [investigationTypeInput, setInvestigationTypeInput] = useState('');
    const [investigationDescriptionInput, setInvestigationDescriptionInput] = useState('');

    const [todaysAppointment, setTodaysAppointment] = useState(appointmentId);
    const [todaysAppointmentPackage, setTodaysAppointmentPackage] = useState(packageType);
    const [previewData, setPreviewData] = useState(null);

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
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const capitalizeFirstChar = (value) => {
        if (typeof value !== 'string') return value ?? 'None';
        if (!value) return 'None';
        return value.charAt(0).toUpperCase() + value.slice(1);
    };

    const handleSymptomDateChange = (date) => {
        setSelectedSymptomDate(date);
        const symptomsForDate = groupedSymptoms[date] || [];
        setSymptomsData(symptomsForDate[0]);
        if (symptomsForDate.length > 0) {
            const firstSymptom = symptomsForDate[0];
            setSymptomsFormData({
                appoinment_id: firstSymptom.appoinment_id || '',
                chiefComplaint: firstSymptom.chief_complaint || '',
                onsetDurationSeverity: firstSymptom.onset_duration_severity || '',
                associatedSymptoms: firstSymptom.associated_symptoms || '',
                consultingDoctor: firstSymptom.consulting_doctor || '',
                aggravatingRelievingFactor: firstSymptom.aggravating_relief_factor || '',
                nextVisitDate: firstSymptom.next_visit_date || ''
            });
        }
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
            pdf.save(name + '_' + patientId + '_' + filename);
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
        frequency_A: 0,
        frequency_E: 0,
        frequency_F: 0,
        frequency_N: 0,
        dosageTiming: 'after_food',
        eatingType: 'normal',
    });
    const [editingIdx, setEditingIdx] = useState(null);

    const isPrescriptionUnchanged =
        editingIdx !== null &&
        prescriptions[editingIdx] &&
        newPrescription.medicineName === prescriptions[editingIdx].medicine_name &&
        String(newPrescription.quantity) === String(prescriptions[editingIdx].quantity) &&
        newPrescription.frequency_F === prescriptions[editingIdx].frequency_F &&
        newPrescription.frequency_A === prescriptions[editingIdx].frequency_A &&
        newPrescription.frequency_E === prescriptions[editingIdx].frequency_E &&
        newPrescription.frequency_N === prescriptions[editingIdx].frequency_N &&
        newPrescription.dosageTiming === prescriptions[editingIdx].dosageTiming &&
        newPrescription.eatingType === prescriptions[editingIdx].eatType;

    const isValidPrescription =
        newPrescription.medicineName.trim() !== '' &&
        prescriptions.find(p => p.medicine_name.toLowerCase() === newPrescription.medicineName.trim().toLowerCase()) === undefined &&
        (Number(newPrescription.frequency_F) > 0 || Number(newPrescription.frequency_A) > 0 || Number(newPrescription.frequency_E) > 0 || Number(newPrescription.frequency_N) > 0);
    console.log('isValidPrescription', isValidPrescription);
    const handlePrescriptionChange = (e, field) => {
        const value = e.target.value;
        setNewPrescription((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleEditPrescription = (idx) => {
        const prescriptionToEdit = prescriptions[idx];
        if (!prescriptionToEdit) return;
        setEditingIdx(idx);
        setNewPrescription({
            id: prescriptionToEdit.id,
            medicineName: prescriptionToEdit.medicine_name,
            quantity: prescriptionToEdit.quantity,
            frequency_F: prescriptionToEdit.frequency_F,
            frequency_A: prescriptionToEdit.frequency_A,
            frequency_E: prescriptionToEdit.frequency_E,
            frequency_N: prescriptionToEdit.frequency_N,
            dosageTiming: prescriptionToEdit.dosageTiming,
            eatingType: prescriptionToEdit.type,
        });
        setTimeout(() => {
            medicineNameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            medicineNameInputRef.current?.focus();
        }, 0);
        console.log("Prescription to edit", prescriptionToEdit);
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
            quantity: 1, // Reset to a default quantity like 1
            frequency_F: 0,
            frequency_A: 0,
            frequency_E: 0,
            frequency_N: 0,
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
            console.log('todaysAppointment', todaysAppointment);
            if (response.ok && Array.isArray(data.existingMedicines)) {
                const medicines = data.existingMedicines;
                // setPrescriptions(medicines); // Keep the flat list for editing/adding
                const grouped = medicines.reduce((acc, med) => {
                    const date = med.created_at.split('T')[0]; // Extract YYYY-MM-DD
                    if (!acc[date]) {
                        acc[date] = [];
                    }
                    acc[date].push(med);
                    return acc;
                }, {});
                let dates = Object.keys(grouped).sort().reverse(); // Sort dates descending
                const firstData = dates[0] ?? null
                if (firstData && firstData !== getTodayDate() && todaysAppointment) {
                    grouped[getTodayDate()] = [];
                }
                setGroupedPrescriptions(grouped);
                const dateToDisplay = selectedPrescriptionDate || (todaysAppointment ? getTodayDate() : (dates.length > 0 ? dates[0] : getTodayDate()));

                if (!selectedPrescriptionDate) {
                    setSelectedPrescriptionDate(dateToDisplay);
                }
                // Always update the prescriptions for the selected date from the newly fetched data
                setPrescriptions(grouped[dateToDisplay] || []);
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
        console.log("Update Started", editingIdx)
        console.log("Update Started", newPrescription)
    }

    const handleAddNewPrescription = async () => {
        if (!todaysAppointment) {
            return;
        }
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}con/upsert-prescriptions`;
            const body = {
                patientId: patientId,
                appointmentId: todaysAppointment,
                prescription: [
                    {
                        medicineName: newPrescription.medicineName,
                        quantity: newPrescription.quantity,
                        frequency_A: Number(newPrescription.frequency_A) ?? 0,
                        frequency_E: Number(newPrescription.frequency_E) ?? 0,
                        frequency_F: Number(newPrescription.frequency_F) ?? 0,
                        frequency_N: Number(newPrescription.frequency_N) ?? 0,
                        dosageTiming: newPrescription.dosageTiming,
                        type: newPrescription.eatingType
                    }
                ]
            };
            console.log('Body', JSON.stringify(body))
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
                toast.success(data.message || 'Prescription updated successfully');
                getPrescriptions();
                setEditingIdx(null);
                setNewPrescription({
                    medicineName: '',
                    quantity: 1, // Reset to a default quantity like 1
                    frequency_A: '',
                    frequency_E: '',
                    frequency_F: '',
                    frequency_N: '',
                    dosageTiming: 'after_food',
                    eatingType: 'normal'
                });
            } else {
                setError(data.message || 'Failed');
                setLoading(false);
                toast.error(data.message ?? 'Network error');
            }
        } catch (err) {
            console.log('Error updating prescription:', err);
            setError('Network error');
            setLoading(false);
            toast.error(err ?? 'Network error');
        }
    };

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
        if (!todaysAppointment) {
            toast.error('No appointment found for today');
            return;
        }
        if (!patientId) {
            toast.error('Patient ID not found');
            return;
        }

        setLoading(true);

        try {
            const body = {
                patientId: Number(patientId),
                appointmentId: todaysAppointment,
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
    // console.log("familyHistoryData||||:", familyHistoryData);

    const getInsertVitalSigns = async () => {
        setLoading(true);

        try {
            const body = {
                patientId: patientId,
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
            const urlString = getApiUrl(URLConfigEnum.PATIENT_VITAL_SIGNS_UPDATE);
            const response = await fetch(urlString,
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
            const url = new URL(getApiUrl(URLConfigEnum.PATIENT_VITAL_SIGNS, patientId));
            console.log('URLString patient', url);
            console.log('vitals url:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('vitals Response status:', response.status);
            const data = await response.json();
            console.log('vitals response:', data);

            if (response.ok && data.data && Array.isArray(data.data)) {
                console.log('<<<<<<>>>>//', response);
                const sortedVitals = data.data.sort((a, b) => new Date(b.dateOfRecord) - new Date(a.dateOfRecord));
                setVitalSignsData(sortedVitals);
                if (sortedVitals.length > 0) {
                    const firstData = sortedVitals[0];
                    setselectedVitalSign(firstData);
                    if (getPrescriptionDateTitle(firstData.dateOfRecord) === 'Today') {
                        setVitalSigns(prev => (
                            {
                                ...prev,
                                temperature: firstData.temperature,
                                heartRate: firstData.heartRate,
                                bloodPressure: {
                                    systolic: (firstData.bloodPressure || '/').split('/')[0],
                                    diastolic: (firstData.bloodPressure || '/').split('/')[1]
                                },
                                respiratoryRate: firstData.respiratoryRate,
                            }
                        ))
                        setBasicData(prev => (
                            {
                                ...prev,
                                age: firstData.age || '',
                                height: firstData.height || '',
                                weight: firstData.weight || '',
                                bmi: firstData.bmi || ''
                            }
                        ))
                    } else if (todaysAppointment) {
                        setupDefaultVitalForToday(sortedVitals)
                    }
                } else {
                    setupDefaultVitalForToday([])
                }
            } else {
                setVitalSignsData([]);
                setselectedVitalSign(null);
            }
        } catch (err) {
            console.error('Error fetching vital signs:', err);
            setVitalSignsData([]);
            setselectedVitalSign(null);
            setError('Network error');
        }
        setLoading(false);
    };

    const getAppointmentBy = async (patientId) => {
        setLoading(true);
        setError('');
        try {
            // let url = `${API_BASE_URL}doctor/getappointments`; //allapointment
            let url = `${API_BASE_URL}patient/getappointments?patientId=${patientId}`;
            console.log('Fetching:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('appointment...:', data);
            if (response.ok && data.data) {
                const appointments = Array.isArray(data.data) ? data.data : [];
                const todaysAppointmentForPatient = appointments.find((item) => item.slotDate === getTodayDate());
                if (todaysAppointmentForPatient) {
                    if (todaysAppointmentForPatient.appointmentId) {
                        setTodaysAppointment(todaysAppointmentForPatient.appointmentId);
                        console.log("Today's appointment ID found and set:", todaysAppointmentForPatient.appointmentId);
                        getPreviewData(todaysAppointmentForPatient.appointmentId);
                    }
                    if (todaysAppointmentForPatient.packageType) {
                        setTodaysAppointmentPackage(todaysAppointmentForPatient.packageType);
                    }
                } else {
                    console.log("No appointment for today for this patient.");
                }
            } else {
                console.log("Todays appointment id Error")
                setError(data.message || 'Failed to fetch patients detail');
            }
        } catch (err) {
            setError('Network erroaa');
        } finally {
            setLoading(false);
            getPrescriptions();
        }
    };

    const setupDefaultVitalForToday = (sortedVitals) => {
        const todayVital = {
            patientId: patientId,
            dateOfRecord: getTodayDate(),
            temperature: '',
            heartRate: '',
            bloodPressure: '/',
            respiratoryRate: '',
            age: '',
            height: '',
            weight: '',
            bmi: '',
        };
        const newVitals = [todayVital, ...sortedVitals];
        setVitalSignsData(newVitals);
        setselectedVitalSign(newVitals[0]);
        setVitalSigns({
            temperature: '',
            heartRate: '',
            bloodPressure: { systolic: '', diastolic: '' },
            respiratoryRate: ''
        });
        setBasicData({
            age: '',
            height: '',
            weight: '',
            bmi: ''
        });
    }
    // Get symptoms data from API
    const getSymptomsData = async () => {
        setLoading(true);
        setError('');
        try {
            let url = `${API_BASE_URL}patient/symptoms-get?patientId=${patientId}`;
            console.log('symptoms url:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            console.log('symptoms response:', data);
            if (response.ok && data.data && Array.isArray(data.data)) {
                const symptoms = data.data;
                const grouped = symptoms.reduce((acc, item) => {
                    const date = (item.created_at || '').split('T')[0];
                    if (date) {
                        if (!acc[date]) {
                            acc[date] = [];
                        }
                        acc[date].push(item);
                    }
                    return acc;
                }, {});

                const today = getTodayDate();
                if (!grouped[today] && todaysAppointment) {
                    grouped[today] = [{ created_at: getTodayDate() }];
                }

                const dates = Object.keys(grouped).sort().reverse();
                setGroupedSymptoms(grouped);
                let todaysItem = grouped[dates[0]]
                let nextDay = grouped[dates[1]]
                if (todaysItem?.[0]?.next_visit_date) {
                    setGeneralNextVisitDate(todaysItem[0].next_visit_date);
                } else if (nextDay?.[0]?.next_visit_date) {
                    setGeneralNextVisitDate(nextDay[0].next_visit_date);
                } else {
                    setGeneralNextVisitDate('');
                }
                const firstDateSelected = grouped[dates[0]]?.[0]?.created_at || '';
                const dateToDisplay = selectedSymptomDate || (todaysAppointment ? today : firstDateSelected);
                console.log('dateToDisplay:', dateToDisplay, firstDateSelected);
                if (!selectedSymptomDate) {
                    setSelectedSymptomDate(dateToDisplay);
                }

                const symptomsForDate = grouped[dateToDisplay] || [];
                setSymptomsData(symptomsForDate[0]);

                if (symptomsForDate.length > 0) {
                    const firstSymptom = symptomsForDate[0];
                    setSymptomsFormData({
                        chiefComplaint: firstSymptom.chief_complaint || '',
                        onsetDurationSeverity: firstSymptom.onset_duration_severity || '',
                        associatedSymptoms: firstSymptom.associated_symptoms || '',
                        consultingDoctor: firstSymptom.consulting_doctor || '',
                        aggravatingRelievingFactor: firstSymptom.aggravating_relief_factor || '',
                        nextVisitDate: firstSymptom.next_visit_date || ''
                    });
                } else {
                    setSymptomsFormData({
                        chiefComplaint: '', onsetDurationSeverity: '', associatedSymptoms: '',
                        consultingDoctor: '', aggravatingRelievingFactor: '', nextVisitDate: ''
                    });
                }
                setIsEditingSymptoms(false);
            } else if (todaysAppointment) {
                const today = getTodayDate();
                setGroupedSymptoms({ [today]: [] });
                setSelectedSymptomDate(today);
                setSymptomsData(null);
                setSymptomsFormData({ chiefComplaint: '', onsetDurationSeverity: '', associatedSymptoms: '', consultingDoctor: '', aggravatingRelievingFactor: '', nextVisitDate: '' });
            }
        } catch (err) {
            console.error('Error fetching symptoms:', err);
            setSymptomsData(null);
            setError('Network error');
        }
        setLoading(false);
    };
    // console.log('symptomsData???...', symptomsData);

    const insertSymptoms = async (symptomsFormData) => {
        setLoading(true);

        try {
            const body = {
                appoinment_id: symptomsFormData.appoinment_id,
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
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();

            if (response.ok && Array.isArray(data.data)) {
                const investigations = data.data;
                const grouped = investigations.reduce((acc, item) => {
                    const date = (item.recordDate || item.record_date || '').split('T')[0];
                    if (date) {
                        if (!acc[date]) {
                            acc[date] = [];
                        }
                        acc[date].push(item);
                    }
                    return acc;
                }, {});

                const today = getTodayDate();
                if (!grouped[today] && todaysAppointment) {
                    grouped[today] = [];
                }

                const dates = Object.keys(grouped).sort().reverse();
                setGroupedInvestigations(grouped);

                const dateToDisplay = selectedInvestigationDate || (dates.length > 0 ? dates[0] : (todaysAppointment ? today : ''));

                if (!selectedInvestigationDate) {
                    setSelectedInvestigationDate(dateToDisplay);
                }

                setInvestigationData(grouped[dateToDisplay] || []);
            } else if (todaysAppointment) {
                const today = getTodayDate();
                setGroupedInvestigations({ [today]: [] });
                setSelectedInvestigationDate(today);
                setInvestigationData([]);
            }
        } catch (err) {
            console.error('Error fetching symptoms:', err);
            setError('Network error');
        }
        setLoading(false);
    };

    const getPreviewData = async (appointmentId) => {
        if (!appointmentId) {
            console.log('No appointmentId to preview');
            return;
        }
        try {
            const url = new URL(getApiUrl(URLConfigEnum.PATIENT_PREVIEW, patientId, appointmentId));
            console.log('URLString patient preview', url.toString());
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            console.log('URLString patient preview response', data);
            if (response.ok) {
                setPreviewData(data.data);
            }
        } catch (err) {
            console.error('Error fetching patient preview:', err);
            setError('Network error');
        }
        setLoading(false);
    };

    const completeAction = () => {
        setIsCheckoutConfirmModalOpen(true);
    }

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

    const handleConfirmCheckout = async () => {
        // This method is intentionally left empty for now, as per the request.
        setIsCheckoutConfirmModalOpen(false);
        if (todaysAppointment && patientId) {
            try {
                const data = await setCompleteAppointment(todaysAppointment, patientId);
                if (data) {
                    toast.success('Appointment completed successfully');
                }
            } catch (error) {
                console.error('Error completing appointment:', error);
                toast.error('Failed to complete appointment');
            }
        } else {
            toast.warning('No appointment/patient ID found for today');
        }
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

    const titleize = (key = '') =>
        key
            .replace(/([A-Z])/g, ' $1')
            .replace(/[_\-]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())
            .trim();
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
                        const medName = m.medicineName || m.medicine_name || m.name || m.medicine || 'N/A';
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
                                    <span style={{ marginRight: 12 }}>
                                        Dose Timing: <b>{m.dosageTiming || 'N/A'}</b>
                                    </span>
                                    <span style={{ marginRight: 12 }}>
                                        Eating Type: <b>{m.eatType || 'N/A'}</b>
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    useEffect(() => {
        // This effect fetches all the initial data for the patient.
        // It runs only when the `patientId` changes.
        if (!patientId) {
            return; // Guard clause to prevent fetching data without a patientId.
        }
        console.log("appointmentId", appointmentId, "patientId", patientId, todaysAppointment);
        if (todaysAppointment) {
            console.log("appointmentId if", appointmentId, "patientId", patientId);
            getPrescriptions();
            getPreviewData(todaysAppointment)
        } else {
            console.log("appointmentId null and api call", appointmentId, "patientId", patientId);
            getAppointmentBy(patientId)
        }
        getPatients();
        getfamilyHistory();
        getVitalSignsData();
        // insertSymptoms(); // This function is for updating/inserting, not for initial data fetch
        getSymptomsData()
        getInvestigationData();
        // The dependency array intentionally omits the getter functions.
        // This is because they are redefined on every render, and including them
        // would cause an infinite loop. We only want to refetch when patientId changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patientId, todaysAppointment]);

    const headerTable = (title, ref, filename, headerTitle) => {
        return (
            <div style={{ flexDirection: 'row', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{headerTitle}</h3>
                {downloadButtonUI(title, ref, filename)}
            </div>
        )
    };

    const downloadButtonUI = (title, ref, filename) => {
        return (
            <button
                className="pdf-btn"
                title={title}
                // onClick={() => exportSectionToPDF(prescriptionRef, 'Prescription.pdf')}
                onClick={() => exportHeaderAndSection(ref, filename)}
                style={{
                    ...PatientStyles.pdfBtn
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 24 }}>
                    <div>
                        <label>Download</label>
                    </div>
                    <img src={downloadIcon} alt="Download" style={{ width: 16, height: 16 }} />
                </div>
            </button>
        )
    };
    const getTodayDate = () => {
        const today = new Date();

        // format options to extract year, month, and day for Asia/Kolkata
        const options = {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };

        const formatter = new Intl.DateTimeFormat('en-CA', options); // 'en-CA' gives YYYY-MM-DD
        return formatter.format(today);
    };
    const getYesterday = () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const options = {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }

        const formatter = new Intl.DateTimeFormat('en-CA', options);
        return formatter.format(yesterday);
    };
    const getPrescriptionDateTitle = (date) => {
        if (date === getTodayDate()) {
            return 'Today';
        } else if (date === getYesterday()) {
            return 'Yesterday';
        } else {
            return date;
        }
    };

    const onCLickSelectPrescriptionDate = (date) => {
        const customPrescriptionByDate = groupedPrescriptions[date]
        // if (customPrescriptionByDate.length === 0 || customPrescriptionByDate === null || customPrescriptionByDate === undefined) return
        setSelectedPrescriptionDate(date)
        setPrescriptions(customPrescriptionByDate);
    };

    const renderProfileUI = () => {
        return (
            <div
                className="patient-section"
                style={PatientStyles.profileSectionContainer}
                ref={profileRef}
            >
                <div
                    style={PatientStyles.profileCard}
                >
                    {headerTable('Download profile as PDF', profileRef, 'Profile.pdf', 'Profile')}
                    <div style={PatientStyles.profileCardHeader}>
                        <div
                            style={PatientStyles.profileAvatarWrapper}
                        >
                            <img
                                src={patients[0]?.avatar || 'https://i.ibb.co/2cX0dQr/avatar.png'}
                                alt="avatar"
                                style={PatientStyles.profileAvatar}
                            />
                        </div>

                        <div style={PatientStyles.flex1}>
                            <div
                                style={PatientStyles.profileNameContainer}
                            >
                                <div>
                                    <h2 style={PatientStyles.patientName}>
                                        {name || 'Peter Thomas'}
                                    </h2>
                                    <div style={PatientStyles.patientSubDetail}>
                                        {patients[0]?.applyMode || 'Inperson'}
                                    </div>
                                    <div style={PatientStyles.marginTop8}>
                                        <a style={PatientStyles.patientCode}>
                                            [{patients[0]?.patientCode || 'DRS25154'}]
                                        </a>
                                    </div>
                                </div>
                                {/* optional small logo on the right if needed */}
                                <div style={PatientStyles.profileHeaderActions} />
                            </div>

                            <hr style={PatientStyles.divider} />

                            <div style={PatientStyles.contactDetails}>
                                <div style={PatientStyles.flex1}>
                                    <div style={PatientStyles.contactItem}>
                                        Email ID : {email || 'xyz@gmail.com'}
                                    </div>
                                    {/* <div style={{ marginBottom: 8 }}>{patients[0]?.email || 'xyz@gmail.com'}</div> */}
                                    <div style={PatientStyles.contactItem}>
                                        Contact Number : {mobile || '+91 98567 56421'}
                                    </div>
                                    {/* <div style={{ marginBottom: 8 }}>{patients[0]?.mobileNumber || '+91 98567 56421'}</div> */}
                                    <div style={PatientStyles.contactItem}>Address : {address}</div>
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
    };

    const vitalEditableUI = () => {
        return (
            <>
                <div style={PatientStyles.vitalsSummaryHeader}>
                    {headerTable('Download vital signs as PDF', vitalRef, 'VitalSigns.pdf', '')}
                </div>
                <div className="patient-section grid-2" style={PatientStyles.relative}>
                    <div className="card">
                        <h4>Vital Signs :</h4>
                        <p>
                            Temperature :{' '}
                            {editing.section === 'vital' && editing.field === 'temperature' ? (
                                <>
                                    <input
                                        value={vitalSigns.temperature}
                                        onChange={e => setVitalSigns(prev => ({ ...prev, temperature: e.target.value }))}
                                        style={PatientStyles.inputSmall}
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
                                        style={PatientStyles.inputSmall}
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
                                        style={PatientStyles.inputExtraSmall}
                                    />
                                    /
                                    <input
                                        value={vitalSigns.bloodPressure.diastolic}
                                        onChange={e => setVitalSigns(prev => ({ ...prev, bloodPressure: { ...prev.bloodPressure, diastolic: e.target.value } }))}
                                        style={PatientStyles.inputExtraSmall}
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
                                        style={PatientStyles.inputSmall}
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
                                        style={PatientStyles.inputSmall}
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
                                        style={PatientStyles.inputSmall}
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
                                        style={PatientStyles.inputSmall}
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
                                        style={PatientStyles.inputSmall}
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
            </>
        )
    };
    const renderVitalUI = () => {
        const selectedVitalData = vitalSignsData.find(vital => vital.dateOfRecord === selectedVitalSign.dateOfRecord);
        console.log("selectedVitalData", selectedVitalData)
        return (
            <div>
                <div style={{ ...PatientStyles.tabsContainer, height: 32, justifyContent: 'flex-start', gap: 12 }}>
                    {vitalSignsData.map((vital, idx) => (
                        <div key={vital.id || idx} style={{ display: 'flex', alignItems: 'center' }}>
                            <button
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                                onClick={() => setselectedVitalSign(vital)}
                            >
                                <h4 style={{
                                    color: selectedVitalSign.dateOfRecord === vital.dateOfRecord ? '#000000' : '#8C8C8C',
                                    fontSize: 16, fontWeight: selectedVitalSign.dateOfRecord === vital.dateOfRecord ? 'bold' : 'normal', textAlign: 'left', margin: 0
                                }}>{getPrescriptionDateTitle(vital.dateOfRecord)}</h4>
                            </button>
                        </div>
                    ))}
                </div>
                {vitalSignsData.length > 0 && (
                    <>
                        {getPrescriptionDateTitle(selectedVitalData.dateOfRecord) === 'Today' && todaysAppointment && (
                            vitalEditableUI()
                        )}
                        {getPrescriptionDateTitle(selectedVitalData.dateOfRecord) !== 'Today' && (
                            <div style={PatientStyles.vitalsSummaryContainer} ref={vitalRef}>
                                <div style={PatientStyles.vitalsSummaryWrapper}>
                                    <div style={PatientStyles.vitalsSummaryCard}>
                                        <div style={PatientStyles.vitalsSummaryHeader}>
                                            {headerTable('Download vital signs as PDF', vitalRef, 'VitalSigns.pdf', '')}
                                        </div>
                                        <div style={PatientStyles.vitalsSummaryContent}>
                                            <div style={PatientStyles.flex1}>
                                                <span style={PatientStyles.vitalsSummaryTitle}>Vital Signs :</span>
                                                <div style={PatientStyles.vitalItem}>Temperature : <span style={PatientStyles.vitalValue}>{selectedVitalData?.temperature} ℃</span></div>
                                                <div style={PatientStyles.vitalItem}>Heart Rate : <span style={PatientStyles.vitalValue}>{selectedVitalData?.heartRate} bpm</span></div>
                                                <div style={PatientStyles.vitalItem}>Blood Pressure : <span style={PatientStyles.vitalValue}>{selectedVitalData?.bloodPressure} mmHg</span></div>
                                                <div style={PatientStyles.vitalItem}>Respiratory Rate : <span style={PatientStyles.vitalValue}>{selectedVitalData?.respiratoryRate} per minute</span></div>
                                            </div>
                                            <div style={PatientStyles.flex1}>
                                                <span style={PatientStyles.vitalsSummaryTitle}>Basic Data :</span>
                                                <div style={PatientStyles.vitalItem}>Age : <span style={PatientStyles.vitalValueBold}>{selectedVitalData?.age} Years</span></div>
                                                <div style={PatientStyles.vitalItem}>Height : <span style={PatientStyles.vitalValue}>{selectedVitalData?.height} CM(s)</span></div>
                                                <div style={PatientStyles.vitalItem}>Weight : <span style={PatientStyles.vitalValue}>{selectedVitalData?.weight} KG</span></div>
                                                <div style={PatientStyles.vitalItem}>BMI : <span style={PatientStyles.vitalValueBold}>{selectedVitalData?.bmi}</span></div>
                                            </div>
                                            <></>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
                {!selectedVitalSign && todaysAppointment && (
                    vitalEditableUI()
                )}

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
    };

    const renderFamilyHistoryUI = () => {
        return (
            <div className="patient-section" ref={familyHistoryRef} style={PatientStyles.relative}>
                {headerTable('Download Family Medical History as PDF', familyHistoryRef, 'FamilyMedicalHistory.pdf', 'Family Medical History')}
                {!isEditingFamilyHistory ? (
                    <>
                        {/* Display Mode - Table View */}
                        <table
                            style={PatientStyles.historyTable}
                        >
                            <thead>
                                <tr style={PatientStyles.tableHeader}>
                                    <th style={PatientStyles.tableTh}>Conditions</th>
                                    <th style={PatientStyles.tableTh}>
                                        Family Members
                                    </th>
                                    <th style={PatientStyles.tableTh}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(familyHistory && familyHistory.length > 0 ? familyHistory : []).map((item, idx) => (
                                    <tr key={idx} style={PatientStyles.tableRow}>
                                        <td style={PatientStyles.tableTd}>{item.condition_name}</td>
                                        <td style={PatientStyles.tableTd}>{item.family_member}</td>
                                        <td style={PatientStyles.tableTd}>{item.status}</td>
                                    </tr>
                                ))}
                                {familyHistory && familyHistory.length == 0 && (
                                    <tr>
                                        <td colSpan="3" style={PatientStyles.tableTd}>
                                            No Family Medical History
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div style={PatientStyles.actionButtonsContainer}>
                            <button
                                onClick={() => {
                                    // Initialize edit mode with API data
                                    setFamilyHistoryData(familyHistory && familyHistory.length > 0 ? [...familyHistory] : []);
                                    setNewFamilyEntry({ condition_name: '', family_member: '', status: '' });
                                    setEditingFamilyIdx(null);
                                    setIsEditingFamilyHistory(true);
                                }}
                                style={PatientStyles.editButton}
                            >
                                Edit
                            </button>
                            <button
                                style={PatientStyles.updateButton}
                            >
                                Update
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Edit Mode - Form View */}
                        <div
                            style={PatientStyles.formGrid3}
                        >
                            {/* Conditions Input */}
                            <div>
                                <label
                                    style={PatientStyles.formLabel}
                                >
                                    Conditions
                                </label>
                                <input
                                    type="text"
                                    value={newFamilyEntry.condition_name}
                                    onChange={(e) => setNewFamilyEntry({ ...newFamilyEntry, condition_name: e.target.value })}
                                    placeholder="Enter Here..."
                                    style={PatientStyles.formInput}
                                />
                            </div>

                            {/* Family Members Input */}
                            <div>
                                <label
                                    style={PatientStyles.formLabel}
                                >
                                    Family Members
                                </label>
                                <input
                                    type="text"
                                    value={newFamilyEntry.family_member}
                                    onChange={(e) => setNewFamilyEntry({ ...newFamilyEntry, family_member: e.target.value })}
                                    placeholder="Enter Here..."
                                    style={PatientStyles.formInput}
                                />
                            </div>

                            {/* Status Dropdown */}
                            <div>
                                <label
                                    style={PatientStyles.formLabel}
                                >
                                    Status
                                </label>
                                <div style={PatientStyles.inputWithButton}>
                                    <select
                                        value={newFamilyEntry.status}
                                        onChange={(e) => setNewFamilyEntry({ ...newFamilyEntry, status: e.target.value })}
                                        style={PatientStyles.formSelect}
                                    >
                                        <option value="">Select</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                    <button
                                        onClick={handleAddFamilyHistory}
                                        style={PatientStyles.addEntryButton}
                                        title={editingFamilyIdx !== null ? 'Update entry' : 'Add entry'}
                                    >
                                        {editingFamilyIdx !== null ? '✓' : '+'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Current Entries List */}
                        {Array.isArray(familyHistoryData) && familyHistoryData.length > 0 && (
                            <div style={PatientStyles.marginBottom24}>
                                <h4 style={PatientStyles.currentEntriesTitle}>Current Entries</h4>
                                <table
                                    style={PatientStyles.historyTable}
                                >
                                    <thead>
                                        <tr style={PatientStyles.tableHeader}>
                                            <th style={PatientStyles.tableTh}>
                                                Conditions
                                            </th>
                                            <th style={PatientStyles.tableTh}>
                                                Family Members
                                            </th>
                                            <th style={PatientStyles.tableTh}>
                                                Status
                                            </th>
                                            <th style={PatientStyles.tableThCenter}>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {familyHistoryData.map((item, idx) => (
                                            <tr key={idx} style={PatientStyles.tableRow}>
                                                <td style={PatientStyles.tableTd}>{item.condition_name}</td>
                                                <td style={PatientStyles.tableTd}>{item.family_member}</td>
                                                <td style={PatientStyles.tableTd}>{item.status}</td>
                                                <td style={PatientStyles.tableTdCenter}>
                                                    <button
                                                        onClick={() => handleEditFamilyHistory(idx)}
                                                        style={PatientStyles.editTableButton}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteFamilyHistory(idx)}
                                                        style={PatientStyles.deleteTableButton}
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
                        <div style={PatientStyles.actionButtonsContainerCenter}>
                            <button
                                onClick={handleCancelEditingFamilyHistory}
                                style={PatientStyles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={insertFamilyHistory}
                                disabled={loading}
                                style={{ ...PatientStyles.updateButtonLarge, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
                            >
                                {loading ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        )
    };

    const getPrescriptionFrequency = (med, fType = 'forenoon' | 'afternoon' | 'evening' | 'night') => {
        switch (fType) {
            case 'forenoon': return (med.frequency_F) || '0';
            case 'afternoon': return (med.frequency_A) || '0';
            case 'evening': return (med.frequency_E) || '0';
            case 'night': return (med.frequency_N) || '0';
            default: return '0';
        }
    }

    const getTiming = (med) => {
        if (!med) {
            return 'N/A';
        }
        return med.dosage_timing === 'after_food' ? 'After Food' : 'Before Food';
    }
    const renderPrescriptionUI = () => {
        return (
            <div className="patient-section" ref={prescriptionRef} style={{ position: 'relative' }}>
                <div style={{ ...PatientStyles.tabsContainer, height: 32, justifyContent: 'flex-start', gap: 12 }}>
                    {Object.keys(groupedPrescriptions).sort((a, b) => new Date(b) - new Date(a)).map((date, idx) => (
                        <div key={date} style={{ display: 'flex', alignItems: 'center' }}>
                            <button
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                                onClick={() => onCLickSelectPrescriptionDate(date)}
                            >
                                <h4 style={{
                                    color: selectedPrescriptionDate === date ? '#000000' : '#8C8C8C',
                                    fontSize: 16, fontWeight: selectedPrescriptionDate === date ? 'bold' : 'normal', textAlign: 'left', margin: 0
                                }}>{getPrescriptionDateTitle(date)}</h4>
                            </button>
                        </div>
                    ))}
                </div>
                {headerTable('Download Prescription as PDF', prescriptionRef, 'Prescription.pdf', 'Prescription')}
                <table className="prescription-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Medicine Name</th>
                            <th style={PatientStyles.tableCellViewSmall}>Quantity</th>
                            <th><div className='thDivMid'>Forenoon</div></th>
                            <th><div className='thDivMid'>Afternoon</div></th>
                            <th><div className='thDivMid'>Evening</div></th>
                            <th><div className='thDivMid'>Night</div></th>
                            <th><div className='thDivMid'>Dose Timing</div></th>
                            <th><div className='thDivMid'>Eating Type</div></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(prescriptions) && prescriptions.length > 0 && prescriptions.map((med, idx) => (
                            <tr key={med.id || idx}>
                                <td style={PatientStyles.tableCellViewSmall}> <div className='tdDivLeft'>{idx + 1 < 10 ? `0${idx + 1}.` : `${idx + 1}.`}</div></td>
                                <td> <div className='tdDivLeft'>{med.medicine_name}</div></td>
                                <td style={PatientStyles.tableCellViewSmall}><div className='tdDivMid'>{med.quantity}</div></td>
                                <td style={PatientStyles.tableCellViewMid}><div className='tdDivMid'>{getPrescriptionFrequency(med, 'forenoon')}</div></td>
                                <td style={PatientStyles.tableCellViewMid}><div className='tdDivMid'>{getPrescriptionFrequency(med, 'afternoon')}</div></td>
                                <td style={PatientStyles.tableCellViewMid}><div className='tdDivMid'>{getPrescriptionFrequency(med, 'evening')}</div></td>
                                <td style={PatientStyles.tableCellViewMid}><div className='tdDivMid'>{getPrescriptionFrequency(med, 'night')}</div></td>
                                <td style={PatientStyles.tableCellViewNormal}><div className='tdDivMid'>{getTiming(med)}</div></td>
                                <td style={PatientStyles.tableCellViewNormal}><div className='tdDivMid'>{capitalizeFirstChar(med.type)}</div></td>
                                {getPrescriptionDateTitle(selectedPrescriptionDate) === 'Today' && (
                                    <td style={PatientStyles.tableCellAction}>
                                        <button
                                            onClick={() => handleEditPrescription(idx)}
                                            disabled={editingIdx !== null}
                                            style={
                                                {
                                                    ...PatientStyles.presEditButton,
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
                                                    ...PatientStyles.removeTableButton,
                                                    cursor: editingIdx !== null ? 'not-allowed' : 'pointer',
                                                    opacity: editingIdx !== null ? 0.5 : 1,
                                                }
                                            }
                                        >
                                            Remove
                                        </button>

                                    </td>
                                )}
                            </tr>
                        ))}
                        {getPrescriptionDateTitle(selectedPrescriptionDate) === 'Today' && (
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
                                            value={newPrescription.frequency_F}
                                            onChange={(e) => handlePrescriptionChange(e, 'frequency_F')}
                                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                        >
                                            {FREQUENCY_OPTIONS.map((num) => (
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
                                            value={newPrescription.frequency_A}
                                            onChange={(e) => handlePrescriptionChange(e, 'frequency_A')}
                                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                        >
                                            {FREQUENCY_OPTIONS.map((num) => (
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
                                            value={newPrescription.frequency_E}
                                            onChange={(e) => handlePrescriptionChange(e, 'frequency_E')}
                                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                        >
                                            {FREQUENCY_OPTIONS.map((num) => (
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
                                            value={newPrescription.frequency_N}
                                            onChange={(e) => handlePrescriptionChange(e, 'frequency_N')}
                                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                        >
                                            {FREQUENCY_OPTIONS.map((num) => (
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
                                                        ...PatientStyles.updatePrescriptionButton,
                                                        background: isPrescriptionUnchanged ? '#ccc' : '#0070f3',
                                                        border: `1px solid ${isPrescriptionUnchanged ? '#ccc' : '#0070f3'}`,
                                                        cursor: isPrescriptionUnchanged ? 'not-allowed' : 'pointer',
                                                    }}
                                                >
                                                    Update
                                                </button>
                                                <button
                                                    style={PatientStyles.presCancelButton}
                                                    onClick={handleCancelEditPrescription}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                        {editingIdx === null && (
                                            <button
                                                style={{
                                                    ...PatientStyles.addButton,
                                                    background: !isValidPrescription ? '#ccc' : '#0070f3',
                                                    border: `1px solid ${!isValidPrescription ? '#ccc' : '#0070f3'}`,
                                                    cursor: !isValidPrescription ? 'not-allowed' : 'pointer',
                                                }}
                                                disabled={!isValidPrescription}
                                                onClick={handleAddNewPrescription}
                                            >
                                                Add
                                            </button>
                                        )}

                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {(!Array.isArray(prescriptions) || prescriptions.length === 0) && (
                    <div style={PatientStyles.centerContent}>
                        <label style={PatientStyles.noDataLabel}>
                            No prescriptions found.
                        </label>
                        <label style={PatientStyles.noDataLabel}>
                            Please add prescription details to display here.
                        </label>
                    </div>
                )}
            </div>
        )
    };

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
            <div className="patient-section" ref={presentRef} style={PatientStyles.relative}>
                {/*Date horizontal scroll */}
                <div className="patient-section" ref={presentRef} style={PatientStyles.relative}>
                    <div style={{ ...PatientStyles.tabsContainer, height: 32, justifyContent: 'flex-start', gap: 12 }}>
                        {Object.keys(groupedSymptoms).sort((a, b) => new Date(b) - new Date(a)).map((date, idx) => (
                            <div key={date} style={{ display: 'flex', alignItems: 'center' }}>
                                <button
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                                    onClick={() => handleSymptomDateChange(date)}
                                >
                                    <h4 style={{
                                        color: selectedSymptomDate === date ? '#000000' : '#8C8C8C',
                                        fontSize: 16, fontWeight: selectedSymptomDate === date ? 'bold' : 'normal', textAlign: 'left', margin: 0
                                    }}>{getPrescriptionDateTitle(date)}</h4>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                {headerTable('Download Present Symptoms as PDF', presentRef, 'PresentSymptoms.pdf', 'Present Symptoms')}
                {/* Loading State */}
                {loading && <div style={PatientStyles.loadingText}>Loading symptoms data...</div>}

                {/* Error State */}
                {/* {error && <div style={{ padding: 12, background: '#ffebee', borderRadius: 6, color: '#c62828', marginBottom: 20 }}>{error}</div>} */}

                {/* No Data State */}
                {(!symptomsData) && !loading && (
                    <div style={PatientStyles.noDataContainer}>
                        <p style={PatientStyles.noDataText}>No symptoms data available for the selected date</p>
                    </div>
                )}

                {/* View Mode - Display symptoms data */}
                {symptomsData && !isEditingSymptoms && (
                    <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 16, background: '#fff' }}>
                        <div style={PatientStyles.symptomsGrid}>
                            {/* Left Column */}
                            <div>
                                <div style={PatientStyles.marginBottom20}>
                                    <label style={PatientStyles.symptomLabel}>Chief Complaint</label>
                                    <p style={PatientStyles.symptomValue}>
                                        {symptomsData.chief_complaint || 'N/A'}
                                    </p>
                                </div>

                                <div style={PatientStyles.marginBottom20}>
                                    <label style={PatientStyles.symptomLabel}>Onset, Duration, Severity</label>
                                    <p style={PatientStyles.symptomValue}>
                                        {symptomsData.onset_duration_severity || 'N/A'}
                                    </p>
                                </div>

                                <div style={PatientStyles.marginBottom20}>
                                    <label style={PatientStyles.symptomLabel}>Associated Symptoms</label>
                                    <p style={PatientStyles.symptomValue}>
                                        {symptomsData.associated_symptoms || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div>
                                <div style={PatientStyles.marginBottom20}>
                                    <label style={PatientStyles.symptomLabel}>Consulting Doctor</label>
                                    <p style={PatientStyles.symptomValue}>
                                        {symptomsData.consulting_doctor || 'N/A'}
                                    </p>
                                </div>

                                <div style={PatientStyles.marginBottom20}>
                                    <label style={PatientStyles.symptomLabel}>Aggravating / Relieving Factor</label>
                                    <p style={PatientStyles.symptomValue}>
                                        {symptomsData.aggravating_relief_factor || 'N/A'}
                                    </p>
                                </div>

                                <div style={PatientStyles.marginBottom20}>
                                    <label style={PatientStyles.symptomLabel}>Next visit Date</label>
                                    <p style={PatientStyles.symptomValue}>
                                        {symptomsData.next_visit_date || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {symptomsData && !isEditingSymptoms && symptomsData.created_at === getTodayDate() && (
                    <div style={PatientStyles.actionButtonsContainer}>
                        <div style={PatientStyles.actionButtonsContainer}>
                            <button
                                onClick={() => setIsEditingSymptoms(true)}
                                style={PatientStyles.editButton}
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                )}

                {/* Edit Mode - Edit symptoms data */}
                {isEditingSymptoms && (
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
    };

    const renderMeetingProcessUI = () => {
        return (
            <div className="patient-section" style={PatientStyles.marginTop24}>
                <h3>Meeting Process</h3>
                <div style={PatientStyles.meetingProcessControls}>
                    <div>
                        <label style={PatientStyles.smallLabel}>Meeting ID</label>
                        <input
                            type="text"
                            value={meetingIdInput}
                            onChange={(e) => setMeetingIdInput(e.target.value)}
                            placeholder="Enter meeting ID"
                            style={PatientStyles.smallInput}
                        />
                    </div>
                    <div>
                        <label style={PatientStyles.smallLabel}>Patient ID</label>
                        <input
                            type="text"
                            value={patientIdInput}
                            onChange={(e) => setPatientIdInput(e.target.value)}
                            placeholder="Enter patient id"
                            style={PatientStyles.smallInput}
                        />
                    </div>
                    <div>
                        <label style={PatientStyles.smallLabel}>Language</label>
                        <select
                            value={languageOption}
                            onChange={(e) => setLanguageOption(e.target.value)}
                            style={PatientStyles.smallSelect}
                        >
                            <option value="en">en</option>
                            <option value="ta">ta</option>
                        </select>
                    </div>
                </div>
                <div style={PatientStyles.meetingProcessActions}>
                    <button
                        onClick={getMeetingProcess}
                        disabled={loading}
                        style={{
                            ...PatientStyles.processButton,
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
                        style={PatientStyles.resetButton}
                    >
                        Reset
                    </button>
                </div>

                {error && <div style={PatientStyles.errorText}>{error}</div>}
                {meetingprocess && meetingprocess.data ? (
                    <div style={PatientStyles.marginTop24}>
                        {/* Remedies Section */}
                        <div style={PatientStyles.marginBottom24}>
                            <h4 style={PatientStyles.subSectionTitle}>Remedies</h4>
                            {Array.isArray(meetingprocess.data.remedies) && meetingprocess.data.remedies.length > 0 ? (
                                <ul style={PatientStyles.list}>
                                    {meetingprocess.data.remedies.map((remedy, idx) => (
                                        <li key={idx} style={PatientStyles.listItem}>
                                            <b>Medicine:</b> {remedy.medicine} <br />
                                            <b>Dosage:</b> {remedy.dosage} <br />
                                            <b>Purpose:</b> {remedy.purpose}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div style={PatientStyles.noDataText}>No remedies found</div>
                            )}
                        </div>

                        {/* Tests Section */}
                        <div style={PatientStyles.marginBottom24}>
                            <h4 style={PatientStyles.subSectionTitle}>Tests</h4>
                            {Array.isArray(meetingprocess.data.tests) && meetingprocess.data.tests.length > 0 ? (
                                <ul style={PatientStyles.list}>
                                    {meetingprocess.data.tests.map((test, idx) => (
                                        <li key={idx}>{test}</li>
                                    ))}
                                </ul>
                            ) : (
                                <div style={{ color: '#888' }}>No tests found</div>
                            )}
                        </div>

                        {/* Follow Ups Section */}
                        <div style={PatientStyles.marginBottom24}>
                            <h4 style={PatientStyles.subSectionTitle}>Follow Ups</h4>
                            {Array.isArray(meetingprocess.data.follow_ups) && meetingprocess.data.follow_ups.length > 0 ? (
                                <ul style={PatientStyles.list}>
                                    {meetingprocess.data.follow_ups.map((follow, idx) => (
                                        <li key={idx}>{follow}</li>
                                    ))}
                                </ul>
                            ) : (
                                <div style={{ color: '#888' }}>No follow ups found</div>
                            )}
                        </div>

                        {/* Other Section */}
                        <div style={PatientStyles.marginBottom24}>
                            <h4 style={PatientStyles.subSectionTitle}>Other</h4>
                            {Array.isArray(meetingprocess.data.other) && meetingprocess.data.other.length > 0 ? (
                                <ul style={PatientStyles.list}>
                                    {meetingprocess.data.other.map((other, idx) => (
                                        <li key={idx}>{other}</li>
                                    ))}
                                </ul>
                            ) : (
                                <div style={{ color: '#888' }}>No other notes found</div>
                            )}
                        </div>

                        {/* Prescription Section */}
                        <div style={PatientStyles.marginBottom24}>
                            <h4 style={PatientStyles.subSectionTitle}>Prescription</h4>
                            {meetingprocess.data.prescription && Array.isArray(meetingprocess.data.prescription.prescription) && meetingprocess.data.prescription.prescription.length > 0 ? (
                                <table style={PatientStyles.summaryTable}>
                                    <thead>
                                        <tr style={PatientStyles.summaryTableHeader}>
                                            <th style={PatientStyles.summaryTableTh}>Medicine Name</th>
                                            <th style={PatientStyles.summaryTableTh}>Quantity</th>
                                            <th style={PatientStyles.summaryTableTh}>Frequency</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {meetingprocess.data.prescription.prescription.map((item, idx) => (
                                            <tr key={idx}>
                                                <td style={PatientStyles.summaryTableTd}>{item.medicineName}</td>
                                                <td style={PatientStyles.summaryTableTd}>{item.quantity}</td>
                                                <td style={PatientStyles.summaryTableTd}>
                                                    {item.frequency && typeof item.frequency === 'object' ? (
                                                        <div>
                                                            {Object.entries(item.frequency).map(([freqKey, freqVal]) => (
                                                                <div key={freqKey} style={PatientStyles.marginBottom4}>
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
                                <div style={PatientStyles.noDataText}>No prescription found</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={PatientStyles.noDataFound}>
                        No data found
                    </div>
                )}
            </div>
        )
    };

    const renderDiagnosticUI = () => {
        return (
            <div className="diagnostic-section" ref={diagnosticRef} style={PatientStyles.diagnosticSection}>
                <div style={{ ...PatientStyles.tabsContainer, height: 32, justifyContent: 'flex-start', gap: 12 }}>
                    {Object.keys(groupedInvestigations).sort((a, b) => new Date(b) - new Date(a)).map((date, idx) => (
                        <div key={date} style={{ display: 'flex', alignItems: 'center' }}>
                            <button
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                                onClick={() => {
                                    setSelectedInvestigationDate(date);
                                    setInvestigationData(groupedInvestigations[date] || []);
                                }}
                            >
                                <h4 style={{
                                    color: selectedInvestigationDate === date ? '#000000' : '#8C8C8C',
                                    fontSize: 16, fontWeight: selectedInvestigationDate === date ? 'bold' : 'normal', textAlign: 'left', margin: 0
                                }}>{getPrescriptionDateTitle(date)}</h4>
                            </button>
                        </div>
                    ))}
                </div>
                {headerTable('Download Diagnostic as PDF', diagnosticRef, 'Diagnostic.pdf', 'Diagnostic Investigation')}
                <div style={PatientStyles.searchContainer}>
                    <input
                        type="search"
                        placeholder="Search"
                        style={PatientStyles.searchInput}
                    />
                </div>
                <div style={PatientStyles.diagnosticContent}>
                    <div style={PatientStyles.flex1}>
                        {/* Investigation inputs on left side */}
                        {getPrescriptionDateTitle(selectedInvestigationDate) === 'Today' && (
                            <div style={PatientStyles.investigationFormCard}>
                                <h4 style={PatientStyles.marginTop0}>Add Investigation</h4>
                                <div style={PatientStyles.formGrid1}>
                                    <div>
                                        <label style={PatientStyles.smallLabel}>Investigation Type</label>
                                        <input
                                            value={investigationTypeInput}
                                            onChange={(e) => setInvestigationTypeInput(e.target.value)}
                                            placeholder="e.g. ECG"
                                            style={PatientStyles.smallInput}
                                        />
                                    </div>
                                    <div>
                                        <label style={PatientStyles.smallLabel}>Description</label>
                                        <textarea
                                            value={investigationDescriptionInput}
                                            onChange={(e) => setInvestigationDescriptionInput(e.target.value)}
                                            placeholder="Short description..."
                                            rows={3}
                                            style={PatientStyles.textarea}
                                        />
                                    </div>
                                    <div style={PatientStyles.formActions}>
                                        <button
                                            onClick={() => { setInvestigationTypeInput(''); setInvestigationDescriptionInput(''); setImages([]); }}
                                            style={PatientStyles.resetButtonSmall}
                                        >
                                            Reset
                                        </button>
                                        <button
                                            onClick={handleSubmitInvestigation}
                                            style={PatientStyles.saveButtonSmall}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {getPrescriptionDateTitle(selectedInvestigationDate) === 'Today' && (
                        <div style={PatientStyles.imageUploaderContainer}>
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
                                    <div style={PatientStyles.imageUploaderWrapper}>
                                        {/* single image preview area (show latest image if any) */}
                                        <div
                                            style={PatientStyles.imagePreviewArea}
                                            onClick={onImageUpload}
                                            {...dragProps}
                                        >
                                            {imageList.length > 0 ? (
                                                <img
                                                    src={imageList[imageList.length - 1].data_url}
                                                    alt="preview"
                                                    style={PatientStyles.imagePreview}
                                                />
                                            ) : (
                                                <div style={PatientStyles.imageDropText}>Click or drop an image here</div>
                                            )}
                                        </div>
                                        {/* thumbnails + actions */}
                                        <div style={PatientStyles.thumbnailContainer}>
                                            {imageList.map((image, index) => (
                                                <div
                                                    key={index}
                                                    style={PatientStyles.thumbnail}
                                                >
                                                    <img src={image.data_url} alt="" style={PatientStyles.thumbnailImg} />
                                                    <div style={PatientStyles.thumbnailActions}>
                                                        <div style={PatientStyles.thumbnailDate}>{new Date().toLocaleDateString()}</div>
                                                        <div style={PatientStyles.thumbnailButtons}>
                                                            <button
                                                                onClick={() => onImageUpdate(index)}
                                                                title="Edit"
                                                                style={PatientStyles.editIconButton}
                                                            >
                                                                ✎
                                                            </button>
                                                            <button
                                                                onClick={() => onImageRemove(index)}
                                                                title="Remove"
                                                                style={PatientStyles.deleteIconButton}
                                                            >
                                                                🗑
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* control row */}
                                        <div style={PatientStyles.imageUploaderControls}>
                                            <button
                                                onClick={onImageUpload}
                                                style={{
                                                    ...PatientStyles.uploadButton,
                                                    background: isDragging ? '#e6f0ff' : '#fff',
                                                }}
                                            >
                                                Upload
                                            </button>

                                            <button
                                                onClick={onImageRemoveAll}
                                                style={PatientStyles.removeAllButton}
                                            >
                                                Remove all
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </ImageUploading>
                        </div>
                    )}
                </div>
                {/* show investigationData entries below imaging area */}
                {Array.isArray(investigationData) && investigationData.length > 0 ? (
                    <div style={PatientStyles.marginTop20}>
                        <h3 style={PatientStyles.investigationListTitle}>Investigations</h3>
                        <div style={PatientStyles.investigationList}>
                            {investigationData.map((item, idx) => (
                                <div
                                    key={item.id || idx}
                                    style={PatientStyles.investigationItem}
                                >
                                    <div style={PatientStyles.flex1}>
                                        <div style={PatientStyles.investigationItemTitle}>
                                            {item.investigationType || 'N/A'}
                                        </div>
                                        <div style={PatientStyles.investigationItemDescription}>{item.description || 'No description'}</div>
                                        <div style={PatientStyles.investigationItemDate}>Date: {item.recordDate || item.record_date || 'N/A'}</div>
                                    </div>

                                    <div style={PatientStyles.investigationItemImageContainer}>
                                        {item.report_file_url ? (
                                            <a href={item.report_file_url} target="_blank" rel="noreferrer">
                                                <img
                                                    src={item.report_file_url}
                                                    alt="report"
                                                    style={PatientStyles.investigationItemImage}
                                                />
                                            </a>
                                        ) : (
                                            <div style={PatientStyles.noFileText}>No file</div>
                                        )}

                                        {/* <div style={{ marginTop: 8 }}>
                                                    <button
                                                        onClick={() => alert('Edit investigation: implement edit handler as needed')}
                                                        style={PatientStyles.editInvestigationButton}
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
                    <div style={PatientStyles.noDataText}>No diagnostic investigations found</div>
                )}
            </div>
        )
    };
    const renderPreviewUI = () => {
        if (!previewData) return null;

        return (
            <>
                <div style={PatientStyles.previewContainer}>
                    {/* Left Column */}
                    <div style={PatientStyles.previewLeftColumn}>
                        <div style={PatientStyles.previewRow}>
                            <span style={PatientStyles.previewLabel}>Patient Name:</span>
                            <span style={PatientStyles.previewValue}>{previewData.patient_name}</span>
                        </div>
                        <div style={PatientStyles.previewRow}>
                            <span style={PatientStyles.previewLabel}>Patient ID:</span>
                            <span style={PatientStyles.previewValue}>PA{previewData.patient_id?.toString().padStart(3, '0')}</span>
                        </div>
                        <div style={PatientStyles.previewRow}>
                            <span style={PatientStyles.previewLabel}>Package:</span>
                            <span style={PatientStyles.previewValueCapitalize}>{previewData.package}</span>
                        </div>
                        <div style={PatientStyles.previewRow}>
                            <span style={PatientStyles.previewLabel}>Mail ID:</span>
                            <span style={PatientStyles.previewValue}>{previewData.email}</span>
                        </div>
                        <div style={PatientStyles.previewRow}>
                            <span style={PatientStyles.previewLabel}>Contact No:</span>
                            <span style={PatientStyles.previewValue}>{previewData.contact_no}</span>
                        </div>
                        <div style={PatientStyles.previewRow}>
                            <span style={PatientStyles.previewLabel}>Address:</span>
                            <span style={PatientStyles.previewValue}>{previewData.address}</span>
                        </div>
                    </div>

                    {/* Blue Vertical Divider */}
                    <div style={PatientStyles.previewDivider}></div>

                    {/* Right Column */}
                    <div style={PatientStyles.previewRightColumn}>
                        <div style={PatientStyles.previewRow}>
                            <span style={PatientStyles.previewLabel}>Date:</span>
                            <span style={PatientStyles.previewValue}>{previewData.date}</span>
                        </div>
                        <div style={PatientStyles.previewRow}>
                            <span style={PatientStyles.previewLabel}>Slot time:</span>
                            <span style={PatientStyles.previewValue}>{previewData.slot_time}</span>
                        </div>
                        <div style={PatientStyles.previewRow}>
                            <span style={PatientStyles.previewLabel}>Check In:</span>
                            <span style={PatientStyles.previewValue}>{previewData.check_in}</span>
                        </div>
                        <div style={PatientStyles.previewRow}>
                            <span style={PatientStyles.previewLabel}>Checkout:</span>
                            <span style={PatientStyles.previewValue}>{previewData.check_out || '--'}</span>
                        </div>
                        <div style={PatientStyles.previewRow}>
                            <span style={PatientStyles.previewLabel}>Duration:</span>
                            <span style={PatientStyles.previewValue}>{previewData.duration === "null mins" ? '--' : previewData.duration}</span>
                        </div>
                        <div style={PatientStyles.previewRow}>
                            <span style={PatientStyles.previewLabel}>Problem:</span>
                            <span style={PatientStyles.previewValue}>{previewData.problem}</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, marginRight: 24 }}>
                    <button
                        className="pdf-btn"
                        title={'Complete'}
                        // onClick={() => exportSectionToPDF(prescriptionRef, 'Prescription.pdf')}
                        onClick={() => completeAction()}
                        style={{
                            ...PatientStyles.pdfBtn
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 24, width: 100, justifyContent: 'center' }}>
                            <div>
                                <label style={{ fontSize: 16 }}>Complete</label>
                            </div>
                        </div>
                    </button>
                </div>
            </>
        );
    };
    return (
        <div className="patient-profile">
            <Sidebar />
            {/* Patient Header */}
            <div className="main-section">
                <Header />
                <div ref={combinedRef} style={PatientStyles.relative}>
                    {' '}
                    {/* Combined ref */}
                    {/* <div className="patient-header" style={{ margin: '20px 0', padding: '10px' }}> */}
                    <div ref={headerRef} className="patient-header" style={PatientStyles.patientHeader}>
                        <div className="patient-contact">
                            <h1 style={PatientStyles.hospitalName}>Doctor Hospital</h1>
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
                            <img src={Pad} style={PatientStyles.headerPadImage} alt="patient" className="patient-avatar" />
                        </div>
                    </div>
                    {/* TAB NAV */}
                    <div style={PatientStyles.tabsContainer}>
                        {PatientTabListModel.sort((a, b) => a.index - b.index).map((tab) => {
                            const active = activeTab === tab.name;
                            if (tab.name === 'meeting process' && todaysAppointmentPackage !== 'video call') {
                                return <div key={'meeting-process-empty'}></div>;
                            }
                            if (tab.name === 'preview' && (!todaysAppointment && !previewData)) {
                                return <div key={'preview'}></div>;
                            }
                            return (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    style={{
                                        ...PatientStyles.tabButton,
                                        ...(active ? PatientStyles.activeTab : PatientStyles.inactiveTab),
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

                {activeTab === 'meeting process' && (todaysAppointmentPackage.toLowerCase() === 'video call') && (
                    renderMeetingProcessUI()
                )}
                {activeTab === 'diagnostic' && (
                    renderDiagnosticUI()
                )}
                {activeTab === 'present' && (
                    renderPresentUI()
                )}

                {activeTab === 'preview' && todaysAppointment && (
                    renderPreviewUI()
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
            <ConfirmationModal
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                isOpen={isCheckoutConfirmModalOpen}
                onClose={() => setIsCheckoutConfirmModalOpen(false)}
                onConfirm={handleConfirmCheckout}
                title="Patient checkout confirmation"
                message="Are you sure to confirm the updates?"
            />
        </div >
    );
}
