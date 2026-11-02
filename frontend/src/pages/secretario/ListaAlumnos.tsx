/**
 * Pantalla de Gestión de Alumnos para el personal de Secretaría.
 * Incluye búsqueda reactiva con debounce, ordenamiento por columnas asistido por el backend,
 * matriculación/creación con modal, edición de datos personales y eliminación en cascada con confirmación.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import EncabezadoPagina from '../../components/ui/EncabezadoPagina';
import TablaDatos, { ColumnaTabla } from '../../components/ui/TablaDatos';
import EstadoCarga from '../../components/ui/EstadoCarga';
import Boton from '../../components/ui/Boton';
import Modal from '../../components/ui/Modal';
import ModalConfirmacion from '../../components/ui/ModalConfirmacion';
import AvisoTemporal from '../../components/ui/AvisoTemporal';
import FormularioAlumno from '../../components/secretario/FormularioAlumno';
import useDebounce from '../../hooks/useDebounce';
import {
  listarAlumnos,
  crearAlumno,
  editarAlumno,
  eliminarAlumno
} from '../../api/alumnosApi';
import { AlumnoResumen } from '../../types/modelos';
import { formatearNombreCompleto, formatearPromedio } from '../../utils/formato';
import { NOTA_APROBATORIA } from '../../utils/notas';
import './ListaAlumnos.css';

export const ListaAlumnos: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados de datos
  const [alumnos, setAlumnos] = useState<AlumnoResumen[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros y ordenamiento
  // ¿Por qué el ordenamiento se delega al backend?
  // Porque el backend aplica la regla de negocio institucional estricta:
  // los alumnos sin notas (null) deben posicionarse SIEMPRE al final de la lista,
  // independientemente de si el orden es ascendente o descendente.
  const [busqueda, setBusqueda] = useState<string>('');
  const busquedaDebounced = useDebounce(busqueda, 300);

  const [columnaOrden, setColumnaOrden] = useState<'edad' | 'promedio' | 'apellidos'>('apellidos');
  const [sentidoOrden, setSentidoOrden] = useState<'asc' | 'desc'>('asc');

  // Modales
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState<boolean>(false);
  const [alumnoEditando, setAlumnoEditando] = useState<AlumnoResumen | null>(null);
  const [alumnoAEliminar, setAlumnoAEliminar] = useState<AlumnoResumen | null>(null);
  const [eliminando, setEliminando] = useState<boolean>(false);

  // Notificación de éxito
  const [avisoExito, setAvisoExito] = useState<string | null>(null);

  // Apertura automática si llega con query ?accion=nuevo
  useEffect(() => {
    if (searchParams.get('accion') === 'nuevo') {
      setModalNuevoAbierto(true);
      // Limpiar el parámetro
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const cargarAlumnos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await listarAlumnos(busquedaDebounced, columnaOrden, sentidoOrden);
      setAlumnos(datos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al consultar la lista de alumnos.');
    } finally {
      setCargando(false);
    }
  }, [busquedaDebounced, columnaOrden, sentidoOrden]);

  useEffect(() => {
    cargarAlumnos();
  }, [cargarAlumnos]);

  // Manejador del clic en encabezados para ordenar
  const manejarOrdenar = (clave: string) => {
    if (clave === 'apellidos' || clave === 'edad' || clave === 'promedio') {
      if (columnaOrden === clave) {
        setSentidoOrden(sentidoOrden === 'asc' ? 'desc' : 'asc');
      } else {
        setColumnaOrden(clave as 'edad' | 'promedio' | 'apellidos');
        setSentidoOrden('asc');
      }
    }
  };

  // Creación de alumno
  const manejarCrearAlumno = async (datos: { apellidos: string; nombres: string; edad: number }) => {
    const alumnoCreado = await crearAlumno(datos);
    setModalNuevoAbierto(false);
    setAvisoExito(`Alumno matriculado exitosamente con el código: ${alumnoCreado.codigo}`);
    await cargarAlumnos();
  };

  // Edición de alumno
  const manejarEditarAlumno = async (datos: { apellidos: string; nombres: string; edad: number }) => {
    if (!alumnoEditando) return;
    await editarAlumno(alumnoEditando.codigo, datos);
    setAlumnoEditando(null);
    setAvisoExito(`Datos del alumno ${alumnoEditando.codigo} actualizados.`);
    await cargarAlumnos();
  };

  // Eliminación de alumno
  const confirmarEliminar = async () => {
    if (!alumnoAEliminar) return;
    setEliminando(true);
    try {
      await eliminarAlumno(alumnoAEliminar.codigo);
      setAvisoExito(`Alumno ${alumnoAEliminar.codigo} y sus matrículas fueron eliminados.`);
      setAlumnoAEliminar(null);
      await cargarAlumnos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el alumno.');
    } finally {
      setEliminando(false);
    }
  };

  // Columnas para TablaDatos
  const columnas: ColumnaTabla<AlumnoResumen>[] = [
    {
      clave: 'codigo',
      encabezado: 'Código',
      ordenable: false,
      render: (alu) => <strong className="alumno-codigo-texto">{alu.codigo}</strong>
    },
    {
      clave: 'apellidos',
      encabezado: 'Apellidos y Nombres',
      ordenable: true,
      render: (alu) => formatearNombreCompleto(alu.apellidos, alu.nombres)
    },
    {
      clave: 'edad',
      encabezado: 'Edad',
      ordenable: true,
      alineacion: 'centro',
      render: (alu) => `${alu.edad} años`
    },
    {
      clave: 'cantidadCursos',
      encabezado: 'Cursos Inscritos',
      ordenable: false,
      alineacion: 'centro',
      render: (alu) => (
        <span className="badge-cursos">{alu.cantidadCursos} asignaturas</span>
      )
    },
    {
      clave: 'promedio',
      encabezado: 'Promedio General',
      ordenable: true,
      alineacion: 'centro',
      render: (alu) => {
        if (alu.promedioGeneral === null) {
          return <span className="promedio-vacio">—</span>;
        }
        const aprobado = alu.promedioGeneral >= NOTA_APROBATORIA;
        return (
          <span className={`promedio-pill ${aprobado ? 'promedio-aprobado' : 'promedio-desaprobado'}`}>
            {formatearPromedio(alu.promedioGeneral)}
          </span>
        );
      }
    },
    {
      clave: 'acciones',
      encabezado: 'Acciones de Gestión',
      ordenable: false,
      alineacion: 'derecha',
      render: (alu) => (
        <div className="alumnos-acciones-fila">
          <button
            type="button"
            className="accion-btn accion-ver"
            onClick={() => navigate(`/secretario/alumnos/${alu.codigo}`)}
            title="Ver ficha académica, matrículas y registrar notas"
          >
            Ver Detalle
          </button>
          <button
            type="button"
            className="accion-btn accion-editar"
            onClick={() => setAlumnoEditando(alu)}
            title="Editar datos personales"
          >
            Editar
          </button>
          <button
            type="button"
            className="accion-btn accion-eliminar"
            onClick={() => setAlumnoAEliminar(alu)}
            title="Eliminar alumno y sus matrículas"
          >
            Eliminar
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="lista-alumnos-pagina">
      <EncabezadoPagina
        titulo="Gestión General de Alumnos"
        descripcion="Padrón estudiantil oficial. Permite ordenar por rendimiento o edad, matricular nuevos ingresantes y gestionar sus expedientes."
        acciones={
          <Boton variante="primario" onClick={() => setModalNuevoAbierto(true)}>
            + Matricular Nuevo Alumno
          </Boton>
        }
      />

      <AvisoTemporal mensaje={avisoExito} alCerrar={() => setAvisoExito(null)} />

      {/* Barra de Filtros y Búsqueda */}
      <div className="alumnos-barra-herramientas">
        <div className="alumnos-buscador">
          <span className="alumnos-buscador-icono" aria-hidden="true">
            🔍
          </span>
          <input
            type="search"
            placeholder="Buscar por apellidos, nombres o código oficial..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="alumnos-buscador-input"
            aria-label="Buscar alumnos"
          />
          {busqueda && (
            <button
              type="button"
              className="alumnos-buscador-limpiar"
              onClick={() => setBusqueda('')}
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>

        <div className="alumnos-conteo-info">
          Mostrando <strong>{alumnos.length}</strong> alumnos registrados
        </div>
      </div>

      <EstadoCarga
        cargando={cargando}
        error={error}
        alReintentar={cargarAlumnos}
        esVacio={alumnos.length === 0}
        mensajeVacio={
          busqueda
            ? `No se encontraron alumnos que coincidan con "${busqueda}".`
            : 'Aún no hay alumnos matriculados en la institución. Registra el primero.'
        }
        accionVacio={
          !busqueda && (
            <Boton variante="primario" onClick={() => setModalNuevoAbierto(true)}>
              Matricular Primer Alumno
            </Boton>
          )
        }
      >
        <TablaDatos
          columnas={columnas}
          filas={alumnos}
          claveFila={(a) => a.codigo}
          columnaOrden={columnaOrden}
          sentidoOrden={sentidoOrden}
          alOrdenar={manejarOrdenar}
        />
      </EstadoCarga>

      {/* Modal para Crear Alumno */}
      <Modal
        abierto={modalNuevoAbierto}
        alCerrar={() => setModalNuevoAbierto(false)}
        titulo="Matricular Nuevo Alumno"
      >
        <FormularioAlumno
          alGuardar={manejarCrearAlumno}
          alCancelar={() => setModalNuevoAbierto(false)}
        />
      </Modal>

      {/* Modal para Editar Alumno */}
      <Modal
        abierto={!!alumnoEditando}
        alCerrar={() => setAlumnoEditando(null)}
        titulo={`Editar Alumno [${alumnoEditando?.codigo}]`}
      >
        {alumnoEditando && (
          <FormularioAlumno
            esEdicion={true}
            codigoInicial={alumnoEditando.codigo}
            apellidosInicial={alumnoEditando.apellidos}
            nombresInicial={alumnoEditando.nombres}
            edadInicial={alumnoEditando.edad}
            alGuardar={manejarEditarAlumno}
            alCancelar={() => setAlumnoEditando(null)}
          />
        )}
      </Modal>

      {/* Modal de Confirmación para Eliminar */}
      <ModalConfirmacion
        abierto={!!alumnoAEliminar}
        titulo="Confirmar Baja de Alumno"
        mensaje={`¿Está seguro de que desea eliminar al alumno ${formatearNombreCompleto(
          alumnoAEliminar?.apellidos || '',
          alumnoAEliminar?.nombres || ''
        )} con código ${alumnoAEliminar?.codigo}? Esta acción eliminará permanentemente todas sus matrículas y calificaciones registradas.`}
        textoConfirmar="Eliminar Alumno"
        textoCancelar="Conservar Alumno"
        alConfirmar={confirmarEliminar}
        alCancelar={() => setAlumnoAEliminar(null)}
        cargando={eliminando}
      />
    </div>
  );
};

export default ListaAlumnos;
