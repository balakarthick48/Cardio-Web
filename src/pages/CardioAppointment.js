import React, { useEffect } from "react";
import "../styles/CardioAppointment.css";
import { PieChart, Pie, Legend } from "recharts";

const CardioAppointment = () => {

  useEffect(() => {
     const ctx = document.getElementById("satisfactionChart");

    if (ctx) {
      new PieChart (ctx, {
        type: "doughnut",
        data: {
          labels: ["Excellent", "Good", "Poor"],
          datasets: [
            {
              data: [75, 15, 10],
              backgroundColor: ["#28a745", "#004dff", "#dc3545"],
              hoverBackgroundColor: ["#28a745", "#004dff", "#dc3545"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "80%",
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.label || "";
                  if (label) {
                    label += ": ";
                  }
                  if (context.parsed !== null) {
                    label += context.parsed + "%";
                  }
                  return label;
                },
              },
            },
          },
        },
      });
    }
  }, []);

  return (
    <div className="dashboard-container">
      {/* === Sidebar === */}
      <aside className="sidebar">
        <div>
          <div className="logo">
            <i className="fas fa-heartbeat icon"></i>
            <h1 className="title">Cardio Doctor</h1>
          </div>
          <nav>
            <ul>
              <li>
                <a href="Cardio Doctor Dashboard.html">
                  <i className="fas fa-home icon"></i> Dashboard
                </a>
              </li>
              <li>
                <a href="CardioAppointment.html" className="active">
                  <i className="fas fa-notes-medical icon"></i> Appointment
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fas fa-hospital-user icon"></i> Patients
                </a>
              </li>
              <li>
                <a href="CardioFinance Dashboard.html">
                  <i className="fas fa-money-bill-wave icon"></i> Financial
                </a>
              </li>
              <li>
                <a href="settingspage.html">
                  <i className="fas fa-cog icon"></i> Settings
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <a href="cardio.html" className="logout-link">
          <i className="fas fa-sign-out-alt icon"></i>
          <span>Logout</span>
        </a>
      </aside>

      {/* === Main Content === */}
      <main className="main-content">
        {/* Left Column */}
        <div className="left-column">
          <header className="main-header">
            <h1>Appointment</h1>
            <div className="header-controls">
              <div className="search-bar">
                <i className="fas fa-search"></i>
                <input type="text" placeholder="Search" />
              </div>
              <i className="fas fa-bell notification-icon"></i>
              <img
                className="profile-image"
                src="7f6af534e736111a3e9452df8ee383550d4329de.png"
                alt="Profile"
              />
            </div>
          </header>

          {/* Summary Cards */}
          <div className="summary-cards-container">
            <div className="summary-card appointments">
              <div className="icon-circle">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <div className="details">
                <p className="label">Appointments</p>
                <h4 className="value">
                  11 <span className="trend-indicator">Today</span>
                </h4>
              </div>
            </div>
            <div className="summary-card urgent">
              <div className="icon-circle">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="details">
                <p className="label">Urgent</p>
                <h4 className="value">
                  02 <span className="trend-indicator">Today</span>
                </h4>
              </div>
            </div>
            <div className="summary-card canceled">
              <div className="icon-circle">
                <i className="fas fa-times"></i>
              </div>
              <div className="details">
                <p className="label">Canceled</p>
                <h4 className="value">
                  03 <span className="trend-indicator">Today</span>
                </h4>
              </div>
            </div>
          </div>

          {/* Appointment List Header */}
          <div className="appointment-list-header">
            <h3>
              Today <span>(11 Appointments)</span>
            </h3>
            <div className="controls">
              <i className="fas fa-calendar-alt calendar-icon"></i>
              <select>
                <option>August</option>
                <option>September</option>
              </select>
              <select>
                <option>Tomorrow</option>
                <option>Today</option>
              </select>
              <div className="layout-icons">
                <i className="fas fa-th active"></i>
                <i className="fas fa-list"></i>
              </div>
            </div>
          </div>

          {/* Appointment Grid */}
          <div className="appointment-grid">
            {[...Array(6)].map((_, idx) => (
              <div className="appointment-card" key={idx}>
                <div className="patient-info">
                  <img
                    className="avatar"
                    src="https://i.ibb.co/P4v9d15/peter-thomas.png"
                    alt="Patient"
                  />
                  <div className="details">
                    <h4>Peter Thomas</h4>
                    <p>Experties</p>
                  </div>
                  <div className="type-tag">
                    <i className="fas fa-user-tag"></i>
                  </div>
                </div>
                <div className="details-row">
                  <span>10:00 AM</span>
                  <span>22/08/2025</span>
                </div>
                <div className="details-row">
                  <a href="#" className="view-details-button">
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <div className="doctor-card">
            <img
              className="doctor-image"
              src="7f6af534e736111a3e9452df8ee383550d4329de.png"
              alt="Doctor"
            />
            <h4 className="name">Dr. Sekar M.D</h4>
            <p className="specialty">Cardiologist</p>
            <div className="doctor-stats">
              <div className="stat">
                <h4>4250</h4>
                <p>Appointments</p>
              </div>
              <div className="stat">
                <h4>1.2K</h4>
                <p>Total Patients</p>
              </div>
              <div className="stat">
                <h4>4.2</h4>
                <p>Rating</p>
              </div>
            </div>
          </div>

          <div className="upcoming-appointments-card">
            <h3>Upcoming Appointments</h3>
            <p>August 20, 2025</p>
            <ul className="appointment-list">
              <li className="appointment-item">
                <span className="time">8:30 PM - 9:00 PM</span>
                <div className="patient-info">
                  <p className="name">Aanand K.</p>
                  <p className="description">
                    Experiences shortness of breath & chest discomfort during
                    mild activity.
                  </p>
                </div>
              </li>
              <li className="appointment-item">
                <span className="time">9:00 PM - 9:30 PM</span>
                <div className="patient-info">
                  <p className="name">Aanand K.</p>
                  <p className="description">
                    Experiences shortness of breath & chest discomfort during
                    mild activity.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="patient-satisfaction-card">
            <h3>Patient Satisfaction</h3>
            <div className="satisfaction-content">
              <div className="satisfaction-chart-container">
                <canvas id="satisfactionChart" className="satisfaction-chart"></canvas>
                <div className="total-value-overlay">
                  <p>Total</p>
                  <h4>45,250</h4>
                </div>
              </div>
              <ul className="satisfaction-legend">
                <li className="excellent">Excellent</li>
                <li className="good">Good</li>
                <li className="poor">Poor</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CardioAppointment;
