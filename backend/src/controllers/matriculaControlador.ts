/**
 * Controlador para la gestión de matrículas y calificaciones individuales.
 * Atiende las operaciones de inscripción, retiro de cursos y registro de notas por práctica.
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { NOTA_MAXIMA, NOTA_MINIMA } from '../config/constantes';
import * as matriculaServicio from '../services/matriculaServicio';

const esquemaMatricular = z.object({
  codigoCurso: z
    .string()
    .trim()
    .regex(/^\d{3}$/, 'El código de curso debe tener exactamente 3 dígitos.')
});

const esquemaNota = z.object({
  nota: z
    .union([
      z.null(),
      z
        .number({ invalid_type_error: 'La nota debe ser un número entero o null.' })
        .int('La nota debe ser un número entero.')
        .min(NOTA_MINIMA, `La nota mínima permitida es ${NOTA_MINIMA}.`)
        .max(NOTA_MAXIMA, `La nota máxima permitida es ${NOTA_MAXIMA}.`)
    ])
});

/**
 * Inscribe a un estudiante en una asignatura específica con sus calificaciones pendientes.
 */
export function matricular(req: Request, res: Response, next: NextFunction): void {
  try {
    const { codigo } = req.params;
    const { codigoCurso } = esquemaMatricular.parse(req.body);

    const matricula = matriculaServicio.matricularAlumno(codigo, codigoCurso);
    res.status(201).json(matricula);
  } catch (error) {
    next(error);
  }
}

/**
 * Retira a un estudiante de una asignatura específica.
 */
export function retirar(req: Request, res: Response, next: NextFunction): void {
  try {
    const { codigo, codigoCurso } = req.params;
    matriculaServicio.retirarAlumno(codigo, codigoCurso);
    res.json({ mensaje: 'Alumno retirado del curso exitosamente.' });
  } catch (error) {
    next(error);
  }
}

/**
 * Registra o actualiza la calificación de una práctica (1 a 4).
 */
export function registrarNota(req: Request, res: Response, next: NextFunction): void {
  try {
    const { codigo, codigoCurso, practica } = req.params;
    const numeroPractica = parseInt(practica, 10);

    const { nota } = esquemaNota.parse(req.body);

    const resultado = matriculaServicio.registrarNota(codigo, codigoCurso, numeroPractica, nota);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}
