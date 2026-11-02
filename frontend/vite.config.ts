/**
 * Configuración de Vite para el entorno de desarrollo y compilación del frontend.
 * Establece el plugin de React y el proxy reverso para redirigir /api hacia el servidor backend en http://localhost:4000.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
