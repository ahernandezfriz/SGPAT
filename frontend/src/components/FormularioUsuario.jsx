// frontend/src/components/FormularioUsuario.jsx
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getAreas } from '../servicios/areas.servicio';
import { crearUsuario, actualizarUsuario } from '../servicios/usuarios.servicio';

/**
 * Formulario para Crear o Editar un Usuario.
 * @param {object} props
 * @param {object|null} props.usuarioAEditar - Si se pasa un usuario, entra en modo Edición.
 * @param {function} props.onClose - Función para cerrar el modal.
 */
const FormularioUsuario = ({ usuarioAEditar, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    email: '',
    nombreCompleto: '',
    password: '',
    rol: 'TRABAJADOR',
    areaId: '',
    diasAdminDisponibles: 5.0,
  });
  const [errorServidor, setErrorServidor] = useState('');

  // Cargar las áreas para el dropdown
  const { data: areas, isLoading: cargandoAreas } = useQuery('areas', getAreas);

  // Determinar si estamos en modo Edición
  const esModoEdicion = !!usuarioAEditar;

  // Llenar el formulario si estamos en modo Edición
  useEffect(() => {
    if (esModoEdicion) {
      setFormData({
        email: usuarioAEditar.email,
        nombreCompleto: usuarioAEditar.nombreCompleto,
        password: '', // La contraseña se deja en blanco (no se edita por defecto)
        rol: usuarioAEditar.rol,
        areaId: usuarioAEditar.areaId,
        diasAdminDisponibles: usuarioAEditar.diasAdminDisponibles,
      });
    }
  }, [usuarioAEditar, esModoEdicion]);

  // Mutación para guardar (Crea o Actualiza)
  const mutacion = useMutation(
    (datos) => {
      if (esModoEdicion) {
        return actualizarUsuario({ id: usuarioAEditar.id, ...datos });
      } else {
        return crearUsuario(datos);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('usuarios'); // Refrescar la tabla de usuarios
        onClose(); // Cerrar el modal
      },
      onError: (error) => {
        setErrorServidor(error.message);
      }
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorServidor('');

    let datosAEnviar = { ...formData };
    
    // En modo Edición, si la contraseña está vacía, no la enviamos
    if (esModoEdicion && !datosAEnviar.password) {
      delete datosAEnviar.password;
    }
    
    // Asegurarse de que el ID del área sea un número
    datosAEnviar.areaId = parseInt(datosAEnviar.areaId);
    datosAEnviar.diasAdminDisponibles = parseFloat(datosAEnviar.diasAdminDisponibles);

    mutacion.mutate(datosAEnviar);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre Completo */}
        <div>
          <label htmlFor="nombreCompleto" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
          <input
            type="text"
            name="nombreCompleto"
            id="nombreCompleto"
            value={formData.nombreCompleto}
            onChange={handleChange}
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Contraseña */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={esModoEdicion ? 'Dejar en blanco para no cambiar' : 'Requerido'}
            required={!esModoEdicion}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        
        {/* Rol */}
        <div>
          <label htmlFor="rol" className="block text-sm font-medium text-gray-700">Rol</label>
          <select
            name="rol"
            id="rol"
            value={formData.rol}
            onChange={handleChange}
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="TRABAJADOR">Trabajador</option>
            <option value="COORDINADOR">Coordinador</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>

        {/* Área */}
        <div>
          <label htmlFor="areaId" className="block text-sm font-medium text-gray-700">Área</label>
          <select
            name="areaId"
            id="areaId"
            value={formData.areaId}
            onChange={handleChange}
            required
            disabled={cargandoAreas}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="">{cargandoAreas ? 'Cargando...' : 'Seleccione un área'}</option>
            {areas && areas.map(area => (
              <option key={area.id} value={area.id}>{area.nombre}</option>
            ))}
          </select>
        </div>
        
        {/* Días Disponibles */}
        <div>
          <label htmlFor="diasAdminDisponibles" className="block text-sm font-medium text-gray-700">Días Admin. Disponibles</label>
          <input
            type="number"
            name="diasAdminDisponibles"
            id="diasAdminDisponibles"
            value={formData.diasAdminDisponibles}
            onChange={handleChange}
            step="0.5"
            min="0"
            required
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
      </div>

      {/* Errores */}
      {errorServidor && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          <strong>Error:</strong> {errorServidor}
        </div>
      )}

      {/* Acciones */}
      <div className="flex justify-end gap-x-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          disabled={mutacion.isLoading}
          className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={mutacion.isLoading || cargandoAreas}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {mutacion.isLoading ? 'Guardando...' : (esModoEdicion ? 'Actualizar Usuario' : 'Crear Usuario')}
        </button>
      </div>
    </form>
  );
};

export default FormularioUsuario;