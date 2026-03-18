import API_BASE_URL from '../config';

// Enum-like object for all API endpoints
export const URLConfigEnum = Object.freeze({
  APPOINTMENT_HISTORY: 'APPOINTMENT_HISTORY',
  PATIENT_VITAL_SIGNS: 'PATIENT_VITAL_SIGNS',
  PATIENT_VITAL_SIGNS_UPDATE: 'PATIENT_VITAL_SIGNS_UPDATE',
});

export const CMS_API_URL = 'https://api-cms.elevartechnologies.com/api/';

// Map enum keys to relative API paths
const URL_PATHS = {
  [URLConfigEnum.APPOINTMENT_HISTORY]: 'patient/appointment-history',
  [URLConfigEnum.PATIENT_VITAL_SIGNS]: 'patient/vitals-basic-get?patientId=',
  [URLConfigEnum.PATIENT_VITAL_SIGNS_UPDATE]: 'patient/vitals-basic',
};

// Get the full URL for a given enum key
export const getApiUrl = (key, patientId = '') => {
  const path = URL_PATHS[key];

  if (!path) {
    throw new Error(`Unknown URL config key: ${key}`);
  }

  if (key === URLConfigEnum.PATIENT_VITAL_SIGNS && patientId) {
    return `${CMS_API_URL}${path}${patientId}`;
  } else {
    return `${CMS_API_URL}${path}`;
  }
};

export default URLConfigEnum;
