import axios from 'axios';

// En desarrollo (Vite) /api -> http://backend:4000/api/v1
// En producción (Nginx) /api -> http://backend:4000/api/v1
// Configurar baseURL relativa para que use el proxy
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 300000, // Matching backend timeout (5 mins) for AI generation
});

// Interceptor para inyectar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globales (opcional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirado o inválido, logout forzado?
      // window.location.href = '/login'; // O usar evento custom
    }
    return Promise.reject(error);
  }
);

export default api;
