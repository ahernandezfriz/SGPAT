// frontend/src/components/HistorialSolicitudes.jsx
import React from 'react';
import { IconoEstado, formatearFecha } from './SolicitudActiva'; // Reutilizamos helpers

const HistorialSolicitudes = ({ solicitudes }) => {
  if (solicitudes.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 lg:col-span-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Historial de Solicitudes
        </h3>
        <div className="text-center text-gray-500 py-8">
          <p>No tienes solicitudes en tu historial.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 lg:col-span-1">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Historial de Solicitudes
      </h3>
      
      {/* Contenedor de la tabla con scroll en móviles */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {solicitudes.map((sol) => (
              <tr key={sol.id}>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {sol.tipo === 'TELETRABAJO' ? 'Teletrabajo' : 'Administrativo'}
                  </div>
                  {sol.tipo === 'ADMINISTRATIVO' && (
                    <div className="text-xs text-gray-500">{sol.motivo}</div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">
                    {/* Mostramos la fecha simple, la jornada la vemos en el estado si es medio día */}
                    {formatearFecha(sol.fechaInicio, sol.jornada)}
                  </div>
                </td>
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

export default HistorialSolicitudes;