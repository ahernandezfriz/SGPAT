// frontend/src/pages/PaginaCoordinador.jsx
import React from 'react';
import { useQuery } from 'react-query';
import { getSolicitudesPorArea } from '../servicios/solicitudes.servicio';
import TablaSolicitudes from '../components/TablaSolicitudes';

const PaginaCoordinador = () => {
  const { 
    data: solicitudes, 
    isLoading, 
    isError 
  } = useQuery('solicitudesArea', getSolicitudesPorArea);
  // Usamos la misma key 'solicitudesArea' que el Admin

  if (isError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
        Error al cargar las solicitudes del área.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TablaSolicitudes 
        isLoading={isLoading}
        solicitudes={solicitudes || []}
        // No pasamos 'mostrarArea', así que por defecto es 'false' (vista Coordinador)
      />
    </div>
  );
};

export default PaginaCoordinador;