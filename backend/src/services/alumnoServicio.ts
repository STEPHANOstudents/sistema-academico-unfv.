/**
 * Servicio de gestión integral de alumnos.
 * Implementa las operaciones CRUD, cálculo de promedios, ordenamientos y búsqueda.
 */

import { alumnosDB, cursosDB, matriculasDB } from '../data/baseDatosMemoria';
import { ErrorApp } from '../middlewares/manejoErrores';
import { Alumno, AlumnoDetalle, AlumnoResumen } from '../models/alumno';
import { MatriculaDetalle } from '../models/matricula';
import { calcularPromedioCurso, calcularPromedioGeneral, determinarEstadoCurso } from '../utils/calculos';
import { generarCodigo } from '../utils/codigoAlumno';

/** Parámetros admitidos para el filtrado y ordenamiento de alumnos */
export interface ParametrosConsultaAlumnos {
  buscar?: string;
  ordenarPor?: 'edad' | 'promedio' | 'apellidos';
  orden?: 'asc' | 'desc';
}

/**
 * Construye el objeto AlumnoResumen calculando dinámicamente sus asignaturas y promedio general.
 *
 * @param alumno Entidad alumno almacenada
 * @returns Resumen formateado para listados
 */
export function construirResumenAlumno(alumno: Alumno): AlumnoResumen {
  const misMatriculas = matriculasDB.filter((m) => m.codigoAlumno === alumno.codigo);
  const promediosCursos = misMatriculas.map((m) => calcularPromedioCurso(m.notas));
  const promedioGeneral = calcularPromedioGeneral(promediosCursos);

  return {
    codigo: alumno.codigo,
    apellidos: alumno.apellidos,
    nombres: alumno.nombres,
    edad: alumno.edad,
    cantidadCursos: misMatriculas.length,
    promedioGeneral
  };
}

/**
 * Obtiene el detalle completo de un alumno, incluyendo cada curso matriculado,
 * sus 4 casillas de calificaciones, promedios individuales y estados académicos.
 *
 * @param codigo Código de 9 caracteres del estudiante
 * @returns Detalle enriquecido del alumno
 */
export function obtenerDetalleAlumno(codigo: string): AlumnoDetalle {
  const alumno = alumnosDB.find((a) => a.codigo.toUpperCase() === codigo.toUpperCase());
  if (!alumno) {
    throw new ErrorApp(404, `No se encontró ningún alumno con el código ${codigo}.`);
  }

  const resumen = construirResumenAlumno(alumno);
  const misMatriculas = matriculasDB.filter((m) => m.codigoAlumno === alumno.codigo);

  const matriculasDetalle: MatriculaDetalle[] = misMatriculas.map((m) => {
    const curso = cursosDB.find((c) => c.codigo === m.codigoCurso);
    return {
      curso: curso ? { ...curso } : { codigo: m.codigoCurso, nombre: 'Curso no registrado' },
      notas: [...m.notas],
      promedio: calcularPromedioCurso(m.notas),
      estado: determinarEstadoCurso(m.notas)
    };
  });

  return {
    ...resumen,
    matriculas: matriculasDetalle
  };
}

/**
 * Lista todos los alumnos aplicando filtros de búsqueda textual y criterios de ordenamiento.
 *
 * Regla de negocio crítica sobre ordenamiento:
 * Cuando se ordena por 'promedio', los alumnos sin calificaciones (promedio === null)
 * se sitúan SIEMPRE al final de la lista, sin importar si el orden es ascendente o descendente.
 *
 * @param params Criterios de búsqueda y orden
 * @returns Colección ordenada de resúmenes de alumnos
 */
export function listarAlumnos(params: ParametrosConsultaAlumnos): AlumnoResumen[] {
  let resultado = alumnosDB.map(construirResumenAlumno);

  // 1. Filtro por búsqueda textual (código, apellidos o nombres)
  if (params.buscar && params.buscar.trim() !== '') {
    const texto = params.buscar.trim().toLowerCase();
    resultado = resultado.filter((a) =>
      a.codigo.toLowerCase().includes(texto) ||
      a.apellidos.toLowerCase().includes(texto) ||
      a.nombres.toLowerCase().includes(texto)
    );
  }

  // 2. Ordenamiento configurable
  const criterio = params.ordenarPor || 'apellidos';
  const sentido = params.orden === 'desc' ? 'desc' : 'asc';

  resultado.sort((a, b) => {
    if (criterio === 'promedio') {
      // Regla obligatoria: valores null siempre al final
      if (a.promedioGeneral === null && b.promedioGeneral === null) return 0;
      if (a.promedioGeneral === null) return 1;
      if (b.promedioGeneral === null) return -1;

      return sentido === 'asc'
        ? a.promedioGeneral - b.promedioGeneral
        : b.promedioGeneral - a.promedioGeneral;
    }

    if (criterio === 'edad') {
      return sentido === 'asc' ? a.edad - b.edad : b.edad - a.edad;
    }

    // Por defecto: orden alfabético por apellidos
    const comparacion = a.apellidos.localeCompare(b.apellidos, 'es', { sensitivity: 'base' });
    return sentido === 'asc' ? comparacion : -comparacion;
  });

  return resultado;
}

