/**
 * Widget interactivo de Speaki (Trickcal: Chibi Go).
 * Mascota institucional flotante y cómica.
 * Aplastamiento suave y progresivo sincronizado con SpeakiSad2,
 * liberación elástica sincronizada con SpeakiSad3,
 * inicio en reposo y cierre con SpeakiSad1.
 */

import React, { useState, useRef, useEffect } from 'react';
import './SpeakiWidget.css';

type EstadoSpeaki = 'feliz' | 'triste';
type FaseAplastada = 'normal' | 'aplastando' | 'aplastada' | 'desaplastando';

const FRASE_INICIAL = '¡Hola! Soy Speaki, tu mascota académica. ¡Pellízcame los cachetes!';

const FRASES_FELICES = [
  '¡Yaaaay, aprobaste sin ir a susti! 🎉',
  '¡Con fe en el promedio villarrealino!',
  '¡Qué pro! 15.50 es un promediasso.',
  '¡Mis cachetes son 100% esponjosos y aprobatorios!',
  '¡Sigan estudiando, futuros graduados UNFV!',
  '¡Ese 20 en la práctica 4 se festeja!'
];

const FRASES_TRISTES = [
  '¡Noooo, jalamos el curso! 😭',
  '¡Un puntito más por piedad, profe!',
  '¡Me voy a sustitutorio directo, ayyy!',
  '¡Con 10.4 no redondea a 11, qué dolor!',
  '¡Piedad con la práctica calificada!'
];

/** Frases conmovedoras y tristes cuando el usuario la aplasta */
const FRASES_APLASTADA = [
  'Aplastarme no cambiará los resultados :(',
  '¿Por qué me aplastas? No te hice nada :(',
  'Eres malo :(',
  'No me hagas bullying :(',
  '¿Acaso aplastarme te sube puntos en el promedio? :(',
  '¡Auuu! ¡No me aplastes con el dedo que me duele! :('
];

/** Frases de profundo alivio y gratitud cuando el usuario la libera */
const FRASES_LIBERADA = [
  '¡Uff, la sentí cerca! No podía respirar así...',
  '¡Gracias por recapacitar!',
  '¡Gracias por liberarme!',
  '¡Yo sabía que me liberarías! :)',
  '¡Qué alivio! Casi me quedo aplastada para siempre...',
  '¡Por fin aire fresco! Ya no me aplastes porfa :3'
];

const AUDIOS_FELICES = ['/speaki/SpeakiHappy1.mp3', '/speaki/SpeakiHappy2.mp3'];

