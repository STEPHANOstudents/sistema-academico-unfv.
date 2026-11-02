/**
 * Tarjeta para exhibir los casos extremos de rendimiento (mayor y menor promedio general).
 */

import React from 'react';
import { AlumnoResumen } from '../../types/modelos';
import { formatearNombreCompleto, formatearPromedio } from '../../utils/formato';
import { NOTA_APROBATORIA } from '../../utils/notas';
import './TarjetaExtremo.css';

interface TarjetaExtremoProps {
  tipo: 'mejor' | 'menor';
  alumno: AlumnoResumen | null;
  alVerDetalle?: (codigo: string) => void;
}

export const TarjetaExtremo: React.FC<TarjetaExtremoProps> = ({
  tipo,
  alumno,
  alVerDetalle
}) => {
  const esMejor = tipo === 'mejor';
  const titulo = esMejor ? 'Mayor Promedio General' : 'Menor Promedio General';
  const icono = esMejor ? '🏆' : '📉';

  if (!alumno || alumno.promedioGeneral === null) {
    return (
      <div className={`tarjeta-extremo ${esMejor ? 'extremo-mejor' : 'extremo-menor'}`}>
        <div className="extremo-cabecera">
          <span className="extremo-icono" aria-hidden="true">
            {icono}
          </span>
          <h4 className="extremo-titulo">{titulo}</h4>
        </div>
        <div className="extremo-cuerpo-vacio">
          <p>Aún no hay alumnos con calificaciones registradas para computar este extremo.</p>
        </div>
      </div>
    );
  }

  const aprobado = alumno.promedioGeneral >= NOTA_APROBATORIA;

  return (
    <div className={`tarjeta-extremo ${esMejor ? 'extremo-mejor' : 'extremo-menor'}`}>
      <div className="extremo-cabecera">
        <span className="extremo-icono" aria-hidden="true">
          {icono}
        </span>
        <h4 className="extremo-titulo">{titulo}</h4>
      </div>

      <div className="extremo-cuerpo">
        <div className="extremo-promedio-bloque">
          <span
            className={`extremo-promedio-numero ${
              aprobado ? 'promedio-aprobado' : 'promedio-desaprobado'
            }`}
          >
            {formatearPromedio(alumno.promedioGeneral)}
          </span>
          <span className="extremo-promedio-etiqueta">
            {aprobado ? 'Condición Aprobatoria' : 'Condición Desaprobatoria'}
          </span>
        </div>

        <div className="extremo-datos-alumno">
          <p className="extremo-nombre">
            {formatearNombreCompleto(alumno.apellidos, alumno.nombres)}
          </p>
          <p className="extremo-codigo">Código: {alumno.codigo}</p>
          <p className="extremo-meta">
            Edad: {alumno.edad} años · {alumno.cantidadCursos} cursos matriculados
          </p>

          {alVerDetalle && (
            <button
              type="button"
              className="extremo-boton-ver"
              onClick={() => alVerDetalle(alumno.codigo)}
            >
              Consultar Ficha Académica →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TarjetaExtremo;
