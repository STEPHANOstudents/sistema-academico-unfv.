/**
 * Modelos de datos para los alumnos de la institución.
 * Describe la entidad persistida y las estructuras formateadas de resumen y detalle.
 */

import { MatriculaDetalle } from './matricula';

/** Entidad alumno almacenada en el sistema */
export interface Alumno {
  codigo: string; // 8 dígitos + 1 letra verificadora calculada, ej. "20184321C"
  apellidos: string;
  nombres: string;
  edad: number;
}

/** Resumen de alumno utilizado en listas principales y ordenamientos */
export interface AlumnoResumen {
  codigo: string;
  apellidos: string;
  nombres: string;
  edad: number;
  cantidadCursos: number;
  promedioGeneral: number | null;
}

/** Vista exhaustiva de un alumno con el desglose de todas sus asignaturas y notas */
export interface AlumnoDetalle extends AlumnoResumen {
  matriculas: MatriculaDetalle[];
}
