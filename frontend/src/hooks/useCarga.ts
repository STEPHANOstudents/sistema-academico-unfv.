/**
 * Hook personalizado para gestionar llamadas asíncronas de carga de datos.
 * Provee estados reactivos de datos, cargando, error y mecanismo de recarga.
 */

import { useState, useEffect, useCallback } from 'react';

export interface ResultadoCarga<T> {
  datos: T | null;
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
  setDatos: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Ejecuta una operación asíncrona de consulta y administra sus estados.
 *
 * @param funcionAsincrona Función que retorna una promesa con los datos
 * @param dependencias Lista de dependencias para volver a invocar la función
 * @returns Objeto con datos, estado de carga, error y función de recarga
 */
export function useCarga<T>(
  funcionAsincrona: () => Promise<T>,
  dependencias: readonly unknown[] = []
): ResultadoCarga<T> {
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const ejecutar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await funcionAsincrona();
      setDatos(respuesta);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado al cargar los datos.');
      }
    } finally {
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias);

  useEffect(() => {
    ejecutar();
  }, [ejecutar]);

  return {
    datos,
    cargando,
    error,
    recargar: ejecutar,
    setDatos
  };
}

export default useCarga;
