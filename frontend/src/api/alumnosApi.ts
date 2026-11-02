/**
 * Servicios de llamada a la API para la gestión integral de alumnos y calificaciones.
 */

import { llamarApi } from './cliente';
import {
  Alumno,
  AlumnoDetalle,
  AlumnoResumen,
  ExtremosAlumnos,
  Matricula,
  MatriculaDetalle
} from '../types/modelos';

/**
 * Consulta la lista de alumnos con parámetros opcionales de búsqueda y ordenamiento.
 */
export async function listarAlumnos(
  buscar?: string,
  ordenarPor?: 'edad' | 'promedio' | 'apellidos',
  orden?: 'asc' | 'desc'
): Promise<AlumnoResumen[]> {
  const params = new URLSearchParams();
  if (buscar && buscar.trim() !== '') params.append('buscar', buscar.trim());
  if (ordenarPor) params.append('ordenarPor', ordenarPor);
  if (orden) params.append('orden', orden);

  const query = params.toString();
  const ruta = query ? `/alumnos?${query}` : '/alumnos';

  return llamarApi<AlumnoResumen[]>(ruta);
}

/**
 * Registra a un nuevo alumno generando automáticamente su código ponderado.
 */
export async function crearAlumno(datos: {
  apellidos: string;
  nombres: string;
  edad: number;
}): Promise<Alumno> {
  return llamarApi<Alumno>('/alumnos', {
    method: 'POST',
    body: JSON.stringify(datos)
  });
}

/**
 * Consulta la ficha completa de un alumno por su código.
 */
export async function obtenerAlumnoPorCodigo(codigo: string): Promise<AlumnoDetalle> {
  return llamarApi<AlumnoDetalle>(`/alumnos/${encodeURIComponent(codigo)}`);
}

/**
 * Actualiza los datos personales (nombres, apellidos, edad) de un alumno.
 */
export async function editarAlumno(
  codigo: string,
  datos: { apellidos?: string; nombres?: string; edad?: number }
): Promise<Alumno> {
  return llamarApi<Alumno>(`/alumnos/${encodeURIComponent(codigo)}`, {
    method: 'PUT',
    body: JSON.stringify(datos)
  });
}

/**
 * Da de baja a un alumno y elimina en cascada sus matrículas.
 */
export async function eliminarAlumno(codigo: string): Promise<{ mensaje: string }> {
  return llamarApi<{ mensaje: string }>(`/alumnos/${encodeURIComponent(codigo)}`, {
    method: 'DELETE'
  });
}

/**
 * Obtiene los alumnos con el mayor y menor promedio general.
 */
export async function obtenerExtremos(): Promise<ExtremosAlumnos> {
  return llamarApi<ExtremosAlumnos>('/alumnos/extremos');
}

/**
 * Inscribe a un estudiante en una asignatura.
 */
export async function matricularAlumno(codigo: string, codigoCurso: string): Promise<Matricula> {
  return llamarApi<Matricula>(`/alumnos/${encodeURIComponent(codigo)}/matriculas`, {
    method: 'POST',
    body: JSON.stringify({ codigoCurso })
  });
}

/**
 * Retira a un estudiante de una asignatura específica.
 */
export async function retirarAlumno(
  codigo: string,
  codigoCurso: string
): Promise<{ mensaje: string }> {
  return llamarApi<{ mensaje: string }>(
    `/alumnos/${encodeURIComponent(codigo)}/matriculas/${encodeURIComponent(codigoCurso)}`,
    {
      method: 'DELETE'
    }
  );
}

/**
 * Registra o rectifica la calificación de una práctica (1 a 4).
 */
export async function registrarNota(
  codigo: string,
  codigoCurso: string,
  practica: number,
  nota: number | null
): Promise<MatriculaDetalle> {
  return llamarApi<MatriculaDetalle>(
    `/alumnos/${encodeURIComponent(codigo)}/matriculas/${encodeURIComponent(codigoCurso)}/notas/${practica}`,
    {
      method: 'PUT',
      body: JSON.stringify({ nota })
    }
  );
}
