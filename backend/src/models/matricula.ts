/**
 * Modelos de datos para las matrículas y calificaciones de los alumnos.
 * Define la tupla fija de 4 notas y los posibles estados académicos del curso.
 */

import { Curso } from './curso';

/** Posibles estados académicos de un curso según el avance de sus calificaciones */
export type EstadoCurso = 'SIN_NOTAS' | 'EN_CURSO' | 'APROBADO' | 'DESAPROBADO';

/** Tupla estricta con las notas de las 4 prácticas fijas; null representa nota pendiente */
export type NotasTupla = [number | null, number | null, number | null, number | null];

/** Registro de inscripción de un alumno en un curso */
export interface Matricula {
  codigoAlumno: string;
  codigoCurso: string;
  notas: NotasTupla;
}

/** Detalle de la matrícula de un curso con información ampliada para vistas y reportes */
export interface MatriculaDetalle {
  curso: Curso;
  notas: NotasTupla;
  promedio: number | null;
  estado: EstadoCurso;
}

/** Resumen de alumno matriculado en un curso para el listado de calificaciones por curso */
export interface AlumnoEnCurso {
  codigoAlumno: string;
  apellidos: string;
  nombres: string;
  notas: NotasTupla;
  promedio: number | null;
  estado: EstadoCurso;
}
