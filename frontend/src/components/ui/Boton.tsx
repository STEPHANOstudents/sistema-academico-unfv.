/**
 * Botón interactivo reutilizable con variantes estilísticas institucionales.
 * Soporta estados de carga, deshabilitación y accesibilidad de teclado.
 */

import React, { ButtonHTMLAttributes } from 'react';
import './Boton.css';

export type VarianteBoton = 'primario' | 'secundario' | 'peligro';

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton;
  cargando?: boolean;
}

export const Boton: React.FC<BotonProps> = ({
  children,
  variante = 'primario',
  cargando = false,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`boton-unfv boton-${variante} ${cargando ? 'boton-cargando' : ''} ${className}`}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando ? (
        <span className="boton-contenido-carga">
          <span className="boton-spinner" aria-hidden="true" />
          <span>Procesando...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Boton;
