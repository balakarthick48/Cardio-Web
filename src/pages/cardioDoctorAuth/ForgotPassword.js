import React,{useState} from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../config";
import doctorImage from "../../assets/images/Doctor.png";
import HeartIcon from "../../assets/images/RedHeart.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');  
  const [showOtpForm, setShowOtpForm] = useState(false); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        // setShowOtpForm(true);
        // Optionally, navigate to OTP verification page
      navigate('/doctor-otp', { state: { email } });
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src={doctorImage}alt="Doctor" className="doctor-img" />
      </div>
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

          <button className="back-to-login" onClick={() => navigate("/")}>
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
