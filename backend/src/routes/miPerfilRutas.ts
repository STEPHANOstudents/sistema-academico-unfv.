/**
 * Rutas para la consulta del expediente del alumno autenticado.
 * Protegido para acceso exclusivo con rol ALUMNO.
 */

import { Router } from 'express';
import * as miPerfilControlador from '../controllers/miPerfilControlador';
import { autenticarToken } from '../middlewares/autenticacion';
import { soloRol } from '../middlewares/autorizacion';

const enrutador = Router();

// Consulta del perfil y calificaciones del estudiante conectado
enrutador.get('/', autenticarToken, soloRol('ALUMNO'), miPerfilControlador.verMiPerfil);

export default enrutador;
