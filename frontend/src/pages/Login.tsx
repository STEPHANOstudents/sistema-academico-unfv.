/**
 * Pantalla institucional de acceso al Sistema de Gestión Académica UNFV.
 * Proporciona dos modalidades de autenticación seleccionables por pestañas: Alumno y Secretario.
 */

import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Escudo from '../components/ui/Escudo';
import CampoTexto from '../components/ui/CampoTexto';
import Boton from '../components/ui/Boton';
import MensajeError from '../components/ui/MensajeError';
import { useAuth } from '../context/AuthContext';
import { loginSecretario, loginAlumno } from '../api/authApi';
import { Rol } from '../types/modelos';
import './Login.css';

export const Login: React.FC = () => {
  const [modo, setModo] = useState<Rol>('ALUMNO');

  // Campos para Alumno
  const [codigoAlumno, setCodigoAlumno] = useState<string>('');

  // Campos para Secretario
  const [usuarioSecretario, setUsuarioSecretario] = useState<string>('');
  const [claveSecretario, setClaveSecretario] = useState<string>('');

  // Estados de control
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);

  const { token, rol, iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Si ya existe sesión activa, redirigir automáticamente al panel respectivo
  useEffect(() => {
    if (token && rol) {
      const destino = rol === 'SECRETARIO' ? '/secretario' : '/alumno';
      navigate(destino, { replace: true });
    }
  }, [token, rol, navigate]);

  // Limpiar mensaje de error al alternar pestaña
  const cambiarModo = (nuevoModo: Rol) => {
    setModo(nuevoModo);
    setErrorServidor(null);
  };

  const manejarEnvio = async (e: FormEvent) => {
    e.preventDefault();
    setErrorServidor(null);
    setCargando(true);

    try {
      if (modo === 'ALUMNO') {
        const codigoLimpio = codigoAlumno.trim().toUpperCase();
        if (!codigoLimpio) {
          setErrorServidor('Por favor, ingrese su código de alumno.');
          setCargando(false);
          return;
        }

        const respuesta = await loginAlumno(codigoLimpio);
        iniciarSesion(respuesta.token, respuesta.rol, respuesta.nombre, codigoLimpio);

        // Redirección hacia /alumno o la ruta original intentada
        const origen = (location.state as { desde?: { pathname: string } })?.desde?.pathname;
        navigate(origen && origen.startsWith('/alumno') ? origen : '/alumno', { replace: true });
      } else {
        const usuarioLimpio = usuarioSecretario.trim();
        const claveLimpia = claveSecretario.trim();

        if (!usuarioLimpio || !claveLimpia) {
          setErrorServidor('Por favor, complete su usuario y clave.');
          setCargando(false);
          return;
        }

        const respuesta = await loginSecretario(usuarioLimpio, claveLimpia);
        iniciarSesion(respuesta.token, respuesta.rol, respuesta.nombre, usuarioLimpio);

        // Redirección hacia /secretario o la ruta original intentada
        const origen = (location.state as { desde?: { pathname: string } })?.desde?.pathname;
        navigate(origen && origen.startsWith('/secretario') ? origen : '/secretario', { replace: true });
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorServidor(error.message);
      } else {
        setErrorServidor('Error inesperado al intentar iniciar sesión.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-pantalla">
      <div className="login-tarjeta">
        {/* Franja superior guinda con acento plateado */}
        <div className="login-franja-guinda" aria-hidden="true" />

        <div className="login-cuerpo">
          {/* Encabezado institucional */}
          <div className="login-encabezado">
            <Escudo tamano={64} />
            <h1 className="login-universidad">Universidad Nacional Federico Villarreal</h1>
            <p className="login-subtitulo">Sistema de Gestión Académica</p>
          </div>

          {/* Selector de modo institucional (Pestañas) */}
          <div className="login-pestanas" role="tablist" aria-label="Modalidad de ingreso">
            <button
              type="button"
              role="tab"
              aria-selected={modo === 'ALUMNO'}
              className={`login-pestana ${modo === 'ALUMNO' ? 'login-pestana-activa' : ''}`}
              onClick={() => cambiarModo('ALUMNO')}
            >
              Soy Alumno
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={modo === 'SECRETARIO'}
              className={`login-pestana ${modo === 'SECRETARIO' ? 'login-pestana-activa' : ''}`}
              onClick={() => cambiarModo('SECRETARIO')}
            >
              Soy Secretario
            </button>
          </div>

          {/* Alerta de error del servidor */}
          <MensajeError mensaje={errorServidor} alCerrar={() => setErrorServidor(null)} />

          {/* Formulario de Login */}
          <form onSubmit={manejarEnvio} noValidate className="login-formulario">
            {modo === 'ALUMNO' ? (
              <div className="login-campos-alumno">
                <CampoTexto
                  etiqueta="Código de Alumno"
                  ayuda="Ejemplo: 20184321C (8 dígitos seguidos de su letra verificadora)"
                  placeholder="20184321C"
                  value={codigoAlumno}
                  maxLength={9}
                  onChange={(e) => setCodigoAlumno(e.target.value.toUpperCase())}
                  autoComplete="off"
                  autoFocus
                  required
                />
                <p className="login-nota-alumno">
                  Los estudiantes ingresan directamente con su código oficial sin requerir contraseña.
                </p>
              </div>
            ) : (
              <div className="login-campos-secretario">
                <CampoTexto
                  etiqueta="Usuario Administrativo"
                  placeholder="Ej. 100"
                  value={usuarioSecretario}
                  onChange={(e) => setUsuarioSecretario(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  required
                />
                <CampoTexto
                  etiqueta="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  value={claveSecretario}
                  onChange={(e) => setClaveSecretario(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            )}

            <Boton
              type="submit"
              variante="primario"
              cargando={cargando}
              className="login-boton-acceder"
            >
              {modo === 'ALUMNO' ? 'Consultar Mis Notas' : 'Ingresar al Sistema'}
            </Boton>
          </form>
        </div>

        {/* Pie de la tarjeta */}
        <div className="login-pie">
          <span>Portal Oficial de Evaluación Académica</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
