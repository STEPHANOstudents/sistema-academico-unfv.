/**
 * Pantalla de Registro Masivo de Notas por Asignatura.
 * Permite calificar a todos los alumnos de un curso con navegación fluida por teclado (Enter baja de fila, Tab avanza de práctica),
 * resaltado de prácticas pendientes y actualización en tiempo real de promedios y estados.
 */

import React, { useState, useEffect, useCallback } from 'react';
import EncabezadoPagina from '../../components/ui/EncabezadoPagina';
import EstadoCarga from '../../components/ui/EstadoCarga';
import InsigniaEstado from '../../components/ui/InsigniaEstado';
import AvisoTemporal from '../../components/ui/AvisoTemporal';
import FilaNotasEditable from '../../components/secretario/FilaNotasEditable';
import { listarCursos, obtenerMatriculasDeCurso } from '../../api/cursosApi';
import { AlumnoEnCurso, Curso, EstadoCurso, Notas } from '../../types/modelos';
import { formatearNombreCompleto, formatearPromedio } from '../../utils/formato';
import { NOTA_APROBATORIA } from '../../utils/notas';
import './RegistroNotas.css';

export const RegistroNotas: React.FC = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [codigoCursoSeleccionado, setCodigoCursoSeleccionado] = useState<string>('');

  const [alumnosCurso, setAlumnosCurso] = useState<AlumnoEnCurso[]>([]);
  const [cargandoCursos, setCargandoCursos] = useState<boolean>(true);
  const [cargandoMatriculas, setCargandoMatriculas] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Selector para destacar casillas vacías de una práctica específica
  const [resaltarPractica, setResaltarPractica] = useState<number | null>(null);

  // Avisos de confirmación
  const [avisoExito, setAvisoExito] = useState<string | null>(null);

  // Cargar lista inicial de cursos para el selector
  useEffect(() => {
    async function inicializarCursos() {
      setCargandoCursos(true);
      setError(null);
      try {
        const catalogo = await listarCursos();
        setCursos(catalogo);
        if (catalogo.length > 0) {
          setCodigoCursoSeleccionado(catalogo[0].codigo);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar cursos.');
      } finally {
        setCargandoCursos(false);
      }
    }
    inicializarCursos();
  }, []);

  // Cargar alumnos inscritos cada vez que cambie el curso seleccionado
  const cargarAlumnosDeCurso = useCallback(async () => {
    if (!codigoCursoSeleccionado) return;
    setCargandoMatriculas(true);
    setError(null);
    try {
      const respuesta = await obtenerMatriculasDeCurso(codigoCursoSeleccionado);
      setAlumnosCurso(respuesta.alumnos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar alumnos matriculados.');
    } finally {
      setCargandoMatriculas(false);
    }
  }, [codigoCursoSeleccionado]);

  useEffect(() => {
    cargarAlumnosDeCurso();
  }, [cargarAlumnosDeCurso]);

  /**
   * Actualiza el estado local de un alumno tras modificar una práctica en FilaNotasEditable.
   */
  const manejarNotaActualizada = (
    codigoAlumno: string,
    nuevasNotas: Notas,
    nuevoPromedio: number | null,
    nuevoEstado: EstadoCurso
  ) => {
    setAlumnosCurso((prev) =>
      prev.map((a) => {
        if (a.codigoAlumno === codigoAlumno) {
          return {
            ...a,
            notas: nuevasNotas,
            promedio: nuevoPromedio,
            estado: nuevoEstado
          };
        }
        return a;
      })
    );
  };

  const cursoActual = cursos.find((c) => c.codigo === codigoCursoSeleccionado);

  return (
    <div className="registro-notas-pagina">
      <AvisoTemporal mensaje={avisoExito} alCerrar={() => setAvisoExito(null)} />

      <EncabezadoPagina
        titulo="Registro de Calificaciones por Curso"
        descripcion="Herramienta de evaluación ágil para asentar notas práctica por práctica a toda la nómina de estudiantes."
      />

      {/* Barra de Filtros y Configuración de Calificación */}
      <div className="registro-notas-panel-control">
        <div className="registro-control-campo">
          <label htmlFor="selector-curso-notas" className="registro-control-etiqueta">
            Seleccionar Asignatura:
          </label>
          <select
            id="selector-curso-notas"
            value={codigoCursoSeleccionado}
            onChange={(e) => setCodigoCursoSeleccionado(e.target.value)}
            className="registro-select-curso"
            disabled={cargandoCursos}
          >
            {cursos.map((c) => (
              <option key={c.codigo} value={c.codigo}>
                [{c.codigo}] {c.nombre} ({c.cantidadAlumnos} inscritos)
              </option>
            ))}
          </select>
        </div>

        <div className="registro-control-campo">
          <label htmlFor="resaltar-pendientes" className="registro-control-etiqueta">
            Resaltar Prácticas Pendientes:
          </label>
          <select
            id="resaltar-pendientes"
            value={resaltarPractica !== null ? String(resaltarPractica) : ''}
            onChange={(e) => {
              const val = e.target.value;
              setResaltarPractica(val ? parseInt(val, 10) : null);
            }}
            className="registro-select-resaltar"
          >
            <option value="">Ninguna</option>
            <option value="1">Solo Práctica 1 pendientes</option>
            <option value="2">Solo Práctica 2 pendientes</option>
            <option value="3">Solo Práctica 3 pendientes</option>
            <option value="4">Solo Práctica 4 pendientes</option>
          </select>
        </div>

        <div className="registro-ayuda-teclado">
          <span className="tecla-ayuda-tag">Tab</span> Siguiente práctica ·{' '}
          <span className="tecla-ayuda-tag">Enter</span> Baja al alumno siguiente
        </div>
      </div>

      <EstadoCarga
        cargando={cargandoCursos || cargandoMatriculas}
        error={error}
        alReintentar={cargarAlumnosDeCurso}
        esVacio={alumnosCurso.length === 0}
        mensajeVacio={`No hay alumnos matriculados en "${cursoActual?.nombre || 'este curso'}". Matrícula alumnos primero en la sección de Alumnos.`}
      >
        <div className="registro-notas-tabla-contenedor">
          <table className="registro-notas-tabla">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Código</th>
                <th>Apellidos y Nombres</th>
                <th style={{ width: '270px', textAlign: 'center' }}>
                  Calificaciones (P1 - P4)
                </th>
                <th style={{ width: '100px', textAlign: 'center' }}>Promedio</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {alumnosCurso.map((alumno, index) => {
                const aprobado =
                  alumno.promedio !== null && alumno.promedio >= NOTA_APROBATORIA;

                return (
                  <tr key={alumno.codigoAlumno} className="registro-fila-alumno">
                    <td>
                      <span className="registro-codigo-texto">{alumno.codigoAlumno}</span>
                    </td>
                    <td>
                      <span className="registro-nombre-texto">
                        {formatearNombreCompleto(alumno.apellidos, alumno.nombres)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <FilaNotasEditable
                        codigoAlumno={alumno.codigoAlumno}
                        codigoCurso={codigoCursoSeleccionado}
                        notasIniciales={alumno.notas}
                        alActualizar={(nuevasNotas, nuevoProm, nuevoEst) =>
                          manejarNotaActualizada(alumno.codigoAlumno, nuevasNotas, nuevoProm, nuevoEst)
                        }
                        alNotificarExito={(msg) => setAvisoExito(msg)}
                        alNotificarError={(err) => setError(err)}
                        resaltarPractica={resaltarPractica}
                        indiceFila={index}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        className={`registro-promedio-pill ${
                          alumno.promedio !== null
                            ? aprobado
                              ? 'promedio-aprobado'
                              : 'promedio-desaprobado'
                            : 'promedio-vacio'
                        }`}
                      >
                        {formatearPromedio(alumno.promedio)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <InsigniaEstado estado={alumno.estado} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </EstadoCarga>
    </div>
  );
};

export default RegistroNotas;
