/**
 * Formulario para matricular a un estudiante en un curso no inscrito aún.
 */

import React, { useState } from 'react';
import Boton from '../ui/Boton';
import MensajeError from '../ui/MensajeError';
import { Curso } from '../../types/modelos';
import './FormularioMatricula.css';

interface FormularioMatriculaProps {
  cursosDisponibles: Curso[];
  codigosCursosInscritos: string[];
  alMatricular: (codigoCurso: string) => Promise<void>;
  alCancelar: () => void;
}

export const FormularioMatricula: React.FC<FormularioMatriculaProps> = ({
  cursosDisponibles,
  codigosCursosInscritos,
  alMatricular,
  alCancelar
}) => {
  // Filtrar solo las asignaturas en las que el alumno aún no está matriculado
  const cursosSinInscribir = cursosDisponibles.filter(
    (c) => !codigosCursosInscritos.includes(c.codigo)
  );

  const [codigoSeleccionado, setCodigoSeleccionado] = useState<string>(
    cursosSinInscribir.length > 0 ? cursosSinInscribir[0].codigo : ''
  );
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoSeleccionado) {
      setError('Seleccione un curso para matricular.');
      return;
    }

    setGuardando(true);
    setError(null);
    try {
      await alMatricular(codigoSeleccionado);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al registrar la matrícula.');
      }
    } finally {
      setGuardando(false);
    }
  };

  if (cursosSinInscribir.length === 0) {
    return (
      <div className="formulario-matricula-completo">
        <p className="formulario-matricula-aviso">
          El alumno ya se encuentra matriculado en todas las asignaturas disponibles de la institución.
        </p>
        <div className="formulario-matricula-acciones">
          <Boton type="button" variante="secundario" onClick={alCancelar}>
            Cerrar
          </Boton>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={manejarEnvio} className="formulario-matricula">
      <MensajeError mensaje={error} alCerrar={() => setError(null)} />

      <div className="formulario-matricula-campo">
        <label htmlFor="selector-curso" className="formulario-matricula-etiqueta">
          Seleccione la asignatura:
        </label>
        <select
          id="selector-curso"
          value={codigoSeleccionado}
          onChange={(e) => setCodigoSeleccionado(e.target.value)}
          className="formulario-matricula-select"
          disabled={guardando}
        >
          {cursosSinInscribir.map((c) => (
            <option key={c.codigo} value={c.codigo}>
              [{c.codigo}] {c.nombre}
            </option>
          ))}
        </select>
        <p className="formulario-matricula-ayuda">
          La matrícula inicial crea las 4 prácticas en estado pendiente. Las notas se registrarán luego.
        </p>
      </div>

      <div className="formulario-matricula-acciones">
        <Boton type="button" variante="secundario" onClick={alCancelar} disabled={guardando}>
          Cancelar
        </Boton>
        <Boton type="submit" variante="primario" cargando={guardando}>
          Confirmar Matrícula
        </Boton>
      </div>
    </form>
  );
};

export default FormularioMatricula;
