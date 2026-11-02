/**
 * Pie de página institucional y sobrio.
 * Señala explícitamente el carácter demostrativo y volátil de los datos.
 */

import React from 'react';
import './PiePagina.css';

export const PiePagina: React.FC = () => {
  return (
    <footer className="pie-pagina-unfv">
      <div className="pie-pagina-contenedor">
        <p className="pie-pagina-aviso">
          Sistema de prueba · Los datos no se conservan al reiniciar el servidor
        </p>
        <p className="pie-pagina-derechos">
          Universidad Nacional Federico Villarreal · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default PiePagina;
