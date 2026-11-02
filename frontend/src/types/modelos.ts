/**
 * Definiciones de tipos y modelos de datos compartidos en el frontend.
 * Refleja fielmente el contrato de la API del backend sin discrepancias.
 */

export type Rol = 'SECRETARIO' | 'ALUMNO';
export type EstadoCurso = 'SIN_NOTAS' | 'EN_CURSO' | 'APROBADO' | 'DESAPROBADO';
export type Notas = [number | null, number | null, number | null, number | null];

export interface Alumno {
  codigo: string;
  apellidos: string;
  nombres: string;
  edad: number;
}

export interface AlumnoResumen {
  codigo: string;
  apellidos: string;
  nombres: string;
  edad: number;
  cantidadCursos: number;
  promedioGeneral: number | null;
}

export interface MatriculaDetalle {
  curso: { codigo: string; nombre: string };
  notas: Notas;
  promedio: number | null;
  estado: EstadoCurso;
}

export interface AlumnoDetalle extends AlumnoResumen {
  matriculas: MatriculaDetalle[];
}

export interface Curso {
  codigo: string;
  nombre: string;
  cantidadAlumnos: number;
}

export interface AlumnoEnCurso {
  codigoAlumno: string;
  apellidos: string;
  nombres: string;
  notas: Notas;
  promedio: number | null;
  estado: EstadoCurso;
}

export interface MatriculasCursoRespuesta {
  curso: { codigo: string; nombre: string };
  alumnos: AlumnoEnCurso[];
}

export interface ExtremosAlumnos {
  mejor: AlumnoResumen | null;
  menor: AlumnoResumen | null;
}

export interface Matricula {
  codigoAlumno: string;
  codigoCurso: string;
  notas: Notas;
}

export interface RespuestaLogin {
  token: string;
  rol: Rol;
  nombre: string;
}

export interface UsuarioSesion {
  id: string;
  rol: Rol;
  nombre: string;
}
