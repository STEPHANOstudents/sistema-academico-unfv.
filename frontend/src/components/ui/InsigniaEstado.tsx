/**
 * Insignia visual para representar el estado académico de un curso.
 * Mapea las 4 condiciones formales a etiquetas legibles y accesibles.
 */

import React from 'react';
import { EstadoCurso } from '../../types/modelos';
import './InsigniaEstado.css';

interface InsigniaEstadoProps {
  estado: EstadoCurso;
  className?: string;
}

const TEXTOS_ESTADO: Record<EstadoCurso, string> = {
  SIN_NOTAS: 'Sin notas',
  EN_CURSO: 'En curso',
  APROBADO: 'Aprobado',
  DESAPROBADO: 'Desaprobado'
};

export const InsigniaEstado: React.FC<InsigniaEstadoProps> = ({ estado, className = '' }) => {
  const claseVariante = `insignia-${estado.toLowerCase().replace('_', '-')}`;
  const texto = TEXTOS_ESTADO[estado] || estado;

  return (
    <span className={`insignia-estado ${claseVariante} ${className}`}>
      <span className="insignia-punto" aria-hidden="true" />
      {texto}
    </span>
  );
};

export default InsigniaEstado;
