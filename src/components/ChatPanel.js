import React, { useState } from "react";
import '../styles/ChatPanel.css';
export default function ChatPanel({ user, onClose }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  if (!user) return null;

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { from: "me", text: message }]);
      setMessage("");
      // Here you can add logic to send the message to the user
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span>{user.name}</span>
        <button onClick={onClose} style={{ marginLeft: "auto" }}>×</button>
      </div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.from === "me" ? "my-message" : "their-message"}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your messagess"
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}