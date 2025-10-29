// backend/src/api/auth.rutas.js

const { Router } = require('express');
const controladorAuth = require('../controladores/auth.controlador');
const verificarToken = require('../middlewares/verificarToken');

const router = Router();

// Ruta pública para iniciar sesión
// POST /api/auth/login
router.post('/login', controladorAuth.login);

// Ruta protegida para obtener el perfil del usuario
// GET /api/auth/perfil
// 'verificarToken' actúa como un guardia antes de pasar al controlador.
router.get('/perfil', verificarToken, controladorAuth.getPerfil);

module.exports = router;