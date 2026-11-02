/**
 * Servicio de gestión para el catálogo de cursos académicos.
 * Ofrece listado con estadísticas de alumnos inscritos, creación y consulta de matrículas por curso.
 */

import { alumnosDB, cursosDB, matriculasDB } from '../data/baseDatosMemoria';
import { ErrorApp } from '../middlewares/manejoErrores';
import { Curso, CursoConCantidad } from '../models/curso';
import { AlumnoEnCurso } from '../models/matricula';
import { calcularPromedioCurso, determinarEstadoCurso } from '../utils/calculos';

/**
 * Retorna todos los cursos disponibles complementados con la cantidad de alumnos inscritos.
 *
 * @returns Lista de cursos con conteo de inscritos
 */
export function listarCursos(): CursoConCantidad[] {
  return cursosDB.map((curso) => {
    const cantidadAlumnos = matriculasDB.filter((m) => m.codigoCurso === curso.codigo).length;
    return {
      ...curso,
      cantidadAlumnos
    };
  });
}

/**
 * Registra una nueva asignatura en el catálogo académico institucional.
 *
 * @param datos Objeto con el código de 3 dígitos y el nombre de la asignatura
 * @returns Curso creado satisfactoriamente
 */
export function crearCurso(datos: { codigo: string; nombre: string }): Curso {
  const codigoLimpio = datos.codigo.trim();
  const nombreLimpio = datos.nombre.trim();

  // Validación de unicidad de código
  const yaExiste = cursosDB.some((c) => c.codigo === codigoLimpio);
  if (yaExiste) {
    throw new ErrorApp(409, `Ya existe un curso registrado con el código ${codigoLimpio}.`);
  }

  const nuevoCurso: Curso = {
    codigo: codigoLimpio,
    nombre: nombreLimpio
  };

  cursosDB.push(nuevoCurso);
  return nuevoCurso;
}

/**
 * Obtiene la lista de todos los alumnos matriculados en una asignatura específica junto con sus notas.
 * Diseñado especialmente para la pantalla de registro y visualización masiva de notas por curso.
 *
 * @param codigoCurso Código de 3 dígitos de la asignatura
 * @returns Lista detallada de estudiantes matriculados en dicho curso
 */
export function obtenerMatriculasDeCurso(codigoCurso: string): {
  curso: Curso;
  alumnos: AlumnoEnCurso[];
} {
  const curso = cursosDB.find((c) => c.codigo === codigoCurso);
  if (!curso) {
    throw new ErrorApp(404, `No se encontró ningún curso con el código ${codigoCurso}.`);
  }

  const matriculasDelCurso = matriculasDB.filter((m) => m.codigoCurso === codigoCurso);

  const alumnos: AlumnoEnCurso[] = matriculasDelCurso.map((m) => {
    const alumno = alumnosDB.find((a) => a.codigo === m.codigoAlumno);
    return {
      codigoAlumno: m.codigoAlumno,
      apellidos: alumno ? alumno.apellidos : 'Desconocido',
      nombres: alumno ? alumno.nombres : 'Desconocido',
      notas: [...m.notas],
      promedio: calcularPromedioCurso(m.notas),
      estado: determinarEstadoCurso(m.notas)
    };
  });

  // Ordenar alfabéticamente por apellidos para facilitar el trabajo del docente/secretario
  alumnos.sort((a, b) => a.apellidos.localeCompare(b.apellidos, 'es', { sensitivity: 'base' }));

  return {
    curso,
    alumnos
  };
}
