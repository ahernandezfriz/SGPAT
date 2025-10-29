// frontend/src/servicios/api.js
import axios from 'axios';

// Creamos una instancia de Axios
const api = axios.create({
  // La URL base de nuestro backend (que corre en el puerto 4000)
  baseURL: 'http://localhost:4000/api',
});

/*
  Esta función es un interceptor que adjuntará el token JWT
  a CADA solicitud saliente si es que existe en localStorage.
*/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Configuramos el header 'Authorization'
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;