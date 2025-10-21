import React, { useState, useEffect } from "react";
import "../styles/Chat.css";
// Example avatars (replace with your actual image imports)
import Avatar1 from "../assets/images/Avatar1.png";
import Avatar2 from "../assets/images/Avatar2.png";
import Avatar3 from "../assets/images/Avatar1.png";
import Avatar4 from "../assets/images/Avatar2.png";
import Avatar5 from "../assets/images/Avatar1.png";
import DoctorAvatar from "../assets/images/Doctor.png";
import API_BASE_URL from '../config';

export default function Chat({ to, setTo }) {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [bulkcancel, setBulkCancel] = useState([]);

  const [cc, setCc] = useState([
    { id: 1, name: "Dr. Sekar M.D", email: "xyz@gmail.com", avatar: DoctorAvatar }
  ]);
  // const [to, setTo] = useState([
  //   // { id: 2, name: "Aarav Sharma", email: "aarav@gmail.com", avatar: Avatar1 },
  //   // { id: 3, name: "Vivek Mishra", email: "vivek@gmail.com", avatar: Avatar2 },
  //   // { id: 4, name: "Aniket Verma", email: "aniket@gmail.com", avatar: Avatar3 },
  //   // { id: 5, name: "Arjun Mehta", email: "arjun@gmail.com", avatar: Avatar4 },
  //   // { id: 6, name: "Neha Pillai", email: "neha@gmail.com", avatar: Avatar5 }
  // ]);
  const [message, setMessage] = useState("");

  const removeCc = (id) => setCc(cc.filter(user => user.id !== id));
  const removeTo = (id) => setTo(to.filter(user => user.id !== id));

          const handlebulkcancelappointment = async () => {
        setLoading(true);
        setError('');
        try {
           const appointmentIds = to.map(user => user.id);
           let bodyData = {  appointmentIds: appointmentIds, message: message };
           console.log('bodyData:', bodyData);
            let url = `${API_BASE_URL}admin/bulk-cancel-appointments`;
            // console.log('Fetching:', url);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });
            console.log('Response status bulk:', response.status);
            console.log('Response body bulk//:', response.body);
            const data = await response.json();
            console.log('bulkcancel response:', data);
            if (response.ok) {
                setBulkCancel(data.message);
                setTo([]); // Clear the 'to' section after success
            setMessage(""); 
            } else {
                setError(data.message || 'Failed to fetch patients detail');
            }
        } catch (err) {
            setError('Network erroaa');
        }
        setLoading(false);
    };

  const handleSend = () => {
    if (message.trim()) {
      // Send message logic here
      setMessage("");
    }
  };


    // console.log('bulkcancel&&&&', bulkcancel);

  if (loading) return <div className="chat-screen-panel">Loading...</div>;
  if (error) return <div className="chat-screen-panel">Error: {error}</div>;
  return (
    <div className="chat-screen-panel">
      {/* {bulkcancel && (
      <div className="chat-success-message" style={{color: "green", fontWeight: "bold"}}>{bulkcancel}</div>
    )}
    {error && (
      <div className="chat-error-message">{error}</div>
    )} */}
      <div className="inner-chat-panel">
        <div style={{ fontWeight: 500, marginBottom: 8 }}>CC :</div>
        {cc.map(user => (
          <div key={user.id} className="chat-user-row cc-row">
            <img src={user.avatar} alt={user.name} className="chat-avatar" />
            <div className="chat-user-info">
              <div className="chat-user-name">{user.name}</div>
              <div className="chat-user-email">{user.email}{user.appointmentIds}</div>
            </div>
            <button className="chat-remove-btn" onClick={() => removeCc(user.id)}>×</button>
          </div>
        ))}
        <div style={{ fontWeight: 500, margin: "18px 0 8px 0" }}>To :</div>
        {bulkcancel && (
      <div className="chat-success-message" style={{color: "green", fontWeight: "bold"}}>{bulkcancel}</div>
    )}
    {error && (
      <div className="chat-error-message" style={{color: "red", fontWeight: "bold"}}>{error}</div>
    )}
        {to.map(user => (
          <div key={user.id} className="chat-user-row">
            <img src={user.avatar} alt={user.name} className="chat-avatar" />
            <div className="chat-user-info">
              <div className="chat-user-name">{user.name}</div>
              <div className="chat-user-email">{user.email}</div>
            </div>
            <button className="chat-remove-btn" onClick={() => removeTo(user.id)}>×</button>
          </div>
        ))}
      </div>
      <div className="chat-input chat-screen-input">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your message"
        />
        <button className="chat-send-btn" onClick={handlebulkcancelappointment}>
          <svg width="24" height="24" fill="#fff" viewBox="0 0 24 24">
            <path d="M2 21l21-9-21-9v7l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}