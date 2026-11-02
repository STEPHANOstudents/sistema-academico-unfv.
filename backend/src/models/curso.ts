/**
 * Modelos de datos para los cursos impartidos en la institución.
 * Describe tanto la entidad básica como su versión enriquecida con conteo de inscritos.
 */

/** Entidad básica de un curso académico */
export interface Curso {
  codigo: string; // Exactamente 3 dígitos, ej. "101"
  nombre: string; // Denominación de la asignatura, ej. "Programación I"
}

/** Representación del curso con la cantidad de alumnos inscritos */
export interface CursoConCantidad extends Curso {
  cantidadAlumnos: number;
}
