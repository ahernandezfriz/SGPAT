// backend/src/app.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');
const { MOTIVOS_ADMINISTRATIVOS } = require('./constantes');

// --- Importar nuevas rutas ---
const authRutas = require('./api/auth.rutas');
const solicitudesRutas = require('./api/solicitudes.rutas');
const areasRutas = require('./api/areas.rutas'); 
const usuariosRutas = require('./api/usuarios.rutas'); 

// --- Inicialización ---
const app = express();
// Eliminamos esta instancia, cada controlador la crea (mejor para 'hot-reload')
// const prisma = new PrismaClient(); 

// --- Middlewares Esenciales ---
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// --- Rutas de la API ---

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ mensaje: 'API del Sistema de Gestión de Permisos funcionando' });
});

// Ruta para obtener los motivos
app.get('/api/opciones/motivos', (req, res) => {
  res.json(MOTIVOS_ADMINISTRATIVOS);
});

// --- Añadimos las rutas de Autenticación ---
// Todas las rutas en 'authRutas' estarán prefijadas con /api/auth
app.use('/api/auth', authRutas);

// Rutas de Solicitudes
app.use('/api/solicitudes', solicitudesRutas); 


// Rutas de Áreas
app.use('/api/areas', areasRutas);

// Rutas de Usuarios
app.use('/api/usuarios', usuariosRutas);



// --- Manejo de Errores (básico) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('¡Algo salió mal!');
});

// --- Puerto de escucha ---
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});