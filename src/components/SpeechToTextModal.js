import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';

const SpeechToTextModal = ({ isOpen, onClose, onTranscript, fieldName }) => {
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'en-US';
        recognition.interimResults = true;

        recognition.onstart = () => {
            setListening(true);
        };

        recognition.onend = () => {
            setListening(false);
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            setTranscript(prev => prev + finalTranscript);
        };
        
        recognition.onerror = (event) => {
            toast.error(`Speech recognition error: ${event.error}`);
            console.error('Speech recognition error', event);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !listening) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Speech recognition couldn't be started.", e);
                toast.error("Speech recognition could not be started. Please check browser permissions.");
            }
        }
    }, [listening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && listening) {
            recognitionRef.current.stop();
        }
    }, [listening]);

    useEffect(() => {
        if (isOpen) {
            setTranscript(''); // Reset transcript when modal opens
            startListening();
        } else {
            stopListening();
        }
    }, [isOpen, startListening, stopListening]);

    const handleRetry = () => {
        if (listening) {
            stopListening();
        } else {
            setTranscript('');
            // A small delay to allow the recognition to stop before restarting
            setTimeout(() => {
                startListening();
            }, 100);
        }
    };

    const handleDone = () => {
        onTranscript(transcript);
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    const titleize = (key = '') =>
        (key || '').replace(/([A-Z])/g, ' $1').replace(/[_\-.]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h3 style={styles.header}>Listening for "{titleize(fieldName)}"</h3>
                <div style={styles.transcriptBox}>
                    {transcript || (listening ? 'Listening...' : 'No speech detected.')}
                </div>
                <div style={styles.buttonContainer}>
                    <button onClick={onClose} style={{...styles.button, ...styles.cancelButton}}>
                        Cancel
                    </button>
                    <button onClick={handleRetry} style={{...styles.button, ...styles.retryButton}}>
                        {listening ? 'Stop' : 'Retry'}
                    </button>
                    <button
                        onClick={handleDone}
                        style={{
                            ...styles.button,
                            ...styles.doneButton,
                            ...(!transcript && styles.disabledButton),
                        }}
                        disabled={!transcript}
                    >
                        Done
                    </button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
    },
    modal: {
        background: 'white', padding: '20px', borderRadius: '8px',
        width: '90%', maxWidth: '500px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    },
    header: { marginTop: 0, color: '#333' },
    transcriptBox: {
        minHeight: '100px', border: '1px solid #ddd', borderRadius: '4px',
        padding: '10px', marginBottom: '20px', color: '#555', background: '#f9f9f9',
    },
    buttonContainer: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    button: {
        padding: '10px 20px', border: 'none', borderRadius: '4px',
        cursor: 'pointer', fontWeight: 'bold',
    },
    cancelButton: { background: '#eee', color: '#333' },
    retryButton: { background: '#ffc107', color: 'black' },
    doneButton: { background: '#0a66ff', color: 'white' },
    disabledButton: { background: '#ccc', cursor: 'not-allowed' },
};

export default SpeechToTextModal;