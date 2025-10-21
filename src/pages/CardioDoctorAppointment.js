import React from "react";
import "../styles/CardioDoctorAppointment.css";

const appointments = [
  {
    name: "Aarav Sharma",
    type: "Inperson",
    time: "10:00 AM",
    date: "22/08/2025",
    status: "Paid",
    avatar: "https://i.pravatar.cc/100?img=1",
  },
  {
    name: "Aniket Verma",
    type: "Video",
    time: "10:30 AM",
    date: "22/08/2025",
    status: "Pay",
    avatar: "https://i.pravatar.cc/100?img=2",
  },
  {
    name: "Manish Kumar",
    type: "Inperson",
    time: "11:00 AM",
    date: "22/08/2025",
    status: "Check-In",
    avatar: "https://i.pravatar.cc/100?img=3",
  },
  {
    name: "Arjun Mehta",
    type: "Inperson",
    time: "11:30 AM",
    date: "22/08/2025",
    status: "Progress",
    avatar: "https://i.pravatar.cc/100?img=4",
  },
  {
    name: "Neha Pillai",
    type: "Video",
    time: "12:00 PM",
    date: "22/08/2025",
    status: "Next",
    avatar: "https://i.pravatar.cc/100?img=5",
  },
  {
    name: "Vivek Mishra",
    type: "Inperson",
    time: "12:30 PM",
    date: "22/08/2025",
    status: "Check-In",
    avatar: "https://i.pravatar.cc/100?img=6",
  },
];

export default function CardioDoctorAppointment() {
  return (
    <div className="appointment-page">
      {/* Header */}
      <header className="header">
        <h2>Appointment</h2>
        <div className="header-actions">
          <input type="text" placeholder="Search" />
          <button className="icon-btn">🔔</button>
          <div className="user-profile">
            <span className="user-name">User Name</span>
            <span className="role">Admin</span>
            <div className="avatar">A</div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card blue">
          <h3>Appointments</h3>
          <p>11 Today</p>
        </div>
        <div className="stat-card green">
          <h3>Urgent</h3>
          <p>02 Today</p>
        </div>
        <div className="stat-card red">
          <h3>Cancelled</h3>
          <p>03 Today</p>
        </div>
      </div>

      <div className="content">
        {/* Left side - Appointments */}
        <div className="appointments-list">
          <h4>Today (11 Appointments)</h4>
          <div className="appointments-grid">
            {appointments.map((appt, index) => (
              <div className="appointment-card" key={index}>
                <img src={appt.avatar} alt={appt.name} />
                <h5>{appt.name}</h5>
                <span className="type">{appt.type}</span>
                <p className="time">{appt.time}</p>
                <p className="date">{appt.date}</p>
                <p className={`status ${appt.status.toLowerCase()}`}>
                  {appt.status}
                </p>
                <div className="actions">
                  <button>View Details</button>
                  <button>Check-In</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Bulk Cancellation */}
        <aside className="bulk-panel">
          <h4>Bulk Cancellation</h4>
          <div className="cc">
            <strong>CC :</strong>
            <div className="tag">Dr. Sekar M.D ✖</div>
          </div>
          <div className="to">
            <strong>To :</strong>
            {appointments.map((appt, index) => (
              <div className="tag" key={index}>
                <img src={appt.avatar} alt={appt.name} />
                {appt.name} ✖
              </div>
            ))}
          </div>
          <input
            type="text"
            className="chat-input"
            placeholder="Type your message"
          />
        </aside>
      </div>
    </div>
  );
}
