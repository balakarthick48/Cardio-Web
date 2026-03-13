// import React, { useEffect, useRef } from 'react';
// import ZoomMtgEmbedded from '@zoom/meetingsdk/embedded';

// const client = ZoomMtgEmbedded.createClient();

// export default function ZoomMeeting({ meetingNumber, meetingUrl, userName = 'Guest', onClose }) {
//     const rootRef = useRef(null);

//     useEffect(() => {
//         if (!rootRef.current) return;
//         const meetingSDKElement = rootRef.current;
//         client.init({
//             debug: false,
//             rootElement: meetingSDKElement,
//             language: 'en-US'
//         });

//         let cancelled = false;

//         async function joinMeeting() {
//             try {
//                 // Call your backend to get signature + apiKey (replace endpoint as needed)
//                 const q = meetingNumber ? `?meetingNumber=${meetingNumber}` : `?meetingUrl=${encodeURIComponent(meetingUrl)}`;
//                 const res = await fetch(`/api/zoom/signature${q}`, { method: 'GET' });
//                 const json = await res.json();
//                 if (!res.ok) throw new Error(json.message || 'Signature fetch failed');

//                 const signature = json.signature;
//                 const sdkKey = json.apiKey || json.sdkKey; // server should return your SDK key (apiKey)
//                 const meetingNo = json.meetingNumber || meetingNumber;
//                 const password = json.password || '';

//                 if (cancelled) return;

//                 await client.join({
//                     sdkKey,
//                     signature,
//                     meetingNumber: String(meetingNo),
//                     password,
//                     userName
//                 });
//             } catch (err) {
//                 console.error('Zoom join failed', err);
//             }
//         }

//         joinMeeting();

//         return () => {
//             cancelled = true;
//             try { client.leave(); } catch (e) { /* ignore */ }
//         };
//     }, [meetingNumber, meetingUrl, userName]);

//     return (
//         <div
//             style={{
//                 position: 'fixed',
//                 inset: 0,
//                 background: 'rgba(0,0,0,0.6)',
//                 zIndex: 9999,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center'
//             }}
//             onClick={onClose}
//         >
//             <div
//                 ref={rootRef}
//                 onClick={(e) => e.stopPropagation()}
//                 style={{
//                     width: 980,
//                     height: 640,
//                     background: '#fff',
//                     borderRadius: 8,
//                     overflow: 'hidden'
//                 }}
//             />
//         </div>
//     );
// }

// ...existing code...
import React, { useEffect, useRef, useState } from 'react';

export default function ZoomMeeting({ meetingNumber, meetingUrl, userName = 'Guest', onClose }) {
    const rootRef = useRef(null);
    const [error, setError] = useState(null);
    const clientRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        let client;

        async function initAndJoin() {if (!rootRef.current) return;
            try {
                // dynamic import to avoid SSR/build issues
                const ZoomMtgEmbedded = (await import('@zoom/meetingsdk/embedded')).default;
                client = ZoomMtgEmbedded.createClient();
                clientRef.current = client;

                client.init({
                    debug: false,
                    rootElement: rootRef.current,
                    language: 'en-US'
                });

                // request signature from backend
                const q = meetingNumber ? `?meetingNumber=${meetingNumber}` : `?meetingUrl=${encodeURIComponent(meetingUrl)}`;
                const res = await fetch(`/api/zoom/signature${q}`);

                // read as text first (handles HTML/error pages), then try to parse JSON
                const text = await res.text();
                let json;
                try {
                    json = text ? JSON.parse(text) : null;
                } catch (parseErr) {
                    console.error('Signature endpoint returned non-JSON:', text);
                    const snippet = (text || '').slice(0, 400).replace(/\s+/g, ' ');
                    if (mounted) setError(`Unexpected response from signature endpoint: ${snippet}`);
                    return;
                }

                if (!res.ok) {
                    const msg = json?.message || `Signature request failed (${res.status})`;
                    console.error('Zoom signature error', json || text);
                    if (mounted) setError(msg);
                    return;
                }

                const signature = json.signature || json.sig;
                const sdkKey = json.apiKey || json.sdkKey;
                const meetingNo = String(json.meetingNumber || meetingNumber || '');
                const password = json.password || '';

                if (!signature || !sdkKey || !meetingNo) {
                    const msg = 'Invalid signature response from server (missing signature/sdkKey/meetingNumber)';
                    console.error(msg, json);
                    if (mounted) setError(msg);
                    return;
                }
                 // join meeting
                await client.join({
                    sdkKey,
                    signature,
                    meetingNumber: meetingNo,
                    password,
                    userName
                });
            } catch (err) {
                console.error('Zoom init/join failed:', err);
                const readable = err && err.message ? err.message : String(err);
                if (mounted) setError(readable);
            }
        }
        initAndJoin();

        return () => {
            mounted = false;
            try { clientRef.current?.leave(); } catch (e) { /* ignore */ }
        };
    }, [meetingNumber, meetingUrl, userName]);

    // If signature failed, provide a fallback button to open meeting URL
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: 980,
                    height: 640,
                    background: '#fff',
                    borderRadius: 8,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div style={{ padding: 8, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600 }}>Zoom Meeting</div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>Close</button>
                </div>

                <div ref={rootRef} style={{ flex: 1, minHeight: 0 }} />

                {error && (
                    <div style={{ padding: 12, borderTop: '1px solid #eee', background: '#fff6f6', color: '#b00020' }}>
                        <div style={{ marginBottom: 8, fontWeight: 600 }}>Could not start embedded meeting</div>
                        <div style={{ marginBottom: 8 }}>{error}</div>
                        {meetingUrl && (
                            <div>
                                <button
                                    onClick={() => window.open(meetingUrl, '_blank')}
                                    style={{
                                        background: '#0a66ff',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: 6,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Open meeting in new tab
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
// ...existing code...