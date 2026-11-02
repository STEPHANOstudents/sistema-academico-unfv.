/**
 * Controlador para la gestión del catálogo de asignaturas.
 * Permite listar cursos, crear nuevas materias y consultar el listado de calificaciones por asignatura.
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { LONGITUD_MAX_NOMBRE } from '../config/constantes';
import * as cursoServicio from '../services/cursoServicio';

const esquemaCrearCurso = z.object({
  codigo: z
    .string()
    .trim()
    .regex(/^\d{3}$/, 'El código de curso debe estar compuesto exactamente por 3 dígitos numéricos.'),
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre del curso es obligatorio.')
    .max(LONGITUD_MAX_NOMBRE, `El nombre no puede superar los ${LONGITUD_MAX_NOMBRE} caracteres.`)
});

/**
 * Retorna el catálogo completo de cursos y la cantidad de inscritos en cada uno.
 */
export function listar(_req: Request, res: Response, next: NextFunction): void {
  try {
    const cursos = cursoServicio.listarCursos();
    res.json(cursos);
  } catch (error) {
    next(error);
  }
}

/**
 * Registra una nueva asignatura en el sistema.
 */
export function crear(req: Request, res: Response, next: NextFunction): void {
  try {
    const datosValidados = esquemaCrearCurso.parse(req.body);
    const nuevoCurso = cursoServicio.crearCurso(datosValidados);
    res.status(201).json(nuevoCurso);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene la relación de estudiantes matriculados en una materia con sus notas para el registro masivo.
 */
export function matriculasDeCurso(req: Request, res: Response, next: NextFunction): void {
  try {
    const { codigo } = req.params;
    const datos = cursoServicio.obtenerMatriculasDeCurso(codigo);
    res.json(datos);
  } catch (error) {
    next(error);
  }
}
