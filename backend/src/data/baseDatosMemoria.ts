/**
 * Estructuras de almacenamiento volátil en memoria para la aplicación.
 * Mantiene colecciones en arreglos durante el tiempo de ejecución del servidor.
 */

import { Alumno } from '../models/alumno';
import { Curso } from '../models/curso';
import { Matricula } from '../models/matricula';
import { Secretario } from '../models/usuario';

/** Arreglo en memoria con los secretarios autorizados */
export const secretariosDB: Secretario[] = [];

/** Arreglo en memoria con los alumnos registrados */
export const alumnosDB: Alumno[] = [];

/** Arreglo en memoria con los cursos disponibles */
export const cursosDB: Curso[] = [];

/** Arreglo en memoria con las matrículas y calificaciones */
export const matriculasDB: Matricula[] = [];
