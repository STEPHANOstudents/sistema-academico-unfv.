/**
 * Casillas editables para las 4 prácticas de un curso.
 * Guarda automáticamente cada práctica al perder foco (blur) o presionar Enter,
 * restaurando el valor anterior en caso de error y emitiendo el nuevo promedio y estado.
 */

import React, { useState, useEffect } from 'react';
import { EstadoCurso, Notas } from '../../types/modelos';
import { registrarNota } from '../../api/alumnosApi';
import { NOTA_APROBATORIA } from '../../utils/notas';
import './FilaNotasEditable.css';

interface FilaNotasEditableProps {
  codigoAlumno: string;
  codigoCurso: string;
  notasIniciales: Notas;
  alActualizar?: (notas: Notas, promedio: number | null, estado: EstadoCurso) => void;
  alNotificarExito?: (mensaje: string) => void;
  alNotificarError?: (error: string) => void;
  resaltarPractica?: number | null; // 1 a 4 para marcar pendientes
  indiceFila?: number;
}

export const FilaNotasEditable: React.FC<FilaNotasEditableProps> = ({
  codigoAlumno,
  codigoCurso,
  notasIniciales,
  alActualizar,
  alNotificarExito,
  alNotificarError,
  resaltarPractica = null,
  indiceFila = 0
}) => {
  // Valores en texto para cada una de las 4 casillas (vacío = null)
  const [valoresTexto, setValoresTexto] = useState<[string, string, string, string]>(() => [
    notasIniciales[0] !== null ? String(notasIniciales[0]) : '',
    notasIniciales[1] !== null ? String(notasIniciales[1]) : '',
    notasIniciales[2] !== null ? String(notasIniciales[2]) : '',
    notasIniciales[3] !== null ? String(notasIniciales[3]) : ''
  ]);

  const [guardandoIndice, setGuardandoIndice] = useState<number | null>(null);

  // Sincronizar si las notas externas cambian
  useEffect(() => {
    setValoresTexto([
      notasIniciales[0] !== null ? String(notasIniciales[0]) : '',
      notasIniciales[1] !== null ? String(notasIniciales[1]) : '',
      notasIniciales[2] !== null ? String(notasIniciales[2]) : '',
      notasIniciales[3] !== null ? String(notasIniciales[3]) : ''
    ]);
  }, [notasIniciales]);

  /**
   * Guarda una práctica individual al salir del campo o pulsar Enter.
   */
  const guardarPractica = async (numeroPractica: number) => {
    const indice = numeroPractica - 1;
    const textoIngresado = valoresTexto[indice].trim();

    // Determinar la nota numérica o null
    let notaEnviar: number | null = null;
    if (textoIngresado !== '') {
      const parsed = parseInt(textoIngresado, 10);
      if (isNaN(parsed) || parsed < 0 || parsed > 20) {
        if (alNotificarError) {
          alNotificarError('La nota debe ser un número entero entre 0 y 20.');
        }
        // Restaurar valor previo
        const valorPrevio = notasIniciales[indice] !== null ? String(notasIniciales[indice]) : '';
        setValoresTexto((prev) => {
          const copia = [...prev] as [string, string, string, string];
          copia[indice] = valorPrevio;
          return copia;
        });
        return;
      }
      notaEnviar = parsed;
    }

    // Si el valor no ha cambiado con respecto al original, evitar llamada innecesaria
    if (notaEnviar === notasIniciales[indice]) {
      return;
    }

    setGuardandoIndice(indice);
    try {
      const respuesta = await registrarNota(codigoAlumno, codigoCurso, numeroPractica, notaEnviar);

      if (alActualizar) {
        alActualizar(respuesta.notas, respuesta.promedio, respuesta.estado);
      }
      if (alNotificarExito) {
        alNotificarExito(`Práctica ${numeroPractica} guardada correctamente.`);
      }
    } catch (err) {
      // Revertir en caso de fallo del servidor
      const valorPrevio = notasIniciales[indice] !== null ? String(notasIniciales[indice]) : '';
      setValoresTexto((prev) => {
        const copia = [...prev] as [string, string, string, string];
        copia[indice] = valorPrevio;
        return copia;
      });
      if (alNotificarError) {
        alNotificarError(err instanceof Error ? err.message : 'Error al guardar la nota.');
      }
    } finally {
      setGuardandoIndice(null);
    }
  };

  /**
   * Maneja el evento de teclado para navegación y confirmación con Enter.
   * Con Enter: guarda y mueve el foco a la misma columna de la fila siguiente.
   */
  const manejarKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    numeroPractica: number
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      guardarPractica(numeroPractica);

      // Mover el foco al mismo casillero del siguiente alumno en la tabla
      const siguienteFilaInput = document.querySelector(
        `input[data-fila="${indiceFila + 1}"][data-practica="${numeroPractica}"]`
      ) as HTMLInputElement | null;

      if (siguienteFilaInput) {
        siguienteFilaInput.focus();
        siguienteFilaInput.select();
      } else {
        (e.target as HTMLInputElement).blur();
      }
    }
  };

  return (
    <div className="fila-notas-editable">
      {[1, 2, 3, 4].map((num) => {
        const idx = num - 1;
        const valorActual = valoresTexto[idx];
        const estaGuardando = guardandoIndice === idx;
        const esResaltado = resaltarPractica === num && valorActual === '';

        // Estilo de color según nota
        let claseColor = 'nota-input-vacio';
        if (valorActual !== '') {
          const numNota = parseInt(valorActual, 10);
          if (!isNaN(numNota)) {
            claseColor = numNota >= NOTA_APROBATORIA ? 'nota-input-aprobado' : 'nota-input-desaprobado';
          }
        }

        return (
          <div key={num} className={`casilla-practica ${esResaltado ? 'casilla-resaltada' : ''}`}>
            <span className="casilla-etiqueta">P{num}</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              data-fila={indiceFila}
              data-practica={num}
              value={valorActual}
              disabled={estaGuardando}
              placeholder="—"
              className={`casilla-input ${claseColor} ${estaGuardando ? 'casilla-guardando' : ''}`}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setValoresTexto((prev) => {
                  const copia = [...prev] as [string, string, string, string];
                  copia[idx] = val;
                  return copia;
                });
              }}
              onBlur={() => guardarPractica(num)}
              onKeyDown={(e) => manejarKeyDown(e, num)}
              title={`Práctica ${num}: Ingrese nota de 0 a 20 o deje vacío para pendiente`}
            />
            {estaGuardando && <span className="casilla-mini-spinner" aria-hidden="true" />}
          </div>
        );
      })}
    </div>
  );
};

export default FilaNotasEditable;
