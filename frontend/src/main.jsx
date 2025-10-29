// frontend/src/main.jsx (CORREGIDO)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './context/AuthContext';
import App from './App.jsx';
import './index.css';

// Creamos un cliente para React Query
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/*
      ¡ORDEN CORREGIDO!
      QueryClientProvider DEBE envolver a AuthProvider,
      porque AuthProvider AHORA USA el hook useQuery.
    */}

    {/* 1. Proveedor de React Query (NIVEL SUPERIOR) */}
    <QueryClientProvider client={queryClient}>
      {/* 2. Proveedor de Autenticación (NIVEL HIJO) */}
      <AuthProvider>
        {/* 3. Router */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);