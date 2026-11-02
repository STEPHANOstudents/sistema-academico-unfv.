/**
 * Tabla institucional reutilizable con soporte para ordenamiento por columnas y estado vacío.
 */

import { ReactNode } from 'react';
import './TablaDatos.css';

export interface ColumnaTabla<T> {
  clave: string;
  encabezado: string;
  ordenable?: boolean;
  alineacion?: 'izquierda' | 'centro' | 'derecha';
  render?: (fila: T, indice: number) => ReactNode;
}

interface TablaDatosProps<T> {
  columnas: ColumnaTabla<T>[];
  filas: T[];
  claveFila: (fila: T) => string;
  columnaOrden?: string;
  sentidoOrden?: 'asc' | 'desc';
  alOrdenar?: (clave: string) => void;
  mensajeVacio?: string;
  className?: string;
}

export function TablaDatos<T>({
  columnas,
  filas,
  claveFila,
  columnaOrden,
  sentidoOrden = 'asc',
  alOrdenar,
  mensajeVacio = 'No hay registros disponibles.',
  className = ''
}: TablaDatosProps<T>) {
  return (
    <div className={`tabla-datos-contenedor ${className}`}>
      <table className="tabla-datos-elemento">
        <thead>
          <tr>
            {columnas.map((col) => {
              const esActiva = columnaOrden === col.clave;
              const puedeOrdenar = col.ordenable && alOrdenar;

              return (
                <th
                  key={col.clave}
                  className={`tabla-th tabla-alineacion-${col.alineacion || 'izquierda'} ${
                    puedeOrdenar ? 'tabla-th-ordenable' : ''
                  }`}
                  onClick={() => puedeOrdenar && alOrdenar(col.clave)}
                >
                  <div className="tabla-th-contenido">
                    <span>{col.encabezado}</span>
                    {puedeOrdenar && (
                      <span className="tabla-icono-orden" aria-hidden="true">
                        {esActiva ? (sentidoOrden === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {filas.length === 0 ? (
            <tr>
              <td colSpan={columnas.length} className="tabla-celda-vacia">
                {mensajeVacio}
              </td>
            </tr>
          ) : (
            filas.map((fila, index) => (
              <tr key={claveFila(fila)} className="tabla-fila">
                {columnas.map((col) => (
                  <td
                    key={col.clave}
                    className={`tabla-td tabla-alineacion-${col.alineacion || 'izquierda'}`}
                  >
                    {col.render
                      ? col.render(fila, index)
                      : String((fila as Record<string, unknown>)[col.clave] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TablaDatos;
