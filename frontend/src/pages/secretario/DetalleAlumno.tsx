/**
 * Pantalla de Detalle Académico del Alumno.
 * Permite gestionar matrículas por curso, calificar práctica por práctica con guardado inmediato
 * y retirar al estudiante de materias con confirmación explícita.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EncabezadoPagina from '../../components/ui/EncabezadoPagina';
import EstadoCarga from '../../components/ui/EstadoCarga';
import Tarjeta from '../../components/ui/Tarjeta';
import Boton from '../../components/ui/Boton';
import InsigniaEstado from '../../components/ui/InsigniaEstado';
import Modal from '../../components/ui/Modal';
import ModalConfirmacion from '../../components/ui/ModalConfirmacion';
import AvisoTemporal from '../../components/ui/AvisoTemporal';
import FilaNotasEditable from '../../components/secretario/FilaNotasEditable';
import FormularioMatricula from '../../components/secretario/FormularioMatricula';
import {
  obtenerAlumnoPorCodigo,
  matricularAlumno,
  retirarAlumno
} from '../../api/alumnosApi';
import { listarCursos } from '../../api/cursosApi';
import { AlumnoDetalle, Curso, EstadoCurso, Notas } from '../../types/modelos';
import { formatearNombreCompleto, formatearPromedio } from '../../utils/formato';
import { NOTA_APROBATORIA } from '../../utils/notas';
import './DetalleAlumno.css';

export const DetalleAlumno: React.FC = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();

  const [alumno, setAlumno] = useState<AlumnoDetalle | null>(null);
  const [cursosDisponibles, setCursosDisponibles] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modales
  const [modalMatriculaAbierto, setModalMatriculaAbierto] = useState<boolean>(false);
  const [cursoARetirar, setCursoARetirar] = useState<{ codigo: string; nombre: string } | null>(null);
  const [retirando, setRetirando] = useState<boolean>(false);

  // Avisos y notificaciones
  const [avisoExito, setAvisoExito] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    if (!codigo) return;
    setCargando(true);
    setError(null);
    try {
      const [detalle, catalogoCursos] = await Promise.all([
        obtenerAlumnoPorCodigo(codigo),
        listarCursos()
      ]);
      setAlumno(detalle);
      setCursosDisponibles(catalogoCursos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la ficha del alumno.');
    } finally {
      setCargando(false);
    }
  }, [codigo]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Manejar matrícula en nuevo curso
  const manejarMatricular = async (codigoCurso: string) => {
    if (!codigo) return;
    await matricularAlumno(codigo, codigoCurso);
    setModalMatriculaAbierto(false);
    setAvisoExito('Matrícula registrada exitosamente.');
    await cargarDatos();
  };

  // Manejar retiro de curso
  const confirmarRetiro = async () => {
    if (!codigo || !cursoARetirar) return;
    setRetirando(true);
    try {
      await retirarAlumno(codigo, cursoARetirar.codigo);
      setAvisoExito(`El alumno fue retirado de ${cursoARetirar.nombre}.`);
      setCursoARetirar(null);
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al retirar la matrícula.');
    } finally {
      setRetirando(false);
    }
  };

  // Actualización reactiva cuando se guarda una nota individual en FilaNotasEditable
  const manejarNotaActualizada = (
    codigoCurso: string,
    nuevasNotas: Notas,
    nuevoPromedio: number | null,
    nuevoEstado: EstadoCurso
  ) => {
    if (!alumno) return;

    const matriculasActualizadas = alumno.matriculas.map((m) => {
      if (m.curso.codigo === codigoCurso) {
        return {
          ...m,
          notas: nuevasNotas,
          promedio: nuevoPromedio,
          estado: nuevoEstado
        };
      }
      return m;
    });

    // Recalcular promedio general en el cliente inmediatamente
    const promediosValidos = matriculasActualizadas
      .map((m) => m.promedio)
      .filter((p): p is number => p !== null);

    const nuevoPromedioGeneral =
      promediosValidos.length > 0
        ? Math.round(
            (promediosValidos.reduce((a, b) => a + b, 0) / promediosValidos.length) * 100
          ) / 100
        : null;

    setAlumno({
      ...alumno,
      matriculas: matriculasActualizadas,
      promedioGeneral: nuevoPromedioGeneral
    });
  };

  const codigosInscritos = alumno ? alumno.matriculas.map((m) => m.curso.codigo) : [];

  return (
    <div className="detalle-alumno-pagina">
      <AvisoTemporal mensaje={avisoExito} alCerrar={() => setAvisoExito(null)} />

      <EncabezadoPagina
        titulo="Ficha Académica del Alumno"
        descripcion="Expediente personal y control de calificaciones práctica a práctica por cada asignatura inscrita."
        acciones={
          <div className="detalle-alumno-acciones-encabezado">
            <Boton variante="secundario" onClick={() => navigate('/secretario/alumnos')}>
              ← Volver al Padrón
            </Boton>
            <Boton variante="primario" onClick={() => setModalMatriculaAbierto(true)}>
              + Inscribir en Curso
            </Boton>
          </div>
        }
      />

      <EstadoCarga cargando={cargando} error={error} alReintentar={cargarDatos}>
        {alumno && (
          <>
            {/* Tarjeta de Datos Personales del Alumno */}
            <div className="ficha-alumno-tarjeta">
              <div className="ficha-alumno-identidad">
                <span className="ficha-alumno-codigo">{alumno.codigo}</span>
                <h3 className="ficha-alumno-nombre">
                  {formatearNombreCompleto(alumno.apellidos, alumno.nombres)}
                </h3>
                <span className="ficha-alumno-edad">Edad: {alumno.edad} años</span>
              </div>

              <div className="ficha-alumno-promedio-general">
                <span className="ficha-promedio-etiqueta">Promedio General Ponderado</span>
                <div className="ficha-promedio-valor-caja">
                  <span
                    className={`ficha-promedio-numero ${
                      alumno.promedioGeneral !== null
                        ? alumno.promedioGeneral >= NOTA_APROBATORIA
                          ? 'promedio-aprobado'
                          : 'promedio-desaprobado'
                        : 'promedio-vacio'
                    }`}
                  >
                    {formatearPromedio(alumno.promedioGeneral)}
                  </span>
                  <span className="ficha-promedio-condicion">
                    {alumno.promedioGeneral !== null
                      ? alumno.promedioGeneral >= NOTA_APROBATORIA
                        ? 'Rendimiento Aprobatorio'
                        : 'Rendimiento Desaprobatorio'
                      : 'Sin calificaciones suficientes'}
                  </span>
                </div>
              </div>
            </div>

            {/* Listado de Asignaturas Matriculadas */}
            <div className="detalle-cursos-seccion">
              <div className="detalle-cursos-cabecera">
                <h3 className="detalle-cursos-titulo">
                  Asignaturas Matriculadas ({alumno.matriculas.length})
                </h3>
                <span className="detalle-cursos-ayuda">
                  Las notas se guardan automáticamente al salir de la casilla o al pulsar Enter.
                </span>
              </div>

              {alumno.matriculas.length === 0 ? (
                <div className="detalle-cursos-vacio">
                  <p>Este estudiante aún no se encuentra matriculado en ningún curso.</p>
                  <Boton variante="primario" onClick={() => setModalMatriculaAbierto(true)}>
                    Matricular en su Primer Curso
                  </Boton>
                </div>
              ) : (
                <div className="detalle-cursos-lista">
                  {alumno.matriculas.map((mat, index) => (
                    <Tarjeta key={mat.curso.codigo} className="tarjeta-curso-alumno">
                      <div className="curso-fila-principal">
                        <div className="curso-datos">
                          <span className="curso-codigo-badge">[{mat.curso.codigo}]</span>
                          <h4 className="curso-nombre-texto">{mat.curso.nombre}</h4>
                          <InsigniaEstado estado={mat.estado} />
                        </div>

                        <div className="curso-promedio-bloque">
                          <span className="curso-promedio-etiqueta">Promedio Asignatura</span>
                          <span
                            className={`curso-promedio-valor ${
                              mat.promedio !== null
                                ? mat.promedio >= NOTA_APROBATORIA
                                  ? 'promedio-aprobado'
                                  : 'promedio-desaprobado'
                                : 'promedio-vacio'
                            }`}
                          >
                            {formatearPromedio(mat.promedio)}
                          </span>
                        </div>
                      </div>

                      <div className="curso-calificaciones-fila">
                        <div className="curso-casillas-contenedor">
                          <span className="curso-practicas-etiqueta">Prácticas Calificadas:</span>
                          <FilaNotasEditable
                            codigoAlumno={alumno.codigo}
                            codigoCurso={mat.curso.codigo}
                            notasIniciales={mat.notas}
                            alActualizar={(nuevasNotas, nuevoProm, nuevoEst) =>
                              manejarNotaActualizada(mat.curso.codigo, nuevasNotas, nuevoProm, nuevoEst)
                            }
                            alNotificarExito={(msg) => setAvisoExito(msg)}
                            alNotificarError={(err) => setError(err)}
                            indiceFila={index}
                          />
                        </div>

                        <button
                          type="button"
                          className="curso-boton-retirar"
                          onClick={() => setCursoARetirar({ codigo: mat.curso.codigo, nombre: mat.curso.nombre })}
                          title="Retirar al alumno de este curso"
                        >
                          Retirar Asignatura
                        </button>
                      </div>
                    </Tarjeta>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </EstadoCarga>

      {/* Modal para Matricular en Asignatura */}
      <Modal
        abierto={modalMatriculaAbierto}
        alCerrar={() => setModalMatriculaAbierto(false)}
        titulo="Inscribir en Asignatura"
      >
        <FormularioMatricula
          cursosDisponibles={cursosDisponibles}
          codigosCursosInscritos={codigosInscritos}
          alMatricular={manejarMatricular}
          alCancelar={() => setModalMatriculaAbierto(false)}
        />
      </Modal>

      {/* Modal de Confirmación para Retiro de Curso */}
      <ModalConfirmacion
        abierto={!!cursoARetirar}
        titulo="Confirmar Retiro de Asignatura"
        mensaje={`¿Está seguro de que desea retirar al estudiante de la asignatura "${cursoARetirar?.nombre}"? Se perderán las 4 casillas de prácticas registradas en esta materia.`}
        textoConfirmar="Retirar de Asignatura"
        textoCancelar="Mantener Inscripción"
        alConfirmar={confirmarRetiro}
        alCancelar={() => setCursoARetirar(null)}
        cargando={retirando}
      />
    </div>
  );
};

export default DetalleAlumno;
