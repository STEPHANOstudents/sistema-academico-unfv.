/**
 * Cliente HTTP base para realizar peticiones hacia la API del backend (/api).
 * Inyecta automáticamente los tokens Bearer de sessionStorage y centraliza el manejo de errores.
 */

const CLAVE_STORAGE_TOKEN = 'unfv_token_acceso';

/**
 * Función genérica para invocar endpoints de la API.
 * 
 * ¿Por qué se limpia la sesión y se redirige en caso de error 401?
 * Una respuesta HTTP 401 indica inequívocamente que el token JWT ha caducado, fue revocado
 * o carece de validez criptográfica. Mantener la sesión viva en el cliente provocaría
 * fallos recurrentes y estados inconsistentes. Por ello, se purga sessionStorage y se
 * fuerza el regreso a /login para que el usuario se reautentique de manera limpia.
 *
 * @param ruta Ruta relativa del endpoint (ej. '/alumnos')
 * @param opciones Opciones estándar de la función fetch
 * @returns Promesa con los datos tipados de la respuesta
 */
export async function llamarApi<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const token = sessionStorage.getItem(CLAVE_STORAGE_TOKEN);

  const cabeceras: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((opciones.headers as Record<string, string>) || {})
  };

  if (token) {
    cabeceras['Authorization'] = `Bearer ${token}`;
  }

  // Asegurar que la ruta comience con /api si no lo tiene ya
  const urlFinal = ruta.startsWith('/api') ? ruta : `/api${ruta.startsWith('/') ? '' : '/'}${ruta}`;

  const respuesta = await fetch(urlFinal, {
    ...opciones,
    headers: cabeceras
  });

  // Manejo de expiración o token inválido (401)
  if (respuesta.status === 401) {
    // Si la llamada no es a una ruta de autenticación de login
    if (!ruta.includes('/auth/secretario/login') && !ruta.includes('/auth/alumno/login')) {
      sessionStorage.removeItem(CLAVE_STORAGE_TOKEN);
      sessionStorage.removeItem('unfv_sesion_usuario');
      // Redirigir al login si nos encontramos en el navegador
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }

  // Parsear el cuerpo de la respuesta
  let datos: unknown;
  try {
    datos = await respuesta.json();
  } catch (_e) {
    datos = null;
  }

  if (!respuesta.ok) {
    // Si el servidor devolvió el formato estándar { mensaje: "..." }
    if (datos && typeof datos === 'object' && 'mensaje' in datos) {
      throw new Error((datos as { mensaje: string }).mensaje);
    }
    throw new Error(`Error en la solicitud: código HTTP ${respuesta.status}`);
  }

  return datos as T;
}
