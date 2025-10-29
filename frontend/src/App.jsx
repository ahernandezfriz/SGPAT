// frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Importaciones de Páginas y Componentes
import PaginaLogin from './pages/PaginaLogin';
import RutaProtegida from './components/RutaProtegida';
import PaginaDashboard from './pages/PaginaDashboard';
import RutaPorRol from './components/RutaPorRol';
import PaginaCoordinador from './pages/PaginaCoordinador';
//import PaginaAdmin from './pages/PaginaAdmin';
import PaginaGestionUsuarios from './pages/PaginaGestionUsuarios';

// --- ¡ACTUALIZACIÓN! ---
// 1. Importamos la página real de Admin
import PaginaAdmin from './pages/PaginaAdmin';

// 2. (Ya no necesitamos el componente 'const PaginaAdmin = ...' de antes)


function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<PaginaLogin />} />

        {/* --- RUTAS PROTEGIDAS (Requieren Login) --- */}
        <Route element={<RutaProtegida />}>
          
          {/* Rutas para TODOS los roles logueados */}
          <Route path="/" element={<PaginaDashboard />} />

          {/* Rutas para COORDINADOR y ADMIN */}
          <Route element={<RutaPorRol rolesPermitidos={['COORDINADOR', 'ADMIN']} />}>
            <Route path="/coordinacion" element={<PaginaCoordinador />} />
          </Route>

          {/* Rutas SÓLO para ADMIN */}
          <Route element={<RutaPorRol rolesPermitidos={['ADMIN']} />}>
            {/* 3. Usamos el componente importado */}
            <Route path="/admin" element={<PaginaAdmin />} />
            <Route path="/admin/usuarios" element={<PaginaGestionUsuarios />} />
          </Route>
          
        </Route>
        {/* --- FIN RUTAS PROTEGIDAS --- */}

        <Route path="*" element={<div>404 - Página no encontrada</div>} />
      </Routes>
    </div>
  );
}

export default App;