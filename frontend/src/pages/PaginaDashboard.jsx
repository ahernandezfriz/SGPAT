// frontend/src/pages/PaginaDashboard.jsx
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from 'react-query';
import { getMisSolicitudes } from '../servicios/solicitudes.servicio';
import Modal from '../components/Modal';
import FormularioNuevaSolicitud from '../components/FormularioNuevaSolicitud';
// --- Importamos el componente (sin llaves) y el helper (con llaves) ---
import SolicitudActiva, { IconoEstado, formatearFecha } from '../components/SolicitudActiva';
import HistorialSolicitudes from '../components/HistorialSolicitudes';

// (Iconos)
const IconoCalendario = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const IconoReloj = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
// (Esqueleto de carga)
const DashboardEsqueleto = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="bg-gray-200 h-36 rounded-lg col-span-2"></div><div className="bg-gray-200 h-36 rounded-lg"></div></div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-gray-200 h-48 rounded-lg"></div><div className="bg-gray-200 h-48 rounded-lg"></div></div>
  </div>
);

// Componente principal
const PaginaDashboard = () => {
  const { usuario } = useAuth();
  const [modalAbierto, setModalAbierto] = useState(false);
  
  const { data: solicitudes, isLoading, isError } = useQuery('misSolicitudes', getMisSolicitudes);

  const diasUsados = 5.0 - (usuario?.diasDisponibles || 5.0);

  // --- LÓGICA ACTUALIZADA (Devuelve array completo) ---
  const { solicitudesActivas, historial } = useMemo(() => {
    if (!solicitudes) {
      return { solicitudesActivas: [], historial: [] };
    }
    const hoyStr = new Date().toLocaleDateString('en-CA');
    const activas = [];
    const pasadas = [];
    solicitudes.forEach(s => {
      const fechaSolicitudStr = s.fechaInicio.split('T')[0];
      if (s.estado === 'RECHAZADO' || fechaSolicitudStr < hoyStr) {
        pasadas.push(s);
      } else {
        activas.push(s);
      }
    });
    activas.sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));
    pasadas.sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));
    return {
      solicitudesActivas: activas, // <-- Devolvemos el array completo
      historial: pasadas,
    };
  }, [solicitudes]);

  const handleAbrirModal = () => setModalAbierto(true);
  const handleCerrarModal = () => setModalAbierto(false);

  if (!usuario) {
    return <DashboardEsqueleto />; 
  }

  return (
    <>
      <div className="space-y-6">
        
        {/* --- Fila 1: Contador y Botón --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white shadow rounded-lg p-6 flex items-center col-span-1 md:col-span-2">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-4"><IconoCalendario /></div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Días Administrativos Disponibles</h3>
              <p className="text-3xl font-bold text-gray-900">{usuario.diasDisponibles}<span className="text-base font-normal text-gray-500"> / 5</span></p>
              <p className="text-sm text-gray-500 mt-1">(Has usado: {diasUsados} días)</p>
            </div>
           </div>
           <div className="bg-white shadow rounded-lg p-6 flex flex-col justify-center items-center">
            <button onClick={handleAbrirModal} className="w-full bg-green-500 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Crear Nueva Solicitud
            </button>
           </div>
        </div>

        {/* --- Fila 2: Activas e Historial --- */}
        {isLoading && ( <DashboardEsqueleto /> /* Muestra esqueleto completo si todo carga */ )}
        {isError && ( <div>Error al cargar solicitudes</div> )}

        {solicitudes && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* --- TARJETA DE SOLICITUDES ACTIVAS (ACTUALIZADA) --- */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full mr-3"><IconoReloj /></div>
                <h3 className="text-lg font-semibold text-gray-900">Solicitudes Activas y Pendientes</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {solicitudesActivas.length > 0 ? (
                  // Bucle sobre las solicitudes activas
                  solicitudesActivas.map((sol) => (
                    <SolicitudActiva key={sol.id} solicitud={sol} />
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>No tienes solicitudes pendientes o aprobadas próximas.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Historial (no cambia) */}
            <HistorialSolicitudes solicitudes={historial} />
          </div>
        )}
      </div>

      {/* --- Modal (no cambia) --- */}
      <Modal isOpen={modalAbierto} onClose={handleCerrarModal} titulo="Crear Nueva Solicitud de Permiso">
        <FormularioNuevaSolicitud alCancelar={handleCerrarModal} />
      </Modal>
    </>
  );
};

export default PaginaDashboard;