/**
 * Reglas y constantes institucionales relativas a notas y calificaciones.
 */

/** Calificación aprobatoria mínima oficial según el reglamento académico */
export const NOTA_APROBATORIA = 11;

/** Calificación mínima absoluta */
export const NOTA_MINIMA = 0;

/** Calificación máxima absoluta */
export const NOTA_MAXIMA = 20;

/**
 * Determina si una calificación cumple la condición de aprobada.
 *
 * @param nota Valor numérico de la calificación
 * @returns true si la nota es mayor o igual a 11
 */
export function esAprobado(nota: number | null): boolean {
  return nota !== null && nota >= NOTA_APROBATORIA;
}

/**
 * Retorna la clase CSS correspondiente a la nota para coloreado semántico.
 *
 * @param nota Calificación numérica o null
 * @returns Nombre de la clase CSS
 */
export function obtenerClaseNota(nota: number | null): string {
  if (nota === null) return 'nota-pendiente';
  return nota >= NOTA_APROBATORIA ? 'nota-aprobada' : 'nota-desaprobada';
}
