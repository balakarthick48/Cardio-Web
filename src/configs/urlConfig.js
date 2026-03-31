import API_BASE_URL from '../config';

// Enum-like object for all API endpoints
export const URLConfigEnum = Object.freeze({
  APPOINTMENT_HISTORY: 'APPOINTMENT_HISTORY',
  PATIENT_VITAL_SIGNS: 'PATIENT_VITAL_SIGNS',
  PATIENT_VITAL_SIGNS_UPDATE: 'PATIENT_VITAL_SIGNS_UPDATE',
  PATIENT_PREVIEW: 'PATIENT_PREVIEW',
  COMPLETE_APPOINTMENT: 'COMPLETE_APPOINTMENT',
  UPDATE_PRESCRIPTIONS: 'UPDATE_PRESCRIPTIONS',
  DELETE_PRESCRIPTIONS: 'DELETE_PRESCRIPTIONS'
});

// export const CMS_API_URL = 'https://api-cms.elevartechnologies.com/api/';

// Map enum keys to relative API paths
const URL_PATHS = {
  [URLConfigEnum.APPOINTMENT_HISTORY]: 'patient/appointment-history',
  [URLConfigEnum.PATIENT_VITAL_SIGNS]: 'patient/vitals-basic-get?patientId=',
  [URLConfigEnum.PATIENT_VITAL_SIGNS_UPDATE]: 'patient/vitals-basic',
  [URLConfigEnum.PATIENT_PREVIEW]: 'patient/patient-appointment-preview',
  [URLConfigEnum.COMPLETE_APPOINTMENT]: 'patient/appointments/checkout',
  [URLConfigEnum.UPDATE_PRESCRIPTIONS]: 'patient/update-prescription',
  [URLConfigEnum.DELETE_PRESCRIPTIONS]: 'patient/delete-prescriptions'
};

// Get the full URL for a given enum key
export const getApiUrl = (key, patientId = '', aappointment_id = '') => {
  const path = URL_PATHS[key];

  if (!path) {
    throw new Error(`Unknown URL config key: ${key}`);
  }

  if (key === URLConfigEnum.PATIENT_VITAL_SIGNS && patientId) {
    return `${API_BASE_URL}${path}${patientId}`;
  } else if (key === URLConfigEnum.PATIENT_PREVIEW && aappointment_id && aappointment_id) {
    return `${API_BASE_URL}${path}?appointment_id=${aappointment_id}&patient_id=${patientId}`;
  } else {
    return `${API_BASE_URL}${path}`;
  }
};

export default URLConfigEnum;
