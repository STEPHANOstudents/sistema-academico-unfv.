/**
 * Enrutador principal de la API (/api).
 * Agrupa todos los módulos funcionales del sistema y expone el endpoint público de salud.
 */

import { Router } from 'express';
import authRutas from './authRutas';
import alumnoRutas from './alumnoRutas';
import cursoRutas from './cursoRutas';
import miPerfilRutas from './miPerfilRutas';

const enrutadorPrincipal = Router();

// Endpoint público para verificar el estado operativo del servicio
enrutadorPrincipal.get('/salud', (_req, res) => {
  res.json({ estado: 'ok' });
});

// Enrutadores modulares
enrutadorPrincipal.use('/auth', authRutas);
enrutadorPrincipal.use('/alumnos', alumnoRutas);
enrutadorPrincipal.use('/cursos', cursoRutas);
enrutadorPrincipal.use('/mi-perfil', miPerfilRutas);

export default enrutadorPrincipal;