/**
 * Crea y matricula a un nuevo alumno en la institución.
 * El código es autogenerado de forma obligatoria siguiendo el algoritmo oficial ponderado.
 *
 * @param datos Información personal (apellidos, nombres y edad)
 * @returns El alumno recién creado
 */
export function crearAlumno(datos: { apellidos: string; nombres: string; edad: number }): Alumno {
  const codigosExistentes = alumnosDB.map((a) => a.codigo);
  const nuevoCodigo = generarCodigo(codigosExistentes);

  const nuevoAlumno: Alumno = {
    codigo: nuevoCodigo,
    apellidos: datos.apellidos.trim(),
    nombres: datos.nombres.trim(),
    edad: datos.edad
  };

  alumnosDB.push(nuevoAlumno);
  return nuevoAlumno;
}

/**
 * Edita la información básica de un alumno existente (apellidos, nombres o edad).
 * El código de alumno es inmutable por diseño institucional.
 *
 * @param codigo Código del alumno a modificar
 * @param datos Nuevos valores para actualización
 * @returns Alumno con sus datos actualizados
 */
export function editarAlumno(
  codigo: string,
  datos: { apellidos?: string; nombres?: string; edad?: number }
): Alumno {
  const alumno = alumnosDB.find((a) => a.codigo.toUpperCase() === codigo.toUpperCase());
  if (!alumno) {
    throw new ErrorApp(404, `No se encontró el alumno con código ${codigo} para editar.`);
  }

  if (datos.apellidos !== undefined) {
    alumno.apellidos = datos.apellidos.trim();
  }
  if (datos.nombres !== undefined) {
    alumno.nombres = datos.nombres.trim();
  }
  if (datos.edad !== undefined) {
    alumno.edad = datos.edad;
  }

  return alumno;
}

/**
 * Da de baja a un alumno de la institución eliminándolo de la base de datos
 * y removiendo en cascada todas las matrículas y notas asociadas a su código.
 *
 * @param codigo Código del alumno a eliminar
 */
export function eliminarAlumno(codigo: string): void {
  const indice = alumnosDB.findIndex((a) => a.codigo.toUpperCase() === codigo.toUpperCase());
  if (indice === -1) {
    throw new ErrorApp(404, `No se encontró el alumno con código ${codigo} para eliminar.`);
  }

  const codigoReal = alumnosDB[indice].codigo;

  // 1. Elimina al alumno de la lista
  alumnosDB.splice(indice, 1);

  // 2. Elimina en cascada todas sus matrículas registradas
  for (let i = matriculasDB.length - 1; i >= 0; i--) {
    if (matriculasDB[i].codigoAlumno === codigoReal) {
      matriculasDB.splice(i, 1);
    }
  }
}

/**
 * Obtiene a los alumnos con el mayor y menor promedio general de la institución.
 * Ignora por completo a aquellos estudiantes que aún no poseen calificaciones registradas.
 *
 * @returns Objeto con los resúmenes del mejor y menor promedio (o null si nadie tiene notas)
 */
export function obtenerAlumnosExtremos(): {
  mejor: AlumnoResumen | null;
  menor: AlumnoResumen | null;
} {
  const conNotas = alumnosDB
    .map(construirResumenAlumno)
    .filter((a): a is AlumnoResumen & { promedioGeneral: number } => a.promedioGeneral !== null);

  if (conNotas.length === 0) {
    return { mejor: null, menor: null };
  }

  let mejor = conNotas[0];
  let menor = conNotas[0];

  for (let i = 1; i < conNotas.length; i++) {
    if (conNotas[i].promedioGeneral > mejor.promedioGeneral) {
      mejor = conNotas[i];
    }
    if (conNotas[i].promedioGeneral < menor.promedioGeneral) {
      menor = conNotas[i];
    }
  }

  return { mejor, menor };
}
