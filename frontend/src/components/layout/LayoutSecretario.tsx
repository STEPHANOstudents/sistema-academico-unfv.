/**
 * Estructura de diseño para las vistas del personal de Secretaría.
 * Integra la cabecera institucional, menú lateral de gestión, área de contenido y pie de página.
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CabeceraInstitucional from './CabeceraInstitucional';
import MenuLateral from './MenuLateral';
import PiePagina from './PiePagina';
import './LayoutSecretario.css';

export const LayoutSecretario: React.FC = () => {
  const [menuAbierto, setMenuAbierto] = useState<boolean>(false);

  const alternarMenu = () => setMenuAbierto(!menuAbierto);
  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <div className="layout-secretario">
      <CabeceraInstitucional
        mostrarBotonMenu={true}
        alAlternarMenu={alternarMenu}
        menuAbierto={menuAbierto}
      />

      <div className="layout-secretario-cuerpo">
        <MenuLateral abierto={menuAbierto} alCerrar={cerrarMenu} />

        <main className="layout-secretario-contenido">
          <div className="layout-secretario-ancho">
            <Outlet />
          </div>
        </main>
      </div>

      <PiePagina />
    </div>
  );
};

export default LayoutSecretario;
