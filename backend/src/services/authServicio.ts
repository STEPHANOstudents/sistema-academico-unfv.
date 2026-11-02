/**
 * Servicio de autenticación para secretarios y alumnos.
 * Gestiona el inicio de sesión, verificación criptográfica y expedición de tokens JWT.
 */

import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { JWT_EXPIRA_EN, JWT_SECRET } from '../config/constantes';
import { secretariosDB, alumnosDB } from '../data/baseDatosMemoria';
import { ErrorApp } from '../middlewares/manejoErrores';
import { PayloadToken, Rol } from '../models/usuario';
import { esCodigoValido } from '../utils/codigoAlumno';

/** Opciones de firma para el token JWT con casteo de tiempo válido */
const opcionesToken: SignOptions = {
  expiresIn: JWT_EXPIRA_EN as SignOptions['expiresIn']
};

/** Resultado devuelto tras un inicio de sesión exitoso */
export interface RespuestaLogin {
  token: string;
  rol: Rol;
  nombre: string;
}

/**
 * Autentica a un secretario mediante sus credenciales de usuario y clave.
 *
 * @param usuario Nombre de usuario administrativo (ej. "100")
 * @param clave Clave en texto plano para cotejo con el hash bcrypt
 * @returns Token JWT, rol y nombre de la persona
 */
export function loginSecretario(usuario: string, clave: string): RespuestaLogin {
  const secretario = secretariosDB.find((s) => s.usuario === usuario);
  if (!secretario) {
    throw new ErrorApp(401, 'Credenciales incorrectas. Verifique usuario y clave.');
  }

  const coincideClave = bcrypt.compareSync(clave, secretario.claveHash);
  if (!coincideClave) {
    throw new ErrorApp(401, 'Credenciales incorrectas. Verifique usuario y clave.');
  }

  const payload: PayloadToken = {
    id: secretario.usuario,
    rol: 'SECRETARIO',
    nombre: secretario.nombre
  };

  const token = jwt.sign(payload, JWT_SECRET, opcionesToken);

  return {
    token,
    rol: 'SECRETARIO',
    nombre: secretario.nombre
  };
}

/**
 * Autentica a un alumno utilizando únicamente su código oficial de 9 caracteres.
 * Comprueba primero la validez formal y matemática del código para detectar errores
 * de tipeo de inmediato, y luego confirma su existencia en la base de datos.
 *
 * @param codigo Código completo del alumno (ej. "20184321C")
 * @returns Token JWT, rol y nombre completo del alumno
 */
export function loginAlumno(codigo: string): RespuestaLogin {
  const codigoLimpio = (codigo || '').trim().toUpperCase();

  // Validación matemática y estructural de la letra verificadora
  if (!esCodigoValido(codigoLimpio)) {
    throw new ErrorApp(401, 'El código ingresado no tiene un formato válido o la letra verificadora es incorrecta.');
  }

  // Búsqueda en los registros de alumnos
  const alumno = alumnosDB.find((a) => a.codigo === codigoLimpio);
  if (!alumno) {
    throw new ErrorApp(401, 'No existe ningún alumno registrado con el código ingresado.');
  }

  const nombreCompleto = `${alumno.nombres} ${alumno.apellidos}`;
  const payload: PayloadToken = {
    id: alumno.codigo,
    rol: 'ALUMNO',
    nombre: nombreCompleto
  };

  const token = jwt.sign(payload, JWT_SECRET, opcionesToken);

  return {
    token,
    rol: 'ALUMNO',
    nombre: nombreCompleto
  };
}

/**
 * Reconstituye la información de la sesión actual a partir del payload verificado del token.
 *
 * @param usuario Payload decodificado inyectado por el middleware de autenticación
 * @returns Objeto con los datos de sesión básica
 */
export function obtenerSesionActual(usuario: PayloadToken): { id: string; rol: Rol; nombre: string } {
  return {
    id: usuario.id,
    rol: usuario.rol,
    nombre: usuario.nombre
  };
}
