/**
 * Formulario para creación y edición de alumnos.
 * Valida nombres, apellidos y rango de edad (15 a 89 años).
 */

import React, { useState, FormEvent } from 'react';
import CampoTexto from '../ui/CampoTexto';
import Boton from '../ui/Boton';
import MensajeError from '../ui/MensajeError';
import './FormularioAlumno.css';

interface FormularioAlumnoProps {
  codigoInicial?: string;
  apellidosInicial?: string;
  nombresInicial?: string;
  edadInicial?: number;
  esEdicion?: boolean;
  alGuardar: (datos: { apellidos: string; nombres: string; edad: number }) => Promise<void>;
  alCancelar: () => void;
}

export const FormularioAlumno: React.FC<FormularioAlumnoProps> = ({
  codigoInicial = '',
  apellidosInicial = '',
  nombresInicial = '',
  edadInicial = 20,
  esEdicion = false,
  alGuardar,
  alCancelar
}) => {
  const [apellidos, setApellidos] = useState<string>(apellidosInicial);
  const [nombres, setNombres] = useState<string>(nombresInicial);
  const [edad, setEdad] = useState<string>(String(edadInicial));

  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!apellidos.trim()) {
      nuevosErrores.apellidos = 'Los apellidos son obligatorios.';
    } else if (apellidos.trim().length > 60) {
      nuevosErrores.apellidos = 'Los apellidos no deben superar los 60 caracteres.';
    }

    if (!nombres.trim()) {
      nuevosErrores.nombres = 'Los nombres son obligatorios.';
    } else if (nombres.trim().length > 60) {
      nuevosErrores.nombres = 'Los nombres no deben superar los 60 caracteres.';
    }

    const edadNum = parseInt(edad, 10);
    if (isNaN(edadNum)) {
      nuevosErrores.edad = 'La edad debe ser un número entero.';
    } else if (edadNum < 15 || edadNum > 89) {
      nuevosErrores.edad = 'La edad debe estar comprendida entre 15 y 89 años.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarEnvio = async (e: FormEvent) => {
    e.preventDefault();
    setErrorGeneral(null);

    if (!validar()) return;

    setGuardando(true);
    try {
      await alGuardar({
        apellidos: apellidos.trim(),
        nombres: nombres.trim(),
        edad: parseInt(edad, 10)
      });
    } catch (err) {
      if (err instanceof Error) {
        setErrorGeneral(err.message);
      } else {
        setErrorGeneral('Error inesperado al guardar los datos del alumno.');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={manejarEnvio} noValidate className="formulario-alumno">
      <MensajeError mensaje={errorGeneral} alCerrar={() => setErrorGeneral(null)} />

      {esEdicion && (
        <CampoTexto
          etiqueta="Código Institucional"
          value={codigoInicial}
          disabled
          ayuda="El código de alumno es inmutable por reglamento."
        />
      )}

      <CampoTexto
        etiqueta="Apellidos"
        placeholder="Ej. Quispe Flores"
        value={apellidos}
        onChange={(e) => setApellidos(e.target.value)}
        error={errores.apellidos}
        required
        maxLength={60}
      />

      <CampoTexto
        etiqueta="Nombres"
        placeholder="Ej. Carlos Alberto"
        value={nombres}
        onChange={(e) => setNombres(e.target.value)}
        error={errores.nombres}
        required
        maxLength={60}
      />

      <CampoTexto
        etiqueta="Edad"
        type="number"
        min={15}
        max={89}
        placeholder="Ej. 20"
        value={edad}
        onChange={(e) => setEdad(e.target.value)}
        error={errores.edad}
        ayuda="Rango permitido: 15 a 89 años"
        required
      />

      {!esEdicion && (
        <p className="formulario-alumno-nota">
          Al guardar, el sistema generará automáticamente un código único de 9 caracteres con letra verificadora calculada por ponderación mod 11.
        </p>
      )}

      <div className="formulario-alumno-acciones">
        <Boton type="button" variante="secundario" onClick={alCancelar} disabled={guardando}>
          Cancelar
        </Boton>
        <Boton type="submit" variante="primario" cargando={guardando}>
          {esEdicion ? 'Guardar Cambios' : 'Registrar y Generar Código'}
        </Boton>
      </div>
    </form>
  );
};

export default FormularioAlumno;
