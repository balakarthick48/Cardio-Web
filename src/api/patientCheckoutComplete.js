import { getApiUrl, URLConfigEnum } from '../configs/urlConfig';

export const setCompleteAppointment = async (appointmentId, patientId) => {
    const url = new URL(getApiUrl(URLConfigEnum.COMPLETE_APPOINTMENT));
    const body = {
        appointment_id: appointmentId,
        patientId: patientId
    }
    console.log("Fetching URL", url.toString(), "\nbody\n:", body)
    const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    const json = await response.json();
    console.log("Response", response);
    console.log("json", json);
    if (!response.ok && json.success !== 'ok') {
        throw new Error(json.message || 'Failed to fetch complete the appointment');
    }
    return json.status;
}