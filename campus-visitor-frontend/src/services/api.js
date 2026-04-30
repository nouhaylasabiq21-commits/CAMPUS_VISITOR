import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data) => API.post('/api/auth/login', data),
  register: (data) => API.post('/api/auth/register', data),
  me: () => API.get('/api/auth/me'),
};

// Visitors
export const visitorsAPI = {
  getAll: (search = '') => API.get(`/api/visitors?search=${search}`),
  getById: (id) => API.get(`/api/visitors/${id}`),
  create: (data) => API.post('/api/visitors', data),
  update: (id, data) => API.put(`/api/visitors/${id}`, data),
  delete: (id) => API.delete(`/api/visitors/${id}`),
};

// Hosts
export const hostsAPI = {
  getAll: (search = '') => API.get(`/api/hosts?search=${search}`),
  getById: (id) => API.get(`/api/hosts/${id}`),
  create: (data) => API.post('/api/hosts', data),
  update: (id, data) => API.put(`/api/hosts/${id}`, data),
  delete: (id) => API.delete(`/api/hosts/${id}`),
};

// Visits
export const visitsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return API.get(`/api/visits?${params}`);
  },
  getById: (id) => API.get(`/api/visits/${id}`),
  create: (data) => API.post('/api/visits', data),
  update: (id, data) => API.put(`/api/visits/${id}`, data),
  updateStatus: (id, status) => API.patch(`/api/visits/${id}/status`, { status }),
  checkIn: (id, data) => API.post(`/api/visits/${id}/check-in`, data),
  checkOut: (id, data) => API.post(`/api/visits/${id}/check-out`, data),
  getDashboardStats: () => API.get('/api/visits/dashboard/stats'),
};

// Logs
export const logsAPI = {
  getAll: () => API.get('/api/logs'),
  getByVisitId: (visit_id) => API.get(`/api/logs/${visit_id}`),
};

export default API;
