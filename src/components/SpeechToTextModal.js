import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';

const SpeechToTextModal = ({ isOpen, onClose, onTranscript, fieldName }) => {
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);
    const silenceTimerRef = useRef(null);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.warn('Speech Recognition is not supported by this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'en-US';
        recognition.interimResults = true;

        const resetSilenceTimer = () => {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
                stopListening();
            }, 3000); // 3 seconds of silence
        };

        recognition.onstart = () => {
            setListening(true);
            resetSilenceTimer();
        };

        recognition.onend = () => {
            setListening(false);
            clearTimeout(silenceTimerRef.current);
        };

        recognition.onresult = (event) => {
            resetSilenceTimer();
            // This is a more robust way to handle continuous transcription
            // by rebuilding the full transcript from the results array.
            const fullTranscript = Array.from(event.results)
                .map((result) => result[0])
                .map((result) => result.transcript)
                .join('');
            setTranscript(fullTranscript);
        };
        
        recognition.onerror = (event) => {
            // 'no-speech' and 'aborted' are common events that don't need to be shown as errors.
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                toast.error(`Speech recognition error: ${event.error}`);
            }
            console.error('Speech recognition error', event);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                // abort() is more immediate than stop() for cleanup.
                recognitionRef.current.abort();
            }
            clearTimeout(silenceTimerRef.current);
        };
    }, [stopListening]);

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                setTranscript(''); // Reset transcript on new start
                recognitionRef.current.start();
            } catch (e) {
                // This error is thrown if recognition is already active. We can safely ignore it.
                if (e.name !== 'InvalidStateError') {
                    console.error("Speech recognition couldn't be started.", e);
                    toast.error("Speech recognition could not be started. Please check browser permissions.");
                }
            }
        }
    }, []); // Empty dependency array makes this callback stable

    useEffect(() => {
        if (isOpen) {
            startListening();
        } else {
            stopListening();
        }
    }, [isOpen, startListening, stopListening]);

    const handleRetry = () => {
        if (listening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const handleDone = () => {
        onTranscript(transcript);
        // Stop listening when done is clicked to ensure cleanup
        stopListening();
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