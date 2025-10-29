// frontend/src/pages/PaginaGestionUsuarios.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getUsuarios, eliminarUsuario } from '../servicios/usuarios.servicio';
import Modal from '../components/Modal';
import FormularioUsuario from '../components/FormularioUsuario';

const PaginaGestionUsuarios = () => {
  const queryClient = useQueryClient();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioAEditar, setUsuarioAEditar] = useState(null); // null = Crear, objeto = Editar

  // 1. Query para traer la lista de usuarios
  const { data: usuarios, isLoading, isError } = useQuery('usuarios', getUsuarios);

  // 2. Mutación para eliminar usuarios
  const mutacionEliminar = useMutation(eliminarUsuario, {
    onSuccess: () => {
      queryClient.invalidateQueries('usuarios');
    },
    onError: (error) => {
      alert(`Error al eliminar: ${error.message}`);
    }
  });

  // --- Handlers ---
  const handleAbrirModalCrear = () => {
    setUsuarioAEditar(null); // Asegurarse de que esté en modo "Crear"
    setModalAbierto(true);
  };

  const handleAbrirModalEditar = (usuario) => {
    setUsuarioAEditar(usuario); // Ponerlo en modo "Editar"
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setUsuarioAEditar(null); // Limpiar
  };

  const handleEliminar = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      mutacionEliminar.mutate(id);
    }
  };

  // --- Renderizado ---
  if (isError) return <div className="text-red-500">Error al cargar usuarios.</div>;

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Gestión de Usuarios
          </h2>
          <button
            onClick={handleAbrirModalCrear}
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            + Crear Nuevo Usuario
          </button>
        </div>

        {/* Tabla de Usuarios */}
        {isLoading ? (
          <div className="text-center">Cargando usuarios...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(usuarios || []).map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nombreCompleto}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        user.rol === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        user.rol === 'COORDINADOR' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{user.area.nombre}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium flex gap-x-2">
                      <button
                        onClick={() => handleAbrirModalEditar(user)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(user.id)}
                        disabled={mutacionEliminar.isLoading}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Crear/Editar */}
      <Modal
        isOpen={modalAbierto}
        onClose={handleCerrarModal}
        titulo={usuarioAEditar ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
      >
        <FormularioUsuario 
          usuarioAEditar={usuarioAEditar}
          onClose={handleCerrarModal}
        />
      </Modal>
    </>
  );
};

export default PaginaGestionUsuarios;