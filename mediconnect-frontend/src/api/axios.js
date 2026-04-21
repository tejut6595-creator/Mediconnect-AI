import axios from 'axios';

// Always point to backend port 5000 explicitly
// This works whether frontend runs on 3000, 3001, 3005, etc.
const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Log errors in development
API.interceptors.response.use(
  res => res,
  err => {
    if (err.code === 'ERR_NETWORK') {
      console.error('Backend not reachable at', BACKEND_URL, '— make sure node server.js is running on port 5000');
    }
    return Promise.reject(err);
  }
);

export const doctorsAPI = {
  getAll:           (params) => API.get('/doctors', { params }),
  getById:          (id)     => API.get(`/doctors/${id}`),
  getAvailability:  (id)     => API.get(`/doctors/availability/${id}`),
};

export const appointmentsAPI = {
  book:   (data) => API.post('/appointments', data),
  getAll: ()     => API.get('/appointments'),
};

export const aiAPI = {
  analyzeSymptoms: (symptoms)  => API.post('/symptoms', { symptoms }),
  checkMedicine:   (medicines) => API.post('/medicine-check', { medicines }),
  chat:            (message)   => API.post('/chat', { message }),
};

export default API;
