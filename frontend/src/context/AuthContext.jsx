// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useContext } from 'react';
// Importamos useQuery
import { useQuery, useQueryClient } from 'react-query';
import api from '../servicios/api';

// Función para traer el perfil (la movemos aquí)
const fetchPerfilUsuario = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error("No hay token");
  }
  // El interceptor de 'api.js' añade el token automáticamente
  const { data } = await api.get('/auth/perfil');
  return data;
};

// 1. Crear el Contexto
const AuthContext = createContext();

// 2. Crear el Proveedor (Provider)
export const AuthProvider = ({ children }) => {
  // 'estaAutenticado' ahora depende de si tenemos un token
  const [token, setToken] = useState(localStorage.getItem('token'));

  // 2. Obtenemos el cliente de query
  const queryClient = useQueryClient();

  // --- ¡LÓGICA CON REACT QUERY! ---
  // Usamos useQuery para gestionar el estado del 'usuario'
  const { 
    data: usuario, 
    isLoading: estaCargando, 
    refetch: refetchUsuario // Obtenemos la función de refetch
  } = useQuery(
    'perfilUsuario',   // Key de la caché
    fetchPerfilUsuario, // Función de fetching
    {
      enabled: !!token, // Solo se ejecuta si 'token' existe
      retry: false,     // No reintenta si el token es inválido
      staleTime: Infinity, // El perfil no se considera "viejo"
      cacheTime: Infinity,
      onError: () => {
        // Si el fetch falla (token inválido), cerramos sesión
        cerrarSesion(); 
      },
    }
  );

  const estaAutenticado = !!usuario; // Está autenticado si 'usuario' tiene datos

  // 4. Función de Iniciar Sesión
  const iniciarSesion = async (email, password) => {
    try {
      const respuesta = await api.post('/auth/login', { email, password });
      const { token: nuevoToken } = respuesta.data;

      localStorage.setItem('token', nuevoToken);
      setToken(nuevoToken); // Actualiza el token, lo que activará el useQuery
      
      return true;

    } catch (error) {
      console.error("Error en inicio de sesión:", error.response?.data?.error);
      throw new Error(error.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  // 5. Función de Cerrar Sesión
  const cerrarSesion = () => {
    localStorage.removeItem('token');
    setToken(null);
    // ¡Limpia TODA la caché de react-query!
    // Esto asegura que la próxima vez que alguien inicie sesión,
    // se carguen los datos frescos de ese nuevo usuario.
    queryClient.clear();
  };

  // 6. Valor que proveerá el Contexto
  const valor = {
    usuario: usuario || null, // Asegura que sea 'null' si está indefinido
    estaAutenticado,
    estaCargando,
    iniciarSesion,
    cerrarSesion,
    refetchUsuario, // Exponemos la función de refetch
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
};

// 7. Hook personalizado (sin cambios)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};