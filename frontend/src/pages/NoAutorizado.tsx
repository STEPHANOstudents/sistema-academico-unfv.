/**
 * Pantalla que se presenta cuando el rol del usuario conectado no cuenta con privilegios para la ruta.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Boton from '../components/ui/Boton';
import Tarjeta from '../components/ui/Tarjeta';
import { useAuth } from '../context/AuthContext';
import './NoAutorizado.css';

export const NoAutorizado: React.FC = () => {
  const { rol, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const volverAZona = () => {
    if (rol === 'SECRETARIO') {
      navigate('/secretario');
    } else if (rol === 'ALUMNO') {
      navigate('/alumno');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="no-autorizado-pantalla">
      <Tarjeta className="no-autorizado-tarjeta">
        <div className="no-autorizado-icono" aria-hidden="true">
          🚫
        </div>
        <h2 className="no-autorizado-titulo">Acceso No Autorizado</h2>
        <p className="no-autorizado-descripcion">
          No dispones de los permisos necesarios para acceder a esta sección del sistema académico.
        </p>
        <p className="no-autorizado-detalle">
          Tu rol actual es: <strong>{rol || 'Sin sesión'}</strong>.
        </p>

        <div className="no-autorizado-acciones">
          <Boton variante="primario" onClick={volverAZona}>
            Ir a mi panel principal
          </Boton>
          <Boton variante="secundario" onClick={cerrarSesion}>
            Cerrar sesión
          </Boton>
        </div>
      </Tarjeta>
    </div>
  );
};

export default NoAutorizado;
