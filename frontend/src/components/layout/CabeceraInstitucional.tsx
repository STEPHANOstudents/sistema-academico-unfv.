/**
 * Cabecera institucional de la Universidad Nacional Federico Villarreal.
 * Despliega el isotipo/escudo, denominación de la casa de estudios, datos del usuario y botón de cierre de sesión.
 */

import React from 'react';
import Escudo from '../ui/Escudo';
import { useAuth } from '../../context/AuthContext';
import './CabeceraInstitucional.css';

interface CabeceraInstitucionalProps {
  mostrarBotonMenu?: boolean;
  alAlternarMenu?: () => void;
  menuAbierto?: boolean;
}

export const CabeceraInstitucional: React.FC<CabeceraInstitucionalProps> = ({
  mostrarBotonMenu = false,
  alAlternarMenu,
  menuAbierto = false
}) => {
  const { nombre, rol, usuario, cerrarSesion } = useAuth();

  return (
    <header className="cabecera-institucional">
      <div className="cabecera-contenedor">
        {/* Lado izquierdo: Botón hamburguesa móvil + Escudo + Denominación */}
        <div className="cabecera-marca">
          {mostrarBotonMenu && (
            <button
              type="button"
              className="cabecera-boton-menu"
              onClick={alAlternarMenu}
              aria-label={menuAbierto ? 'Cerrar menú lateral' : 'Abrir menú lateral'}
              aria-expanded={menuAbierto}
            >
              <span className="cabecera-hamburguesa-icono" aria-hidden="true">
                {menuAbierto ? '✕' : '☰'}
              </span>
            </button>
          )}

          <Escudo tamano={48} />

          <div className="cabecera-titulos">
            <h1 className="cabecera-universidad">Universidad Nacional Federico Villarreal</h1>
            <p className="cabecera-subtitulo">Sistema de Gestión Académica</p>
          </div>
        </div>

        {/* Lado derecho: Información del usuario en sesión y cerrar sesión */}
        {nombre && (
          <div className="cabecera-sesion">
            <div className="cabecera-usuario-info">
              <span className="cabecera-usuario-nombre">{nombre}</span>
              <span className="cabecera-usuario-rol">
                {rol === 'SECRETARIO' ? 'Secretaría Académica' : `Alumno [${usuario}]`}
              </span>
            </div>

            <button
              type="button"
              onClick={cerrarSesion}
              className="cabecera-boton-salir"
              title="Cerrar la sesión actual"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
      <div className="cabecera-linea-plata" aria-hidden="true" />
    </header>
  );
};

export default CabeceraInstitucional;
