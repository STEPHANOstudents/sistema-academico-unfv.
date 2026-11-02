/**
 * Configuración y ensamblaje de la aplicación Express.
 * Define middlewares globales, CORS, análisis de JSON, rutas base y manejador global de errores.
 */

import express from 'express';
import cors from 'cors';
import enrutadorPrincipal from './routes';
import { manejarErrores } from './middlewares/manejoErrores';
import { cargarDatosPrueba } from './data/datosPrueba';
import { secretariosDB } from './data/baseDatosMemoria';

/**
 * Crea y configura una instancia de la aplicación Express lista para funcionar.
 */
export function crearApp(): express.Application {
  // Asegurar carga de datos de prueba si aún no existen
  if (secretariosDB.length === 0) {
    cargarDatosPrueba();
  }

  const app = express();

  // Habilitar CORS para permitir peticiones desde cualquier origen (local y despliegues en Vercel)
  app.use(
    cors({
      origin: true,
      credentials: true
    })
  );

  // Análisis del cuerpo de solicitudes JSON
  app.use(express.json());

  // Rutas de la API bajo el prefijo /api
  app.use('/api', enrutadorPrincipal);

  // Manejo de rutas inexistentes (404)
  app.use((_req, res) => {
    res.status(404).json({ mensaje: 'El recurso solicitado no fue encontrado.' });
  });

  // Manejador centralizado de errores
  app.use(manejarErrores);

  return app;
}

export default crearApp();
