/**
 * Contexto de autenticación y estado global de la sesión.
 * Gestiona el ciclo de vida del usuario, almacenamiento del token y restauración automática al recargar.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Rol, UsuarioSesion } from '../types/modelos';
import { obtenerSesion } from '../api/authApi';

const CLAVE_STORAGE_TOKEN = 'unfv_token_acceso';
const CLAVE_STORAGE_USUARIO = 'unfv_sesion_usuario';

interface ContextoAutenticacionTipo {
  usuario: string | null;
  rol: Rol | null;
  nombre: string | null;
  token: string | null;
  cargando: boolean;
  iniciarSesion: (token: string, rol: Rol, nombre: string, usuario: string) => void;
  cerrarSesion: () => void;
}

const AuthContext = createContext<ContextoAutenticacionTipo | undefined>(undefined);

/**
 * Proveedor del contexto de autenticación para toda la aplicación.
 * 
 * Compromiso de seguridad y justificación de sessionStorage:
 * En este sistema académico de demostración se utiliza `sessionStorage` para almacenar el token JWT.
 * Esto asegura que al cerrar la pestaña del navegador la sesión expire de forma inmediata y automática,
 * reduciendo riesgos en computadoras compartidas o laboratorios universitarios.
 * No obstante, cabe destacar que en un entorno productivo real, la arquitectura recomendada es
 * utilizar cookies seguras con atributo `httpOnly` y `SameSite=Strict`, lo cual blinda completamente
 * al token contra ataques de lectura indebida por scripts del lado del cliente (XSS).
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem(CLAVE_STORAGE_TOKEN);
  });
  const [rol, setRol] = useState<Rol | null>(() => {
    const raw = sessionStorage.getItem(CLAVE_STORAGE_USUARIO);
    if (raw) {
      try {
        const parseado = JSON.parse(raw) as UsuarioSesion;
        return parseado.rol;
      } catch (_e) {
        return null;
      }
    }
    return null;
  });
  const [nombre, setNombre] = useState<string | null>(() => {
    const raw = sessionStorage.getItem(CLAVE_STORAGE_USUARIO);
    if (raw) {
      try {
        const parseado = JSON.parse(raw) as UsuarioSesion;
        return parseado.nombre;
      } catch (_e) {
        return null;
      }
    }
    return null;
  });
  const [usuario, setUsuario] = useState<string | null>(() => {
    const raw = sessionStorage.getItem(CLAVE_STORAGE_USUARIO);
    if (raw) {
      try {
        const parseado = JSON.parse(raw) as UsuarioSesion;
        return parseado.id;
      } catch (_e) {
        return null;
      }
    }
    return null;
  });
  const [cargando, setCargando] = useState<boolean>(true);

  // Al montar la aplicación, si existe un token en sessionStorage, verificarlo contra el backend
  useEffect(() => {
    async function restaurarSesion() {
      const tokenGuardado = sessionStorage.getItem(CLAVE_STORAGE_TOKEN);
      if (!tokenGuardado) {
        setCargando(false);
        return;
      }

      try {
        const datos = await obtenerSesion();
        setUsuario(datos.id);
        setRol(datos.rol);
        setNombre(datos.nombre);
        sessionStorage.setItem(CLAVE_STORAGE_USUARIO, JSON.stringify(datos));
      } catch (_error) {
        // Si el token es inválido o expiró, limpiar estados
        sessionStorage.removeItem(CLAVE_STORAGE_TOKEN);
        sessionStorage.removeItem(CLAVE_STORAGE_USUARIO);
        setToken(null);
        setRol(null);
        setNombre(null);
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    }

    restaurarSesion();
  }, []);

  /**
   * Almacena las credenciales activas tanto en memoria de React como en sessionStorage.
   */
  const iniciarSesion = (nuevoToken: string, nuevoRol: Rol, nuevoNombre: string, nuevoUsuario: string) => {
    setToken(nuevoToken);
    setRol(nuevoRol);
    setNombre(nuevoNombre);
    setUsuario(nuevoUsuario);

    sessionStorage.setItem(CLAVE_STORAGE_TOKEN, nuevoToken);
    sessionStorage.setItem(
      CLAVE_STORAGE_USUARIO,
      JSON.stringify({ id: nuevoUsuario, rol: nuevoRol, nombre: nuevoNombre })
    );
  };

  /**
   * Pasa al estado no autenticado y purga todo rastro del token en sessionStorage.
   */
  const cerrarSesion = () => {
    setToken(null);
    setRol(null);
    setNombre(null);
    setUsuario(null);

    sessionStorage.removeItem(CLAVE_STORAGE_TOKEN);
    sessionStorage.removeItem(CLAVE_STORAGE_USUARIO);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        rol,
        nombre,
        token,
        cargando,
        iniciarSesion,
        cerrarSesion
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para consumir fácilmente las propiedades y funciones del contexto de autenticación.
 */
export function useAuth(): ContextoAutenticacionTipo {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider.');
  }
  return contexto;
}
