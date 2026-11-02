/**
 * Controlador para las rutas de autenticación y consulta de sesión.
 * Gestiona el acceso de secretarios y alumnos, validando las cargas útiles con Zod.
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authServicio from '../services/authServicio';

const esquemaLoginSecretario = z.object({
  usuario: z.string().min(1, 'El usuario es obligatorio.'),
  clave: z.string().min(1, 'La clave es obligatoria.')
});

const esquemaLoginAlumno = z.object({
  codigo: z.string().min(1, 'El código de alumno es obligatorio.')
});

/**
 * Procesa el inicio de sesión para el personal de Secretaría.
 */
export function loginSecretario(req: Request, res: Response, next: NextFunction): void {
  try {
    const { usuario, clave } = esquemaLoginSecretario.parse(req.body);
    const resultado = authServicio.loginSecretario(usuario, clave);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}

/**
 * Procesa el inicio de sesión para los Alumnos mediante su código institucional.
 */
export function loginAlumno(req: Request, res: Response, next: NextFunction): void {
  try {
    const { codigo } = esquemaLoginAlumno.parse(req.body);
    const resultado = authServicio.loginAlumno(codigo);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}

/**
 * Devuelve la identidad y el rol del usuario actualmente autenticado a partir del token.
 */
export function obtenerYo(req: Request, res: Response, next: NextFunction): void {
  try {
    if (!req.usuario) {
      res.status(401).json({ mensaje: 'No hay una sesión activa.' });
      return;
    }
    const sesion = authServicio.obtenerSesionActual(req.usuario);
    res.json(sesion);
  } catch (error) {
    next(error);
  }
}
