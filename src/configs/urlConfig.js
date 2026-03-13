import API_BASE_URL from '../config';

// Enum-like object for all API endpoints
export const URLConfigEnum = Object.freeze({
  APPOINTMENT_HISTORY: 'APPOINTMENT_HISTORY',
});

export const CMS_API_URL = 'https://api-cms.elevartechnologies.com/api/';

// Map enum keys to relative API paths
const URL_PATHS = {
  [URLConfigEnum.APPOINTMENT_HISTORY]: 'patient/appointment-history',
};

// Get the full URL for a given enum key
export const getApiUrl = (key) => {
  const path = URL_PATHS[key];

  if (!path) {
    throw new Error(`Unknown URL config key: ${key}`);
  }

  return `${CMS_API_URL}${path}`;
};

export default URLConfigEnum;
