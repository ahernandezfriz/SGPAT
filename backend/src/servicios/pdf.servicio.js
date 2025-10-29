// backend/src/servicios/pdf.servicio.js
const PDFDocument = require('pdfkit');

/**
 * Genera un PDF de comprobante de permiso.
 * @param {object} solicitud - El objeto Solicitud (con trabajador, area y aprobador incluidos)
 * @returns {Buffer} - El PDF como un buffer de datos
 */
const generarComprobantePDF = async (solicitud) => {
  // Helpers
  const trabajador = solicitud.trabajador;
  const aprobador = solicitud.aprobador; // Asumimos que el aprobador está incluido
  const tipoPermiso = solicitud.tipo === 'ADMINISTRATIVO' ? 'Permiso Administrativo' : 'Teletrabajo';
  const fechaInicioFmt = new Date(solicitud.fechaInicio).toLocaleDateString('es-CL', { timeZone: 'UTC' });
  let detallesFecha = `${fechaInicioFmt} (Jornada: ${solicitud.jornada})`;
  if (solicitud.tipo === 'TELETRABAJO' && solicitud.fechaFin && (solicitud.fechaInicio !== solicitud.fechaFin)) {
      const fechaFinFmt = new Date(solicitud.fechaFin).toLocaleDateString('es-CL', { timeZone: 'UTC' });
      detallesFecha = `Del ${fechaInicioFmt} al ${fechaFinFmt}`;
  }

  // Creamos la promesa para manejar el buffer del PDF
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // --- Contenido del PDF ---

      // Encabezado
      doc.fontSize(20).font('Helvetica-Bold').text('Comprobante de Solicitud de Permiso', { align: 'center' });
      doc.moveDown(2);

      // Datos del Trabajador
      doc.fontSize(14).font('Helvetica-Bold').text('1. Datos del Solicitante');
      doc.fontSize(12).font('Helvetica')
         .text(`Nombre: ${trabajador.nombreCompleto}`)
         .text(`Área: ${trabajador.area.nombre}`)
         .text(`Email: ${trabajador.email}`);
      doc.moveDown(1.5);

      // Datos de la Solicitud
      doc.fontSize(14).font('Helvetica-Bold').text('2. Detalles de la Solicitud');
      doc.fontSize(12).font('Helvetica')
         .text(`Tipo de Permiso: ${tipoPermiso}`)
         .text(`Fecha permiso: ${detallesFecha}`)
         .text(`Estado: ${solicitud.estado}`);
      if (solicitud.motivo) {
        doc.text(`Motivo: ${solicitud.motivo}`);
      }
      doc.moveDown(1.5);
      
      // Datos de Autorización (La "Firma")
      doc.fontSize(14).font('Helvetica-Bold').text('3. Autorización Administrativa');
      if (aprobador) {
        doc.fontSize(12).font('Helvetica')
           .text(`Aprobado por: ${aprobador.nombreCompleto}`)
           .text(`Rol: ${aprobador.rol}`)
           .text(`Fecha de Aprobación: ${new Date(solicitud.actualizadoEn).toLocaleString('es-CL')}`);
      } else {
        doc.fontSize(12).font('Helvetica').text('Aprobador no registrado.'); // Fallback
      }
      doc.moveDown(2);

      // Pie de página
      doc.fontSize(10).font('Helvetica-Oblique').text(
        'Este documento es un comprobante oficial generado por el Sistema de Gestión de Permisos.', 
        { align: 'center' }
      );
      
      // Finalizar el PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generarComprobantePDF };