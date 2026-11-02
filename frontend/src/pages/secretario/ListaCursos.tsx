/**
 * Catálogo general de asignaturas para el personal de Secretaría.
 * Despliega las materias existentes, conteo de inscritos y formulario modal para crear cursos con código de 3 dígitos.
 */

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import EncabezadoPagina from '../../components/ui/EncabezadoPagina';
import TablaDatos, { ColumnaTabla } from '../../components/ui/TablaDatos';
import EstadoCarga from '../../components/ui/EstadoCarga';
import Boton from '../../components/ui/Boton';
import Modal from '../../components/ui/Modal';
import CampoTexto from '../../components/ui/CampoTexto';
import MensajeError from '../../components/ui/MensajeError';
import AvisoTemporal from '../../components/ui/AvisoTemporal';
import { listarCursos, crearCurso } from '../../api/cursosApi';
import { Curso } from '../../types/modelos';
import './ListaCursos.css';

export const ListaCursos: React.FC = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal para nuevo curso
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [codigoCurso, setCodigoCurso] = useState<string>('');
  const [nombreCurso, setNombreCurso] = useState<string>('');
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);

  // Aviso temporal
  const [avisoExito, setAvisoExito] = useState<string | null>(null);

  const cargarCursos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await listarCursos();
      setCursos(datos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el catálogo de cursos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarCursos();
  }, [cargarCursos]);

  const manejarCrearCurso = async (e: FormEvent) => {
    e.preventDefault();
    setErrorFormulario(null);

    const codigoLimpio = codigoCurso.trim();
    const nombreLimpio = nombreCurso.trim();

    // Validaciones del cliente
    if (!/^\d{3}$/.test(codigoLimpio)) {
      setErrorFormulario('El código de curso debe tener exactamente 3 dígitos numéricos (ej. 106).');
      return;
    }

    if (!nombreLimpio) {
      setErrorFormulario('El nombre de la asignatura es obligatorio.');
      return;
    }

    setGuardando(true);
    try {
      await crearCurso({ codigo: codigoLimpio, nombre: nombreLimpio });
      setModalAbierto(false);
      setCodigoCurso('');
      setNombreCurso('');
      setAvisoExito(`Asignatura [${codigoLimpio}] "${nombreLimpio}" creada satisfactoriamente.`);
      await cargarCursos();
    } catch (err) {
      setErrorFormulario(err instanceof Error ? err.message : 'Error al registrar la asignatura.');
    } finally {
      setGuardando(false);
    }
  };

  const columnas: ColumnaTabla<Curso>[] = [
    {
      clave: 'codigo',
      encabezado: 'Código',
      alineacion: 'centro',
      render: (c) => <strong className="curso-codigo-texto">{c.codigo}</strong>
    },
    {
      clave: 'nombre',
      encabezado: 'Nombre de la Asignatura',
      render: (c) => <span className="curso-nombre-fila">{c.nombre}</span>
    },
    {
      clave: 'cantidadAlumnos',
      encabezado: 'Alumnos Matriculados',
      alineacion: 'centro',
      render: (c) => (
        <span className="badge-cantidad-alumnos">
          {c.cantidadAlumnos} {c.cantidadAlumnos === 1 ? 'alumno' : 'alumnos'}
        </span>
      )
    }
  ];

  return (
    <div className="lista-cursos-pagina">
      <AvisoTemporal mensaje={avisoExito} alCerrar={() => setAvisoExito(null)} />

      <EncabezadoPagina
        titulo="Catálogo Institucional de Asignaturas"
        descripcion="Plan de estudios oficial con la cantidad de alumnos matriculados en cada materia."
        acciones={
          <Boton variante="primario" onClick={() => setModalAbierto(true)}>
            + Nueva Asignatura
          </Boton>
        }
      />

      <EstadoCarga
        cargando={cargando}
        error={error}
        alReintentar={cargarCursos}
        esVacio={cursos.length === 0}
        mensajeVacio="No hay cursos registrados actualmente en el sistema."
      >
        <TablaDatos
          columnas={columnas}
          filas={cursos}
          claveFila={(c) => c.codigo}
        />
      </EstadoCarga>

      {/* Modal para Crear Curso */}
      <Modal
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        titulo="Registrar Nueva Asignatura"
      >
        <form onSubmit={manejarCrearCurso} noValidate className="formulario-nuevo-curso">
          <MensajeError mensaje={errorFormulario} alCerrar={() => setErrorFormulario(null)} />

          <CampoTexto
            etiqueta="Código del Curso"
            placeholder="Ej. 106"
            maxLength={3}
            value={codigoCurso}
            onChange={(e) => setCodigoCurso(e.target.value.replace(/\D/g, ''))}
            ayuda="Debe constar exactamente de 3 dígitos numéricos."
            required
            autoFocus
          />

          <CampoTexto
            etiqueta="Nombre de la Asignatura"
            placeholder="Ej. Base de Datos I"
            maxLength={60}
            value={nombreCurso}
            onChange={(e) => setNombreCurso(e.target.value)}
            required
          />

          <div className="formulario-curso-acciones">
            <Boton
              type="button"
              variante="secundario"
              onClick={() => setModalAbierto(false)}
              disabled={guardando}
            >
              Cancelar
            </Boton>
            <Boton type="submit" variante="primario" cargando={guardando}>
              Crear Asignatura
            </Boton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ListaCursos;
