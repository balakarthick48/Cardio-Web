import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/CardioDoctorAuth.css";
import doctorImage from "../../assets/images/Doctor.png";
import HeartIcon from "../../assets/images/RedHeart.png";
import OtpInput from 'react-otp-input';
import API_BASE_URL from "../../config";

const AdminOtpVerification = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');  
  const [loading, setLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false); 

    const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email first.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      // let body = { email: 'svetrivel002@gmail.com' };
      const response = await fetch(`${API_BASE_URL}admin/forgetpassword-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('OTP sent to your email!');
        setShowOtpForm(true);
        // Optionally, navigate to OTP verification page
      navigate('/admin-otp', { state: { email } });
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };


  const verifyotp = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  try {
    let url= `${API_BASE_URL}admin/verify-otp`;
    // url = 'https://mocki.io/v1/a5a086db-eb2d-40e6-98af-1181da3215af'
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await response.json();
    if (response.ok) {
      alert('OTP verified!');
      localStorage.setItem('resetEmail', email);
      navigate('/admin-createpassword');
    } else {
      setError(data.message || 'Login failed');
    }
  } catch (err) {
    setError('Network error');
  }
  };
  
  return (
    <div className="login-container">
      <div className="login-left">
        <img src={doctorImage}alt="Doctor" className="doctor-img" />
      </div>
            {!showOtpForm && (
             <div className="login-right">
         <div className="login-header">
                <div className="login-logo">
                  <img src={HeartIcon} alt="Cardio Doctor Logo" className="login-heart" />
                  {/* <p className="login-logo-text">Cardio Doctor</p> */}
                </div>
        
                <h1 className="login-title">Forgot Password</h1>
                <p className="login-subtitle">Enter your email to reset your password</p>
                </div>

        <div className="form-content">
          <form onSubmit={handleForgotPassword}>
          <div className="form-group">
            <label>Email / Mobile Number</label>
            <input type="text" value={email} onChange={e => setEmail(e.target.value)} style={{width:'96%'}} placeholder="Enter Email / Mobile Number" />
          </div>

          <button className="form-btn" disabled={loading}>
            {loading ? "Sending..." : "Submit"}
          </button>
          </form>

          <button className="back-to-login" onClick={() => navigate("/adminlogin")}>
            Back to Sign In
          </button>
        </div>
      </div>
      )}
      {showOtpForm && (
      <div className="login-right">
         <div className="login-header">
                <div className="login-logo">
                  <img src={HeartIcon} alt="Cardio Doctor Logo" className="login-heart" />
                  {/* <p className="login-logo-text">Cardio Doctor</p> */}
                </div>
        
                <h1 className="login-title">OTP VERIFICATION</h1>
                <p className="login-subtitle">We've sent a verification code to your email address. Please enter it below to continue.</p>
                </div>

        <div className="form-content">
          <OtpInput
          value={otp}
          onChange={setOtp}
      numInputs={6}
      inputStyle={{
        borderRadius: "8px",
        width: "54px",
        height: "54px",
        fontSize: "14px",
        color: "#000",
        fontWeight: "400",
        caretColor: "blue"
      }}
      renderSeparator={<span style={{ width: "8px" }}> </span>}
      renderInput={(props) => <input {...props} />}
    />

          <button className="form-btn" style={{marginBottom:20, marginTop:20}} onClick={verifyotp}>
            Verify
          </button>

          <button className="back-to-login" onClick={() => navigate("/adminlogin")}>
            Back to Sign In
          </button>
        </div>
      </div>
      )}
    </div>
  );
};

export default AdminOtpVerification;
