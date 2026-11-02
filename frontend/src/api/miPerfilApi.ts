/**
 * Servicios de llamada a la API para la consulta del expediente del alumno conectado.
 */

import { llamarApi } from './cliente';
import { AlumnoDetalle } from '../types/modelos';

/**
 * Consulta la ficha y notas del estudiante autenticado a partir de su token.
 */
export async function obtenerMiPerfil(): Promise<AlumnoDetalle> {
  return llamarApi<AlumnoDetalle>('/mi-perfil');
}
