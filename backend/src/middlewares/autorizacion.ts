/**
 * Middleware para el control de acceso basado en roles (RBAC).
 * Garantiza que solo los usuarios con el rol adecuado puedan acceder a recursos protegidos.
 */

import { Request, Response, NextFunction } from 'express';
import { Rol } from '../models/usuario';

/**
 * Genera un middleware que restringe el acceso exclusivamente al rol indicado.
 * 
 * ¿Por qué verificar el rol en el servidor y no solo ocultando botones en el frontend?
 * Ocultar elementos visuales en el cliente (como botones de "Eliminar" o "Editar") solo
 * mejora la experiencia de usuario (UX), pero NO brinda seguridad. Cualquier usuario malintencionado
 * o curioso puede inspeccionar el navegador, alterar el estado en JavaScript o enviar
 * peticiones HTTP directas utilizando herramientas como curl o Postman.
 * La única frontera real y confiable de seguridad reside en el servidor, verificando
 * estrictamente el token firmado antes de ejecutar la lógica de negocio.
 *
 * @param rolPermitido Rol requerido para continuar ('SECRETARIO' o 'ALUMNO')
 * @returns Función middleware de Express
 */
export function soloRol(rolPermitido: Rol) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Si no pasó por el middleware de autenticación o no tiene usuario inyectado
    if (!req.usuario) {
      res.status(401).json({ mensaje: 'No autenticado. Debe iniciar sesión primero.' });
      return;
    }

    // Comprueba si el rol del token coincide exactamente con el rol permitido
    if (req.usuario.rol !== rolPermitido) {
      res.status(403).json({
        mensaje: `Acceso denegado: se requiere rol de ${rolPermitido} para realizar esta acción.`
      });
      return;
    }

    next();
  };
}
