/**
 * Componente accesible para desplegar mensajes de error devueltos por el servidor o validación.
 */

import React from 'react';
import './MensajeError.css';

interface MensajeErrorProps {
  mensaje: string | null;
  className?: string;
  alCerrar?: () => void;
}

export const MensajeError: React.FC<MensajeErrorProps> = ({
  mensaje,
  className = '',
  alCerrar
}) => {
  if (!mensaje) return null;

  return (
    <div className={`mensaje-error-contenedor ${className}`} role="alert">
      <div className="mensaje-error-icono" aria-hidden="true">
        !
      </div>
      <div className="mensaje-error-texto">{mensaje}</div>
      {alCerrar && (
        <button
          type="button"
          onClick={alCerrar}
          className="mensaje-error-cerrar"
          aria-label="Cerrar mensaje de error"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default MensajeError;
