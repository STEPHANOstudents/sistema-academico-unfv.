# Paso 2 de 3: Frontend base, identidad visual, login y navegación por rol

> Cómo usar este archivo: pégalo como prompt en tu asistente de código, dentro de la carpeta `sistema-academico-unfv`, **después de haber terminado y verificado el Paso 1**. En este paso se construye la base del frontend; las pantallas completas del secretario y del alumno se hacen en el Paso 3.

---

## 1. Contexto

Estamos construyendo un **Sistema de Gestión Académica** para un entorno universitario. El backend (Node + Express + TypeScript) ya está terminado en `backend/` y corre en `http://localhost:4000`. Ahora creas el **frontend** en `frontend/` con **React + TypeScript + Vite**.

Hay dos roles:

- `SECRETARIO`: matricula alumnos, los edita o elimina, y registra notas. Inicia sesión con usuario y clave.
- `ALUMNO`: solo visualiza sus propias notas. Inicia sesión **solo con su código** de 9 caracteres (8 dígitos + 1 letra), sin clave.

Los datos de prueba están en memoria, por lo que se pierden al reiniciar el backend. Es lo esperado.

## 2. Reglas generales de código (obligatorias)

1. TypeScript `strict`. Prohibido `any`.
2. **Comentarios en español, claros y útiles.** Explican el porqué.
   - Cada archivo empieza con un comentario de 1 a 3 líneas que dice qué hace.
   - Las partes importantes llevan un comentario más extenso: el contexto de autenticación, el cliente de la API, la ruta protegida por rol y el archivo de tema visual.
3. Componentes funcionales con hooks. Un componente por archivo, con nombres en español y `PascalCase` (`BarraSuperior.tsx`). Cada componente con su CSS al lado (`BarraSuperior.css`).
4. Dependencias permitidas: `react`, `react-dom`, `react-router-dom`. Nada de librerías de UI (ni Material, ni Bootstrap, ni Tailwind). El diseño se hace con CSS propio y variables CSS, para controlar la identidad visual al detalle.
5. Interfaz y textos en español. Accesible: etiquetas `label` en cada campo, foco visible, contraste suficiente, botones con texto claro.

## 3. Estructura de carpetas del frontend

La carpeta `backend/` ya existe y no se toca. Crea la carpeta `frontend/` con esta estructura:

```
frontend/
├── package.json
├── tsconfig.json
├── vite.config.ts              # Proxy: /api → http://localhost:4000
├── index.html                  # Incluye la fuente (Google Fonts) y el título
└── src/
    ├── main.tsx                # Punto de entrada
    ├── App.tsx                 # Define las rutas de toda la aplicación
    ├── styles/
    │   ├── tema.css            # TODAS las variables de color, tipografía y espaciado
    │   └── global.css          # Reset, estilos base, utilidades (.tarjeta, .boton, etc.)
    ├── assets/
    │   └── (aquí se colocará el escudo oficial; por ahora no hay imágenes)
    ├── types/
    │   └── modelos.ts          # Copia de los tipos del contrato de la API (Rol, AlumnoResumen, etc.)
    ├── api/
    │   ├── cliente.ts          # Función base para llamar a la API (token, errores)
    │   ├── authApi.ts          # loginSecretario, loginAlumno, obtenerSesion
    │   ├── alumnosApi.ts       # (se completa en el Paso 3)
    │   ├── cursosApi.ts        # (se completa en el Paso 3)
    │   └── miPerfilApi.ts      # (se completa en el Paso 3)
    ├── context/
    │   └── AuthContext.tsx     # Estado de sesión: usuario, rol, token, iniciar/cerrar sesión
    ├── routes/
    │   └── RutaProtegida.tsx   # Bloquea el acceso según sesión y rol
    ├── components/
    │   ├── layout/
    │   │   ├── LayoutSecretario.tsx   # Cabecera + menú lateral + contenido
    │   │   ├── LayoutAlumno.tsx       # Cabecera + contenido (sin menú lateral)
    │   │   ├── CabeceraInstitucional.tsx
    │   │   ├── MenuLateral.tsx
    │   │   └── PiePagina.tsx
    │   └── ui/
    │       ├── Escudo.tsx             # Marcador de posición del escudo (ver sección 5)
    │       ├── Boton.tsx
    │       ├── CampoTexto.tsx
    │       ├── Tarjeta.tsx
    │       ├── InsigniaEstado.tsx     # Etiqueta de color para el estado del curso
    │       └── MensajeError.tsx
    └── pages/
        ├── Login.tsx
        ├── NoAutorizado.tsx
        ├── NoEncontrada.tsx
        ├── secretario/
        │   └── PanelSecretario.tsx    # Marcador de posición (se completa en el Paso 3)
        └── alumno/
            └── MisNotas.tsx           # Marcador de posición (se completa en el Paso 3)
```

