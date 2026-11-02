/**
 * Define los tipos y contratos para usuarios autenticables y roles del sistema.
 * Soporta credenciales para secretarios y la estructura del token JWT.
 */

/** Roles de acceso admitidos en el sistema */
export type Rol = 'SECRETARIO' | 'ALUMNO';

/** Representa a un usuario administrativo con acceso completo de gestión */
export interface Secretario {
  usuario: string;
  claveHash: string;
  nombre: string;
}

/** Estructura decodificada almacenada dentro del token JWT */
export interface PayloadToken {
  id: string; // Puede ser el nombre de usuario o el código del alumno
  rol: Rol;
  nombre: string;
  iat?: number;
  exp?: number;
}
