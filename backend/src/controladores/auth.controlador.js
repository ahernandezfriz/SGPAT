// backend/src/controladores/auth.controlador.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

/**
 * Inicia sesión de un usuario y devuelve un token JWT.
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Validar entrada
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
  }

  try {
    // 2. Buscar al usuario en la base de datos
    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
      include: { area: true } // Incluimos el área para el frontend
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // 3. Comparar la contraseña
    const esPasswordValido = await bcrypt.compare(password, usuario.password);

    if (!esPasswordValido) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // 4. Generar el Token JWT
    // Guardamos solo la info necesaria y no sensible
    const payload = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      nombre: usuario.nombreCompleto,
      area: usuario.area.nombre
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET, // (definido en docker-compose.yml)
      { expiresIn: '8h' } // El token expira en 8 horas
    );

    // 5. Enviar la respuesta
    // Enviamos el token y los datos del usuario (sin el password)
    res.json({
      token,
      usuario: payload,
    });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * Obtiene el perfil del usuario actualmente autenticado (ruta protegida).
 */
const getPerfil = async (req, res) => {
  try {
    // req.usuarioId fue añadido por el middleware 'verificarToken'
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      select: {
        id: true,
        email: true,
        nombreCompleto: true,
        rol: true,
        diasAdminDisponibles: true,
        area: {
          select: {
            nombre: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    
    // Reformateamos un poco la respuesta
    res.json({
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombreCompleto,
      rol: usuario.rol,
      diasDisponibles: usuario.diasAdminDisponibles,
      area: usuario.area.nombre
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};


module.exports = {
  login,
  getPerfil,
};