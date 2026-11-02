/**
 * Módulo de cálculos académicos para promedios y determinación de estados de curso.
 * Garantiza que las notas pendientes no distorsionen los promedios parciales de los estudiantes.
 */

import { NOTA_APROBATORIA, TOTAL_PRACTICAS } from '../config/constantes';
import { EstadoCurso, NotasTupla } from '../models/matricula';

/**
 * Calcula el promedio aritmético considerando únicamente las prácticas que ya han sido calificadas.
 * A diferencia del sistema anterior de consola, no penaliza las prácticas pendientes computándolas como cero.
 *
 * @param notas Tupla de 4 notas donde null representa una práctica pendiente
 * @returns Promedio redondeado a 2 decimales, o null si ninguna práctica ha sido calificada aún
 */
export function calcularPromedioCurso(notas: NotasTupla): number | null {
  // Filtra únicamente las notas que tienen un valor numérico definido
  const notasRegistradas = notas.filter((n): n is number => n !== null && typeof n === 'number');

  if (notasRegistradas.length === 0) {
    return null;
  }

  const suma = notasRegistradas.reduce((acumulador, nota) => acumulador + nota, 0);
  const promedio = suma / notasRegistradas.length;

  // Redondeo estándar a 2 decimales
  return Math.round(promedio * 100) / 100;
}

/**
 * Determina el estado académico de un curso en función del avance de sus prácticas.
 *
 * Reglas de negocio:
 * - "SIN_NOTAS": 0 prácticas registradas.
 * - "EN_CURSO": entre 1 y 3 prácticas registradas (el semestre continúa).
 * - "APROBADO": las 4 prácticas completadas y promedio >= NOTA_APROBATORIA (11).
 * - "DESAPROBADO": las 4 prácticas completadas y promedio < NOTA_APROBATORIA (11).
 *
 * @param notas Tupla de 4 notas del curso
 * @returns Estado académico formal
 */
export function determinarEstadoCurso(notas: NotasTupla): EstadoCurso {
  const notasRegistradas = notas.filter((n): n is number => n !== null && typeof n === 'number');
  const cantidadRegistradas = notasRegistradas.length;

  if (cantidadRegistradas === 0) {
    return 'SIN_NOTAS';
  }

  if (cantidadRegistradas < TOTAL_PRACTICAS) {
    return 'EN_CURSO';
  }

  // Las 4 prácticas están completadas
  const promedio = calcularPromedioCurso(notas);
  if (promedio !== null && promedio >= NOTA_APROBATORIA) {
    return 'APROBADO';
  }

  return 'DESAPROBADO';
}

/**
 * Calcula el promedio ponderado/general de un estudiante a partir de los promedios de sus asignaturas.
 * Solo incluye en el cómputo aquellos cursos que tienen al menos una práctica calificada (promedio !== null).
 *
 * @param promediosCursos Lista de promedios de los cursos en los que está matriculado el alumno
 * @returns Promedio general redondeado a 2 decimales, o null si el alumno no cuenta con notas registradas
 */
export function calcularPromedioGeneral(promediosCursos: (number | null)[]): number | null {
  const promediosValidos = promediosCursos.filter((p): p is number => p !== null && typeof p === 'number');

  if (promediosValidos.length === 0) {
    return null;
  }

  const suma = promediosValidos.reduce((acumulador, p) => acumulador + p, 0);
  const promedioGeneral = suma / promediosValidos.length;

  return Math.round(promedioGeneral * 100) / 100;
}
