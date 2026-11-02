/**
 * Ventana modal accesible con cierre por teclado (Escape) y bloqueo de desplazamiento.
 */

import React, { useEffect, ReactNode } from 'react';
import './Modal.css';

interface ModalProps {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  children: ReactNode;
  anchoMax?: string;
}

export const Modal: React.FC<ModalProps> = ({
  abierto,
  alCerrar,
  titulo,
  children,
  anchoMax = '540px'
}) => {
  useEffect(() => {
    const manejarEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && abierto) {
        alCerrar();
      }
    };

    if (abierto) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', manejarEscape);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', manejarEscape);
    };
  }, [abierto, alCerrar]);

  if (!abierto) return null;

  return (
    <div className="modal-overlay" onClick={alCerrar} role="dialog" aria-modal="true">
      <div
        className="modal-contenedor"
        style={{ maxWidth: anchoMax }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-cabecera">
          <h3 className="modal-titulo">{titulo}</h3>
          <button
            type="button"
            className="modal-boton-cerrar"
            onClick={alCerrar}
            aria-label="Cerrar ventana emergente"
          >
            ✕
          </button>
        </div>
        <div className="modal-cuerpo">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
