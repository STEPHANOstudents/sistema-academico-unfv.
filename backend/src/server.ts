/**
 * Punto de entrada principal del servidor backend.
 * Carga los datos iniciales de prueba en memoria e inicializa la escucha de peticiones HTTP.
 */

import app from './app';
import { PUERTO } from './config/constantes';
import { cargarDatosPrueba } from './data/datosPrueba';

// 1. Cargar datos de prueba iniciales en memoria
cargarDatosPrueba();

// 2. Iniciar el servidor Express
app.listen(PUERTO, () => {
  console.log(`🚀 Servidor backend escuchando en http://localhost:${PUERTO}`);
  console.log(`📌 Ruta de comprobación de salud: http://localhost:${PUERTO}/api/salud\n`);
});
