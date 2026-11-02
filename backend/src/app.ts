/**
 * Configuración y ensamblaje de la aplicación Express.
 * Define middlewares globales, CORS, análisis de JSON, rutas base y manejador global de errores.
 */

import express from 'express';
import cors from 'cors';
import { CLIENTE_URL } from './config/constantes';
import enrutadorPrincipal from './routes';
import { manejarErrores } from './middlewares/manejoErrores';

/**
 * Crea y configura una instancia de la aplicación Express lista para funcionar.
 */
export function crearApp(): express.Application {
  const app = express();

  // Habilitar CORS para permitir peticiones desde el frontend Vite
  app.use(
    cors({
      origin: [CLIENTE_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
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
