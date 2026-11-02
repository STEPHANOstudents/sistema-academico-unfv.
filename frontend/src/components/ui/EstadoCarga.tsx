/**
 * Componente unificado para los tres estados operativos de pantalla:
 * cargando, error (con botón de reintento) y vacío con orientación al usuario.
 */

import React, { ReactNode } from 'react';
import Boton from './Boton';
import './EstadoCarga.css';

interface EstadoCargaProps {
  cargando: boolean;
  error: string | null;
  alReintentar?: () => void;
  esVacio?: boolean;
  mensajeVacio?: string;
  accionVacio?: ReactNode;
  children: ReactNode;
}

export const EstadoCarga: React.FC<EstadoCargaProps> = ({
  cargando,
  error,
  alReintentar,
  esVacio = false,
  mensajeVacio = 'No se encontraron datos registrados.',
  accionVacio,
  children
}) => {
  if (cargando) {
    return (
      <div className="estado-carga-contenedor" role="status" aria-live="polite">
        <div className="estado-carga-spinner" aria-hidden="true" />
        <p className="estado-carga-texto">Cargando información académica...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="estado-carga-error" role="alert">
        <div className="estado-carga-icono-error" aria-hidden="true">
          ✕
        </div>
        <h4 className="estado-carga-titulo-error">No se pudo cargar la información</h4>
        <p className="estado-carga-detalle-error">{error}</p>
        {alReintentar && (
          <Boton variante="secundario" onClick={alReintentar} className="estado-carga-boton-reintentar">
            Reintentar
          </Boton>
        )}
      </div>
    );
  }

  if (esVacio) {
    return (
      <div className="estado-carga-vacio">
        <div className="estado-carga-icono-vacio" aria-hidden="true">
          📂
        </div>
        <p className="estado-carga-texto-vacio">{mensajeVacio}</p>
        {accionVacio && <div className="estado-carga-accion-vacio">{accionVacio}</div>}
      </div>
    );
  }

  return <>{children}</>;
};

export default EstadoCarga;
