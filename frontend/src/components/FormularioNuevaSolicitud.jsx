// frontend/src/components/FormularioNuevaSolicitud.jsx

import React, { useState } from 'react';
// Importamos useMutation y useQueryClient
import { useQuery, useMutation, useQueryClient } from 'react-query';
// Importamos los servicios
import { getMotivosAdministrativos, crearSolicitud } from '../servicios/solicitudes.servicio';
import { useAuth } from '../context/AuthContext'; // Para refrescar los días

// Componente helper para un 'spinner' de carga
const Spinner = () => (
  <div className="text-center">
    <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
    <p className="text-sm text-gray-500 mt-2">Cargando motivos...</p>
  </div>
);

// Componente principal del formulario
const FormularioNuevaSolicitud = ({ alCancelar }) => {
  // --- Estados del Formulario ---
  const [tipo, setTipo] = useState('TELETRABAJO');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [jornada, setJornada] = useState('COMPLETO');
  const [motivoAdmin, setMotivoAdmin] = useState('');
  const [errorServidor, setErrorServidor] = useState(''); 
  
  // --- Configuración de React Query y Auth (CORREGIDO) ---
  const queryClient = useQueryClient(); // <-- Línea que faltaba
  const { refetchUsuario } = useAuth(); // Función para refrescar el contador

  // --- Lógica de Negocio (Flags) ---
  const esAdministrativo = tipo === 'ADMINISTRATIVO';
  const esUnSoloDia = !fechaFin || fechaInicio === fechaFin || esAdministrativo;

  // --- Carga de Datos (Query) ---
  const { data: motivosData, isLoading, isError } = useQuery(
    'motivosAdmin', 
    getMotivosAdministrativos,
    { enabled: esAdministrativo }
  );

  // --- LÓGICA DE ENVÍO (Mutation) (CORREGIDO) ---
  const mutacion = useMutation(crearSolicitud, {
    onSuccess: () => {
      // 1. Invalidamos (refrescamos) la lista de 'misSolicitudes'
      queryClient.invalidateQueries('misSolicitudes');
      
      // 2. Refrescamos los datos del usuario (para el contador de días)
      refetchUsuario(); 
      
      console.log("¡Solicitud creada con éxito!");
      alCancelar(); // Cerramos el modal
    },
    onError: (error) => {
      setErrorServidor(error.message);
    }
  });

  // --- Manejador de Envío ---
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorServidor(''); // Limpiamos errores

    const datosSolicitud = {
      tipo,
      fechaInicio,
      fechaFin: esAdministrativo ? fechaInicio : fechaFin || fechaInicio,
      jornada: esUnSoloDia ? jornada : 'COMPLETO', 
      motivo: esAdministrativo ? motivoAdmin : null,
    };
    
    mutacion.mutate(datosSolicitud); 
  };
  
  // Validaciones de fecha (FRD 3.A y 4)
  const getMinFechaInicio = () => {
    const hoy = new Date();
    // (Lógica simple, el backend tiene la validación de días hábiles)
    if (esAdministrativo) {
        hoy.setDate(hoy.getDate() + 1); 
    } else {
        hoy.setDate(hoy.getDate() + 1); // Asumimos 1 día para teletrabajo también
    }
    return hoy.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* 1. Tipo de Solicitud */}
      <fieldset>
        <legend className="text-lg font-medium text-gray-900 mb-2">1. Tipo de Permiso</legend>
        <div className="flex gap-x-6">
          <RadioInput name="tipo" value="TELETRABAJO" label="Teletrabajo" checked={tipo} onChange={setTipo} />
          <RadioInput name="tipo" value="ADMINISTRATIVO" label="Administrativo" checked={tipo} onChange={setTipo} />
        </div>
      </fieldset>

      {/* 2. Motivo (Condicional) */}
      {esAdministrativo && (
        <fieldset>
          <legend className="text-lg font-medium text-gray-900 mb-3">2. Motivo del Permiso</legend>
          {isLoading && <Spinner />}
          {isError && <p className="text-red-500">Error al cargar motivos.</p>}
          {motivosData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
              {Object.entries(motivosData).map(([categoria, motivos]) => (
                <div key={categoria} className="rounded-md border border-gray-200 p-3">
                  <h4 className="font-semibold text-gray-700 border-b pb-1 mb-2">{categoria}</h4>
                  <div className="space-y-2">
                    {motivos.map((motivo) => (
                      <RadioInput
                        key={motivo}
                        name="motivoAdmin"
                        value={motivo}
                        label={motivo}
                        checked={motivoAdmin}
                        onChange={setMotivoAdmin}
                        isSmall={true}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </fieldset>
      )}

      {/* 3. Fechas */}
      <fieldset>
        <legend className="text-lg font-medium text-gray-900 mb-2">
          {esAdministrativo ? '2. Fecha del Permiso' : '2. Rango de Fechas'}
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
            <input
              type="date"
              id="fechaInicio"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              min={getMinFechaInicio()}
            />
          </div>
          {!esAdministrativo && (
            <div>
              <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin (opcional)
              </label>
              <input
                type="date"
                id="fechaFin"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                min={fechaInicio} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          )}
        </div>
      </fieldset>

      {/* 4. Jornada (Condicional) */}
      {esUnSoloDia && (
        <fieldset>
          <legend className="text-lg font-medium text-gray-900 mb-2">
            {esAdministrativo ? '3. Jornada' : '3. Jornada'}
          </legend>
          <div className="flex gap-x-6">
            <RadioInput name="jornada" value="COMPLETO" label="Día Completo" checked={jornada} onChange={setJornada} />
            <RadioInput name="jornada" value="MANANA" label="Medio Día (Mañana)" checked={jornada} onChange={setJornada} />
            <RadioInput name="jornada" value="TARDE" label="Medio Día (Tarde)" checked={jornada} onChange={setJornada} />
          </div>
        </fieldset>
      )}

      {/* 5. Mensaje de Error del Servidor */}
      {errorServidor && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          <strong>Error:</strong> {errorServidor}
        </div>
      )}

      {/* 6. Botones de Acción */}
      <div className="flex justify-end gap-x-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={alCancelar}
          disabled={mutacion.isLoading}
          className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={mutacion.isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-400"
        >
          {mutacion.isLoading ? 'Enviando...' : 'Enviar Solicitud'}
        </button>
      </div>
    </form>
  );
};

// Componente helper para los radio buttons
const RadioInput = ({ name, value, label, checked, onChange, isSmall = false }) => (
  <label className={`flex items-center ${isSmall ? 'text-sm' : 'text-base'}`}>
    <input
      type="radio"
      name={name}
      value={value}
      checked={value === checked}
      onChange={(e) => onChange(e.target.value)}
      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
    />
    <span className="ml-2 text-gray-700">{label}</span>
  </label>
);


export default FormularioNuevaSolicitud;