/**
 * Métodos de llamada a la API para los procesos de autenticación y consulta de sesión.
 */

import { llamarApi } from './cliente';
import { RespuestaLogin, UsuarioSesion } from '../types/modelos';

/**
 * Autentica al personal administrativo de secretaría con usuario y clave.
 *
 * @param usuario Nombre de usuario (ej. '100')
 * @param clave Clave en texto plano
 * @returns Respuesta con token, rol y nombre
 */
export async function loginSecretario(usuario: string, clave: string): Promise<RespuestaLogin> {
  return llamarApi<RespuestaLogin>('/auth/secretario/login', {
    method: 'POST',
    body: JSON.stringify({ usuario, clave })
  });
}

/**
 * Autentica a un estudiante utilizando su código oficial de 9 caracteres.
 *
 * @param codigo Código del alumno (ej. '20184321C')
 * @returns Respuesta con token, rol y nombre completo
 */
export async function loginAlumno(codigo: string): Promise<RespuestaLogin> {
  return llamarApi<RespuestaLogin>('/auth/alumno/login', {
    method: 'POST',
    body: JSON.stringify({ codigo })
  });
}

/**
 * Obtiene la sesión actual a partir del token JWT almacenado.
 *
 * @returns Datos del usuario en sesión
 */
export async function obtenerSesion(): Promise<UsuarioSesion> {
  return llamarApi<UsuarioSesion>('/auth/yo');
}
