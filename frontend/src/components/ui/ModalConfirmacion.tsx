/**
 * Modal de confirmación para acciones críticas (ej. eliminación de un alumno o retiro de curso).
 */

import React from 'react';
import Modal from './Modal';
import Boton from './Boton';
import './ModalConfirmacion.css';

interface ModalConfirmacionProps {
  abierto: boolean;
  titulo?: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  alConfirmar: () => void;
  alCancelar: () => void;
  cargando?: boolean;
}

export const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({
  abierto,
  titulo = 'Confirmar Acción',
  mensaje,
  textoConfirmar = 'Eliminar',
  textoCancelar = 'Cancelar',
  alConfirmar,
  alCancelar,
  cargando = false
}) => {
  return (
    <Modal abierto={abierto} alCerrar={alCancelar} titulo={titulo} anchoMax="460px">
      <div className="modal-confirmacion-contenido">
        <p className="modal-confirmacion-mensaje">{mensaje}</p>

        <div className="modal-confirmacion-acciones">
          <Boton
            type="button"
            variante="secundario"
            onClick={alCancelar}
            disabled={cargando}
          >
            {textoCancelar}
          </Boton>
          <Boton
            type="button"
            variante="peligro"
            onClick={alConfirmar}
            cargando={cargando}
          >
            {textoConfirmar}
          </Boton>
        </div>
      </div>
    </Modal>
  );
};

export default ModalConfirmacion;