## 4. Contrato de la API que ya existe

Todas las rutas cuelgan de `/api`. Salvo el login, requieren la cabecera `Authorization: Bearer <token>`. Los errores llegan como `{ "mensaje": "..." }`.

| Método | Ruta | Uso en este paso |
|---|---|---|
| POST | `/auth/secretario/login` | Body `{usuario, clave}` → `{token, rol, nombre}` |
| POST | `/auth/alumno/login` | Body `{codigo}` → `{token, rol, nombre}` |
| GET | `/auth/yo` | Recupera la sesión actual a partir del token |

Copia a `types/modelos.ts` estos tipos, que usará también el Paso 3:

```ts
export type Rol = "SECRETARIO" | "ALUMNO";
export type EstadoCurso = "SIN_NOTAS" | "EN_CURSO" | "APROBADO" | "DESAPROBADO";
export type Notas = [number | null, number | null, number | null, number | null];

export interface AlumnoResumen {
  codigo: string; apellidos: string; nombres: string; edad: number;
  cantidadCursos: number; promedioGeneral: number | null;
}
export interface MatriculaDetalle {
  curso: { codigo: string; nombre: string };
  notas: Notas; promedio: number | null; estado: EstadoCurso;
}
export interface AlumnoDetalle extends AlumnoResumen { matriculas: MatriculaDetalle[]; }
export interface Curso { codigo: string; nombre: string; cantidadAlumnos: number; }
```

## 5. Identidad visual (lo más importante de este paso)

El diseño debe sentirse **universitario, institucional y sobrio**, inspirado en la Universidad Nacional Federico Villarreal (UNFV). No es un panel de empresa moderno ni una app colorida: debe parecer un portal académico serio, ordenado y legible.

**Paleta de colores.** Tomé como referencia el rojo guinda y los tonos oscuros y plateados que se asocian al logo de la UNFV. No pude confirmar los valores oficiales exactos, así que todos los colores deben vivir **únicamente** como variables en `styles/tema.css`. Ningún componente escribe un color directamente (`#...`) en su CSS; siempre usa `var(--...)`. Así, cuando tengas el manual de identidad oficial, cambias los colores en un solo archivo.

```css
:root {
  /* Marca (aproximación: confirmar con el manual de identidad oficial) */
  --color-primario: #7A1226;        /* guinda institucional */
  --color-primario-oscuro: #55091A; /* hover, cabecera */
  --color-primario-claro: #F6E9EC;  /* fondos suaves, filas resaltadas */

  /* Neutros */
  --color-texto: #1F1F24;
  --color-texto-suave: #5C5C66;
  --color-fondo: #F4F4F6;           /* fondo de la página */
  --color-superficie: #FFFFFF;      /* tarjetas, tablas */
  --color-borde: #D9D9DF;
  --color-plata: #B8BAC2;           /* detalles, separadores decorativos */

  /* Estados (independientes de la marca, para no confundir con errores) */
  --color-aprobado: #1E7B4A;
  --color-desaprobado: #B3261E;
  --color-en-curso: #8A6100;
  --color-sin-notas: #5C5C66;
}
```

**Tipografía.** Titulares con una fuente serif sobria (por ejemplo `Merriweather` o `Libre Baskerville` desde Google Fonts, con respaldo `Georgia, serif`) y texto de interfaz con una sans-serif legible (`Inter` o `Source Sans 3`, con respaldo `system-ui`). Define `--fuente-titulo` y `--fuente-texto` en `tema.css`.

**Carácter visual:**

- Cabecera institucional guinda, con el escudo a la izquierda, el nombre "Universidad Nacional Federico Villarreal" y debajo el subtítulo "Sistema de Gestión Académica". Una línea fina plateada debajo de la cabecera.
- Fondo claro y tarjetas blancas con borde fino y esquinas poco redondeadas (4 a 6 px). Evita sombras exageradas, degradados llamativos y animaciones decorativas.
- Botón principal guinda con texto blanco; botón secundario con borde guinda y fondo transparente.
- Tablas con encabezado guinda claro, filas alternadas muy sutiles y buen espaciado.
- Pie de página sobrio con el texto "Sistema de prueba · Los datos no se conservan al reiniciar".

**Escudo.** No uses ni inventes el escudo oficial. Crea el componente `Escudo.tsx` que muestre un marcador sobrio (un círculo guinda con las siglas "UNFV" en blanco). Debe aceptar una prop opcional `src` para que luego se reemplace por la imagen oficial colocada en `assets/` sin tocar nada más. Deja un comentario que explique cómo hacer el cambio.

**Responsive.** Debe verse bien en escritorio y en celular. En pantallas angostas el menú lateral del secretario se vuelve un menú desplegable con botón.

## 6. Lo que debes construir en este paso