export const SpeakiWidget: React.FC = () => {
  const [estado, setEstado] = useState<EstadoSpeaki>('feliz');
  const [faseAplastada, setFaseAplastada] = useState<FaseAplastada>('normal');
  const [pellizcandoFeliz, setPellizcandoFeliz] = useState<boolean>(false);
  const [globoTexto, setGloboTexto] = useState<string | null>(null);
  const [silenciado, setSilenciado] = useState<boolean>(false);

  // Inicia desactivada en reposo por defecto
  const [minimizado, setMinimizado] = useState<boolean>(true);

  // Control de clics consecutivos
  const clicsSeguidosRef = useRef<number>(0);
  const temporizadorClicsRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const temporizadorGloboRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const temporizadorFaseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (temporizadorGloboRef.current) clearTimeout(temporizadorGloboRef.current);
      if (temporizadorClicsRef.current) clearTimeout(temporizadorClicsRef.current);
      if (temporizadorFaseRef.current) clearTimeout(temporizadorFaseRef.current);
    };
  }, []);

  /**
   * Reproduce una pista de audio de forma segura.
   */
  const reproducirPista = (rutaAudio: string) => {
    if (silenciado) return;

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const nuevoAudio = new Audio(rutaAudio);
      audioRef.current = nuevoAudio;
      nuevoAudio.volume = 0.85;
      nuevoAudio.play().catch(() => {
        // Bloqueo de autoplay del navegador si aplica
      });
    } catch (_e) {
      // Manejo silencioso en caso de no soportar audio
    }
  };

  /**
   * Despierta a Speaki desde el modo reposo:
   * Aparece feliz, muestra su saludo y reproduce SpeakiHappy1.
   */
  const despertarSpeaki = () => {
    setMinimizado(false);
    setEstado('feliz');
    setFaseAplastada('normal');
    setGloboTexto(FRASE_INICIAL);
    reproducirPista('/speaki/SpeakiHappy1.mp3');

    if (temporizadorGloboRef.current) clearTimeout(temporizadorGloboRef.current);
    temporizadorGloboRef.current = setTimeout(() => {
      setGloboTexto(null);
    }, 5000);
  };

  /**
   * Cierra/Dorme la ventana de Speaki volviéndola al modo reposo:
   * Reproduce SpeakiSad1.
   */
  const cerrarSpeaki = (e: React.MouseEvent) => {
    e.stopPropagation();
    reproducirPista('/speaki/SpeakiSad1.mp3');
    setMinimizado(true);
    setFaseAplastada('normal');
    setGloboTexto(null);
  };

  /**
   * Interacción principal al hacer clic sobre Speaki:
   * - Si está aplastada o en proceso: se desaplasta suavemente con SpeakiSad3.
   * - Si está triste y normal: se aplasta suave y progresivamente con SpeakiSad2 y se queda así.
   * - Si está feliz: salto elástico de cachetes (Squish).
   */
  const manejarInteraccion = () => {
    // 1. Si YA está aplastada: se desaplasta suavemente al ritmo de SpeakiSad3
    if (faseAplastada === 'aplastada' || faseAplastada === 'aplastando') {
      setFaseAplastada('desaplastando');
      reproducirPista('/speaki/SpeakiSad3.mp3');
      const fraseLiberacion = FRASES_LIBERADA[Math.floor(Math.random() * FRASES_LIBERADA.length)];
      setGloboTexto(fraseLiberacion);

      if (temporizadorFaseRef.current) clearTimeout(temporizadorFaseRef.current);
      temporizadorFaseRef.current = setTimeout(() => {
        setFaseAplastada('normal');
      }, 800);

      if (temporizadorGloboRef.current) clearTimeout(temporizadorGloboRef.current);
      temporizadorGloboRef.current = setTimeout(() => {
        setGloboTexto(null);
      }, 4500);
      return;
    }

    // 2. Si está triste y normal: se aplasta suave y progresivamente con SpeakiSad2
    if (estado === 'triste') {
      setFaseAplastada('aplastando');
      reproducirPista('/speaki/SpeakiSad2.mp3');
      const fraseAplastamiento = FRASES_APLASTADA[Math.floor(Math.random() * FRASES_APLASTADA.length)];
      setGloboTexto(fraseAplastamiento);

      if (temporizadorFaseRef.current) clearTimeout(temporizadorFaseRef.current);
      temporizadorFaseRef.current = setTimeout(() => {
        setFaseAplastada('aplastada');
      }, 850);

      if (temporizadorGloboRef.current) clearTimeout(temporizadorGloboRef.current);
      temporizadorGloboRef.current = setTimeout(() => {
        setGloboTexto(null);
      }, 5000);
      return;
    }

    // 3. Si está feliz: Pellizco elástico de cachetes
    setPellizcandoFeliz(true);
    setTimeout(() => setPellizcandoFeliz(false), 450);

    clicsSeguidosRef.current += 1;
    if (temporizadorClicsRef.current) clearTimeout(temporizadorClicsRef.current);

    if (clicsSeguidosRef.current >= 4) {
      setEstado('triste');
      clicsSeguidosRef.current = 0;
      reproducirPista('/speaki/SpeakiSad2.mp3');
      setGloboTexto('¡Auuuuch, no me pellizques tanto que me duele!');
    } else {
      const audioFeliz = AUDIOS_FELICES[Math.floor(Math.random() * AUDIOS_FELICES.length)];
      reproducirPista(audioFeliz);

      const fraseFeliz = FRASES_FELICES[Math.floor(Math.random() * FRASES_FELICES.length)];
      setGloboTexto(fraseFeliz);
    }

    temporizadorClicsRef.current = setTimeout(() => {
      clicsSeguidosRef.current = 0;
    }, 1600);

    if (temporizadorGloboRef.current) clearTimeout(temporizadorGloboRef.current);
    temporizadorGloboRef.current = setTimeout(() => {
      setGloboTexto(null);
    }, 4500);
  };

  /**
   * Alterna manualmente el estado de ánimo (Feliz / Triste).
   */
  const alternarEstado = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFaseAplastada('normal');
    const proximoEstado = estado === 'feliz' ? 'triste' : 'feliz';
    setEstado(proximoEstado);

    if (proximoEstado === 'triste') {
      reproducirPista('/speaki/SpeakiSad2.mp3');
      const fraseTriste = FRASES_TRISTES[Math.floor(Math.random() * FRASES_TRISTES.length)];
      setGloboTexto(`¡Ayyyy, me dio ansiedad el sustitutorio! 😭 ${fraseTriste}`);
    } else {
      reproducirPista('/speaki/SpeakiHappy1.mp3');
      setGloboTexto('¡Recuperé el optimismo villarrealino! ✨');
    }

    if (temporizadorGloboRef.current) clearTimeout(temporizadorGloboRef.current);
    temporizadorGloboRef.current = setTimeout(() => {
      setGloboTexto(null);
    }, 4500);
  };

  // 1. Modo Reposo (Por defecto)
  if (minimizado) {
    return (
      <div className="speaki-widget-reposo" role="complementary" aria-label="Speaki en reposo">
        <button
          type="button"
          className="speaki-avatar-reposo-btn"
          onClick={despertarSpeaki}
          title="¡Haz clic para despertar a Speaki!"
          aria-label="Despertar a Speaki"
        >
          <div className="speaki-avatar-circulo">
            <img
              src="/speaki/SpeakiHappyImage.png"
              alt="Speaki durmiendo"
              className="speaki-avatar-img"
              draggable={false}
            />
            <span className="speaki-insignia-z" aria-hidden="true">
              💤
            </span>
          </div>
          <div className="speaki-etiqueta-reposo">
            <span className="speaki-texto-reposo">Despertar a Speaki</span>
            <span className="speaki-subtexto-reposo">🐾 Tócame aquí</span>
          </div>
        </button>
      </div>
    );
  }

  // 2. Modo Activo Despierta
  const imagenSrc =
    estado === 'feliz' ? '/speaki/SpeakiHappyImage.png' : '/speaki/SpeakiSadImage.png';

  let claseContenedor = 'speaki-flotando';
  if (faseAplastada === 'aplastando') {
    claseContenedor = 'speaki-aplastando-suave';
  } else if (faseAplastada === 'aplastada') {
    claseContenedor = 'speaki-estado-aplastada';
  } else if (faseAplastada === 'desaplastando') {
    claseContenedor = 'speaki-desaplastando-suave';
  } else if (pellizcandoFeliz) {
    claseContenedor = 'speaki-squish-activo';
  }

  const mostrarDedo =
    faseAplastada === 'aplastando' ||
    faseAplastada === 'aplastada' ||
    faseAplastada === 'desaplastando';

  return (
    <div className="speaki-widget-flotante" role="complementary" aria-label="Mascota interactiva Speaki">
      {/* Globo de diálogo cómico */}
      {globoTexto && (
        <div className="speaki-globo-dialogo" role="status">
          <p className="speaki-globo-texto">{globoTexto}</p>
          <div className="speaki-globo-cola" aria-hidden="true" />
        </div>
      )}

      {/* Barra de herramientas de Speaki */}
      <div className="speaki-herramientas">
        <button
          type="button"
          className="speaki-herramienta-btn"
          onClick={alternarEstado}
          title={estado === 'feliz' ? 'Poner a Speaki triste' : 'Animar a Speaki a feliz'}
          aria-label="Cambiar estado de ánimo"
        >
          {estado === 'feliz' ? '😭' : '😊'}
        </button>

        <button
          type="button"
          className="speaki-herramienta-btn"
          onClick={(e) => {
            e.stopPropagation();
            setSilenciado(!silenciado);
          }}
          title={silenciado ? 'Activar sonido' : 'Silenciar audios'}
          aria-label={silenciado ? 'Activar sonido' : 'Silenciar sonido'}
        >
          {silenciado ? '🔇' : '🔊'}
        </button>

        <button
          type="button"
          className="speaki-herramienta-btn"
          onClick={cerrarSpeaki}
          title="Poner a Speaki en reposo"
          aria-label="Cerrar y dormir a Speaki"
        >
          ✕
        </button>
      </div>

      {/* Contenedor del personaje con animación suave y dedo sobre la cabeza */}
      <div
        className={`speaki-personaje-contenedor ${claseContenedor}`}
        onClick={manejarInteraccion}
        title={
          faseAplastada === 'aplastada' || faseAplastada === 'aplastando'
            ? '¡Speaki está aplastada! Haz clic para liberarla.'
            : estado === 'triste'
            ? '¡Speaki está triste! Haz clic para aplastarle la cabecita.'
            : '¡Haz clic para pellizcarle los cachetes a Speaki!'
        }
      >
        {/* Mano apuntando hacia abajo aplastando fielmente como en el meme */}
        {mostrarDedo && (
          <img
            src="/speaki/ManoAplastadora.png"
            alt="Mano aplastando a Speaki"
            className={`speaki-mano-aplastadora ${
              faseAplastada === 'aplastando'
                ? 'speaki-mano-bajando'
                : faseAplastada === 'desaplastando'
                ? 'speaki-mano-subiendo'
                : 'speaki-mano-sostenida'
            }`}
            draggable={false}
          />
        )}

        <img
          src={imagenSrc}
          alt={estado === 'feliz' ? 'Speaki Feliz' : 'Speaki Triste'}
          className="speaki-imagen"
          draggable={false}
        />
        <span className="speaki-sombra" aria-hidden="true" />
      </div>
    </div>
  );
};

export default SpeakiWidget;
