/**
 * Campo de entrada de texto accesible con soporte para etiqueta, mensaje de ayuda y errores.
 */

import React, { InputHTMLAttributes, useId } from 'react';
import './CampoTexto.css';

interface CampoTextoProps extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string;
  ayuda?: string;
  error?: string;
}

export const CampoTexto: React.FC<CampoTextoProps> = ({
  etiqueta,
  ayuda,
  error,
  id,
  className = '',
  disabled,
  ...props
}) => {
  const idGenerado = useId();
  const idFinal = id || idGenerado;
  const idAyuda = `${idFinal}-ayuda`;
  const idError = `${idFinal}-error`;

  return (
    <div className={`campo-texto-contenedor ${error ? 'campo-con-error' : ''} ${className}`}>
      <label htmlFor={idFinal} className="campo-texto-etiqueta">
        {etiqueta}
        {props.required && <span className="campo-requerido" aria-hidden="true"> *</span>}
      </label>

      <input
        id={idFinal}
        className="campo-texto-input"
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? idError : ayuda ? idAyuda : undefined}
        {...props}
      />

      {ayuda && !error && (
        <span id={idAyuda} className="campo-texto-ayuda">
          {ayuda}
        </span>
      )}

      {error && (
        <span id={idError} className="campo-texto-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default CampoTexto;
