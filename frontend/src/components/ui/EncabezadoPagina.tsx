/**
 * Encabezado de página con título formal, descripción y botones de acción.
 */

import React, { ReactNode } from 'react';
import './EncabezadoPagina.css';

interface EncabezadoPaginaProps {
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
  className?: string;
}

export const EncabezadoPagina: React.FC<EncabezadoPaginaProps> = ({
  titulo,
  descripcion,
  acciones,
  className = ''
}) => {
  return (
    <div className={`encabezado-pagina ${className}`}>
      <div className="encabezado-pagina-textos">
        <h2 className="encabezado-pagina-titulo">{titulo}</h2>
        {descripcion && <p className="encabezado-pagina-descripcion">{descripcion}</p>}
      </div>
      {acciones && <div className="encabezado-pagina-acciones">{acciones}</div>}
    </div>
  );
};

export default EncabezadoPagina;
