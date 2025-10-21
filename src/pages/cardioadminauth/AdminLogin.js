import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import '../../styles/CardioDoctorAuth.css';
// import { useAuth } from "../../context/AuthContext";
import API_BASE_URL from '../../config';
import doctorImage from '../../assets/images/Doctor.png';
import HeartIcon from '../../assets/images/RedHeart.png';
import HeartWhite from '../../assets/images/WhiteHeart.png';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showSplash, setShowSplash] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [login,setLogin] = useState(false);   
    const [type, setType] = useState('password');
    const [loading, setLoading] = useState(false);

    // const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // let url = `${API_BASE_URL}doctor/checkCredential-doctor`;
            let url = `${API_BASE_URL}admin/checkCredential-admin`;
            // url = 'https://mocki.io/v1/a5a086db-eb2d-40e6-98af-1181da3215af'
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                // alert('Login successful!');
                // login(); // Update authentication state
                setLogin(data);
                toast.success(data.message);
                // navigate('/admindashboard'); // Redirect to dashboard
                setTimeout(() => {
                    navigate('/admindashboard'); // Redirect to dashboard after 3 seconds
                }, 2000);
            } else {
                toast.error(data.message);
                setError(data.message || 'Login failed');
            }
            console.log(data.message);
        } catch (err) {
            setError('Network error');
        }
        setLoading(false);
    };

    // Auto hide splash after 2s
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (showSplash) {
        return (
            <div className="splash-screen">
                <div className="splash-content">
                    <img src={HeartWhite} alt="Cardio Doctor Logo" className="splashscreen-logo" />
                    {/* <p className="splash-text">Cardio Doctor</p> */}
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
           {/* <ToastContainer /> */}
            {/* Left side doctor image */}
            <div className="login-left">
                <img src={doctorImage} alt="Doctor" className="doctor-img" />
            </div>

            {/* Right side form */}
            <div className="login-right">
                <div className="login-header">
                    <div className="login-logo">
                        <img src={HeartIcon} alt="Cardio Doctor Logo" className="login-heart" />
                        {/* <p className="login-logo-text">Cardio Doctor</p> */}
                    </div>

                    <h1 className="login-title">Admin Sign In</h1>
                    <p className="login-subtitle">Hi Welcome back, you've been missed</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-content">
                        <div className="form-group">
                            <label>Email / Mobile Number</label>
                            <input
                                type="email"
                                style={{ width: '96%' }}
                                placeholder="Enter Email / Mobile Number"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <svg className="eye-icon" viewBox="0 0 24 24" onClick={() => setShowPassword(!showPassword)}>
                                    <path d="M12 4.5c5 0 9.27 3.25 11 7.5-1.73 4.25-6 7.5-11 7.5S2.73 16.25 1 12c1.73-4.25 6-7.5 11-7.5zM12 17c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z" />
                                </svg>
                            </div>
                            <div className="invalid-feedback" style={{ color: 'red' }}>
                                {error}
                            </div>
                        </div>

                        <div className="form-options">
                            <div className="remember-me">
                                <input type="checkbox" id="remember" />
                                <label htmlFor="remember">Remember Me</label>
                            </div>
                            <button type="button" className="forgot-password" onClick={() => navigate('/admin-otp')}>
                                Forgot Password?
                            </button>
                        </div>

                        {/* <button className="form-btn" onClick={() => alert("Login attempted!")}> */}
                        <button className="form-btn">Sign In</button>
                    </div>
                </form>
                <div className="form-admin">
                    <button type="button" className="admin-login" onClick={() => navigate('/')}>
                        Click here to doctor login
                    </button>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
};

export default AdminLogin;
