/**
 * Componente guardián para proteger rutas y vistas según la sesión y el rol del usuario.
 * Redirige al login si no hay sesión o despliega la vista de no autorizado si el rol no concuerda.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rol } from '../types/modelos';
import NoAutorizado from '../pages/NoAutorizado';

interface RutaProtegidaProps {
  rolPermitido: Rol;
  children: React.ReactElement;
}

/**
 * Envoltorio para rutas que exigen autenticación y un rol determinado.
 *
 * Consideración de seguridad arquitectónica:
 * La protección de rutas en el cliente (React Router) es una herramienta de navegación y experiencia
 * de usuario (UX): previene accesos accidentales y dirige al usuario a la pantalla idónea.
 * Sin embargo, NO es una barrera de seguridad infranqueable, dado que el código en el cliente puede ser
 * inspeccionado o modificado en memoria. La verdadera seguridad la ejerce de manera inviolable el servidor
 * backend, validando la firma criptográfica del JWT en cada petición a la API.
 */
export const RutaProtegida: React.FC<RutaProtegidaProps> = ({ rolPermitido, children }) => {
  const { token, rol, cargando } = useAuth();
  const location = useLocation();

  // Esperar a que concluya la verificación del token en la inicialización
  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--color-primario)' }}>
        <p>Cargando sesión institucional...</p>
      </div>
    );
  }

  // 1. Si no hay sesión activa, redirigir al Login guardando la ubicación intentada
  if (!token) {
    return <Navigate to="/login" state={{ desde: location }} replace />;
  }

  // 2. Si el rol del usuario autenticado no coincide con el rol requerido
  if (rol !== rolPermitido) {
    return <NoAutorizado />;
  }

  // 3. Acceso autorizado
  return children;
};

export default RutaProtegida;