**6.1 Configuración.** Proyecto Vite con React + TypeScript. En `vite.config.ts`, un proxy para que todo lo que empiece por `/api` vaya a `http://localhost:4000`. El frontend llama siempre a rutas relativas (`/api/...`).

**6.2 `api/cliente.ts`.** Una función genérica (por ejemplo `llamarApi<T>(ruta, opciones)`) que:

- agrega automáticamente la cabecera `Authorization` si hay token;
- convierte las respuestas de error `{mensaje}` en un `Error` con ese texto;
- si el servidor responde 401, cierra la sesión y redirige al login (comenta por qué).

**6.3 `context/AuthContext.tsx`.** Guarda `usuario`, `rol`, `token` y `nombre`. Expone `iniciarSesion`, `cerrarSesion` y un indicador `cargando`. El token se guarda en `sessionStorage` (la sesión se cierra al cerrar la pestaña). Al abrir la app, si hay token guardado, llama a `/auth/yo` para restaurar la sesión. Comenta la decisión de usar `sessionStorage` y su compromiso de seguridad: aquí son datos de prueba, en producción se usarían cookies `httpOnly`.

**6.4 `routes/RutaProtegida.tsx`.** Recibe el rol permitido. Si no hay sesión, redirige a `/login`. Si hay sesión con otro rol, muestra `NoAutorizado`. Comenta que esto mejora la experiencia pero **no es la seguridad real**: la seguridad real la aplica el backend.

**6.5 `Login.tsx`.** Una sola página con **dos modos** elegibles mediante pestañas o botones: "Soy alumno" y "Soy secretario".

- Alumno: un único campo "Código de alumno" (convertir a mayúsculas, máximo 9 caracteres, ayuda "Ejemplo: 20184321C").
- Secretario: campos "Usuario" y "Clave".
- Muestra el error del servidor con `MensajeError`, deshabilita el botón mientras carga y permite enviar con Enter.
- Diseño: tarjeta centrada sobre el fondo, escudo arriba, título serif, y una franja guinda a un lado o arriba que dé identidad. Debe verse institucional, no como un formulario genérico.
- Tras iniciar sesión, redirige según el rol: secretario → `/secretario`, alumno → `/alumno`.

**6.6 Rutas en `App.tsx`:**

| Ruta | Contenido |
|---|---|
| `/login` | Login |
| `/secretario/*` | Protegida (SECRETARIO), dentro de `LayoutSecretario`, con `PanelSecretario` provisional |
| `/alumno/*` | Protegida (ALUMNO), dentro de `LayoutAlumno`, con `MisNotas` provisional |
| `/` | Redirige según la sesión: a su zona o al login |
| otras | `NoEncontrada` |

**6.7 Layouts.**

- `LayoutSecretario`: cabecera institucional (con nombre del usuario y botón "Cerrar sesión"), menú lateral con las futuras secciones (Panel, Alumnos, Cursos, Registro de notas; las rutas se activan en el Paso 3, por ahora pueden quedar deshabilitadas o apuntar al panel) y pie de página.
- `LayoutAlumno`: cabecera institucional con el código y el nombre del alumno, contenido centrado y pie de página. Sin menú lateral: el alumno tiene una sola vista.

**6.8 Componentes `ui/`.** Pequeños, reutilizables y con CSS propio: `Boton` (variantes `primario`, `secundario`, `peligro`), `CampoTexto` (con `label`, ayuda y error), `Tarjeta`, `InsigniaEstado` (recibe un `EstadoCurso` y muestra el texto en español, "Sin notas", "En curso", "Aprobado", "Desaprobado", con su color de estado) y `MensajeError`.

## 7. Criterios de aceptación

1. Con el backend encendido, `npm run dev` en `frontend/` muestra el login en `http://localhost:5173`.
2. El secretario entra con `100` / `123` y llega a `/secretario` con la cabecera guinda, el menú y su nombre visible.
3. Un alumno entra con uno de los códigos que el backend imprime en consola y llega a `/alumno`. Con un código mal escrito, ve el mensaje de error del servidor.
4. Siendo alumno, escribir `/secretario` en la barra de direcciones muestra "No autorizado". Sin sesión, redirige al login.
5. Recargar la página con sesión iniciada **no** cierra la sesión.
6. "Cerrar sesión" vuelve al login y limpia el token.
7. Ningún archivo CSS fuera de `tema.css` contiene colores escritos en hexadecimal.
8. La interfaz se ve bien a 1280 px y a 375 px de ancho.
9. `tsc --noEmit` no da errores y no hay ningún `any`.

## 8. Lo que NO debes hacer en este paso

- No construyas todavía las tablas de alumnos, formularios de matrícula ni el registro de notas (Paso 3).
- No modifiques el backend. Si crees que falta algo en la API, dímelo en lugar de cambiarla.
- No agregues librerías de componentes ni de estilos.
- No uses imágenes del escudo oficial ni inventes un logo.
