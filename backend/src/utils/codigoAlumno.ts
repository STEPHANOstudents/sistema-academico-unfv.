/**
 * Utilidades para la generación y validación matemática de códigos de alumnos.
 * Implementa el algoritmo de dígito/letra verificadora ponderada con base en módulo 11.
 */

const LETRAS_VERIFICADORAS = 'ABCDEFGHIJK';
const PESOS = [7, 6, 5, 4, 3, 2];

/**
 * Calcula la letra verificadora para un número base de 8 dígitos.
 * 
 * Paso a paso:
 * 1. Invierte la cadena del número base de derecha a izquierda.
 * 2. Toma los primeros 6 dígitos de la cadena invertida.
 * 3. Multiplica cada uno de los 6 dígitos por los factores de ponderación [7, 6, 5, 4, 3, 2].
 * 4. Suma los productos obtenidos.
 * 5. Obtiene el residuo al dividir entre 11 (suma % 11).
 * 6. Mapea el residuo a la letra correspondiente en "ABCDEFGHIJK" (0 -> A, ..., 10 -> K).
 *
 * @param numeroBase Cadena de 8 caracteres numéricos
 * @returns Letra mayúscula de verificación ('A' a 'K')
 */
export function calcularLetraVerificadora(numeroBase: string): string {
  // 1. Invertir la cadena de texto
  const invertido = numeroBase.split('').reverse().join('');

  // 2. Extraer los primeros 6 caracteres
  const primerosSeis = invertido.slice(0, 6);

  // 3 y 4. Multiplicar por los pesos correspondientes y acumular la suma
  let suma = 0;
  for (let i = 0; i < PESOS.length; i++) {
    const digito = parseInt(primerosSeis[i], 10);
    suma += digito * PESOS[i];
  }

  // 5 y 6. Obtener índice por módulo 11 y extraer la letra correspondiente
  const indice = suma % 11;
  return LETRAS_VERIFICADORAS[indice];
}

/**
 * Genera un código de alumno nuevo y aleatorio garantizando unicidad.
 * Sortea un número entre 20180000 y 20189999, calcula su letra verificadora
 * y comprueba que no colisione con códigos ya existentes.
 *
 * @param codigosExistentes Conjunto o arreglo de códigos ya registrados en memoria
 * @returns Código único de 9 caracteres (8 dígitos + 1 letra)
 */
export function generarCodigo(codigosExistentes: Set<string> | string[]): string {
  const existentes = codigosExistentes instanceof Set
    ? codigosExistentes
    : new Set(codigosExistentes);

  let intentos = 0;
  const MAX_INTENTOS = 10000;

  while (intentos < MAX_INTENTOS) {
    intentos++;
    // 1. Sorteo de un número entero en el rango [20180000, 20189999]
    const numeroAleatorio = Math.floor(Math.random() * (20189999 - 20180000 + 1)) + 20180000;
    const numeroCadena = numeroAleatorio.toString();

    // 2. Cálculo de la letra verificadora según el algoritmo
    const letra = calcularLetraVerificadora(numeroCadena);
    const codigoGenerado = `${numeroCadena}${letra}`;

    // 3. Verificar que no exista colisión
    if (!existentes.has(codigoGenerado)) {
      return codigoGenerado;
    }
  }

  throw new Error('No se pudo generar un código único luego de múltiples intentos.');
}

/**
 * Valida la estructura formal y la coherencia matemática de un código de alumno.
 * Verifica que contenga exactamente 8 dígitos seguidos de una letra mayúscula válida,
 * y que dicha letra coincida con la letra calculada por el algoritmo ponderado.
 *
 * @param codigo Código de alumno a comprobar (ej. "20184321C")
 * @returns true si el formato y la letra son válidos; false en caso contrario
 */
export function esCodigoValido(codigo: string): boolean {
  if (!codigo || typeof codigo !== 'string') {
    return false;
  }

  const codigoLimpio = codigo.trim().toUpperCase();

  // Debe tener exactamente 9 caracteres: 8 dígitos + 1 letra mayúscula
  if (!/^\d{8}[A-Z]$/.test(codigoLimpio)) {
    return false;
  }

  const numeroBase = codigoLimpio.substring(0, 8);
  const letraIngresada = codigoLimpio.charAt(8);

  // Calcula la letra que matemáticamente debería tener
  const letraEsperada = calcularLetraVerificadora(numeroBase);

  return letraIngresada === letraEsperada;
}
