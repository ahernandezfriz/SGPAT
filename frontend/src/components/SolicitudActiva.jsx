// frontend/src/components/SolicitudActiva.jsx
import React from 'react';

// --- EXPORTED HELPERS ---
// (Otros componentes los importan desde aquí)

export const IconoEstado = ({ estado }) => {
  const estilos = {
    PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    APROBADO: 'bg-green-100 text-green-800 border-green-300',
    RECHAZADO: 'bg-red-100 text-red-800 border-red-300',
  };
  const texto = {
    PENDIENTE: 'Pendiente',
    APROBADO: 'Aprobado',
    RECHAZADO: 'Rechazado',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${estilos[estado] || 'bg-gray-100'}`}>
      {texto[estado] || 'Desconocido'}
    </span>
  );
};

export const formatearFecha = (fechaStr, jornada = 'COMPLETO') => {
  const fecha = new Date(fechaStr);
  const opciones = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
  let jornadaTexto = '';

  switch (jornada) {
    case 'MANANA':
      jornadaTexto = ' (Media Jornada - Mañana)';
      break;
    case 'TARDE':
      jornadaTexto = ' (Media Jornada - Tarde)';
      break;
    // No mostramos "Día Completo" para limpiar la UI
    case 'COMPLETO':
    default:
      jornadaTexto = '';
  }

  return `${fecha.toLocaleDateString('es-ES', opciones)}${jornadaTexto}`;
};

// --- DEFAULT EXPORT ---
// (El componente que renderiza los detalles de UNA solicitud)

const SolicitudActiva = ({ solicitud }) => {
  const esVariosDias = solicitud.fechaInicio !== solicitud.fechaFin;

  return (
    // Cada solicitud es un item de lista con borde inferior
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-xl font-bold text-blue-600">
            {solicitud.tipo === 'TELETRABAJO' ? 'Teletrabajo' : 'Permiso Administrativo'}
          </p>
          {solicitud.motivo && (
            <p className="text-sm text-gray-600 -mt-1">{solicitud.motivo}</p>
          )}
        </div>
        <IconoEstado estado={solicitud.estado} />
      </div>
      
      <div className="space-y-1">
        {esVariosDias ? (
          <div>
            <p className="text-sm font-medium text-gray-500">Desde</p>
            <p className="text-lg text-gray-800">{formatearFecha(solicitud.fechaInicio)}</p>
            <p className="text-sm font-medium text-gray-500 mt-2">Hasta</p>
            <p className="text-lg text-gray-800">{formatearFecha(solicitud.fechaFin)}</p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-gray-500">Fecha</p>
            <p className="text-lg text-gray-800">
              {formatearFecha(solicitud.fechaInicio, solicitud.jornada)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitudActiva;