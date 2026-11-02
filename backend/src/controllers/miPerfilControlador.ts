/**
 * Controlador para la vista privada del estudiante (Mi Perfil / Mis Notas).
 * Garantiza que el código del alumno provenga siempre del token criptográfico y no de la URL.
 */

import { Request, Response, NextFunction } from 'express';
import * as alumnoServicio from '../services/alumnoServicio';

/**
 * Retorna la información personal, asignaturas matriculadas, calificaciones y promedios del estudiante autenticado.
 *
 * Principio de seguridad inmutable:
 * El código del alumno se extrae directamente de req.usuario.id (inyectado desde el JWT verificado).
 * Jamás se acepta un parámetro de consulta ni de ruta para evitar que un alumno consulte datos ajenos.
 */
export function verMiPerfil(req: Request, res: Response, next: NextFunction): void {
  try {
    if (!req.usuario) {
      res.status(401).json({ mensaje: 'No hay una sesión activa.' });
      return;
    }

    const codigoAlumno = req.usuario.id;
    const detalleAlumno = alumnoServicio.obtenerDetalleAlumno(codigoAlumno);

    res.json(detalleAlumno);
  } catch (error) {
    next(error);
  }
}
