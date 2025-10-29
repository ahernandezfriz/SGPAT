// frontend/src/components/TablaSolicitudes.jsx
import React from 'react';
// Reutilizamos los helpers que creamos para el dashboard
import { IconoEstado, formatearFecha } from './SolicitudActiva'; 

/**
 * Muestra una tabla con la lista de solicitudes.
 * @param {object} props
 * @param {boolean} props.isLoading - Si está cargando
 * @param {Array} props.solicitudes - El array de solicitudes a mostrar
 * @param {boolean} [props.mostrarArea] - (Opcional) Si se debe mostrar la columna 'Área' (para el Admin)
 */
const TablaSolicitudes = ({ isLoading, solicitudes, mostrarArea = false }) => {
  
  if (isLoading) {
    // Esqueleto de carga para la tabla
    return (
      <div className="bg-white shadow rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-12 bg-gray-100 rounded w-full mb-2"></div>
        <div className="h-12 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  if (!solicitudes || solicitudes.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Solicitudes
        </h2>
        <div className="text-center text-gray-500 py-8">
          <p>No hay solicitudes para mostrar en esta vista.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Solicitudes del Área
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trabajador</th>
              {/* Columna condicional para el Admin */}
              {mostrarArea && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fechas</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {solicitudes.map((sol) => (
              <tr key={sol.id}>
                {/* Trabajador */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{sol.trabajador.nombreCompleto}</span>
                </td>
                
                {/* Área (Condicional) */}
                {mostrarArea && (
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{sol.trabajador.area.nombre}</span>
                  </td>
                )}
                
                {/* Tipo y Motivo */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {sol.tipo === 'TELETRABAJO' ? 'Teletrabajo' : 'Administrativo'}
                  </div>
                  {sol.tipo === 'ADMINISTRATIVO' && (
                    <div className="text-xs text-gray-500">{sol.motivo}</div>
                  )}
                </td>

                {/* Fechas */}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                  {sol.fechaInicio === sol.fechaFin ? (
                    formatearFecha(sol.fechaInicio, sol.jornada)
                  ) : (
                    // Usamos un formato más simple para rangos
                    `Del ${formatearFecha(sol.fechaInicio)} al ${formatearFecha(sol.fechaFin)}`
                  )}
                </td>

                {/* Estado */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <IconoEstado estado={sol.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaSolicitudes;