// frontend/src/servicios/areas.servicio.js
import api from './api';

/**
 * Obtiene una lista de todas las áreas.
 * (Requiere estar logueado como ADMIN)
 */
export const getAreas = async () => {
  try {
    const { data } = await api.get('/areas');
    return data;
  } catch (error) {
    console.error("Error al obtener áreas:", error);
    throw new Error(error.response.data.error || 'Error al cargar áreas');
  }
};
