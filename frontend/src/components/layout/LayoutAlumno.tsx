/**
 * Estructura de diseño para la vista del Alumno.
 * Interfaz limpia y centrada sin menú lateral, orientada a la consulta de sus calificaciones.
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import CabeceraInstitucional from './CabeceraInstitucional';
import PiePagina from './PiePagina';
import './LayoutAlumno.css';

export const LayoutAlumno: React.FC = () => {
  return (
    <div className="layout-alumno">
      <CabeceraInstitucional mostrarBotonMenu={false} />

      <main className="layout-alumno-contenido">
        <div className="layout-alumno-ancho">
          <Outlet />
        </div>
      </main>

      <PiePagina />
    </div>
  );
};

export default LayoutAlumno;
