// backend/src/controladores/areas.controlador.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Obtiene todas las áreas de la base de datos.
 */
const getAreas = async (req, res) => {
  try {
    const areas = await prisma.area.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });
    res.json(areas);
  } catch (error) {
    console.error("Error al obtener áreas:", error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = {
  getAreas,
};