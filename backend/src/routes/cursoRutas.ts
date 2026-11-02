/**
 * Rutas para el catálogo de asignaturas y la consulta de notas por curso.
 * Protegido para uso exclusivo de SECRETARIO.
 */

import { Router } from 'express';
import * as cursoControlador from '../controllers/cursoControlador';
import { autenticarToken } from '../middlewares/autenticacion';
import { soloRol } from '../middlewares/autorizacion';

const enrutador = Router();

// Todas las rutas en este archivo requieren autenticación y rol SECRETARIO
enrutador.use(autenticarToken, soloRol('SECRETARIO'));

// Catálogo de cursos con cantidad de alumnos matriculados
enrutador.get('/', cursoControlador.listar);

// Creación de una nueva materia
enrutador.post('/', cursoControlador.crear);

// Lista de alumnos matriculados en un curso específico con sus calificaciones
enrutador.get('/:codigo/matriculas', cursoControlador.matriculasDeCurso);

export default enrutador;
