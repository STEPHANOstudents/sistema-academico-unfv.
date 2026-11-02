/**
 * Componente principal de la aplicación y enrutamiento global.
 * Configura las rutas protegidas para SECRETARIO y ALUMNO, layouts y páginas de error.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import RutaProtegida from './routes/RutaProtegida';
import LayoutSecretario from './components/layout/LayoutSecretario';
import LayoutAlumno from './components/layout/LayoutAlumno';
import Login from './pages/Login';
import NoAutorizado from './pages/NoAutorizado';
import NoEncontrada from './pages/NoEncontrada';

// Pantallas del Secretario
import PanelSecretario from './pages/secretario/PanelSecretario';
import ListaAlumnos from './pages/secretario/ListaAlumnos';
import DetalleAlumno from './pages/secretario/DetalleAlumno';
import ListaCursos from './pages/secretario/ListaCursos';
import RegistroNotas from './pages/secretario/RegistroNotas';

// Pantalla del Alumno
import MisNotas from './pages/alumno/MisNotas';

// Mascota interactiva institucional Speaki
import SpeakiWidget from './components/speaki/SpeakiWidget';

/**
 * Redirección de la raíz (/) hacia el panel correspondiente según la sesión activa.
 */
const RedireccionRaiz: React.FC = () => {
  const { token, rol, cargando } = useAuth();

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--color-primario)' }}>
        <p>Cargando sesión institucional...</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return rol === 'SECRETARIO' ? <Navigate to="/secretario" replace /> : <Navigate to="/alumno" replace />;
};

export const App: React.FC = () => {
  return (
    <>
      <Routes>
        {/* Redirección dinámica en la raíz */}
        <Route path="/" element={<RedireccionRaiz />} />

        {/* Acceso público */}
        <Route path="/login" element={<Login />} />

        {/* Pantalla 403 No Autorizado */}
        <Route path="/no-autorizado" element={<NoAutorizado />} />

        {/* Módulo Protegido: Personal de Secretaría */}
        <Route
          path="/secretario"
          element={
            <RutaProtegida rolPermitido="SECRETARIO">
              <LayoutSecretario />
            </RutaProtegida>
          }
        >
          <Route index element={<PanelSecretario />} />
          <Route path="alumnos" element={<ListaAlumnos />} />
          <Route path="alumnos/:codigo" element={<DetalleAlumno />} />
          <Route path="cursos" element={<ListaCursos />} />
          <Route path="notas" element={<RegistroNotas />} />
        </Route>

        {/* Módulo Protegido: Estudiante */}
        <Route
          path="/alumno"
          element={
            <RutaProtegida rolPermitido="ALUMNO">
              <LayoutAlumno />
            </RutaProtegida>
          }
        >
          <Route index element={<MisNotas />} />
        </Route>

        {/* Ruta 404 No Encontrada */}
        <Route path="*" element={<NoEncontrada />} />
      </Routes>

      {/* Widget Interactivo de Speaki en la esquina inferior derecha */}
      <SpeakiWidget />
    </>
  );
};

export default App;
