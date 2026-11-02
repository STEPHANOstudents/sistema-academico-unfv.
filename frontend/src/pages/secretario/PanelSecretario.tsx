/**
 * Panel Principal del Secretario.
 * Presenta métricas institucionales, casos extremos de rendimiento y accesos rápidos a gestión.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EncabezadoPagina from '../../components/ui/EncabezadoPagina';
import EstadoCarga from '../../components/ui/EstadoCarga';
import Boton from '../../components/ui/Boton';
import TarjetaExtremo from '../../components/secretario/TarjetaExtremo';
import { listarAlumnos, obtenerExtremos } from '../../api/alumnosApi';
import { listarCursos } from '../../api/cursosApi';
import { AlumnoResumen, Curso, ExtremosAlumnos } from '../../types/modelos';
import './PanelSecretario.css';

export const PanelSecretario: React.FC = () => {
  const navigate = useNavigate();

  const [alumnos, setAlumnos] = useState<AlumnoResumen[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [extremos, setExtremos] = useState<ExtremosAlumnos | null>(null);

  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const [resAlumnos, resCursos, resExtremos] = await Promise.all([
        listarAlumnos(),
        listarCursos(),
        obtenerExtremos()
      ]);
      setAlumnos(resAlumnos);
      setCursos(resCursos);
      setExtremos(resExtremos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos del panel.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Alumnos sin ninguna nota registrada
  const alumnosSinNotas = alumnos.filter((a) => a.promedioGeneral === null).length;

  return (
    <div className="panel-secretario-pagina">
      <EncabezadoPagina
        titulo="Panel de Secretaría Académica"
        descripcion="Monitoreo global de métricas estudiantiles, cursos habilitados y accesos ágiles de evaluación."
        acciones={
          <div className="panel-accesos-rapidos">
            <Boton
              variante="secundario"
              onClick={() => navigate('/secretario/alumnos?accion=nuevo')}
            >
              + Matricular Alumno
            </Boton>
            <Boton
              variante="primario"
              onClick={() => navigate('/secretario/notas')}
            >
              Registrar Notas por Curso
            </Boton>
          </div>
        }
      />

      <EstadoCarga cargando={cargando} error={error} alReintentar={cargarDatos}>
        {/* Tarjetas de Métricas Generales */}
        <div className="panel-metricas-grid">
          <div className="tarjeta-metrica">
            <div className="metrica-icono" aria-hidden="true">👥</div>
            <div className="metrica-cuerpo">
              <span className="metrica-numero">{alumnos.length}</span>
              <span className="metrica-etiqueta">Total de Alumnos Matriculados</span>
            </div>
          </div>

          <div className="tarjeta-metrica">
            <div className="metrica-icono" aria-hidden="true">📚</div>
            <div className="metrica-cuerpo">
              <span className="metrica-numero">{cursos.length}</span>
              <span className="metrica-etiqueta">Cursos Registrados</span>
            </div>
          </div>

          <div className="tarjeta-metrica">
            <div className="metrica-icono metrica-icono-alerta" aria-hidden="true">⏳</div>
            <div className="metrica-cuerpo">
              <span className="metrica-numero">{alumnosSinNotas}</span>
              <span className="metrica-etiqueta">Alumnos sin Calificaciones</span>
            </div>
          </div>
        </div>

        {/* Sección de Extremos de Rendimiento */}
        <div className="panel-seccion-extremos">
          <h3 className="panel-subtitulo-seccion">Rendimiento Académico Extremo</h3>
          <p className="panel-descripcion-seccion">
            Identificación de los estudiantes con mayor y menor promedio general computado (se excluyen a los alumnos no calificados).
          </p>

          <div className="panel-extremos-grid">
            <TarjetaExtremo
              tipo="mejor"
              alumno={extremos?.mejor ?? null}
              alVerDetalle={(codigo) => navigate(`/secretario/alumnos/${codigo}`)}
            />
            <TarjetaExtremo
              tipo="menor"
              alumno={extremos?.menor ?? null}
              alVerDetalle={(codigo) => navigate(`/secretario/alumnos/${codigo}`)}
            />
          </div>
        </div>
      </EstadoCarga>
    </div>
  );
};

export default PanelSecretario;
