// frontend/src/components/RutaPorRol.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente "Guardián" que protege rutas según una lista de roles permitidos.
 * Debe usarse DENTRO de <RutaProtegida>
 * @param {object} props
 * @param {string[]} props.rolesPermitidos - Array de roles (ej: ['ADMIN', 'COORDINADOR'])
 */
const RutaPorRol = ({ rolesPermitidos }) => {
  const { usuario } = useAuth();

  if (!usuario) {
    // Esto no debería pasar si se usa dentro de RutaProtegida, pero por seguridad:
    return <Navigate to="/login" replace />;
  }

  // Comprobar si el rol del usuario está en la lista de permitidos
  const tienePermiso = rolesPermitidos.includes(usuario.rol);

  if (!tienePermiso) {
    // Si no tiene permiso, lo enviamos al dashboard principal
    return <Navigate to="/" replace />;
  }

  // Si tiene permiso, renderizamos el contenido de la ruta
  return <Outlet />;
};

export default RutaPorRol;