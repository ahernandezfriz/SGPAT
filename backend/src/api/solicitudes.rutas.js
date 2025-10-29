// backend/src/api/solicitudes.rutas.js
const { Router } = require('express');
const controlador = require('../controladores/solicitudes.controlador');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');
const { validarCreacionSolicitud } = require('../middlewares/validarSolicitud');

const router = Router();

// Todas las rutas aquí están protegidas, requieren login
router.use(verificarToken);

/**
 * POST /api/solicitudes
 * Crear una nueva solicitud.
 * Protegida por token y por el validador.
 */
router.post(
  '/', 
  validarCreacionSolicitud, // Primero validamos la data
  controlador.crearSolicitud // Luego la creamos
);

/**
 * GET /api/solicitudes/mias
 * Obtiene todas las solicitudes del usuario autenticado.
 */
router.get('/mias', controlador.getMisSolicitudes);

/**
 * GET /api/solicitudes/area
 * Obtiene todas las solicitudes del área (o todas si es Admin).
 * ESTA RUTA ES CORRECTA: El coordinador SÍ puede ver.
 */
router.get(
  '/area',
  verificarRol(['COORDINADOR', 'ADMIN']), 
  controlador.getSolicitudesPorArea
);

/**
 * PUT /api/solicitudes/:id/estado
 * Actualiza el estado de una solicitud (Aprobar/Rechazar).
 * --- ¡CORRECCIÓN AQUÍ! ---
 * Solo el 'ADMIN' puede ejecutar esta acción.
 */
router.put(
  '/:id/estado',
  verificarRol(['ADMIN']), // <-- CAMBIADO DE ['COORDINADOR', 'ADMIN']
  controlador.actualizarEstadoSolicitud
);


// (Protegida para Admin, aunque podríamos abrirla a COORDINADOR también si quisiéramos)
router.get('/:id/comprobante', verificarRol(['ADMIN', 'COORDINADOR']), controlador.descargarComprobante);

module.exports = router;