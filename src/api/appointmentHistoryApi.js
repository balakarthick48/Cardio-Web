import { getApiUrl, URLConfigEnum } from '../configs/urlConfig';
import { AppointmentHistory } from '../models/AppointmentHistory';

export const fetchAppointmentHistory = async ({ fromDate, toDate }) => {
  const url = new URL(getApiUrl(URLConfigEnum.APPOINTMENT_HISTORY));

  if (fromDate) {
    url.searchParams.append('from_date', fromDate);
  }
  if (toDate) {
    url.searchParams.append('to_date', toDate);
  }

  console.log("Appointment hisotyr", url.toString(), fromDate, toDate)
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Failed to fetch appointment history');
  }
  console.log("Response", json.data)
  const items = Array.isArray(json.data) ? json.data : [];

  return items.map((item) => AppointmentHistory.fromApi(item));
};

