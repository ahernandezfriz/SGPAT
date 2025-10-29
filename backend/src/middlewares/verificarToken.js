// backend/src/middlewares/verificarToken.js

const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar la validez de un token JWT.
 * El token debe venir en el header 'Authorization' como 'Bearer [token]'
 */
const verificarToken = (req, res, next) => {
  // 1. Obtener el token del header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
  }

  try {
    // 2. Verificar el token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Añadir el ID del usuario al objeto 'req' para usarlo en el controlador
    req.usuarioId = payload.id;
    
    // 4. Continuar al siguiente middleware o controlador
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado.' });
    }
    console.error('Error al verificar token:', error);
    return res.status(403).json({ error: 'Token inválido.' });
  }
};

module.exports = verificarToken;