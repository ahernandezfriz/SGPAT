// backend/src/middlewares/verificarRol.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware para verificar si el usuario tiene uno de los roles permitidos.
 * Se debe usar DESPUÉS de 'verificarToken'.
 * @param {string[]} rolesPermitidos - Array de roles ('ADMIN', 'COORDINADOR', 'TRABAJADOR')
 */
const verificarRol = (rolesPermitidos) => {
  return async (req, res, next) => {
    const usuarioId = req.usuarioId; // Asignado por 'verificarToken'

    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { rol: true }
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      // Comprobar si el rol del usuario está en la lista de permitidos
      if (!rolesPermitidos.includes(usuario.rol)) {
        return res.status(403).json({ error: 'Acceso denegado. No tienes los permisos necesarios.' });
      }

      // Si tiene el rol, pasamos al siguiente middleware o controlador
      next();
      
    } catch (error) {
      console.error("Error al verificar rol:", error);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  };
};

module.exports = verificarRol;