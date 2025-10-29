// frontend/src/servicios/solicitudes.servicio.js
import api from './api'; // Importamos nuestra instancia de Axios

/**
 * Obtiene el objeto de motivos administrativos agrupados por categoría.
 */
export const getMotivosAdministrativos = async () => {
  try {
    const { data } = await api.get('/opciones/motivos');
    return data;
  } catch (error) {
    console.error("Error al obtener motivos:", error);
    throw new Error(error.response.data.error || 'Error al cargar motivos');
  }
};

/**
 * Envía una nueva solicitud de permiso al backend.
 * @param {object} datosSolicitud - Los datos del formulario.
 */
export const crearSolicitud = async (datosSolicitud) => {
  try {
    const { data } = await api.post('/solicitudes', datosSolicitud);
    return data;
  } catch (error) {
    // Re-lanzamos el error para que react-query lo capture
    console.error("Error al crear solicitud:", error.response.data.error);
    throw new Error(error.response.data.error || 'Error al crear la solicitud');
  }
};

/**
 * Obtiene todas las solicitudes del usuario autenticado.
 */
export const getMisSolicitudes = async () => {
  try {
    const { data } = await api.get('/solicitudes/mias');
    return data;
  } catch (error) {
    console.error("Error al obtener mis solicitudes:", error);
    throw new Error(error.response.data.error || 'Error al cargar solicitudes');
  }
};

/**
 * Obtiene todas las solicitudes del área del coordinador (o todas si es Admin).
 */
export const getSolicitudesPorArea = async () => {
  try {
    // Esta llamada requiere rol de COORDINADOR o ADMIN
    const { data } = await api.get('/solicitudes/area');
    return data;
  } catch (error) {
    console.error("Error al obtener solicitudes del área:", error);
    throw new Error(error.response.data.error || 'Error al cargar solicitudes');
  }
};

/**
 * Actualiza el estado de una solicitud (Aprobado/Rechazado).
 * Requiere rol de ADMIN.
 * @param {number} id - ID de la solicitud
 * @param {string} estado - 'APROBADO' o 'RECHAZADO'
 */
export const actualizarEstadoSolicitud = async ({ id, estado }) => {
  try {
    const { data } = await api.put(`/solicitudes/${id}/estado`, { estado });
    return data;
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    throw new Error(error.response.data.error || 'Error al actualizar');
  }
};