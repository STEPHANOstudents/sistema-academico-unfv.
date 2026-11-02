/**
 * Servicio para la gestión de matrículas y calificaciones.
 * Controla la inscripción de alumnos en asignaturas y el registro práctica por práctica.
 */

import { NOTA_MAXIMA, NOTA_MINIMA, TOTAL_PRACTICAS } from '../config/constantes';
import { alumnosDB, cursosDB, matriculasDB } from '../data/baseDatosMemoria';
import { ErrorApp } from '../middlewares/manejoErrores';
import { Matricula, MatriculaDetalle } from '../models/matricula';
import { calcularPromedioCurso, determinarEstadoCurso } from '../utils/calculos';

/**
 * Inscribe a un estudiante en una asignatura determinada.
 *
 * Reglas de negocio obligatorias:
 * 1. Matricular crea la tupla de notas en [null, null, null, null]. Nunca se solicitan notas al matricular.
 * 2. Un alumno no puede matricularse dos veces en el mismo curso (responde HTTP 409).
 * 3. Tanto el alumno como el curso deben existir previamente en el sistema.
 *
 * @param codigoAlumno Código de 9 caracteres del alumno
 * @param codigoCurso Código de 3 dígitos del curso
 * @returns Matrícula registrada con sus 4 casillas vacías
 */
export function matricularAlumno(codigoAlumno: string, codigoCurso: string): Matricula {
  const codigoAlu = codigoAlumno.trim().toUpperCase();
  const codigoCur = codigoCurso.trim();

  // 1. Validar existencia del estudiante
  const alumnoExiste = alumnosDB.some((a) => a.codigo === codigoAlu);
  if (!alumnoExiste) {
    throw new ErrorApp(404, `No se encontró el alumno con código ${codigoAlu}.`);
  }

  // 2. Validar existencia del curso
  const cursoExiste = cursosDB.some((c) => c.codigo === codigoCur);
  if (!cursoExiste) {
    throw new ErrorApp(404, `No se encontró el curso con código ${codigoCur}.`);
  }

  // 3. Validar duplicidad de matrícula (error 409)
  const yaMatriculado = matriculasDB.some(
    (m) => m.codigoAlumno === codigoAlu && m.codigoCurso === codigoCur
  );
  if (yaMatriculado) {
    throw new ErrorApp(409, 'El alumno ya se encuentra matriculado en este curso.');
  }

  // 4. Crear la matrícula con las 4 prácticas pendientes (null)
  const nuevaMatricula: Matricula = {
    codigoAlumno: codigoAlu,
    codigoCurso: codigoCur,
    notas: [null, null, null, null]
  };

  matriculasDB.push(nuevaMatricula);
  return nuevaMatricula;
}

/**
 * Retira a un estudiante de una asignatura específica y elimina sus calificaciones en la misma.
 *
 * @param codigoAlumno Código del alumno
 * @param codigoCurso Código del curso
 */
export function retirarAlumno(codigoAlumno: string, codigoCurso: string): void {
  const codigoAlu = codigoAlumno.trim().toUpperCase();
  const codigoCur = codigoCurso.trim();

  const indice = matriculasDB.findIndex(
    (m) => m.codigoAlumno === codigoAlu && m.codigoCurso === codigoCur
  );

  if (indice === -1) {
    throw new ErrorApp(404, 'No se encontró la matrícula especificada para retirar al estudiante.');
  }

  matriculasDB.splice(indice, 1);
}

/**
 * Registra o rectifica la nota de una práctica específica (1, 2, 3 o 4).
 * Permite asignar un valor entero entre 0 y 20, o null para dejar la práctica en estado pendiente.
 *
 * @param codigoAlumno Código del estudiante
 * @param codigoCurso Código de la asignatura
 * @param practica Número correlativo de práctica (1, 2, 3 o 4)
 * @param nota Calificación entera entre 0 y 20, o null para borrar/dejar pendiente
 * @returns Detalle actualizado de la matrícula con nuevo promedio y estado
 */
export function registrarNota(
  codigoAlumno: string,
  codigoCurso: string,
  practica: number,
  nota: number | null
): MatriculaDetalle {
  const codigoAlu = codigoAlumno.trim().toUpperCase();
  const codigoCur = codigoCurso.trim();

  // Validación de número de práctica
  if (!Number.isInteger(practica) || practica < 1 || practica > TOTAL_PRACTICAS) {
    throw new ErrorApp(400, `El número de práctica debe ser un valor entero entre 1 y ${TOTAL_PRACTICAS}.`);
  }

  // Validación del rango de calificación
  if (nota !== null) {
    if (typeof nota !== 'number' || !Number.isInteger(nota) || nota < NOTA_MINIMA || nota > NOTA_MAXIMA) {
      throw new ErrorApp(
        400,
        `La nota debe ser un número entero entre ${NOTA_MINIMA} y ${NOTA_MAXIMA}, o null para dejarla pendiente.`
      );
    }
  }

  // Búsqueda de la matrícula correspondiente
  const matricula = matriculasDB.find(
    (m) => m.codigoAlumno === codigoAlu && m.codigoCurso === codigoCur
  );

  if (!matricula) {
    throw new ErrorApp(404, 'No se encontró la matrícula del alumno en este curso.');
  }

  // Asignar en el índice correspondiente (práctica 1 -> índice 0)
  matricula.notas[practica - 1] = nota;

  const curso = cursosDB.find((c) => c.codigo === matricula.codigoCurso);

  return {
    curso: curso ? { ...curso } : { codigo: matricula.codigoCurso, nombre: 'Curso no registrado' },
    notas: [...matricula.notas],
    promedio: calcularPromedioCurso(matricula.notas),
    estado: determinarEstadoCurso(matricula.notas)
  };
}
