/**
 * Pantalla de Consulta de Calificaciones del Alumno (Mis Notas).
 * Vista de solo lectura optimizada para dispositivos móviles y escritorio.
 * Muestra el promedio general del estudiante, sus cursos inscritos, desglose de las 4 prácticas y estados.
 */

import React, { useState, useEffect, useCallback } from 'react';
import EstadoCarga from '../../components/ui/EstadoCarga';
import Tarjeta from '../../components/ui/Tarjeta';
import InsigniaEstado from '../../components/ui/InsigniaEstado';
import CeldaNota from '../../components/ui/CeldaNota';
import { obtenerMiPerfil } from '../../api/miPerfilApi';
import { AlumnoDetalle } from '../../types/modelos';
import { formatearNombreCompleto, formatearPromedio } from '../../utils/formato';
import { NOTA_APROBATORIA } from '../../utils/notas';
import './MisNotas.css';

export const MisNotas: React.FC = () => {
  const [perfil, setPerfil] = useState<AlumnoDetalle | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargarMiPerfil = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await obtenerMiPerfil();
      setPerfil(datos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar su expediente académico.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarMiPerfil();
  }, [cargarMiPerfil]);

  return (
    <div className="mis-notas-pagina">
      <EstadoCarga cargando={cargando} error={error} alReintentar={cargarMiPerfil}>
        {perfil && (
          <>
            {/* Cabecera de Bienvenida del Estudiante */}
            <div className="mis-notas-perfil-tarjeta">
              <div className="mis-notas-saludo">
                <span className="mis-notas-codigo-pill">{perfil.codigo}</span>
                <h2 className="mis-notas-estudiante-nombre">
                  {formatearNombreCompleto(perfil.apellidos, perfil.nombres)}
                </h2>
                <p className="mis-notas-subtexto">
                  Alumno de Pregrado · {perfil.edad} años · {perfil.cantidadCursos} cursos matriculados
                </p>
              </div>

              <div className="mis-notas-promedio-general-caja">
                <span className="mis-notas-promedio-titulo">Promedio General Ponderado</span>
                <span
                  className={`mis-notas-promedio-grande ${
                    perfil.promedioGeneral !== null
                      ? perfil.promedioGeneral >= NOTA_APROBATORIA
                        ? 'promedio-aprobado'
                        : 'promedio-desaprobado'
                      : 'promedio-vacio'
                  }`}
                >
                  {formatearPromedio(perfil.promedioGeneral)}
                </span>
                <span className="mis-notas-promedio-subtitulo">
                  {perfil.promedioGeneral !== null
                    ? perfil.promedioGeneral >= NOTA_APROBATORIA
                      ? 'Condición: Rendimiento Aprobatorio'
                      : 'Condición: Rendimiento en Observación'
                    : 'Aún sin calificaciones registradas'}
                </span>
              </div>
            </div>

            {/* Cuadro de Información Académica */}
            <div className="mis-notas-reglamento-aviso">
              <span className="reglamento-icono" aria-hidden="true">
                ℹ️
              </span>
              <p className="reglamento-texto">
                <strong>Reglamento de Evaluación:</strong> La nota aprobatoria mínima es 11.
                El estado de la asignatura se computa como Aprobado o Desaprobado una vez completadas las 4 prácticas.
                Los promedios parciales se calculan únicamente sobre las evaluaciones ya rendidas, sin penalizar evaluaciones pendientes.
              </p>
            </div>

            {/* Listado de Cursos */}
            <div className="mis-notas-cursos-contenedor">
              <h3 className="mis-notas-cursos-titulo">Mis Asignaturas Inscritas</h3>

              {perfil.matriculas.length === 0 ? (
                <div className="mis-notas-vacio">
                  <span className="mis-notas-icono-vacio" aria-hidden="true">
                    📚
                  </span>
                  <h4>Todavía no tienes cursos matriculados</h4>
                  <p>Por favor, acércate a la Secretaría Académica para formalizar tu matrícula semestral.</p>
                </div>
              ) : (
                <div className="mis-notas-cursos-lista">
                  {perfil.matriculas.map((mat) => (
                    <Tarjeta key={mat.curso.codigo} className="tarjeta-curso-estudiante">
                      <div className="curso-estudiante-cabecera">
                        <div className="curso-estudiante-identidad">
                          <span className="curso-estudiante-codigo">[{mat.curso.codigo}]</span>
                          <h4 className="curso-estudiante-nombre">{mat.curso.nombre}</h4>
                        </div>
                        <InsigniaEstado estado={mat.estado} />
                      </div>

                      <div className="curso-estudiante-cuerpo">
                        <div className="curso-estudiante-practicas-grid">
                          <CeldaNota nota={mat.notas[0]} etiqueta="Práctica 1" />
                          <CeldaNota nota={mat.notas[1]} etiqueta="Práctica 2" />
                          <CeldaNota nota={mat.notas[2]} etiqueta="Práctica 3" />
                          <CeldaNota nota={mat.notas[3]} etiqueta="Práctica 4" />
                        </div>

                        <div className="curso-estudiante-promedio-bloque">
                          <span className="curso-estudiante-promedio-etiqueta">
                            Promedio Asignatura
                          </span>
                          <span
                            className={`curso-estudiante-promedio-valor ${
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
                    </Tarjeta>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </EstadoCarga>
    </div>
  );
};

export default MisNotas;
