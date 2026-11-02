/**
 * Middleware para la validación del JSON Web Token (JWT) en peticiones entrantes.
 * Extrae el encabezado Authorization, verifica la firma criptográfica e inyecta la sesión en req.usuario.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constantes';
import { PayloadToken } from '../models/usuario';

// Extensión de la interfaz Request de Express para contener los datos decodificados del token
declare global {
  namespace Express {
    interface Request {
      usuario?: PayloadToken;
    }
  }
}

/**
 * Middleware de autenticación obligatoria.
 * Verifica la presencia del token JWT con esquema 'Bearer' en la cabecera 'Authorization'.
 * Si el token es ausente, expirado o adulterado, interrumpe el flujo respondiendo HTTP 401.
 *
 * @param req Objeto de petición Express
 * @param res Objeto de respuesta Express
 * @param next Función para continuar al siguiente middleware
 */
export function autenticarToken(req: Request, res: Response, next: NextFunction): void {
  const encabezadoAutorizacion = req.headers.authorization;

  if (!encabezadoAutorizacion) {
    res.status(401).json({ mensaje: 'No se proporcionó el token de autenticación.' });
    return;
  }

  // Comprueba que siga el formato estándar "Bearer <token>"
  const partes = encabezadoAutorizacion.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    res.status(401).json({ mensaje: 'Formato de token inválido. Debe ser: Bearer <token>' });
    return;
  }

  const token = partes[1];

  try {
    const decodificado = jwt.verify(token, JWT_SECRET) as PayloadToken;
    req.usuario = decodificado;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido o expirado. Inicie sesión nuevamente.' });
    return;
  }
}
