/**
 * Utilidades de formateo visual para cadenas de texto, promedios y datos personales.
 */

/**
 * Formatea un promedio con 2 cifras decimales estrictas o un guion largo si es nulo.
 *
 * @param promedio Valor numérico del promedio o null si está pendiente
 * @returns Cadena con formato "14.50" o "—"
 */
export function formatearPromedio(promedio: number | null): string {
  if (promedio === null || typeof promedio !== 'number' || isNaN(promedio)) {
    return '—';
  }
  return promedio.toFixed(2);
}

/**
 * Formatea el nombre completo con estructura académica institucional: "Apellidos, Nombres".
 *
 * @param apellidos Apellidos del estudiante
 * @param nombres Nombres del estudiante
 * @returns Cadena formal unificada
 */
export function formatearNombreCompleto(apellidos: string, nombres: string): string {
  const ape = (apellidos || '').trim();
  const nom = (nombres || '').trim();
  if (!ape && !nom) return 'Sin nombre';
  if (!ape) return nom;
  if (!nom) return ape;
  return `${ape}, ${nom}`;
}
