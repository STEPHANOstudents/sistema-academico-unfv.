/**
 * Hook para retrasar la actualización de un valor hasta que transcurra un tiempo sin cambios.
 * Especialmente útil para optimizar peticiones de búsqueda mientras el usuario escribe en el teclado.
 */

import { useState, useEffect } from 'react';

/**
 * Retorna un valor demorado que solo se actualiza tras pasar el período de espera.
 *
 * @param valor Valor actual reactivo
 * @param retrasoMs Milisegundos de espera (por defecto 300 ms)
 * @returns Valor retrasado
 */
export function useDebounce<T>(valor: T, retrasoMs: number = 300): T {
  const [valorDebounced, setValorDebounced] = useState<T>(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      setValorDebounced(valor);
    }, retrasoMs);

    return () => {
      clearTimeout(temporizador);
    };
  }, [valor, retrasoMs]);

  return valorDebounced;
}

export default useDebounce;
