/**
 * Menú de navegación lateral para el personal de Secretaría.
 * Vincula todas las secciones operativas del sistema con respuesta adaptativa para móviles.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import './MenuLateral.css';

interface MenuLateralProps {
  abierto: boolean;
  alCerrar: () => void;
}

interface ItemNavegacion {
  etiqueta: string;
  ruta: string;
  icono: string;
}

const ITEMS_NAVEGACION: ItemNavegacion[] = [
  { etiqueta: 'Panel Principal', ruta: '/secretario', icono: '📊' },
  { etiqueta: 'Gestión de Alumnos', ruta: '/secretario/alumnos', icono: '👥' },
  { etiqueta: 'Catálogo de Cursos', ruta: '/secretario/cursos', icono: '📚' },
  { etiqueta: 'Registro de Notas', ruta: '/secretario/notas', icono: '📝' }
];

export const MenuLateral: React.FC<MenuLateralProps> = ({ abierto, alCerrar }) => {
  return (
    <>
      {/* Fondo semitransparente para cerrar el menú en dispositivos móviles */}
      {abierto && <div className="menu-lateral-overlay" onClick={alCerrar} aria-hidden="true" />}

      <nav className={`menu-lateral ${abierto ? 'menu-lateral-abierto' : ''}`} aria-label="Navegación de secretaría">
        <div className="menu-lateral-titulo">
          <span>Módulos de Gestión</span>
        </div>

        <ul className="menu-lateral-lista">
          {ITEMS_NAVEGACION.map((item) => (
            <li key={item.ruta} className="menu-lateral-item">
              <NavLink
                to={item.ruta}
                end={item.ruta === '/secretario'}
                onClick={alCerrar}
                className={({ isActive }) =>
                  `menu-lateral-enlace ${isActive ? 'menu-lateral-enlace-activo' : ''}`
                }
              >
                <span className="menu-lateral-icono" aria-hidden="true">
                  {item.icono}
                </span>
                <span className="menu-lateral-texto">{item.etiqueta}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default MenuLateral;
