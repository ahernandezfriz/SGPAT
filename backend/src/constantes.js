// backend/src/constantes.js

// Objeto con los motivos administrativos agrupados por categoría.
// Esta es la estructura que consumirá el frontend.
const MOTIVOS_ADMINISTRATIVOS = {
    Perfeccionamiento: [
      "Perfeccionamiento",
      "Seminarios",
      "Cursos",
      "Suplencia",
      "Misiones",
      "Comisiones",
      "Simposios",
      "Proyectos",
      "Intercambios",
      "Congresos",
      "Eventos",
      "Tesis",
      "Invitaciones",
    ],
    Reglamento: [
      "Matrimonio",
      "Fallecimiento familiar directo",
      "Nacimiento hijo",
      "Permiso sindical",
      "Exámenes preventivos",
      "Asistencia a eventos (Reglamento)", // Ajustado
    ],
    Particulares: [
      "Motivos particulares",
      "Fallecimiento familiar no directo",
      "Consulta médica",
      "Actividad escolar hijo",
      "Licenciatura/titulación hijo",
    ],
  };
  
  // Exportamos para usarlo en otros módulos (ej. el controlador de opciones)
  module.exports = {
    MOTIVOS_ADMINISTRATIVOS,
  };