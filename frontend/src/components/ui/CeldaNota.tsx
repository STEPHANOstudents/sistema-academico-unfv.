/**
 * Despliega una nota individual formateada con diferenciación semántica y textual de aprobación.
 */

import React from 'react';
import { NOTA_APROBATORIA } from '../../utils/notas';
import './CeldaNota.css';

interface CeldaNotaProps {
  nota: number | null;
  etiqueta?: string;
  className?: string;
}

export const CeldaNota: React.FC<CeldaNotaProps> = ({ nota, etiqueta, className = '' }) => {
  if (nota === null || typeof nota !== 'number') {
    return (
      <div className={`celda-nota celda-nota-pendiente ${className}`}>
        {etiqueta && <span className="celda-nota-etiqueta">{etiqueta}</span>}
        <span className="celda-nota-valor">—</span>
        <span className="celda-nota-estado">Pendiente</span>
      </div>
    );
  }

  const aprobado = nota >= NOTA_APROBATORIA;

  return (
    <div
      className={`celda-nota ${aprobado ? 'celda-nota-aprobada' : 'celda-nota-desaprobada'} ${className}`}
    >
      {etiqueta && <span className="celda-nota-etiqueta">{etiqueta}</span>}
      <span className="celda-nota-valor">{nota}</span>
      <span className="celda-nota-estado">{aprobado ? 'Aprobada' : 'Desaprobada'}</span>
    </div>
  );
};

export default CeldaNota;
