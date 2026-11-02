/**
 * Manejador centralizado de errores para la aplicación Express.
 * Asegura que todas las respuestas de error sigan el formato estándar { "mensaje": "..." }.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Clase de error personalizada que asocia un código de estado HTTP con un mensaje descriptivo.
 */
export class ErrorApp extends Error {
  public readonly codigoEstado: number;

  constructor(codigoEstado: number, mensaje: string) {
    super(mensaje);
    this.codigoEstado = codigoEstado;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Middleware para capturar y formatear errores producidos en la cadena de ejecución.
 *
 * @param err Objeto de error capturado
 * @param _req Petición Express
 * @param res Respuesta Express
 * @param _next Función siguiente
 */
export function manejarErrores(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Errores de validación de esquemas Zod
  if (err instanceof ZodError) {
    const primerDetalle = err.errors[0]?.message || 'Datos de solicitud inválidos.';
    res.status(400).json({ mensaje: primerDetalle });
    return;
  }

  // Errores operacionales controlados de la aplicación
  if (err instanceof ErrorApp) {
    res.status(err.codigoEstado).json({ mensaje: err.message });
    return;
  }

  // Errores de análisis de JSON en el cuerpo de la petición (Express body-parser)
  if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400) {
    res.status(400).json({ mensaje: 'Cuerpo de la petición JSON mal formado.' });
    return;
  }

  // Errores inesperados o no controlados (registro en consola para depuración interna)
  console.error('Error no controlado en la aplicación:', err);
  res.status(500).json({ mensaje: 'Ocurrió un error inesperado en el servidor.' });
}
