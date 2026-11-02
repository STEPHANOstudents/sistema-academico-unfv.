/**
 * Controlador para la gestión de alumnos por parte del personal de secretaría.
 * Expone operaciones de listado, búsqueda, creación, edición, eliminación y cálculo de extremos.
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { EDAD_MAXIMA, EDAD_MINIMA, LONGITUD_MAX_NOMBRE } from '../config/constantes';
import * as alumnoServicio from '../services/alumnoServicio';

const esquemaCrearAlumno = z.object({
  apellidos: z
    .string()
    .trim()
    .min(1, 'Los apellidos son obligatorios.')
    .max(LONGITUD_MAX_NOMBRE, `Los apellidos no deben superar los ${LONGITUD_MAX_NOMBRE} caracteres.`),
  nombres: z
    .string()
    .trim()
    .min(1, 'Los nombres son obligatorios.')
    .max(LONGITUD_MAX_NOMBRE, `Los nombres no deben superar los ${LONGITUD_MAX_NOMBRE} caracteres.`),
  edad: z
    .number({ invalid_type_error: 'La edad debe ser un número entero.' })
    .int('La edad debe ser un número entero.')
    .min(EDAD_MINIMA, `La edad mínima permitida es ${EDAD_MINIMA} años.`)
    .max(EDAD_MAXIMA, `La edad máxima permitida es ${EDAD_MAXIMA} años.`)
});

const esquemaEditarAlumno = z.object({
  apellidos: z
    .string()
    .trim()
    .min(1, 'Los apellidos no pueden estar vacíos.')
    .max(LONGITUD_MAX_NOMBRE, `Los apellidos no deben superar los ${LONGITUD_MAX_NOMBRE} caracteres.`)
    .optional(),
  nombres: z
    .string()
    .trim()
    .min(1, 'Los nombres no pueden estar vacíos.')
    .max(LONGITUD_MAX_NOMBRE, `Los nombres no deben superar los ${LONGITUD_MAX_NOMBRE} caracteres.`)
    .optional(),
  edad: z
    .number({ invalid_type_error: 'La edad debe ser un número entero.' })
    .int('La edad debe ser un número entero.')
    .min(EDAD_MINIMA, `La edad mínima permitida es ${EDAD_MINIMA} años.`)
    .max(EDAD_MAXIMA, `La edad máxima permitida es ${EDAD_MAXIMA} años.`)
    .optional()
});

/**
 * Lista todos los alumnos aplicando filtros y ordenamientos solicitados.
 */
export function listar(req: Request, res: Response, next: NextFunction): void {
  try {
    const buscar = typeof req.query.buscar === 'string' ? req.query.buscar : undefined;
    const ordenarPor = ['edad', 'promedio', 'apellidos'].includes(req.query.ordenarPor as string)
      ? (req.query.ordenarPor as 'edad' | 'promedio' | 'apellidos')
      : undefined;
    const orden = req.query.orden === 'desc' ? 'desc' : 'asc';

    const alumnos = alumnoServicio.listarAlumnos({ buscar, ordenarPor, orden });
    res.json(alumnos);
  } catch (error) {
    next(error);
  }
}

/**
 * Registra a un nuevo alumno asignándole automáticamente un código ponderado.
 */
export function crear(req: Request, res: Response, next: NextFunction): void {
  try {
    const datosValidados = esquemaCrearAlumno.parse(req.body);
    const nuevoAlumno = alumnoServicio.crearAlumno(datosValidados);
    res.status(201).json(nuevoAlumno);
  } catch (error) {
    next(error);
  }
}

/**
 * Retorna los alumnos con mayor y menor promedio general.
 */
export function extremos(_req: Request, res: Response, next: NextFunction): void {
  try {
    const resultado = alumnoServicio.obtenerAlumnosExtremos();
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}

/**
 * Consulta la ficha completa de un estudiante con sus asignaturas y calificaciones.
 */
export function obtenerPorCodigo(req: Request, res: Response, next: NextFunction): void {
  try {
    const { codigo } = req.params;
    const alumnoDetalle = alumnoServicio.obtenerDetalleAlumno(codigo);
    res.json(alumnoDetalle);
  } catch (error) {
    next(error);
  }
}

/**
 * Actualiza los datos personales (nombres, apellidos, edad) de un alumno.
 */
export function editar(req: Request, res: Response, next: NextFunction): void {
  try {
    const { codigo } = req.params;
    const datosValidados = esquemaEditarAlumno.parse(req.body);
    const alumnoActualizado = alumnoServicio.editarAlumno(codigo, datosValidados);
    res.json(alumnoActualizado);
  } catch (error) {
    next(error);
  }
}

/**
 * Elimina definitivamente a un alumno y sus matrículas asociadas.
 */
export function eliminar(req: Request, res: Response, next: NextFunction): void {
  try {
    const { codigo } = req.params;
    alumnoServicio.eliminarAlumno(codigo);
    res.json({ mensaje: 'Alumno y matrículas eliminados exitosamente.' });
  } catch (error) {
    next(error);
  }
}
