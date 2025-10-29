// frontend/src/pages/PaginaAdmin.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getSolicitudesPorArea } from '../servicios/solicitudes.servicio';
import { actualizarEstadoSolicitud } from '../servicios/solicitudes.servicio';
import { IconoEstado, formatearFecha } from '../components/SolicitudActiva'; // Reutilizamos helpers
import api from '../servicios/api';

// Componente de botones de acción
const AccionesAdmin = ({ solicitud }) => {

  const queryClient = useQueryClient();

  const [descargando, setDescargando] = useState(false); // Estado de carga para el botón PDF

  const mutacion = useMutation(actualizarEstadoSolicitud, {
    onSuccess: () => {
      // Refrescamos la lista de solicitudes del admin Y la del trabajador (si la está viendo)
      queryClient.invalidateQueries('solicitudesArea');
      queryClient.invalidateQueries('misSolicitudes');
      // Refrescamos el perfil del usuario (por si cambiaron los días)
      queryClient.invalidateQueries('perfilUsuario');
    },
    onError: (error) => {
      alert(`Error al actualizar: ${error.message}`); // Alerta simple por ahora
    }
  });

  const handleAprobar = () => {
    mutacion.mutate({ id: solicitud.id, estado: 'APROBADO' });
  };

  const handleRechazar = () => {
    mutacion.mutate({ id: solicitud.id, estado: 'RECHAZADO' });
  };


  const handleDescargarPDF = async () => {
    setDescargando(true);
    try {
      // 1. Llamar a la API (que ya incluye el token)
      const response = await api.get(
        `/solicitudes/${solicitud.id}/comprobante`,
        {
          responseType: 'blob', // ¡Importante! Pedimos el archivo como un Blob
        }
      );

      // 2. Crear un enlace en memoria
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;


      // --- ¡NUEVA LÓGICA PARA EL NOMBRE DEL ARCHIVO! ---
      // a. Obtener nombre y apellido (simplificado)
      const partesNombre = solicitud.trabajador.nombreCompleto.split(' ');
      const nombre = partesNombre[0] || 'Usuario';
      const apellido = partesNombre[1] || 'SGP'; // Usar apellido o 'SGP' como fallback

      // b. Obtener fecha y hora actual
      const ahora = new Date();
      const dia = String(ahora.getDate()).padStart(2, '0');
      const mes = String(ahora.getMonth() + 1).padStart(2, '0'); // Meses son 0-11
      const anio = ahora.getFullYear();
      const hora = String(ahora.getHours()).padStart(2, '0');
      const minuto = String(ahora.getMinutes()).padStart(2, '0');
      const segundo = String(ahora.getSeconds()).padStart(2, '0');

      
      // 3. Definir el nombre del archivo
      const nombreArchivo = `${nombre}-${apellido}-${dia}${mes}${anio}-${hora}${minuto}${segundo}.pdf`;
      link.setAttribute('download', nombreArchivo);
      
      // 4. Simular clic
      document.body.appendChild(link);
      link.click();
      
      // 5. Limpiar
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error al descargar PDF:", error);
      alert('Error al descargar el comprobante. ¿Está aprobada la solicitud?');
    }
    setDescargando(false);
  };

  // --- LÓGICA DE RENDERIZADO ACTUALIZADA ---
  if (mutacion.isLoading) {
    return <span className="text-sm text-gray-500">Actualizando...</span>;
  }

  // 1. Si está PENDIENTE
  if (solicitud.estado === 'PENDIENTE') {
    return (
      <div className="flex gap-x-2">
        <button
          onClick={handleAprobar}
          className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium hover:bg-green-600"
        >
          Aprobar
        </button>
        <button
          onClick={handleRechazar}
          className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium hover:bg-red-600"
        >
          Rechazar
        </button>
      </div>
    );
  }

  // 2. Si está APROBADO
  if (solicitud.estado === 'APROBADO') {
    return (
      <div className="flex items-center gap-x-3">
        <IconoEstado estado="APROBADO" />
        <button
          onClick={handleDescargarPDF}
          disabled={descargando}
          className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-medium hover:bg-blue-600 disabled:bg-blue-300"
        >
          {descargando ? '...' : 'PDF'}
        </button>
      </div>
    );
  }

  // 3. Si está RECHAZADO (o cualquier otro estado)
  return <IconoEstado estado={solicitud.estado} />;
};


// Página principal del Admin
const PaginaAdmin = () => {
  const { 
    data: solicitudes, 
    isLoading, 
    isError 
  } = useQuery('solicitudesArea', getSolicitudesPorArea);
  // Reutilizamos 'getSolicitudesPorArea' porque el backend
  // ya sabe que si el rol es ADMIN, debe devolver todo.

  if (isError) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
        Error al cargar las solicitudes.
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded w-full mb-2"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Panel de Administración de Solicitudes
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trabajador</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fechas</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(solicitudes || []).map((sol) => (
              <tr key={sol.id}>
                {/* Trabajador */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{sol.trabajador.nombreCompleto}</span>
                </td>
                
                {/* Área */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-700">{sol.trabajador.area.nombre}</span>
                </td>
                
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
                    `Del ${formatearFecha(sol.fechaInicio)} al ${formatearFecha(sol.fechaFin)}`
                  )}
                </td>

                {/* Acciones (en lugar de Estado) */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <AccionesAdmin solicitud={sol} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaginaAdmin;