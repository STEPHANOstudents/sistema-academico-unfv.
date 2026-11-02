/**
 * Notificación temporal breve (toast) para confirmar acciones exitosas.
 */

import React, { useEffect } from 'react';
import './AvisoTemporal.css';

interface AvisoTemporalProps {
  mensaje: string | null;
  alCerrar: () => void;
  duracionMs?: number;
}

export const AvisoTemporal: React.FC<AvisoTemporalProps> = ({
  mensaje,
  alCerrar,
  duracionMs = 4000
}) => {
  useEffect(() => {
    if (!mensaje) return;

    const temporizador = setTimeout(() => {
      alCerrar();
    }, duracionMs);

    return () => clearTimeout(temporizador);
  }, [mensaje, alCerrar, duracionMs]);

  if (!mensaje) return null;

  return (
    <div className="aviso-temporal-contenedor" role="status">
      <span className="aviso-temporal-icono" aria-hidden="true">
        ✓
      </span>
      <span className="aviso-temporal-texto">{mensaje}</span>
      <button
        type="button"
        className="aviso-temporal-boton"
        onClick={alCerrar}
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
};

export default AvisoTemporal;
