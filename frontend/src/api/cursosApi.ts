/**
 * Servicios de llamada a la API para el catálogo de asignaturas.
 */

import { llamarApi } from './cliente';
import { Curso, MatriculasCursoRespuesta } from '../types/modelos';

/**
 * Retorna todos los cursos disponibles con la cantidad de alumnos inscritos.
 */
export async function listarCursos(): Promise<Curso[]> {
  return llamarApi<Curso[]>('/cursos');
}

/**
 * Registra una nueva asignatura en el sistema.
 */
export async function crearCurso(datos: { codigo: string; nombre: string }): Promise<Curso> {
  return llamarApi<Curso>('/cursos', {
    method: 'POST',
    body: JSON.stringify(datos)
  });
}

/**
 * Consulta la lista de alumnos matriculados en una materia junto con sus calificaciones.
 */
export async function obtenerMatriculasDeCurso(
  codigoCurso: string
): Promise<MatriculasCursoRespuesta> {
  return llamarApi<MatriculasCursoRespuesta>(`/cursos/${encodeURIComponent(codigoCurso)}/matriculas`);
}
