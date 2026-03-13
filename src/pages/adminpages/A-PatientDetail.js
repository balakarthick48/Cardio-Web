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
import { useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import Appoinment from '../doctorpages/Appointment';

export default function AdminPatientDetail() {
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
     // const [activeField, setActiveField] = useState(null);
 
 //     setNewPrescription(prev => ({
 //   ...prev,
 //   [activeField]: transcript
 // }));
     ////////##############///////////
     const [text, setText] = useState('');
     const [listening, setListening] = useState(false);
     const [activeField, setActiveField] = useState(null);
 
     // Present Symptoms state
     const [selectedDate, setSelectedDate] = useState('');
     const [symptomsData, setSymptomsData] = useState(null);
     const [isEditingSymptoms, setIsEditingSymptoms] = useState(false);
     const [symptomsFormData, setSymptomsFormData] = useState([{
         chiefComplaint: '',
         onsetDurationSeverity: '',
         associatedSymptoms: '',
         consultingDoctor: '',
         aggravatingRelievingFactor: '',
         nextVisitDate: ''
     }]);
     const [isEditingInvestigation, setIsEditingInvestigation] = useState(false);
     const [investigationData, setInvestigationData] = useState(null);
     const [investigationFormData, setInvestigationFormData] = useState([{
         investigationType: '',
         description: '',
         associatedSymptoms: '',
         report_file: '',
         recordDate: '',
         report_file_url: ''
     }]);
 
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
 //comment on 15.2 (3.21am)
     // const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
 
     // const recognition = new SpeechRecognition();
     // recognition.continuous = true;
     // recognition.lang = 'en-US';
     
     // recognition.onresult = (event) => {
     //     let transcript = '';
     //     for (let i = event.resultIndex; i < event.results.length; i++) {
     //         transcript += event.results[i][0].transcript;
     //     }
     //     setText(transcript);
 
     //     // Insert recognized text into the active field
     //     if (activeField) {
     //         // For prescription fields
     //         if (activeField === 'medicineName') {
     //             setNewPrescription(prev => ({ ...prev, medicineName: transcript }));
     //         } else if (activeField === 'quantity') {
     //             setNewPrescription(prev => ({ ...prev, quantity: transcript }));
     //         } else if (activeField === 'frequency.F') {
     //             setNewPrescription(prev => ({ ...prev, frequency: { ...prev.frequency, F: transcript } }));
     //         } else if (activeField === 'frequency.A') {
     //             setNewPrescription(prev => ({ ...prev, frequency: { ...prev.frequency, A: transcript } }));
     //         } else if (activeField === 'frequency.E') {
     //             setNewPrescription(prev => ({ ...prev, frequency: { ...prev.frequency, E: transcript } }));
     //         } else if (activeField === 'frequency.N') {
     //             setNewPrescription(prev => ({ ...prev, frequency: { ...prev.frequency, N: transcript } }));
     //         }
     //         // For symptoms fields
     //         else if (activeField.startsWith('symptoms.')) {
     //             const field = activeField.replace('symptoms.', '');
     //             setSymptomsFormData(prev => ({ ...prev, [field]: transcript }));
     //         }
     //     }
     // };
 
     // const startListening = (fieldName) => {
     //     setActiveField(fieldName);
     //     setText('');
     //     recognition.start();
     //     setListening(true);
     // };
 
     // const stopListening = () => {
     //     recognition.stop();
     //     setListening(false);
     //     setActiveField(null);
     // };
 const startListening = (fieldName) => {
     setActiveField(fieldName);
     setText('');
 
     recognitionRef.current?.start();
     setListening(true);
 };
 
 const stopListening = () => {
     recognitionRef.current?.stop();
     setListening(false);
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
                 body: JSON.stringify({ patientId: patientId })
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
         } catch (err) {
             setError('Network error');
         }
         setLoading(false);
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
                 setSymptomsFormData([{
                     chiefComplaint: data.data[0].chief_complaint || '',
                     onsetDurationSeverity: data.data[0].onset_duration_severity || '',
                     associatedSymptoms: data.data[0].associated_symptoms || '',
                     consultingDoctor: data.data[0].consulting_doctor || '',
                     aggravatingRelievingFactor: data.data[0].aggravating_relief_factor || '',
                     nextVisitDate: data.data[0].next_visit_date || ''
                 }]);
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
             chief_complaint : symptomsFormData.chiefComplaint || '',
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
                 setInvestigationFormData([{
                     investigationType: data.data[0].investigationType || '',
                     description: data.data[0].description || '',
                     associatedSymptoms: data.data[0].associated_symptoms || '',
                     report_file: data.data[0].report_file || '',
                     recordDate: data.data[0].recordDate || '',
                     report_file_url: data.data[0].report_file_url || ''
                 }]);
 
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
 
 const recognitionRef = useRef(null);
 
 useEffect(() => {
     const SpeechRecognition =
         window.SpeechRecognition || window.webkitSpeechRecognition;
 
     if (!SpeechRecognition) {
         alert("Speech Recognition not supported in this browser");
         return;
     }
 
     const recognition = new SpeechRecognition();
     recognition.continuous = true;
     recognition.lang = 'en-US';
 
     recognitionRef.current = recognition;
 
     recognition.onresult = (event) => {
         let transcript = '';
 
         for (let i = event.resultIndex; i < event.results.length; i++) {
             transcript += event.results[i][0].transcript;
         }
 
         setText(transcript);
 
 //         if (!activeField) return;
 
 //         setNewPrescription(prev => {
 //             const updated = { ...prev };
 
 //             switch (activeField) {
 //                 case 'medicineName':
 //                     updated.medicineName = transcript;
 //                     break;
 
 //                 case 'quantity':
 //                     updated.quantity = transcript;
 //                     break;
 
 //                 case 'frequency.F':
 //                     updated.frequency = { ...prev.frequency, F: transcript };
 //                     break;
 
 //                 case 'frequency.A':
 //                     updated.frequency = { ...prev.frequency, A: transcript };
 //                     break;
 
 //                 case 'frequency.E':
 //                     updated.frequency = { ...prev.frequency, E: transcript };
 //                     break;
 
 //                 case 'frequency.N':
 //                     updated.frequency = { ...prev.frequency, N: transcript };
 //                     break;
 //             }
 
 //             return updated;
 //         });
 //     };
 
 //     recognitionRef.current = recognition;
 
 //     return () => {
 //         recognition.stop();
 //     };
 // }, [activeField]);
 // ✅ Insert text into selected input
         setNewPrescription(prev => {
             if (!activeField) return prev;
 
             if (activeField === "medicineName") {
                 return { ...prev, medicineName: transcript };
             }
 
             if (activeField === "quantity") {
                 return { ...prev, quantity: transcript };
             }
 
             if (activeField.startsWith("frequency.")) {
                 const key = activeField.split(".")[1];
                 return {
                     ...prev,
                     frequency: {
                         ...prev.frequency,
                         [key]: transcript
                          }
                 };
             }
 
             return prev;
         });
     };
 
 }, [activeField]);
 
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
     return (
         <div className="patient-profile">
             <AdminSidebar />
             {/* Patient Header */}
             <div className="main-section">
                 <AdminHeader />
                 <div ref={combinedRef} style={{ position: 'relative' }}>
                     {' '}
                     {/* Combined ref */}
                     {/* <div className="patient-header" style={{ margin: '20px 0', padding: '10px' }}> */}
                     <div ref={headerRef} className="patient-header" style={{ margin: '8px 0 18px', padding: '14px 10px' }}>
                         <div className="patient-contact">
                             <h1 style={{ color: '#2563eb' }}>Doctor Hospital</h1>
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
                             <img src={Pad} style={{ marginLeft: '20px' }} alt="patient" className="patient-avatar" />
                         </div>
                     </div>
                     {/* TAB NAV */}
                     <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '18px 0' }}>
                         {['profile', 'vital', 'family history', 'prescription', 'present', 'meeting process', 'diagnostic'].map((t) => {
                             const label =
                                 t === 'profile'
                                     ? 'Profile'
                                     : t === 'vital'
                                       ? 'Vital Signs'
                                       : t === 'family history'
                                         ? 'Family Medical History'
                                         : t === 'prescription'
                                           ? 'Prescription'
                                           : t === 'present'
                                             ? 'Present Symptoms'
                                             : t === 'meeting process'
                                                 ? 'Meeting Process'
                                             : 'Diagnostic Investigation';
                             const active = activeTab === t;
                             return (
                                 <button
                                     key={t}
                                     onClick={() => setActiveTab(t)}
                                     style={{
                                         padding: '8px 14px',
                                         borderRadius: 6,
                                         border: active ? 'none' : '1px solid #dfe7ff',
                                         background: active ? '#0a66ff' : '#fff',
                                         color: active ? '#fff' : '#333',
                                         cursor: 'pointer',
                                         display: isExportingPDF ? 'none' : 'inline-block', // hide during PDF export
                                         boxShadow: active ? '0 2px 6px rgba(10,102,255,0.15)' : 'none'
                                     }}
                                 >
                                     {label}
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
                     {activeTab === 'profile' && (
                         <div
                             className="patient-section"
                             style={{ display: 'flex', justifyContent: 'center', paddingTop: 6 }}
                             ref={profileRef}
                         >
                             <div
                                 style={{
                                     position: 'relative', // needed so pdf button can be absolutely positioned
                                     width: 760,
                                     background: '#fff',
                                     borderRadius: 8,
                                     boxShadow: '0 6px 18px rgba(11,45,90,0.06)',
                                     padding: 22,
                                     border: '1px solid rgba(10,102,255,0.06)'
                                 }}
                             >
                                 {/* PDF download button (hidden while generating PDF) */}
                                 <button
                                     className="pdf-btn"
                                     title="Download profile as PDF"
                                     // onClick={() => exportSectionToPDF(combinedRef, 'Profile.pdf')}
                                     onClick={() => exportHeaderAndSection(profileRef, 'Profile.pdf')}
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
                                 <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                     <div
                                         style={{
                                             flex: '0 0 96px',
                                             display: 'flex',
                                             justifyContent: 'flex-start',
                                             alignItems: 'flex-start'
                                         }}
                                     >
                                         <img
                                             src={patients[0]?.avatar || 'https://i.ibb.co/2cX0dQr/avatar.png'}
                                             alt="avatar"
                                             style={{
                                                 width: 96,
                                                 height: 96,
                                                 borderRadius: '50%',
                                                 marginBottom: '100px',
                                                 border: '4px solid #f3f7ff'
                                             }}
                                         />
                                     </div>
 
                                     <div style={{ flex: 1 }}>
                                         <div
                                             style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}
                                         >
                                             <div>
                                                 <h2 style={{ margin: 0, fontSize: 22, color: '#111', fontWeight: 700 }}>
                                                     {name || 'Peter Thomas'}
                                                 </h2>
                                                 <div style={{ color: '#7a869a', marginTop: 6, fontSize: 14 }}>
                                                     {patients[0]?.applyMode || 'Inperson'}
                                                 </div>
                                                 <div style={{ marginTop: 8 }}>
                                                     <a style={{ color: '#0a66ff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                                                         [{patients[0]?.patientCode || 'DRS25154'}]
                                                     </a>
                                                 </div>
                                             </div>
                                             {/* optional small logo on the right if needed */}
                                             <div style={{ flex: '0 0 120px', textAlign: 'right' }} />
                                         </div>
 
                                         <hr style={{ border: 'none', borderTop: '2px solid #000000', margin: '16px 0' }} />
 
                                         <div style={{ display: 'flex', gap: 30, color: '#444', fontSize: 14 }}>
                                             <div style={{ flex: 1 }}>
                                                 <div style={{ marginBottom: 8, fontWeight: 400 }}>
                                                     Email ID : {email || 'xyz@gmail.com'}
                                                 </div>
                                                 {/* <div style={{ marginBottom: 8 }}>{patients[0]?.email || 'xyz@gmail.com'}</div> */}
                                                 <div style={{ marginBottom: 8, fontWeight: 400 }}>
                                                     Contact Number : {mobile || '+91 98567 56421'}
                                                 </div>
                                                 {/* <div style={{ marginBottom: 8 }}>{patients[0]?.mobileNumber || '+91 98567 56421'}</div> */}
                                                 <div style={{ marginBottom: 8, fontWeight: 400 }}>Address : {address}</div>
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
                     )}
                 </div>
                 {/* Vital Signs + Basic Data */}
                 {activeTab === 'vital' && (
                     <div>
                         <div className="patient-section grid-2" ref={vitalRef} style={{ position: 'relative' }}>
                             <button
                                 className="pdf-btn"
                                 title="Download vital as PDF"
                                 // onClick={() => exportSectionToPDF(vitalRef, 'vital.pdf')}
                                 onClick={() => exportHeaderAndSection(vitalRef, 'VitalSigns.pdf')}
                                 style={{
                                     position: 'absolute',
 
                                     border: 'none',
 
                                     padding: '6px 8px',
                                     borderRadius: 4,
                                     cursor: 'pointer',
                                     boxShadow: '0 2px 6px rgba(10,102,255,0.15)'
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
                                                 onChange={e => setVitalSigns(prev => ({ ...prev, heartRate: e.target.value }))}
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
                                                 onChange={e => setVitalSigns(prev => ({ ...prev, bloodPressure: { ...prev.bloodPressure, systolic: e.target.value } }))}
                                                 style={{ width: 40 }}
                                             />
                                             /
                                             <input
                                                 value={vitalSigns.bloodPressure.diastolic}
                                                 onChange={e => setVitalSigns(prev => ({ ...prev, bloodPressure: { ...prev.bloodPressure, diastolic: e.target.value } }))}
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
                                                 onChange={e => setVitalSigns(prev => ({ ...prev, respiratoryRate: e.target.value }))}
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
                                 <p>
                                     Age :{' '}
                                     {basicediting.section === 'basic' && basicediting.field === 'age' ? (
                                         <>
                                             <input
                                                 value={basicData.age}
                                                 onChange={e => setBasicData(prev => ({ ...prev, age: e.target.value }))}
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
                                                 onChange={e => setBasicData(prev => ({ ...prev, height: e.target.value }))}
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
                                                 onChange={e => setBasicData(prev => ({ ...prev, weight: e.target.value }))}
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
                                                 onChange={e => setBasicData(prev => ({ ...prev, bmi: e.target.value }))}
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
                                 <button className="done-btn" onClick={getInsertVitalSigns}>Done</button>
                             </div>
                             
                         </div>
                            <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}>
                                 <div style={{
                                     display: 'flex',
                                     gap: 24,
                                     flexWrap: 'wrap',
                                     width: '100%',
                                     maxWidth: 1200
                                 }}>
                                     <div style={{
                                         border: '1px solid #e0e0e0',
                                         borderRadius: 8,
                                         background: '#fff',
                                         boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                         padding: 24,
                                         minWidth: 320,
                                         flex: '1 1 320px',
                                         maxWidth: 400
                                     }}>
                                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                             <span style={{ color: '#1976d2', fontWeight: 600, fontSize: 16 }}>Vital Signs :</span>
                                             <span style={{ color: '#1976d2', fontWeight: 600, fontSize: 16 }}>Basic Data :</span>
                                         </div>
                                         <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
                                             <div style={{ flex: 1 }}>
                                                 <div style={{ marginBottom: 8, color: '#333' }}>Temperature : <span style={{ color: '#1976d2' }}>{vitalSignsData[0]?.temperature} ℃</span></div>
                                                 <div style={{ marginBottom: 8, color: '#333' }}>Heart Rate : <span style={{ color: '#1976d2' }}>{vitalSignsData[0]?.heartRate} bpm</span></div>
                                                 <div style={{ marginBottom: 8, color: '#333' }}>Blood Pressure : <span style={{ color: '#1976d2' }}>{vitalSignsData[0]?.bloodPressure} mmHg</span></div>
                                                 <div style={{ marginBottom: 8, color: '#333' }}>Respiratory Rate : <span style={{ color: '#1976d2' }}>{vitalSignsData[0]?.respiratoryRate} per minute</span></div>
                                             </div>
                                             <div style={{ flex: 1 }}>
                                                 <div style={{ marginBottom: 8, color: '#333' }}>Age : <span style={{ color: '#1976d2', fontWeight: 600 }}>{vitalSignsData[0]?.age} Years</span></div>
                                                 <div style={{ marginBottom: 8, color: '#333' }}>Height : <span style={{ color: '#1976d2' }}>{vitalSignsData[0]?.height} CM(s)</span></div>
                                                 <div style={{ marginBottom: 8, color: '#333' }}>Weight : <span style={{ color: '#1976d2' }}>{vitalSignsData[0]?.weight} KG</span></div>
                                                 <div style={{ marginBottom: 8, color: '#333' }}>BMI : <span style={{ color: '#1976d2', fontWeight: 600 }}>{vitalSignsData[0]?.bmi}</span></div>
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
                 )}
                 {activeTab === 'family history' && (
                     <div className="patient-section" ref={familyHistoryRef} style={{ position: 'relative' }}>
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
                                 <h3 style={{ marginTop: 0, marginBottom: 20 }}>Family Medical History</h3>
                                 <table
                                     style={{
                                         width: '100%',
                                         borderCollapse: 'collapse',
                                         marginBottom: 20,
                                         border: '1px solid #e0e0e0'
                                     }}
                                 >
                                     <thead>
                                         <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                                             <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#333' }}>Conditions</th>
                                             <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#333' }}>
                                                 Family Members
                                             </th>
                                             <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#333' }}>Status</th>
                                         </tr>
                                     </thead>
                                     <tbody>
                                         {(familyHistory && familyHistory.length > 0 ? familyHistory : []).map((item, idx) => (
                                             <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                 <td style={{ padding: 12, color: '#333' }}>{item.condition_name}</td>
                                                 <td style={{ padding: 12, color: '#333' }}>{item.family_member}</td>
                                                 <td style={{ padding: 12, color: '#333' }}>{item.status}</td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
 
                                 <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-start' }}>
                                     <button
                                         onClick={() => {
                                             // Initialize edit mode with API data
                                             setFamilyHistoryData(familyHistory && familyHistory.length > 0 ? [...familyHistory] : []);
                                             setNewFamilyEntry({ condition_name: '', family_member: '', status: '' });
                                             setEditingFamilyIdx(null);
                                             setIsEditingFamilyHistory(true);
                                         }}
                                         style={{
                                             padding: '10px 24px',
                                             background: '#fff',
                                             border: '2px solid #00bcd4',
                                             color: '#00bcd4',
                                             borderRadius: 6,
                                             cursor: 'pointer',
                                             fontWeight: 600,
                                             fontSize: 14
                                         }}
                                     >
                                         Edit
                                     </button>
                                     <button
                                         style={{
                                             padding: '10px 24px',
                                             background: '#0a66ff',
                                             border: 'none',
                                             color: '#fff',
                                             borderRadius: 6,
                                             cursor: 'pointer',
                                             fontWeight: 600,
                                             fontSize: 14
                                         }}
                                     >
                                         Update
                                     </button>
                                 </div>
                             </>
                         ) : (
                             <>
                                 {/* Edit Mode - Form View */}
                                 <h3 style={{ marginTop: 0, marginBottom: 24 }}>Family Medical History</h3>
 
                                 <div
                                     style={{
                                         display: 'grid',
                                         gridTemplateColumns: '1fr 1fr 1fr',
                                         gap: 16,
                                         marginBottom: 24,
                                         padding: 20,
                                         background: '#f9f9f9',
                                         borderRadius: 8
                                     }}
                                 >
                                     {/* Conditions Input */}
                                     <div>
                                         <label
                                             style={{
                                                 display: 'block',
                                                 marginBottom: 8,
                                                 fontWeight: 500,
                                                 color: '#333',
                                                 fontSize: 14
                                             }}
                                         >
                                             Conditions
                                         </label>
                                         <input
                                             type="text"
                                             value={newFamilyEntry.condition_name}
                                             onChange={(e) => setNewFamilyEntry({ ...newFamilyEntry, condition_name: e.target.value })}
                                             placeholder="Enter Here..."
                                             style={{
                                                 width: '100%',
                                                 padding: '10px 12px',
                                                 border: '1px solid #ddd',
                                                 borderRadius: 6,
                                                 fontSize: 14,
                                                 boxSizing: 'border-box',
                                                 fontFamily: 'inherit'
                                             }}
                                         />
                                     </div>
 
                                     {/* Family Members Input */}
                                     <div>
                                         <label
                                             style={{
                                                 display: 'block',
                                                 marginBottom: 8,
                                                 fontWeight: 500,
                                                 color: '#333',
                                                 fontSize: 14
                                             }}
                                         >
                                             Family Members
                                         </label>
                                         <input
                                             type="text"
                                             value={newFamilyEntry.family_member}
                                             onChange={(e) => setNewFamilyEntry({ ...newFamilyEntry, family_member: e.target.value })}
                                             placeholder="Enter Here..."
                                             style={{
                                                 width: '100%',
                                                 padding: '10px 12px',
                                                 border: '1px solid #ddd',
                                                 borderRadius: 6,
                                                 fontSize: 14,
                                                 boxSizing: 'border-box',
                                                 fontFamily: 'inherit'
                                             }}
                                         />
                                     </div>
 
                                     {/* Status Dropdown */}
                                     <div>
                                         <label
                                             style={{
                                                 display: 'block',
                                                 marginBottom: 8,
                                                 fontWeight: 500,
                                                 color: '#333',
                                                 fontSize: 14
                                             }}
                                         >
                                             Status
                                         </label>
                                         <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                             <select
                                                 value={newFamilyEntry.status}
                                                 onChange={(e) => setNewFamilyEntry({ ...newFamilyEntry, status: e.target.value })}
                                                 style={{
                                                     padding: '10px 12px',
                                                     border: '1px solid #ddd',
                                                     borderRadius: 6,
                                                     fontSize: 14,
                                                     flex: 1,
                                                     fontFamily: 'inherit'
                                                 }}
                                             >
                                                 <option value="">Select</option>
                                                 <option value="Yes">Yes</option>
                                                 <option value="No">No</option>
                                             </select>
                                             <button
                                                 onClick={handleAddFamilyHistory}
                                                 style={{
                                                     width: 36,
                                                     height: 36,
                                                     borderRadius: '50%',
                                                     background: '#0a66ff',
                                                     border: 'none',
                                                     color: '#fff',
                                                     cursor: 'pointer',
                                                     fontSize: 18,
                                                     fontWeight: 'bold',
                                                     display: 'flex',
                                                     alignItems: 'center',
                                                     justifyContent: 'center'
                                                 }}
                                                 title={editingFamilyIdx !== null ? 'Update entry' : 'Add entry'}
                                             >
                                                 {editingFamilyIdx !== null ? '✓' : '+'}
                                             </button>
                                         </div>
                                     </div>
                                 </div>
 
                                 {/* Current Entries List */}
                                 {Array.isArray(familyHistoryData) && familyHistoryData.length > 0 && (
                                     <div style={{ marginBottom: 24 }}>
                                         <h4 style={{ marginBottom: 12, color: '#333' }}>Current Entries</h4>
                                         <table
                                             style={{
                                                 width: '100%',
                                                 borderCollapse: 'collapse',
                                                 border: '1px solid #e0e0e0'
                                             }}
                                         >
                                             <thead>
                                                 <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                                                     <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#333' }}>
                                                         Conditions
                                                     </th>
                                                     <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#333' }}>
                                                         Family Members
                                                     </th>
                                                     <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#333' }}>
                                                         Status
                                                     </th>
                                                     <th style={{ padding: 12, textAlign: 'center', fontWeight: 600, color: '#333' }}>
                                                         Actions
                                                     </th>
                                                 </tr>
                                             </thead>
                                             <tbody>
                                                 {familyHistoryData.map((item, idx) => (
                                                     <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                         <td style={{ padding: 12, color: '#333' }}>{item.condition_name}</td>
                                                         <td style={{ padding: 12, color: '#333' }}>{item.family_member}</td>
                                                         <td style={{ padding: 12, color: '#333' }}>{item.status}</td>
                                                         <td style={{ padding: 12, textAlign: 'center' }}>
                                                             <button
                                                                 onClick={() => handleEditFamilyHistory(idx)}
                                                                 style={{
                                                                     padding: '6px 12px',
                                                                     background: '#fff',
                                                                     border: '1px solid #0a66ff',
                                                                     color: '#0a66ff',
                                                                     borderRadius: 4,
                                                                     cursor: 'pointer',
                                                                     marginRight: 8,
                                                                     fontSize: 12,
                                                                     fontWeight: 500
                                                                 }}
                                                             >
                                                                 Edit
                                                             </button>
                                                             <button
                                                                 onClick={() => handleDeleteFamilyHistory(idx)}
                                                                 style={{
                                                                     padding: '6px 12px',
                                                                     background: '#fff',
                                                                     border: '1px solid #f44336',
                                                                     color: '#f44336',
                                                                     borderRadius: 4,
                                                                     cursor: 'pointer',
                                                                     fontSize: 12,
                                                                     fontWeight: 500
                                                                 }}
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
                                 <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                     <button
                                         onClick={handleCancelEditingFamilyHistory}
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
                                         onClick={insertFamilyHistory}
                                         disabled={loading}
                                         style={{
                                             padding: '12px 32px',
                                             background: '#0a66ff',
                                             border: 'none',
                                             color: '#fff',
                                             borderRadius: 6,
                                             cursor: loading ? 'not-allowed' : 'pointer',
                                             fontWeight: 600,
                                             fontSize: 14,
                                             opacity: loading ? 0.6 : 1
                                         }}
                                     >
                                         {loading ? 'Updating...' : 'Update'}
                                     </button>
                                 </div>
                             </>
                         )}
                     </div>
                 )}
                 {/* Prescription */}
                 {activeTab === 'prescription' && (
                     <div className="patient-section" ref={prescriptionRef} style={{ position: 'relative' }}>
                         <h3>Prescription</h3>
                         <button
                             className="pdf-btn"
                             title="Download Prescription as PDF"
                             // onClick={() => exportSectionToPDF(prescriptionRef, 'Prescription.pdf')}
                             onClick={() => exportHeaderAndSection(prescriptionRef, 'Prescription.pdf')}
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
                     </div>
                 )}
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
                 {activeTab === 'prescription' && (
                     <div className="patient-section" style={{ marginTop: 140 }}>
                         <h3>Add Prescription</h3>
                         <table
                             className="prescription-table"
                             style={{
                                 width: '100%',
                                 borderCollapse: 'collapse',
                                 tableLayout: 'fixed', // fixed layout prevents cells from expanding too much
                                 minWidth: 900 // ensure reasonable minimum so layout stays stable
                             }}
                         >
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
                                     <td style={{ padding: '8px' }}>
                                         <div style={{ display: 'flex', gap: 6 }}>
                                             <input
                                                 value={newPrescription.medicineName}
                                                 // value={listening && activeField === 'medicineName' ? text : newPrescription.medicineName}
                                                 onChange={(e) => handlePrescriptionChange(e, 'medicineName')}
                                                 placeholder="Medicine Name"
                                                 style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                             />
                                             <button onClick={() => startListening('medicineName')}>🎤</button>
                                         </div>
                                     </td>
                                     <td style={{ padding: '8px' }}>
                                         <div style={{ display: 'flex', gap: 6 }}>
                                             <input
                                                 value={newPrescription.quantity}
                                                 onChange={(e) => handlePrescriptionChange(e, 'quantity')}
                                                 placeholder="Quantity"
                                                 style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                             />
                                             <button onClick={() => startListening('quantity')}>🎤</button>
                                         </div>
                                     </td>
                                     <td style={{ padding: '8px' }}>
                                         <div style={{ display: 'flex', gap: 6 }}>
                                         <input
                                             value={newPrescription.frequency.F}
                                             onChange={(e) => handlePrescriptionChange(e, 'frequency', 'F')}
                                             placeholder="F"
                                             style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                         />
                                         <button onClick={() => startListening('frequency.F')} disabled={listening}>🎤</button>
                                         </div>
                                     </td>
 
                                     <td style={{ padding: '8px' }}>
                                         <div style={{ display: 'flex', gap: 6 }}>
                                         <input
                                             value={newPrescription.frequency.A}
                                             onChange={(e) => handlePrescriptionChange(e, 'frequency', 'A')}
                                             placeholder="A"
                                             style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                         />
                                         <button onClick={() => startListening('frequency.A')} disabled={listening}>🎤</button>
                                         </div>
                                     </td>
                                     <td style={{ padding: '8px' }}>
                                         <div style={{ display: 'flex', gap: 6 }}>
                                         <input
                                             value={newPrescription.frequency.E}
                                             onChange={(e) => handlePrescriptionChange(e, 'frequency', 'E')}
                                             placeholder="E"
                                             style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                         />
                                         <button onClick={() => startListening('frequency.E')} disabled={listening}>🎤</button>
                                         </div>
                                     </td>
                                     <td style={{ padding: '8px' }}>
                                         <div style={{ display: 'flex', gap: 6 }}>
                                         <input
                                             value={newPrescription.frequency.N}
                                             onChange={(e) => handlePrescriptionChange(e, 'frequency', 'N')}
                                             placeholder="N"
                                             style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                         />
                                         <button onClick={() => startListening('frequency.N')} disabled={listening}>🎤</button>
                                         </div>
                                     </td>
                                     <td style={{ padding: '8px', verticalAlign: 'middle' }}>
                                         <div style={{ display: 'flex', gap: 6 }}>
                                         <button
                                             style={{
                                                 background: '#0070f3',
                                                 color: '#fff',
                                                 borderRadius: 6,
                                                 padding: '8px 14px',
                                                 border: 'none',
                                                 cursor: 'pointer'
                                             }}
                                             onClick={handleUpdatePrescription}
                                         >
                                             {editingIdx !== null ? 'Update' : 'Add'}
                                         </button>
                                         <button
                                             onClick={stopListening}
                                             disabled={!listening}
                                             style={{
                                                 background: listening ? '#f44336' : '#ccc',
                                                 color: '#fff',
                                                 borderRadius: 6,
                                                 padding: '8px 12px',
                                                 border: 'none',
                                                 cursor: listening ? 'pointer' : 'not-allowed'
                                             }}
                                         >
                                             ⏹
                                         </button>
                                         </div>
                                     </td>
                                 </tr>
                             </tbody>
                         </table>
                         <div style={{ padding: '20px', marginTop: '20px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                     <h2 style={{ marginTop: 0, color: '#333' }}>🎤 Speech Recognition</h2>
                     
                     <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                         <button 
                             onClick={() => startListening('general')} 
                             disabled={listening}
                             style={{
                                 padding: '10px 20px',
                                 background: listening ? '#ccc' : '#0a66ff',
                                 color: '#fff',
                                 border: 'none',
                                 borderRadius: 6,
                                 cursor: listening ? 'not-allowed' : 'pointer',
                                 fontWeight: 600
                             }}
                         >
                             🎤 Start Listening
                         </button>
 
                         <button 
                             onClick={stopListening} 
                             disabled={!listening}
                             style={{
                                 padding: '10px 20px',
                                 background: listening ? '#f44336' : '#ccc',
                                 color: '#fff',
                                 border: 'none',
                                 borderRadius: 6,
                                 cursor: listening ? 'pointer' : 'not-allowed',
                                 fontWeight: 600
                             }}
                         >
                             ⏹ Stop
                         </button>
                     </div>
 
                     {listening && (
                         <div style={{ padding: 10, background: '#e3f2fd', borderRadius: 6, marginBottom: 12, color: '#1976d2', fontWeight: 500 }}>
                             🔴 Listening {activeField ? `for: ${activeField}` : '(general)'}...
                         </div>
                     )}
 
                     <div>
                         <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333' }}>Recognized Text:</label>
                         <textarea 
                             value={text} 
                             rows={4} 
                             readOnly 
                             style={{
                                 width: '100%',
                                 padding: '12px',
                                 border: '1px solid #ddd',
                                 borderRadius: 6,
                                 fontFamily: 'monospace',
                                 boxSizing: 'border-box',
                                 backgroundColor: text ? '#fff' : '#f5f5f5'
                             }}
                         />
                     </div>
                 </div>
                     </div>
                     
                 )}
                 {activeTab === 'meeting process' && (
                 <div className="patient-section" style={{ marginTop: 24 }}>
                     <h3>Meeting Process</h3>
                     <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                         <div>
                             <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Meeting ID</label>
                             <input
                                 type="text"
                                 value={meetingIdInput}
                                 onChange={(e) => setMeetingIdInput(e.target.value)}
                                 placeholder="Enter meeting ID"
                                 style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc' }}
                             />
                         </div>
                         <div>
                             <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Patient ID</label>
                             <input
                                 type="text"
                                 value={patientIdInput}
                                 onChange={(e) => setPatientIdInput(e.target.value)}
                                 placeholder="Enter patient id"
                                 style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc' }}
                             />
                         </div>
                         <div>
                             <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Language</label>
                             <select
                                 value={languageOption}
                                 onChange={(e) => setLanguageOption(e.target.value)}
                                 style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #ccc' }}
                             >
                                 <option value="en">en</option>
                                 <option value="ta">ta</option>
                             </select>
                         </div>
                         <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                             <button
                                 onClick={getMeetingProcess}
                                 disabled={loading}
                                 style={{
                                     background: '#0a66ff',
                                     color: '#fff',
                                     padding: '10px 18px',
                                     borderRadius: 6,
                                     border: 'none',
                                     cursor: loading ? 'not-allowed' : 'pointer'
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
                                 style={{
                                     background: '#fff',
                                     border: '1px solid #dfe7ff',
                                     padding: '10px 14px',
                                     borderRadius: 6,
                                     cursor: 'pointer'
                                 }}
                             >
                                 Reset
                             </button>
                         </div>
                     </div>
 
                     {error && <div style={{ color: '#b00020', marginTop: 12 }}>{error}</div>}
                     {meetingprocess && meetingprocess.data ? (
                         <div style={{ marginTop: 24 }}>
                             {/* Remedies Section */}
                             <div style={{ marginBottom: 24 }}>
                                 <h4 style={{ color: '#1976d2', marginBottom: 8 }}>Remedies</h4>
                                 {Array.isArray(meetingprocess.data.remedies) && meetingprocess.data.remedies.length > 0 ? (
                                     <ul style={{ paddingLeft: 20 }}>
                                         {meetingprocess.data.remedies.map((remedy, idx) => (
                                             <li key={idx} style={{ marginBottom: 8 }}>
                                                 <b>Medicine:</b> {remedy.medicine} <br />
                                                 <b>Dosage:</b> {remedy.dosage} <br />
                                                 <b>Purpose:</b> {remedy.purpose}
                                             </li>
                                         ))}
                                     </ul>
                                 ) : (
                                     <div style={{ color: '#888' }}>No remedies found</div>
                                 )}
                             </div>
 
                             {/* Tests Section */}
                             <div style={{ marginBottom: 24 }}>
                                 <h4 style={{ color: '#1976d2', marginBottom: 8 }}>Tests</h4>
                                 {Array.isArray(meetingprocess.data.tests) && meetingprocess.data.tests.length > 0 ? (
                                     <ul style={{ paddingLeft: 20 }}>
                                         {meetingprocess.data.tests.map((test, idx) => (
                                             <li key={idx}>{test}</li>
                                         ))}
                                     </ul>
                                 ) : (
                                     <div style={{ color: '#888' }}>No tests found</div>
                                 )}
                             </div>
 
                             {/* Follow Ups Section */}
                             <div style={{ marginBottom: 24 }}>
                                 <h4 style={{ color: '#1976d2', marginBottom: 8 }}>Follow Ups</h4>
                                 {Array.isArray(meetingprocess.data.follow_ups) && meetingprocess.data.follow_ups.length > 0 ? (
                                     <ul style={{ paddingLeft: 20 }}>
                                         {meetingprocess.data.follow_ups.map((follow, idx) => (
                                             <li key={idx}>{follow}</li>
                                         ))}
                                     </ul>
                                 ) : (
                                     <div style={{ color: '#888' }}>No follow ups found</div>
                                 )}
                             </div>
 
                             {/* Other Section */}
                             <div style={{ marginBottom: 24 }}>
                                 <h4 style={{ color: '#1976d2', marginBottom: 8 }}>Other</h4>
                                 {Array.isArray(meetingprocess.data.other) && meetingprocess.data.other.length > 0 ? (
                                     <ul style={{ paddingLeft: 20 }}>
                                         {meetingprocess.data.other.map((other, idx) => (
                                             <li key={idx}>{other}</li>
                                         ))}
                                     </ul>
                                 ) : (
                                     <div style={{ color: '#888' }}>No other notes found</div>
                                 )}
                             </div>
 
                             {/* Prescription Section */}
                             <div style={{ marginBottom: 24 }}>
                                 <h4 style={{ color: '#1976d2', marginBottom: 8 }}>Prescription</h4>
                                 {meetingprocess.data.prescription && Array.isArray(meetingprocess.data.prescription.prescription) && meetingprocess.data.prescription.prescription.length > 0 ? (
                                     <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
                                         <thead>
                                             <tr style={{ background: '#f5f5f5' }}>
                                                 <th style={{ padding: 8, border: '1px solid #e0e0e0' }}>Medicine Name</th>
                                                 <th style={{ padding: 8, border: '1px solid #e0e0e0' }}>Quantity</th>
                                                 <th style={{ padding: 8, border: '1px solid #e0e0e0' }}>Frequency</th>
                                             </tr>
                                         </thead>
                                         <tbody>
                                             {meetingprocess.data.prescription.prescription.map((item, idx) => (
                                                 <tr key={idx}>
                                                     <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>{item.medicineName}</td>
                                                     <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>{item.quantity}</td>
                                                     <td style={{ padding: 8, border: '1px solid #e0e0e0' }}>
                                                         {item.frequency && typeof item.frequency === 'object' ? (
                                                             <div>
                                                                 {Object.entries(item.frequency).map(([freqKey, freqVal]) => (
                                                                     <div key={freqKey} style={{ marginBottom: 4 }}>
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
                                     <div style={{ color: '#888' }}>No prescription found</div>
                                 )}
                             </div>
                         </div>
                     ) : (
                         <div style={{ marginTop: 24, color: '#888', textAlign: 'center', fontSize: '1.1rem', padding: '40px 0' }}>
                             No data found
                         </div>
                     )}
                 </div>
                 )}
                 {activeTab === 'diagnostic' && (
                     <div className="diagnostic-section" ref={diagnosticRef} style={{ padding: 24, position: 'relative' }}>
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
                                 {/* Investigation inputs on left side */}
                                 <div style={{ background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #e6eefc', marginBottom: 12 }}>
                                     <h4 style={{ marginTop: 0 }}>Add Investigation</h4>
                                     <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                                         <div>
                                             <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Investigation Type</label>
                                             <input
                                                 value={investigationTypeInput}
                                                 onChange={(e) => setInvestigationTypeInput(e.target.value)}
                                                 placeholder="e.g. ECG"
                                                 style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd' }}
                                             />
                                         </div>
 
                                         <div>
                                             <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Description</label>
                                             <textarea
                                                 value={investigationDescriptionInput}
                                                 onChange={(e) => setInvestigationDescriptionInput(e.target.value)}
                                                 placeholder="Short description..."
                                                 rows={3}
                                                 style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', resize: 'vertical' }}
                                             />
                                         </div>
 
                                         <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                             <button
                                                 onClick={() => { setInvestigationTypeInput(''); setInvestigationDescriptionInput(''); setImages([]); }}
                                                 style={{ background: '#fff', border: '1px solid #f0f0f0', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}
                                             >
                                                 Reset
                                             </button>
 
                                             <button
                                                 onClick={handleSubmitInvestigation}
                                                 style={{ background: '#0a66ff', color: '#fff', padding: '8px 12px', borderRadius: 6, border: 'none', cursor: 'pointer' }}
                                             >
                                                 Save
                                             </button>
                                         </div>
                                     </div>
                                 </div>
 
                                 <h4 style={{ marginTop: 0 }}>Imaging :</h4>
                                 <p style={{ color: '#666', lineHeight: 1.6 }}>A patient's chief complaint is the primary reason</p>
                             </div>
 
                             <div style={{ width: 220 }}>
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
                                                         <img src={image.data_url} alt="" style={{ width: '100%', height: 80, objectFit: 'cover' }} />
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
                               </div>
                                                     </div>
                                                 ))}
                                             </div>
 
                                             {/* control row */}
                                             <div style={{ display: 'flex', left: 10, gap: 10, alignItems: 'center' }}>
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
                                             </div>
                                         </div>
                                     )}
                                 </ImageUploading>
                             </div>
                         </div>
                         {/* show investigationData entries below imaging area */}
                         {Array.isArray(investigationData) && investigationData.length > 0 ? (
                             <div style={{ marginTop: 20 }}>
                                 <h3 style={{ marginTop: 8, marginBottom: 12, color: '#1e73ff' }}>Investigations</h3>
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                     {investigationData.map((item, idx) => (
                                         <div
                                             key={item.id || idx}
                                             style={{
                                                 display: 'flex',
                                                 gap: 12,
                                                 alignItems: 'flex-start',
                                                 padding: 12,
                                                 border: '1px solid #e0e0e0',
                                                 borderRadius: 8,
                                                 background: '#fff'
                                             }}
                                         >
                                             <div style={{ flex: 1 }}>
                                                 <div style={{ fontWeight: 700, color: '#111', fontSize: 15 }}>
                                                     {item.investigationType || 'N/A'}
                                                 </div>
                                                 <div style={{ color: '#666', marginTop: 6 }}>{item.description || 'No description'}</div>
                                                 <div style={{ marginTop: 8, color: '#444', fontSize: 13 }}>Date: {item.recordDate || item.record_date || 'N/A'}</div>
                                             </div>
 
                                             <div style={{ width: 160, textAlign: 'right' }}>
                                                 {item.report_file_url ? (
                                                     <a href={item.report_file_url} target="_blank" rel="noreferrer">
                                                         <img
                                                             src={item.report_file_url}
                                                             alt="report"
                                                             style={{ width: 140, height: 110, objectFit: 'contain', borderRadius: 6, border: '1px solid #f0f0f0' }}
                                                         />
                                                     </a>
                                                 ) : (
                                                     <div style={{ color: '#999' }}>No file</div>
                                                 )}
 
                                                 {/* <div style={{ marginTop: 8 }}>
                                                     <button
                                                         onClick={() => alert('Edit investigation: implement edit handler as needed')}
                                                         style={{
                                                             padding: '6px 10px',
                                                             background: '#0a66ff',
                                                             color: '#fff',
                                                             border: 'none',
                                                             borderRadius: 6,
                                                             cursor: 'pointer'
                                                         }}
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
                             <div style={{ marginTop: 20, color: '#888' }}>No diagnostic investigations found</div>
                         )}
                     </div>
                 )}
                 {activeTab === 'present' && (
                     <div className="patient-section" ref={presentRef} style={{ position: 'relative' }}>
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
 
                         <h3 style={{ marginTop: 0, marginBottom: 20 }}>Present Symptoms</h3>
 
                         {/* Date Picker */}
                         <div style={{ marginBottom: 24, display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                             <div style={{ flex: 1, maxWidth: 300 }}>
                                 <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#333', fontSize: 14 }}>
                                     Select Date
                                 </label>
                                 <input
                                     type="date"
                                     value={selectedDate}
                                     onChange={(e) => {
                                         setSelectedDate(e.target.value);
                                         getSymptomsData(e.target.value);
                                     }}
                                     style={{
                                         width: '100%',
                                         padding: '10px 12px',
                                         border: '1px solid #ddd',
                                         borderRadius: 6,
                                         fontSize: 14,
                                         boxSizing: 'border-box',
                                         fontFamily: 'inherit'
                                     }}
                                 />
                             </div>
                         </div>
 
                         {/* Loading State */}
                         {loading && <div style={{ padding: 12, background: '#e3f2fd', borderRadius: 6, color: '#1976d2', marginBottom: 20 }}>Loading symptoms data...</div>}
 
                         {/* Error State */}
                         {/* {error && <div style={{ padding: 12, background: '#ffebee', borderRadius: 6, color: '#c62828', marginBottom: 20 }}>{error}</div>} */}
 
                         {/* No Data State */}
                         {selectedDate && !symptomsData && !loading && (
                             <div style={{ padding: 40, textAlign: 'center', background: '#f5f5f5', borderRadius: 8, marginBottom: 20 }}>
                                 <p style={{ color: '#999', fontSize: 14 }}>No symptoms data available for the selected date</p>
                             </div>
                         )}
 
                         {/* View Mode - Display symptoms data */}
                         {symptomsData && !isEditingSymptoms && (
                             <>
                                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                                     {/* Left Column */}
                                     <div>
                                         <div style={{ marginBottom: 20 }}>
                                             <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: 4, fontSize: 14 }}>Chief Complaint</label>
                                             <p style={{ margin: 0, padding: '10px 0', color: '#666', lineHeight: 1.6 }}>
                                                 {symptomsData[0].chief_complaint || 'N/A'}
                                             </p>
                                         </div>
 
                                         <div style={{ marginBottom: 20 }}>
                                             <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: 4, fontSize: 14 }}>Onset, Duration, Severity</label>
                                             <p style={{ margin: 0, padding: '10px 0', color: '#666', lineHeight: 1.6 }}>
                                                 {symptomsData[0].onset_duration_severity || 'N/A'}
                                             </p>
                                         </div>
 
                                         <div style={{ marginBottom: 20 }}>
                                             <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: 4, fontSize: 14 }}>Associated Symptoms</label>
                                             <p style={{ margin: 0, padding: '10px 0', color: '#666', lineHeight: 1.6 }}>
                                                 {symptomsData[0].associated_symptoms || 'N/A'}
                                             </p>
                                         </div>
                                     </div>
 
                                     {/* Right Column */}
                                     <div>
                                         <div style={{ marginBottom: 20 }}>
                                             <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: 4, fontSize: 14 }}>Consulting Doctor</label>
                                             <p style={{ margin: 0, padding: '10px 0', color: '#666', lineHeight: 1.6 }}>
                                                 {symptomsData[0].consulting_doctor || 'N/A'}
                                             </p>
                                         </div>
 
                                         <div style={{ marginBottom: 20 }}>
                                             <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: 4, fontSize: 14 }}>Aggravating / Relieving Factor</label>
                                             <p style={{ margin: 0, padding: '10px 0', color: '#666', lineHeight: 1.6 }}>
                                                 {symptomsData[0].aggravating_relief_factor || 'N/A'}
                                             </p>
                                         </div>
 
                                         <div style={{ marginBottom: 20 }}>
                                             <label style={{ display: 'block', fontWeight: 600, color: '#333', marginBottom: 4, fontSize: 14 }}>Next visit Date</label>
                                             <p style={{ margin: 0, padding: '10px 0', color: '#666', lineHeight: 1.6 }}>
                                                 {symptomsData[0].next_visit_date || 'N/A'}
                                             </p>
                                         </div>
                                     </div>
                                 </div>
 
                                 <div style={{ display: 'flex', gap: 12 }}>
                                     <button
                                         onClick={() => setIsEditingSymptoms(true)}
                                         style={{
                                             padding: '10px 24px',
                                             background: '#fff',
                                             border: '2px solid #00bcd4',
                                             color: '#00bcd4',
                                             borderRadius: 6,
                                             cursor: 'pointer',
                                             fontWeight: 600,
                                             fontSize: 14
                                         }}
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
                                         <div style={{ display: 'flex', gap: 6 }}>
                                             <textarea
                                                 value={symptomsFormData.chiefComplaint}
                                                 onChange={(e) => setSymptomsFormData({ ...symptomsFormData, chiefComplaint: e.target.value })}
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
                                             {/* <button onClick={() => startListening('symptoms.chiefComplaint')} title="Speak" style={{ padding: 8, borderRadius: 6, border: 'none', background: '#0a66ff', color: '#fff', fontSize: 18, cursor: 'pointer' }}>🎤</button> */}
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
                                         <div style={{ display: 'flex', gap: 6 }}>
                                             <textarea
                                                 value={symptomsFormData.onsetDurationSeverity}
                                                 onChange={(e) => setSymptomsFormData({ ...symptomsFormData, onsetDurationSeverity: e.target.value })}
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
                                             {/* <button onClick={() => startListening('symptoms.onsetDurationSeverity')} title="Speak" style={{ padding: 8, borderRadius: 6, border: 'none', background: '#0a66ff', color: '#fff', fontSize: 18, cursor: 'pointer' }}>🎤</button> */}
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
                                         <div style={{ display: 'flex', gap: 6 }}>
                                             <textarea
                                                 value={symptomsFormData.associatedSymptoms}
                                                 onChange={(e) => setSymptomsFormData({ ...symptomsFormData, associatedSymptoms: e.target.value })}
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
                                             {/* <button onClick={() => startListening('symptoms.associatedSymptoms')} title="Speak" style={{ padding: 8, borderRadius: 6, border: 'none', background: '#0a66ff', color: '#fff', fontSize: 18, cursor: 'pointer' }}>🎤</button> */}
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
                                         <div style={{ display: 'flex', gap: 6 }}>
                                             <textarea
                                                 value={symptomsFormData.consultingDoctor}
                                                 onChange={(e) => setSymptomsFormData({ ...symptomsFormData, consultingDoctor: e.target.value })}
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
                                             {/* <button onClick={() => startListening('symptoms.consultingDoctor')} title="Speak" style={{ padding: 8, borderRadius: 6, border: 'none', background: '#0a66ff', color: '#fff', fontSize: 18, cursor: 'pointer' }}>🎤</button> */}
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
                                         <div style={{ display: 'flex', gap: 6 }}>
                                             <textarea
                                                 value={symptomsFormData.aggravatingRelievingFactor}
                                                 onChange={(e) => setSymptomsFormData({ ...symptomsFormData, aggravatingRelievingFactor: e.target.value })}
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
                                             {/* <button onClick={() => startListening('symptoms.aggravatingRelievingFactor')} title="Speak" style={{ padding: 8, borderRadius: 6, border: 'none', background: '#0a66ff', color: '#fff', fontSize: 18, cursor: 'pointer' }}>🎤</button> */}
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
                                         <div style={{ display: 'flex', gap: 6 }}>
                                             <textarea
                                                 value={symptomsFormData.nextVisitDate}
                                                 onChange={(e) => setSymptomsFormData({ ...symptomsFormData, nextVisitDate: e.target.value })}
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
                                             {/* <button onClick={() => startListening('symptoms.nextVisitDate')} title="Speak" style={{ padding: 8, borderRadius: 6, border: 'none', background: '#0a66ff', color: '#fff', fontSize: 18, cursor: 'pointer' }}>🎤</button> */}
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
                 )}
                 
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
     );
 }
 