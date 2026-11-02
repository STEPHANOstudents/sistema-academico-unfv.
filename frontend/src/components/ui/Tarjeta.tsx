/**
 * Contenedor de tarjeta institucional con bordes finos y fondo blanco sobrio.
 */

import React, { ReactNode } from 'react';
import './Tarjeta.css';

interface TarjetaProps {
  titulo?: string;
  subtitulo?: string;
  acciones?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const Tarjeta: React.FC<TarjetaProps> = ({
  titulo,
  subtitulo,
  acciones,
  children,
  className = ''
}) => {
  return (
    <div className={`tarjeta-unfv ${className}`}>
      {(titulo || acciones) && (
        <div className="tarjeta-cabecera">
          <div>
            {titulo && <h3 className="tarjeta-titulo">{titulo}</h3>}
            {subtitulo && <p className="tarjeta-subtitulo">{subtitulo}</p>}
          </div>
          {acciones && <div className="tarjeta-acciones">{acciones}</div>}
        </div>
      )}
      <div className="tarjeta-cuerpo">{children}</div>
    </div>
  );
};

export default Tarjeta;
