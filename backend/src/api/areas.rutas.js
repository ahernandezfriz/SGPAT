// backend/src/api/areas.rutas.js
const { Router } = require('express');
const controlador = require('../controladores/areas.controlador');
const verificarToken = require('../middlewares/verificarToken');

const router = Router();

// Protegemos la ruta, solo usuarios logueados pueden ver las áreas
router.use(verificarToken);

/**
 * GET /api/areas
 * Obtiene una lista de todas las áreas.
 */
router.get('/', controlador.getAreas);

module.exports = router;