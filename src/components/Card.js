import React, { useState } from 'react';
import Vector from '../assets/images/Vector.png';
import Vector1 from '../assets/images/Vector1.png';
import Vector2 from '../assets/images/Vector2.png';
import ZoomMeeting from './ZoomMeeting';

export default function Card({
    avatar,
    name,
    time,
    date,
    type,
    status,
    checkin,
    icons,
    onClick,
    onDetailsClick,
    onAvatarClick,
    meetingid,
    meetingurl
}) {
    const [selectedCard, setSelectedCard] = useState(null);
    const [showMeeting, setShowMeeting] = useState(false);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'accept':
                return 'green';
            case 'cancel':
                return 'red';
            case 'reschedule':
                return 'yellow';
            default:
                return '#2196f3';
        }
    };

    const extractMeetingNumber = (url) => {
        if (!url) return null;
        // common patterns: /j/123456789 or zoom.us/wc/join/123456 or ?pwd=...
        const m1 = url.match(/\/j\/(\d{8,12})/);
        if (m1) return m1[1];
        const m2 = url.match(/[?&]meetingId=(\d{8,12})/);
        if (m2) return m2[1];
        const m3 = url.match(/\/wc\/join\/(\d{8,12})/);
        if (m3) return m3[1];
        // fallback: digits in url
        const digits = url.match(/(\d{8,12})/);
        return digits ? digits[1] : null;
    };

    const meetingNumber = extractMeetingNumber(meetingurl);

    return (
        <div
            className="appointment-card"
            onClick={onClick}
            style={{
                border: '2px solid #2196f3',
                borderRadius: 10,
                padding: 18,
                background: '#fff',
                minWidth: 260,
                maxWidth: 320,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: 210
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ marginRight: 14, cursor: 'pointer' }} onClick={onAvatarClick}>
                    {avatar}
                </div>
                <div>
                    <h4 style={{ margin: 0, fontWeight: 600, fontSize: 18 }}>{name}</h4>
                    <div style={{ color: '#888', fontSize: 14 }}>{type}</div>
                    <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
                        {/* Status icons */}
                        {icons.map((icon, idx) => (
                            <img key={idx} src={icon} alt="icon" style={{ width: 20, height: 20 }} />
                        ))}
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }}>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{time}</div>
                <div style={{ color: '#888', fontSize: 15 }}>{date}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, justifyContent: 'space-between' }}>
                {/* <div style={{ fontSize: 22, fontWeight: 700 }}>{time}</div> */}
                <div></div>
                <div style={{ color: '#2196f3', fontSize: 15 }}>{checkin}</div>
            </div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #eee',
                    paddingTop: 8
                }}
            >
                <span style={{ color: getStatusColor(status), fontWeight: 500 }}>{status}</span>
                <a
                    href={meetingurl}
                    target="_blank"
                    style={{
                        color: '#8ec71bff',
                        fontWeight: 500,
                        display: type === 'video call' ? 'flex' : 'none',
                        textDecoration: 'none'
                    }}
                >
                    {type}
                </a>
                {/* <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (type === 'video call' && meetingurl) {
                            setShowMeeting(true);
                        } else if (meetingurl) {
                            // if non-video link, open in new tab
                            window.open(meetingurl, '_blank');
                        }
                    }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#8ec71bff',
                        fontWeight: 500,
                        display: type === 'video call' ? 'flex' : (meetingurl ? 'flex' : 'none'),
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    {type}
                </button> */}
                <a
                    href="#"
                    style={{ color: '#2196f3', fontWeight: 500, textDecoration: 'none' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (typeof onDetailsClick === 'function') onDetailsClick();
                    }}
                >
                    {status === 'Check-In' ? 'Check-In' : 'View Details'}
                </a>
            </div>
            {/* Zoom meeting modal */}
            {/* {showMeeting && (
                <ZoomMeeting
                    meetingNumber={meetingNumber}
                    meetingUrl={meetingurl}
                    userName={name || 'Guest'}
                    onClose={() => setShowMeeting(false)}
                />
            )} */}
        </div>
    );
}
