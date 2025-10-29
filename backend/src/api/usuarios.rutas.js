// backend/src/api/usuarios.rutas.js
const { Router } = require('express');
const controlador = require('../controladores/usuarios.controlador');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');

const router = Router();

// TODAS las rutas de usuarios requieren ser ADMIN
router.use(verificarToken);
router.use(verificarRol(['ADMIN']));

/**
 * GET /api/usuarios
 * Obtiene todos los usuarios.
 */
router.get('/', controlador.getUsuarios);

/**
 * POST /api/usuarios
 * Crea un nuevo usuario.
 */
router.post('/', controlador.crearUsuario);

/**
 * PUT /api/usuarios/:id
 * Actualiza un usuario existente.
 */
router.put('/:id', controlador.actualizarUsuario);

/**
 * DELETE /api/usuarios/:id
 * Elimina un usuario.
 */
router.delete('/:id', controlador.eliminarUsuario);

module.exports = router;