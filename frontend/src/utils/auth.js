const API_URL = 'http://localhost:5000';
const STORAGE_KEY = 'queueCureDoctorSession';

export const getDoctorSession = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
};

export const saveDoctorSession = (session) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const clearDoctorSession = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const authHeaders = () => {
  const session = getDoctorSession();
  return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
};

export const authRequest = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

export const logoutDoctor = async () => {
  try {
    await authRequest('/api/auth/logout', { method: 'POST' });
  } finally {
    clearDoctorSession();
  }
};

export const fetchDoctors = async () => {
  const response = await fetch(`${API_URL}/api/doctors`);
  if (!response.ok) {
    throw new Error('Unable to load doctors');
  }
  return response.json();
};
