import React from 'react';
import '../styles/ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h2 className="modal-title">{title}</h2>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    <button onClick={onClose} className="modal-button cancel">
                        No
                    </button>
                    <button onClick={onConfirm} className="modal-button confirm">
                        Yes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;