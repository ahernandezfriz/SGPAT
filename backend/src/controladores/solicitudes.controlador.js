// backend/src/controladores/solicitudes.controlador.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const { enviarEmail } = require('../servicios/email.servicio');
const { generarComprobantePDF } = require('../servicios/pdf.servicio');


// --- FUNCIÓN HELPER ---
const getDiasHabilesAnticipacion = (fecha) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaSolicitud = new Date(fecha);
  fechaSolicitud.setHours(0, 0, 0, 0);
  if (fechaSolicitud <= hoy) return 0;
  let diasDiferencia = 0;
  const unDia = 1000 * 60 * 60 * 24;
  let fechaActual = new Date(hoy.getTime() + unDia);
  while (fechaActual <= fechaSolicitud) {
    const diaSemana = fechaActual.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) {
      diasDiferencia++;
    }
    if (fechaActual.getTime() === fechaSolicitud.getTime()) break;
    fechaActual = new Date(fechaActual.getTime() + unDia);
  }
  return diasDiferencia;
};

// --- FUNCIONES DEL TRABAJADOR ---

/**
 * Crear una nueva solicitud
 */
const crearSolicitud = async (req, res) => {
  const { tipo, fechaInicio, fechaFin, jornada, motivo } = req.body;
  const trabajadorId = req.usuarioId; 

  try {
    if (tipo === 'ADMINISTRATIVO') {
      const diasAnticipacion = getDiasHabilesAnticipacion(fechaInicio);
      if (diasAnticipacion < 1) {
        return res.status(400).json({ 
          error: 'El permiso administrativo requiere al menos 1 día hábil de anticipación.' 
        });
      }
    }

    if (tipo === 'ADMINISTRATIVO') {
      const usuario = await prisma.usuario.findUnique({
        where: { id: trabajadorId },
        select: { diasAdminDisponibles: true }
      });
      const diasSolicitados = (jornada === 'COMPLETO') ? 1.0 : 0.5;
      if (usuario.diasAdminDisponibles < diasSolicitados) {
        return res.status(400).json({ 
          error: `No tienes suficientes días disponibles. Solicitas ${diasSolicitados} y te quedan ${usuario.diasAdminDisponibles}.` 
        });
      }
    }

    const nuevaSolicitud = await prisma.solicitud.create({
      data: {
        tipo: tipo,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        jornada: jornada,
        motivo: motivo,
        estado: 'PENDIENTE',
        trabajador: {
          connect: { id: trabajadorId }
        }
      }
    });
    res.status(201).json(nuevaSolicitud);
  } catch (error) {
    console.error("Error al crear solicitud:", error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};


/**
 * Obtener todas las solicitudes del usuario logueado
 */
const getMisSolicitudes = async (req, res) => {
  const trabajadorId = req.usuarioId;
  try {
    const solicitudes = await prisma.solicitud.findMany({
      where: {
        trabajadorId: trabajadorId
      },
      orderBy: {
        fechaInicio: 'desc'
      }
    });
    res.json(solicitudes);
  } catch (error) {
    console.error("Error al obtener mis solicitudes:", error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};


// --- ¡¡FUNCIONES QUE FALTABAN O ESTABAN INCOMPLETAS!! ---

/**
 * Obtener todas las solicitudes del ÁREA del usuario logueado.
 */
const getSolicitudesPorArea = async (req, res) => {
  const usuarioId = req.usuarioId;
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { areaId: true, rol: true }
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
    
    let filtroWhere = { trabajador: { areaId: usuario.areaId } };
    if (usuario.rol === 'ADMIN') filtroWhere = {}; // Admin ve todo

    const solicitudes = await prisma.solicitud.findMany({
      where: filtroWhere,
      include: {
        trabajador: {
          select: { nombreCompleto: true, area: { select: { nombre: true } } }
        }
      },
      orderBy: { fechaInicio: 'asc' }
    });
    res.json(solicitudes);
  } catch (error) {
    console.error("Error al obtener solicitudes de área:", error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

/**
 * Actualizar el estado de una solicitud (Aprobar/Rechazar)
 */

const actualizarEstadoSolicitud = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const aprobadorId = req.usuarioId;

  if (!['APROBADO', 'RECHAZADO'].includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido.' });
  }

  try {
    const solicitud = await prisma.solicitud.findUnique({
      where: { id: parseInt(id) },
      include: { 
        trabajador: {
          include: {
            area: true 
          }
        } 
      }
    });

    if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada.' });

    let solicitudActualizada;

    // --- Lógica de Aprobación de Permiso Administrativo ---
    if (solicitud.tipo === 'ADMINISTRATIVO' && estado === 'APROBADO') {
      const diasDescontar = (solicitud.jornada === 'COMPLETO') ? 1.0 : 0.5;
      if (solicitud.trabajador.diasAdminDisponibles < diasDescontar) {
        return res.status(400).json({ 
          error: `El trabajador ya no tiene días suficientes.`
        });
      }
      
      // Ejecutar transacción
      const transaccionResultados = await prisma.$transaction([
        // 1. Descontar días al usuario
        prisma.usuario.update({
          where: { id: solicitud.trabajadorId },
          data: { diasAdminDisponibles: { decrement: diasDescontar } }
        }),
        // 2. Actualizar la solicitud
        prisma.solicitud.update({
          where: { id: parseInt(id) },
          data: { estado: estado, aprobadorId: aprobadorId }
        })
      ]);
      // Asignar el resultado de la *segunda* operación (actualización de solicitud)
      solicitudActualizada = transaccionResultados[1]; 

    // --- Lógica para Teletrabajo o Rechazo ---
    } else {
      solicitudActualizada = await prisma.solicitud.update({
        where: { id: parseInt(id) },
        data: { estado: estado, aprobadorId: aprobadorId }
      });
    }

    // --- Lógica de Email ---
    if (estado === 'APROBADO') {
      const areaIdDelTrabajador = solicitud.trabajador.areaId;
      
      const coordinador = await prisma.usuario.findFirst({
        where: {
          areaId: areaIdDelTrabajador,
          rol: 'COORDINADOR'
        }
      });

      if (coordinador && coordinador.email) {
        // Enviar email (sin await para no bloquear)

        // --- Variables de ayuda para el texto ---
        const tipoPermiso = solicitud.tipo === 'ADMINISTRATIVO' ? 'Permiso Administrativo' : 'Teletrabajo';
        const fechaInicioFmt = new Date(solicitud.fechaInicio).toLocaleDateString('es-CL', { timeZone: 'UTC' });

        // Creamos un string para la fecha/jornada
        let detallesFecha = `Fecha: ${fechaInicioFmt} (Jornada: ${solicitud.jornada})`;
        // Si es teletrabajo de varios días, mostramos el rango
        if (solicitud.tipo === 'TELETRABAJO' && solicitud.fechaFin) {
            const fechaFinFmt = new Date(solicitud.fechaFin).toLocaleDateString('es-CL', { timeZone: 'UTC' });
            if (fechaInicioFmt !== fechaFinFmt) {
                detallesFecha = `Del ${fechaInicioFmt} al ${fechaFinFmt}`;
            }
        }

        // --- Plantillas de Correo ---
        const asunto = `Solicitud Aprobada: ${tipoPermiso} - ${solicitud.trabajador.nombreCompleto}`;

        const textoPlano = `
          Hola ${coordinador.nombreCompleto},

          Se ha aprobado una solicitud de permiso para un miembro de tu área.

          Detalles de la Solicitud:
          - Trabajador: ${solicitud.trabajador.nombreCompleto}
          - Área: ${solicitud.trabajador.area.nombre}
          - Tipo: ${tipoPermiso}
          ${solicitud.motivo ? `- Motivo: ${solicitud.motivo}` : ''}
          - ${detallesFecha}

          Este es un correo informativo generado automáticamente.
        `;

        const textoHtml = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h3>Solicitud de Permiso Aprobada</h3>
            <p>Hola ${coordinador.nombreCompleto},</p>
            <p>Se ha aprobado una solicitud de permiso para un miembro de tu área.</p>
            <hr>
            <h4>Detalles de la Solicitud:</h4>
            <ul style="list-style-type: none; padding-left: 0;">
              <li><strong>Trabajador:</strong> ${solicitud.trabajador.nombreCompleto}</li>
              <li><strong>Área:</strong> ${solicitud.trabajador.area.nombre}</li>
              <li><strong>Tipo de Permiso:</strong> ${tipoPermiso}</li>
              ${solicitud.motivo ? `<li><strong>Motivo:</strong> ${solicitud.motivo}</li>` : ''}
              <li><strong>Detalle:</strong> ${detallesFecha}</li>
            </ul>
            <p><em>Este es un correo informativo generado automáticamente.</em></p>
          </div>
        `;

        enviarEmail({
          to: coordinador.email,
          subject: asunto,
          text: textoPlano,
          html: textoHtml
        }).catch(err => {
            console.error("Fallo al enviar email de notificación:", err);
        });
      } else {
        console.log(`No se encontró coordinador para el área ID: ${areaIdDelTrabajador} para notificar.`);
      }
    }

    // --- Respuesta Final ---
    res.json(solicitudActualizada);

  } catch (error) {
    // Imprimir el error específico de Prisma si existe
    console.error("Error al actualizar estado:", error); 
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};



/**
 * GET /api/solicitudes/:id/comprobante
 * Genera y envía un PDF de la solicitud aprobada.
 */
const descargarComprobante = async (req, res) => {
  const { id } = req.params;

  try {
    const solicitud = await prisma.solicitud.findUnique({
      where: { id: parseInt(id) },
      // ¡Importante! Incluir todos los datos necesarios para el PDF
      include: {
        trabajador: { 
          include: { area: true }
        },
        aprobador: true // El usuario que aprobó
      }
    });

    // Validaciones
    if (!solicitud) {
      return res.status(404).json({ error: 'Solicitud no encontrada.' });
    }
    if (solicitud.estado !== 'APROBADO') {
      return res.status(400).json({ error: 'Solo se pueden descargar comprobantes de solicitudes APROBADAS.' });
    }
    if (!solicitud.aprobador) {
       return res.status(400).json({ error: 'No se encontraron datos del aprobador.' });
    }

    // Generar el PDF
    const pdfBuffer = await generarComprobantePDF(solicitud);

    // Enviar el PDF como un archivo adjunto
    const nombreArchivo = `Comprobante-Permiso-${solicitud.id}-${solicitud.trabajador.nombreCompleto.split(' ')[0]}.pdf`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Error al generar PDF:", error);
    res.status(500).json({ error: 'Error interno al generar el PDF.' });
  }
};


// --- EXPORTS (¡MUY IMPORTANTE!) ---
// Asegúrate de que tu module.exports SÍ incluye las nuevas funciones.
module.exports = {
  crearSolicitud,
  getMisSolicitudes,
  getSolicitudesPorArea,
  actualizarEstadoSolicitud,  
  descargarComprobante
};