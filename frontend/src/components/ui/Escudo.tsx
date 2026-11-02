/**
 * Componente institucional de escudo/logo de la Universidad Nacional Federico Villarreal.
 * Despliega un marcador sobrio tipográfico por defecto y permite inyectar una imagen oficial vía 'src'.
 *
 * Para sustituir este marcador por el escudo oficial en el futuro:
 * 1. Coloque el archivo de imagen oficial en la carpeta `src/assets/escudo-unfv.png`.
 * 2. Pase la ruta como prop `src`: `<Escudo src="/src/assets/escudo-unfv.png" />`.
 */

import React from 'react';
import './Escudo.css';

interface EscudoProps {
  src?: string;
  tamano?: number;
  className?: string;
}

export const Escudo: React.FC<EscudoProps> = ({ src, tamano = 56, className = '' }) => {
  if (src) {
    return (
      <img
        src={src}
        alt="Escudo oficial de la Universidad Nacional Federico Villarreal"
        className={`escudo-imagen ${className}`}
        style={{ width: tamano, height: tamano }}
      />
    );
  }

  return (
    <div
      className={`escudo-marcador ${className}`}
      style={{ width: tamano, height: tamano }}
      role="img"
      aria-label="Isotipo institucional UNFV"
    >
      <span className="escudo-siglas" style={{ fontSize: tamano * 0.32 }}>
        UNFV
      </span>
    </div>
  );
};

export default Escudo;
