import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/CardioDoctorAuth.css';
import doctorImage from '../../assets/images/Doctor.png';
import HeartIcon from '../../assets/images/RedHeart.png';
import API_BASE_URL from '../../config';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const CreatePassword = () => {
    const navigate = useNavigate();
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [newPassword, setnewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const validationSchema = Yup.object().shape({
        password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
        confirmPassword: Yup.string()
            .required('Confirm Password is required')
            .oneOf([Yup.ref('password')], 'Passwords must match')
    });
    const formOptions = { resolver: yupResolver(validationSchema) };
    // get functions to build form with useForm() hook
    const { register, handleSubmit, reset, formState } = useForm(formOptions);
    const { errors } = formState;

    // const handleSubmit = () => {
    //   if (newPass && newPass === confirmPass) {
    //     alert("Password updated successfully!");
    //     navigate("/");
    //   } else {
    //     alert("Passwords do not match");
    //   }
    // };

    const passwordSubmit = async (data) => {
        setLoading(true);
        setError('');
        const email = localStorage.getItem('resetEmail');
        try {
            let url = `${API_BASE_URL}doctor/change-password-doctor`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, newPassword: data.password, confirmPassword: data.password })
            });
            const result = await response.json();
            if (response.ok) {
                alert('Password reset successful!');
                navigate('/');
            } else {
                setError(result.message || 'Password reset failed');
            }
        } catch (err) {
            setError('Network error');
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-left">
                {/* <img src={doctorImage} alt="Doctor" className="doctor-img" /> */}
            </div>
            <div className="login-right">
                <div className="login-header">
                    <div className="login-logo">
                        <img src={HeartIcon} alt="Cardio Doctor Logo" className="login-heart" />
                        {/* <p className="login-logo-text">Cardio Doctor</p> */}
                    </div>
                 
                    <h1 className="login-title">Create New Password</h1>
                    <p className="login-subtitle">Your new password must be different</p>
                </div>
                 <form onSubmit={handleSubmit(passwordSubmit)}>
                <div className="form-content">
                    <div className="form-group">
                        <label>New Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showNew ? 'text' : 'password'}
                                // value={newPass}
                                {...register('password')}
                                onChange={(e) => setnewPassword(e.target.value)}
                                placeholder="Enter New Password"
                            />
                            <svg className="eye-icon" viewBox="0 0 24 24" onClick={() => setShowNew(!showNew)}>
                                <path d="M12 4.5c5 0 9.27 3.25 11 7.5-1.73 4.25-6 7.5-11 7.5S2.73 16.25 1 12c1.73-4.25 6-7.5 11-7.5zM12 17c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z" />
                            </svg>
                        </div>
                        <div className="invalid-feedback" style={{ color: 'red' }}>
                            {errors.password?.message}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                // value={confirmPass}
                                {...register('confirmPassword')}
                                onChange={(e) => setnewPassword(e.target.value)}
                                placeholder="Confirm Password"
                            />
                            <svg className="eye-icon" viewBox="0 0 24 24" onClick={() => setShowConfirm(!showConfirm)}>
                                <path d="M12 4.5c5 0 9.27 3.25 11 7.5-1.73 4.25-6 7.5-11 7.5S2.73 16.25 1 12c1.73-4.25 6-7.5 11-7.5zM12 17c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z" />
                            </svg>
                        </div>
                        <div className="invalid-feedback" style={{ color: 'red' }}>
                            {errors.confirmPassword?.message}
                        </div>
                    </div>

                    <button type="submit" className="form-btn" >
                        Update Password
                    </button>

                    <button className="back-to-login" onClick={() => navigate('/')}>
                        Back to Sign In
                    </button>
                </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePassword;
