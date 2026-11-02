/**
 * Rutas de autenticación del sistema.
 * Define los puntos de entrada para login de personal administrativo, alumnos y verificación de sesión.
 */

import { Router } from 'express';
import * as authControlador from '../controllers/authControlador';
import { autenticarToken } from '../middlewares/autenticacion';

const enrutador = Router();

// Login para secretario (usuario + clave)
enrutador.post('/secretario/login', authControlador.loginSecretario);

// Login para alumno (únicamente código validado)
enrutador.post('/alumno/login', authControlador.loginAlumno);

// Verificación de la sesión actual (requiere token válido)
enrutador.get('/yo', autenticarToken, authControlador.obtenerYo);

export default enrutador;
