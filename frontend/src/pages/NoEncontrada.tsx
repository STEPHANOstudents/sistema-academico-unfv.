/**
 * Pantalla para rutas inexistentes (Error 404).
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Boton from '../components/ui/Boton';
import Tarjeta from '../components/ui/Tarjeta';
import './NoEncontrada.css';

export const NoEncontrada: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="no-encontrada-pantalla">
      <Tarjeta className="no-encontrada-tarjeta">
        <h2 className="no-encontrada-codigo">404</h2>
        <h3 className="no-encontrada-titulo">Página no encontrada</h3>
        <p className="no-encontrada-descripcion">
          La ruta que intenta consultar no existe o ha sido movida.
        </p>
        <div className="no-encontrada-acciones">
          <Boton variante="primario" onClick={() => navigate('/')}>
            Volver al inicio
          </Boton>
        </div>
      </Tarjeta>
    </div>
  );
};

export default NoEncontrada;
