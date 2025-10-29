// frontend/src/components/RutaProtegida.jsx
import React from 'react';
import { Navigate, Outlet, Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';

// --- Componente Navbar (Actualizado) ---
const Navbar = () => {
  const { usuario, cerrarSesion } = useAuth();
  
  // Inicializamos el hook de navegación
  const navigate = useNavigate();

  const esCoordinador = usuario.rol === 'COORDINADOR';
  const esAdmin = usuario.rol === 'ADMIN';

  // Creamos un manejador para el clic
  const handleCerrarSesion = () => {
    cerrarSesion();      // Limpia el estado de autenticación
    navigate('/login');  // Fuerza la redirección a la página de login
  };

  return (
    <nav className="bg-white shadow-md w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Lado Izquierdo: Título y Datos */}
          <div className="flex items-center">
            <Link to="/" className="font-bold text-xl text-blue-600">
              Gestión de Permisos
            </Link>
            
            <div className="hidden md:flex ml-6 space-x-4 items-center">
              
              {/* Enlace para Coordinador (o Admin) */}
              {(esCoordinador || esAdmin) && (
                <>
                  <span className="text-gray-300">|</span>
                  <Link 
                    to="/coordinacion" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Coordinación
                  </Link>
                </>
              )}
              
              {/* --- ¡NUEVO ENLACE! --- */}
              {/* Enlace solo para Admin */}
              {esAdmin && (
                <>
                  <span className="text-gray-300">|</span>
                  <Link 
                    to="/admin" 
                    className="text-red-700 hover:text-red-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Aprobar Solicitudes
                  </Link>

                  <span className="text-gray-300">|</span>
                   <Link 
                    to="/admin/usuarios" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Gestionar Usuarios
                  </Link>
                </>
              )}
              {/* --- FIN NUEVO ENLACE --- */}

            </div>
          </div>
          
          {/* Lado Derecho: Usuario y Cerrar Sesión */}
          {/* ... (sin cambios) ... */}
          <div className="flex items-center">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-gray-800 font-medium text-sm">{usuario.nombre}</span>
              <span className="text-gray-500 text-xs">{usuario.area} ({usuario.rol})</span>
            </div>
            <button
              onClick={handleCerrarSesion}
              className="bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
// --- Fin del componente Navbar ---

// --- Componente RutaProtegida (sin cambios) ---
const RutaProtegida = ({ children }) => {
 
  const { estaAutenticado, estaCargando } = useAuth();

  if (estaCargando) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-2xl font-bold">Cargando...</h1>
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar /> 
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet /> 
      </main>
    </div>
  );
};

export default RutaProtegida;