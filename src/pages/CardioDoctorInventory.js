import React from "react";
import "../styles/CardioDoctorInventory.css";

const CardioDoctorInventory = () => {
  return (
    <div className="main-content-container">
      <div className="main-header">
        <h1>Inventory</h1>
        <div className="user-profile">
          <span className="user-info">
            <span className="name">Dr. Smith</span>
            <span className="role">Cardiologist</span>
          </span>
          <img
            src="https://via.placeholder.com/50"
            alt="Doctor"
            className="user-avatar"
          />
        </div>
      </div>
      <div className="content-section">
        <div className="content-section-header">
          <h2>Equipment</h2>
        </div>
        <div className="stock-cards-grid">
          <div className="stock-card">
            <div className="card-image">
              <img
                src="https://via.placeholder.com/100"
                alt="ECG Machine"
              />
            </div>
            <div className="card-details">
              <h3>ECG Machine</h3>
              <h4>Available</h4>
              <p>Last Checked: 2 days ago</p>
            </div>


            <div className="card-details">
              <h3>ECG Machine</h3>
              <h4>Available</h4>
              <p>Last Checked: 2 days ago</p>
            </div>
            <div className="card-details">
              <h3>ECG Machine</h3>
              <h4>Available</h4>
              <p>Last Checked: 3 days ago</p>
            </div>
            <div className="card-details">
              <h3>ECG Machine</h3>
              <h4>Available</h4>
              <p>Last Checked:  days ago</p>
            </div><div className="card-details">
              <h3>ECG Machine</h3>
              <h4>Available</h4>
              <p>Last Checked: 2 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardioDoctorInventory;
