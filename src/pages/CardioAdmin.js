import React from "react";
import "../styles/CardioAdmin.css";

const CardioAdmin = () => {
  return (
    <div className="page-container visible">
      <div className="form-panel">
        <div className="form-content">
          <div className="form-logo">
            <svg className="form-heart-icon" viewBox="0 0 512 512">
              <path d="M320 32a64 64 0 0 0-64 64v16H160a32 32..." />
            </svg>
            <h2 className="form-logo-text">Cardio Admin</h2>
          </div>

          <h1>Welcome Back</h1>
          <p className="subtitle">Login to continue</p>

          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Enter email" />
          </div>

          <div className="form-group password-wrapper">
            <label>Password</label>
            <input type="password" placeholder="Enter password" />
            <span className="eye-icon">👁️</span>
          </div>

          <button className="form-btn">Login</button>
        </div>
      </div>
    </div>
  );
};

export default CardioAdmin;
