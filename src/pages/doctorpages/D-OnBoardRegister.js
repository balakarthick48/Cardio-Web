import React, { useState } from "react";
import "../../styles/D-Dashboard.css";
import "../../styles/D-OnBoardRegister.css";
import bgImage from "../../assets/images/BG-Login.png";
import cardioLogo from "../../assets/images/RedHeart.png";
import Sidebar from "../../components/Sidebar";
import AdminSidebar from "../../components/AdminSidebar";
import { ToastContainer, toast } from "react-toastify";
import API_BASE_URL from "../../config";

const DoctorOnBoardRegister = () => {
  const initialFormFields = {
    doctorName: "",
    phoneNumber: "",
    email: "",
    password: "",
    designation: "",
    bloodGroup: "",
    gender: "",
    dob: "",
    address: "",
    age: "",
    medicalRegistrationNumber: "",
    qualification: "",
    specialization: "",
    yearsOfExperience: "",
    currentHospital: "",
    workLocation: ""
  };

  const [formFields, setFormFields] = useState(initialFormFields);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const [files, setFiles] = useState({
    idProof: null,
    medicalLicenseCertificate: null,
    degreeCertificate: null,
    digitalSignature: null,
    profilePhoto: null,
    bankAccountDocument: null
  });

  // -------------------------- RESET FORM ------------------------
  const resetForm = () => {
    setFormFields(initialFormFields);
    setFiles({
      idProof: null,
      medicalLicenseCertificate: null,
      degreeCertificate: null,
      digitalSignature: null,
      profilePhoto: null,
      bankAccountDocument: null
    });
  };

  // -------------------- HANDLE TEXT INPUT -----------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  // -------------------- HANDLE FILE INPUT -----------------------
  const handleFileSelect = (e, field) => {
    setFiles((prev) => ({ ...prev, [field]: e.target.files[0] }));
  };

  // ------------------- VALIDATION -------------------------------
  const validateForm = () => {
    if (!formFields.doctorName || !formFields.email || !formFields.phoneNumber || !formFields.password) {
      toast.error("Please fill all required fields.");
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(formFields.email)) {
      toast.error("Invalid email format.");
      return false;
    }

    if (!/^[0-9]{10}$/.test(formFields.phoneNumber)) {
      toast.error("Phone number must be 10 digits.");
      return false;
    }

    return true;
  };

      const handleCloseModal = () => {
        setShowConfirmation(false);
        setSubmittedData(null); // Clear submitted data when closing
        // stay on same page (D-OnBoardRegister) — nothing else required
    };
    
  // ------------------ API CALL ----------------------------------
  const registerDoctor = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const fd = new FormData();

      // Append all text fields
      Object.entries(formFields).forEach(([key, value]) => {
        fd.append(key, value || "");
      });

      if (files.idProof) fd.append("idProof", files.idProof);
      if (files.medicalLicenseCertificate)
        fd.append("medicalLicenseCertificate", files.medicalLicenseCertificate);
      if (files.degreeCertificate) fd.append("degreeCertificate", files.degreeCertificate);
      if (files.digitalSignature) fd.append("digitalSignature", files.digitalSignature);
      if (files.profilePhoto) fd.append("profilePhoto", files.profilePhoto);
      if (files.bankAccountDocument) fd.append("bankAccountDocument", files.bankAccountDocument);
    console.log('Form Datacheck///:', fd);
      const response = await fetch(`${API_BASE_URL}doctor/register-doctor-form`, {
        method: "POST",
        body: fd
      });

      const data = await response.json();

      if (response.ok) {
        setSubmittedData(formFields); // Store the data before resetting
        setShowConfirmation(true);
        toast.success("Doctor registered successfully!");
        resetForm();
        setShowConfirmation(true);
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };
console.log('Form Fields:', formFields);
  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <div className="main-section">
        <h2 className="page-title">Doctor Onboard Register</h2>

        {/* ------------------------ FORM LAYOUT ------------------------- */}
        <div className="form-container">

          {/* ---------------- COLUMN 1 ---------------- */}
          <div className="form-column">
            <h3 className="section-title">Basic Information</h3>

            <label>Full Name*</label>
            <input name="doctorName" value={formFields.doctorName} onChange={handleInputChange} />

            <label>Email*</label>
            <input name="email" value={formFields.email} onChange={handleInputChange} />

            <label>Mobile Number*</label>
            <input name="phoneNumber" value={formFields.phoneNumber} onChange={handleInputChange} />

            <label>Password*</label>
            <input type="password" name="password" value={formFields.password} onChange={handleInputChange} />

            <label>Designation</label>
            <input name="designation" value={formFields.designation} onChange={handleInputChange} />

            <label>Blood Group</label>
            <select name="bloodGroup" value={formFields.bloodGroup} onChange={handleInputChange}>
              <option value="">Select</option>
              <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
              <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
            </select>

            <label>Gender</label>
            <select name="gender" value={formFields.gender} onChange={handleInputChange}>
              <option value="">Select</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>

            <label>Date of Birth</label>
            <input type="date" name="dob" value={formFields.dob} onChange={handleInputChange} />

            <label>Age</label>
            <input type="age" name="age" value={formFields.age} onChange={handleInputChange} />
        
            <label>Address</label>
            <textarea name="address" value={formFields.address} onChange={handleInputChange} />
          </div>

          {/* ---------------- COLUMN 2 ---------------- */}
          <div className="form-column">
            <h3 className="section-title">Professional Details</h3>

            <label>Medical Registration Number</label>
            <input name="medicalRegistrationNumber" value={formFields.medicalRegistrationNumber} onChange={handleInputChange} />

            <label>Qualification</label>
            <select name="qualification" value={formFields.qualification} onChange={handleInputChange}>
              <option value="">Select</option>
              <option>MBBS</option><option>MD</option><option>PhD</option><option>Other</option>
            </select>

            <label>Specialization</label>
            <input name="specialization" value={formFields.specialization} onChange={handleInputChange} />

            <label>Years of Experience</label>
            <input name="yearsOfExperience" value={formFields.yearsOfExperience} onChange={handleInputChange} />

            <label>Current Hospital</label>
            <input name="currentHospital" value={formFields.currentHospital} onChange={handleInputChange} />

            <label>Work Location</label>
            <input name="workLocation" value={formFields.workLocation} onChange={handleInputChange} />
          </div>

          {/* ---------------- COLUMN 3 ---------------- */}
          <div className="form-column">
            <h3 className="section-title">Documents Upload</h3>

            <div className="file-row">
              <input placeholder="ID Proof" readOnly />
              <label className="upload-btn">Upload
                <input type="file" hidden onChange={(e) => handleFileSelect(e, "idProof")} />
              </label>
            </div>
            {files.idProof && <p className="file-name">{files.idProof.name}</p>}

            <div className="file-row">
              <input placeholder="Medical License Certificate" readOnly />
              <label className="upload-btn">Upload
                <input type="file" hidden onChange={(e) => handleFileSelect(e, "medicalLicenseCertificate")} />
              </label>
            </div>
            {files.medicalLicenseCertificate && <p className="file-name">{files.medicalLicenseCertificate.name}</p>}

            <div className="file-row">
              <input placeholder="Degree Certificate" readOnly />
              <label className="upload-btn">Upload
                <input type="file" hidden onChange={(e) => handleFileSelect(e, "degreeCertificate")} />
              </label>
            </div>
            {files.degreeCertificate && <p className="file-name">{files.degreeCertificate.name}</p>}

            <label>Profile Photo</label>
            <label className="upload-block">
              {files.profilePhoto ? files.profilePhoto.name : "Upload Photo"}
              <input type="file" hidden onChange={(e) => handleFileSelect(e, "profilePhoto")} />
            </label>

            <label>Digital Signature</label>
            <label className="upload-block">
              {files.digitalSignature ? files.digitalSignature.name : "Upload Signature"}
              <input type="file" hidden onChange={(e) => handleFileSelect(e, "digitalSignature")} />
            </label>

            <div className="file-row" style={{ marginTop: 20 }}>
              <input placeholder="Bank Account Document" readOnly />
              <label className="upload-btn">Upload
                <input type="file" hidden onChange={(e) => handleFileSelect(e, "bankAccountDocument")} />
              </label>
            </div>
            {files.bankAccountDocument && <p className="file-name">{files.bankAccountDocument.name}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <div className="submit-section">
          <button className="submit-btn" onClick={registerDoctor} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>

        {/* Confirmation Modal */}
        {/* {showConfirmation && (
          <div className="modal-overlay">
            <div className="modal-box">
              <button className="modal-close" onClick={() => setShowConfirmation(false)}>
                Close
              </button>

              <h2>Doctor Onboard Confirmation</h2>
              <p>Dear Dr. {formFields.doctorName},</p>
              <p>Your onboarding has been successfully completed.</p>

              <img src={cardioLogo} alt="logo" className="modal-logo" />
            </div>
          </div>
        )} */}
                        {showConfirmation && (
                            <div
                                style={{
                                    position: 'fixed',
                                    inset: 0,
                                    zIndex: 9999,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(0,0,0,0.45)'
                                }}
                            >
                                <div
                                    role="dialog"
                                    aria-modal="true"
                                    style={{
                                        width: '96%', // increased width
                                        maxWidth: 1100, // increased max width
                                        height: '92vh', // increased height
                                        borderRadius: 10,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: '0 12px 60px rgba(0,0,0,0.45)',
                                        background: 'rgba(255,255,255,0.98)' // keep content opaque
                                    }}
                                >
                                    {/* background image layer - semi transparent only for image */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            backgroundImage: `url(${bgImage})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            filter: 'blur(0px) contrast(0.95)',
                                            opacity: 0.3, // make only the background image very faint
                                            pointerEvents: 'none'
                                        }}
                                    />
        
                                    {/* main content (opaque) */}
                                    <div
                                        style={{
                                            position: 'relative',
                                            zIndex: 2,
                                            height: '100%',
                                            padding: 28,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-start',
                                            color: '#222'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={handleCloseModal}
                                                style={{
                                                    background: '#e53935',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '6px 12px',
                                                    borderRadius: 6,
                                                    cursor: 'pointer'
                                                }}
                                                aria-label="Close confirmation"
                                            >
                                                Close
                                            </button>
                                        </div>
        
                                        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginTop: 18, height: '100%' }}>
                                            <div style={{ flex: 1 }}>
                                                <h2 style={{ marginTop: 6 }}>Doctor Onboard Confirmation</h2>
                                                <div style={{ marginTop: 20, color: '#333', lineHeight: 1.6 }}>
                                                    <p>Dr. {submittedData?.doctorName},</p>
                                                    <p>
                                                        Your onboarding has been successfully completed. Welcome to our medical team — we look
                                                        forward to your valuable contributions.
                                                    </p>
                                                    <p style={{ marginTop: 18 }}>
                                                        <strong style={{ color: '#0a66ff' }}>User Name :</strong>Dr.{submittedData?.doctorName}
                                                        <br />
                                                        <strong style={{ color: '#0a66ff' }}>Password :</strong> {submittedData?.password},
                                                        <br />
                                                        <strong style={{ color: '#0a66ff' }}>Employee ID :</strong> {submittedData?.email}
                                                    </p>
                                                    <p style={{ marginTop: 8 }}>
                                                        If Change password{' '}
                                                        <a href="#" style={{ color: '#0a66ff' }}>
                                                            click here
                                                        </a>
                                                    </p>
                                                </div>
                                            </div>
        
                                            {/* empty flex spacer to keep content layout stable */}
                                            <div style={{ width: 220 }} />
                                        </div>
                                    </div>
        
                                    {/* cardio logo positioned bottom-right over the modal container */}
                                    <img
                                        src={cardioLogo}
                                        alt="cardio"
                                        style={{
                                            position: 'absolute',
                                            right: 20,
                                            bottom: 18,
                                            width: 180,
                                            height: 'auto',
                                            objectFit: 'contain',
                                            zIndex: 3,
                                            opacity: 1
                                        }}
                                    />
                                </div>
                            </div>
                        )}

        <ToastContainer />
      </div>
    </div>
  );
};

export default DoctorOnBoardRegister;
