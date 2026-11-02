/**
 * Archivo de configuración con las constantes de negocio y valores por defecto del sistema.
 * Centraliza los límites numéricos de calificaciones, edades, validaciones y configuración del servidor.
 */

import dotenv from 'dotenv';
dotenv.config();

/** Puerto en el que se ejecuta la aplicación Express */
export const PUERTO = Number(process.env.PORT) || 4000;

/** Clave secreta para firmar tokens JWT */
export const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_super_segura_unfv_2026';

/** Tiempo de caducidad de los tokens de autenticación */
export const JWT_EXPIRA_EN = process.env.JWT_EXPIRA_EN || '8h';

/** Origen permitido para solicitudes CORS desde el frontend */
export const CLIENTE_URL = process.env.CLIENTE_URL || 'http://localhost:5173';

/** Calificación mínima permitida para una práctica */
export const NOTA_MINIMA = 0;

/** Calificación máxima permitida para una práctica */
export const NOTA_MAXIMA = 20;

/** Calificación mínima requerida para aprobar una asignatura */
export const NOTA_APROBATORIA = 11;

/** Total de prácticas calificadas fijadas por cada curso */
export const TOTAL_PRACTICAS = 4;

/** Edad mínima aceptada para la matrícula de un alumno */
export const EDAD_MINIMA = 15;

/** Edad máxima aceptada para la matrícula de un alumno */
export const EDAD_MAXIMA = 89;

/** Longitud máxima en caracteres permitida para nombres y apellidos */
export const LONGITUD_MAX_NOMBRE = 60;
