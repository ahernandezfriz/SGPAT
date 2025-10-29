// backend/src/middlewares/validarSolicitud.js
const { body, validationResult } = require('express-validator');
const { MOTIVOS_ADMINISTRATIVOS } = require('../constantes');

// Aplanamos la lista de motivos válidos para el validador
const todosLosMotivos = [].concat(
  MOTIVOS_ADMINISTRATIVOS.Perfeccionamiento,
  MOTIVOS_ADMINISTRATIVOS.Reglamento,
  MOTIVOS_ADMINISTRATIVOS.Particulares
);

// Middleware para manejar los errores de validación
const manejarValidacion = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Devolvemos solo el primer error para simplicidad
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

// Reglas para la creación de una nueva solicitud
const reglasCreacionSolicitud = [
  // 1. Validar Tipo
  body('tipo')
    .isIn(['TELETRABAJO', 'ADMINISTRATIVO'])
    .withMessage('El tipo de solicitud es inválido.'),
  
  // 2. Validar Fechas
  body('fechaInicio')
    .notEmpty().withMessage('La fecha de inicio es requerida.')
    .isISO8601().toDate().withMessage('Formato de fecha de inicio inválido.'),
  
  body('fechaFin')
    .notEmpty().withMessage('La fecha de fin es requerida.')
    .isISO8601().toDate().withMessage('Formato de fecha de fin inválido.'),

  // 3. Validar Jornada
  body('jornada')
    .isIn(['COMPLETO', 'MANANA', 'TARDE'])
    .withMessage('El tipo de jornada es inválido.'),

  // 4. Lógica condicional
  body().custom((value, { req }) => {
    const { tipo, fechaInicio, fechaFin, jornada, motivo } = req.body;

    // Regla 1: Permisos Administrativos (FRD 3.A)
    if (tipo === 'ADMINISTRATIVO') {
      if (fechaInicio.getTime() !== fechaFin.getTime()) {
        throw new Error('Los permisos administrativos solo pueden ser de un día.');
      }
      if (!motivo) {
        throw new Error('El motivo es requerido para permisos administrativos.');
      }
      if (!todosLosMotivos.includes(motivo)) {
        throw new Error('El motivo administrativo seleccionado no es válido.');
      }
    }

    // Regla 2: Jornada vs Rango de Fechas
    if (fechaInicio.getTime() !== fechaFin.getTime()) {
      if (jornada !== 'COMPLETO') {
        throw new Error('Las solicitudes de varios días deben ser de jornada "COMPLETO".');
      }
    }

    return true; // Pasa la validación
  }),
];

module.exports = {
  validarCreacionSolicitud: [
    ...reglasCreacionSolicitud,
    manejarValidacion
  ],
};