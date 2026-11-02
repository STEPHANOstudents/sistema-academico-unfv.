/**
 * Rutas para la gestión de alumnos y sus matrículas.
 * Todas las operaciones en este enrutador requieren rol administrativo de SECRETARIO.
 */

import { Router } from 'express';
import * as alumnoControlador from '../controllers/alumnoControlador';
import * as matriculaControlador from '../controllers/matriculaControlador';
import { autenticarToken } from '../middlewares/autenticacion';
import { soloRol } from '../middlewares/autorizacion';

const enrutador = Router();

// Todas las rutas en este archivo requieren autenticación y rol SECRETARIO
enrutador.use(autenticarToken, soloRol('SECRETARIO'));

// Lista de alumnos con búsqueda y ordenamiento
enrutador.get('/', alumnoControlador.listar);

// Creación de un alumno
enrutador.post('/', alumnoControlador.crear);

// Alumnos con mayor y menor promedio (debe declararse antes de /:codigo para evitar colisión de ruta)
enrutador.get('/extremos', alumnoControlador.extremos);

// Detalle individual de alumno
enrutador.get('/:codigo', alumnoControlador.obtenerPorCodigo);

// Edición de información del alumno
enrutador.put('/:codigo', alumnoControlador.editar);

// Eliminación de alumno y matrículas
enrutador.delete('/:codigo', alumnoControlador.eliminar);

// Matricular a un alumno en un curso
enrutador.post('/:codigo/matriculas', matriculaControlador.matricular);

// Retirar a un alumno de un curso
enrutador.delete('/:codigo/matriculas/:codigoCurso', matriculaControlador.retirar);

// Registrar o modificar la nota de una práctica específica (1 a 4)
enrutador.put('/:codigo/matriculas/:codigoCurso/notas/:practica', matriculaControlador.registrarNota);

export default enrutador;
