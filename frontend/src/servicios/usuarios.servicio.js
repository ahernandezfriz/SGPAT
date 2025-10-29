// frontend/src/servicios/usuarios.servicio.js
import api from './api';

/**
 * GET /api/usuarios
 * Obtiene la lista de todos los usuarios.
 */
export const getUsuarios = async () => {
  try {
    const { data } = await api.get('/usuarios');
    return data;
  } catch (error) {
    throw new Error(error.response.data.error || 'Error al cargar usuarios');
  }
};

/**
 * POST /api/usuarios
 * Crea un nuevo usuario.
 * @param {object} datosUsuario - { email, nombreCompleto, password, rol, areaId }
 */
export const crearUsuario = async (datosUsuario) => {
  try {
    const { data } = await api.post('/usuarios', datosUsuario);
    return data;
  } catch (error) {
    throw new Error(error.response.data.error || 'Error al crear usuario');
  }
};

/**
 * PUT /api/usuarios/:id
 * Actualiza un usuario existente.
 * @param {number} id - ID del usuario
 * @param {object} datosUsuario - Campos a actualizar
 */
export const actualizarUsuario = async ({ id, ...datosUsuario }) => {
  try {
    const { data } = await api.put(`/usuarios/${id}`, datosUsuario);
    return data;
  } catch (error) {
    throw new Error(error.response.data.error || 'Error al actualizar usuario');
  }
};

/**
 * DELETE /api/usuarios/:id
 * Elimina un usuario.
 * @param {number} id - ID del usuario
 */
export const eliminarUsuario = async (id) => {
  try {
    await api.delete(`/usuarios/${id}`);
  } catch (error) {
    throw new Error(error.response.data.error || 'Error al eliminar usuario');
  }
};