// backend/src/controladores/usuarios.controlador.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Helper para hashear la contraseña
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * GET /api/usuarios
 * Obtiene todos los usuarios (para la tabla de admin)
 */
const getUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      // Incluimos el nombre del área
      include: {
        area: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: {
        nombreCompleto: 'asc'
      }
    });
    
    // Ocultamos el password antes de enviarlos
    const usuariosSinPassword = usuarios.map(u => {
      const { password, ...usuario } = u; // Excluir password
      return usuario;
    });

    res.json(usuariosSinPassword);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * POST /api/usuarios
 * Crea un nuevo usuario
 */
const crearUsuario = async (req, res) => {
  const { email, nombreCompleto, password, rol, areaId, diasAdminDisponibles } = req.body;

  // Validación simple
  if (!email || !nombreCompleto || !password || !rol || !areaId) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }

  try {
    // Hashear la contraseña
    const passwordHasheado = await hashPassword(password);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        email: email.toLowerCase(),
        nombreCompleto,
        password: passwordHasheado,
        rol,
        areaId: parseInt(areaId),
        diasAdminDisponibles: parseFloat(diasAdminDisponibles) || 5.0
      }
    });

    const { password: _, ...usuarioCreado } = nuevoUsuario; // Quitar password
    res.status(201).json(usuarioCreado);

  } catch (error) {
    // Manejar error de email duplicado
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ error: 'El email ya está en uso.' });
    }
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * PUT /api/usuarios/:id
 * Actualiza un usuario existente
 */
const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { email, nombreCompleto, password, rol, areaId, diasAdminDisponibles } = req.body;

  try {
    let datosActualizar = {
      email: email?.toLowerCase(),
      nombreCompleto,
      rol,
      areaId: areaId ? parseInt(areaId) : undefined,
      diasAdminDisponibles: diasAdminDisponibles ? parseFloat(diasAdminDisponibles) : undefined
    };

    // Si se proporciona una nueva contraseña, hashearla.
    // Si 'password' es "" o null, no se actualiza.
    if (password) {
      datosActualizar.password = await hashPassword(password);
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: datosActualizar
    });

    const { password: _, ...usuarioSinPassword } = usuarioActualizado;
    res.json(usuarioSinPassword);

  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({ error: 'El email ya está en uso.' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * DELETE /api/usuarios/:id
 * Elimina un usuario
 */
const eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.usuario.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).send(); // 204 = No Content (Éxito sin respuesta)
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    // Manejar si el usuario tiene solicitudes (violación de FK)
    if (error.code === 'P2003') {
         return res.status(400).json({ error: 'No se puede eliminar el usuario porque tiene solicitudes asociadas.' });
    }
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = {
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};