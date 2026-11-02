# Paso 1 de 3: Backend (Node + Express + TypeScript)

> Cómo usar este archivo: pégalo completo como prompt en tu asistente de código (Claude Code, por ejemplo) dentro de una carpeta vacía llamada `sistema-academico-unfv`. Termina y prueba este paso antes de pasar al Paso 2.

---

## 1. Contexto del proyecto

Vamos a construir un **Sistema de Gestión Académica** web, inspirado en un ejercicio de consola hecho en Python. Ese programa original permitía a un operador matricular alumnos con un código autogenerado, registrar 4 prácticas, corregir datos, ordenar por edad o promedio y ver quién tenía el mayor y menor promedio.

Ahora lo rehacemos como aplicación web con **TypeScript en todo el proyecto**, separada en dos carpetas: `backend/` y `frontend/`. En este paso construyes **solo el backend**.

Mejoras respecto al programa original:

- Matricular y registrar notas son **procesos separados**. Un alumno se matricula primero y sus notas se registran después, práctica por práctica.
- Un alumno puede estar matriculado en **varios cursos**, y cada curso tiene sus propias 4 prácticas.
- Hay **dos roles**:
  - `SECRETARIO`: matricula alumnos, los edita o elimina, y registra notas. Inicia sesión con usuario y clave.
  - `ALUMNO`: solo puede ver sus propias notas. Inicia sesión **solo con su código**, sin clave.
- Los datos viven **en memoria** (sin base de datos). Se pierden al reiniciar el servidor, y eso es aceptable porque son datos de prueba.

## 2. Reglas generales de código (obligatorias)

1. TypeScript en modo `strict`. Prohibido usar `any`; si hace falta, usa `unknown` y valida.
2. **Comentarios en español, claros y útiles.** Explican el porqué, no repiten lo que dice el código.
   - Cada archivo empieza con un comentario de 1 a 3 líneas que dice qué hace.
   - Cada función exportada lleva un bloque JSDoc breve.
   - Las partes importantes llevan un comentario más extenso, paso a paso: el cálculo de la letra verificadora, el promedio parcial, el middleware de roles y las reglas de matrícula y notas.
3. Nombres de variables, funciones y archivos en español (`generarCodigo`, `alumnoServicio.ts`), salvo términos técnicos habituales (`middleware`, `token`).
4. Capas separadas: `routes` → `controllers` → `services` → `data`. Los controladores no contienen reglas de negocio; las reglas viven en los servicios.
5. Todos los errores se responden con el formato `{ "mensaje": "texto claro en español" }` y el código HTTP adecuado (400, 401, 403, 404, 409).
6. Dependencias permitidas: `express`, `cors`, `jsonwebtoken`, `bcryptjs`, `dotenv`, `zod` (validación), y como desarrollo `typescript`, `tsx`, `@types/*`. No agregues más sin avisar.

## 3. Estructura de carpetas a crear

Crea **toda** la estructura del proyecto, aunque en este paso solo rellenes `backend/`. La carpeta `frontend/` quedará vacía para el Paso 2.

```
sistema-academico-unfv/
├── README.md                     # Se completa en el Paso 3
├── .gitignore                    # node_modules, dist, .env
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example              # PORT, JWT_SECRET, JWT_EXPIRA_EN
│   └── src/
│       ├── server.ts             # Arranca el servidor (listen)
│       ├── app.ts                # Crea la app Express: cors, json, rutas, errores
│       ├── config/
│       │   └── constantes.ts     # Reglas: nota máxima, aprobatoria, rango de edad, etc.
│       ├── models/
│       │   ├── usuario.ts        # Tipo Secretario y tipo Rol
│       │   ├── alumno.ts         # Tipo Alumno
│       │   ├── curso.ts          # Tipo Curso
│       │   └── matricula.ts      # Tipo Matricula (alumno + curso + 4 notas)
│       ├── data/
│       │   ├── baseDatosMemoria.ts  # Arreglos en memoria (alumnos, cursos, matrículas, secretarios)
│       │   └── datosPrueba.ts       # Carga inicial de datos de prueba
│       ├── utils/
│       │   ├── codigoAlumno.ts   # Generar y validar el código con letra verificadora
│       │   └── calculos.ts       # Promedios y estado del curso
│       ├── middlewares/
│       │   ├── autenticacion.ts  # Lee y verifica el token JWT
│       │   ├── autorizacion.ts   # Exige un rol concreto
│       │   └── manejoErrores.ts  # Captura errores y da formato uniforme
│       ├── services/
│       │   ├── authServicio.ts
│       │   ├── alumnoServicio.ts
│       │   ├── cursoServicio.ts
│       │   └── matriculaServicio.ts   # Matrículas y notas
│       ├── controllers/
│       │   ├── authControlador.ts
│       │   ├── alumnoControlador.ts
│       │   ├── cursoControlador.ts
│       │   ├── matriculaControlador.ts
│       │   └── miPerfilControlador.ts  # Vista del alumno: sus propias notas
│       └── routes/
│           ├── index.ts          # Agrupa todo bajo /api
│           ├── authRutas.ts
│           ├── alumnoRutas.ts
│           ├── cursoRutas.ts
│           └── miPerfilRutas.ts
└── frontend/                     # Vacía por ahora (Paso 2)
```

## 4. Modelos de datos

```ts
// Rol de quien inicia sesión
type Rol = "SECRETARIO" | "ALUMNO";

interface Secretario { usuario: string; claveHash: string; nombre: string; }

interface Alumno {
  codigo: string;      // 8 dígitos + 1 letra verificadora, ej. "20184321C"
  apellidos: string;
  nombres: string;
  edad: number;
}

interface Curso {
  codigo: string;      // exactamente 3 dígitos, ej. "101"
  nombre: string;      // ej. "Programación I"
}

// Una matrícula = un alumno inscrito en un curso, con sus 4 prácticas
interface Matricula {
  codigoAlumno: string;
  codigoCurso: string;
  // 4 posiciones fijas. null = práctica aún sin nota (pendiente).
  notas: [number | null, number | null, number | null, number | null];
}
```

## 5. Reglas de negocio

**Código del alumno** (mismo algoritmo del programa original, impleméntalo en `utils/codigoAlumno.ts` con comentarios paso a paso):

1. Se sortea un número entero entre `20180000` y `20189999`.
2. Se convierte a texto y se invierte (de derecha a izquierda).
3. Se toman los **6 primeros dígitos del texto invertido** y se multiplican por los pesos `[7, 6, 5, 4, 3, 2]` en ese orden. Se suman los productos.
4. Se calcula `suma % 11` y se busca esa posición en `"ABCDEFGHIJK"`. Esa es la letra verificadora.
5. El código final es `número + letra`. Si ya existe un alumno con ese código, se sortea de nuevo.
6. Exporta también `esCodigoValido(codigo: string): boolean`, que comprueba el formato (8 dígitos + 1 letra mayúscula) **y** que la letra coincida con la calculada. Se usará en el login del alumno para detectar errores de tipeo.

**Validaciones** (centralizadas en `constantes.ts` y aplicadas con `zod`):

- Edad: entre 15 y 89. Apellidos y nombres: no vacíos, máximo 60 caracteres, con espacios recortados.
- Código de curso: exactamente 3 dígitos.
- Nota: número entero entre 0 y 20.
- Nota aprobatoria: 11 (constante `NOTA_APROBATORIA`, fácil de cambiar).

**Matrícula y notas:**

- Matricular crea la matrícula con `notas = [null, null, null, null]`. **Nunca** se piden notas al matricular.
- Un alumno no puede matricularse dos veces en el mismo curso (error 409).
- Las notas se registran de una en una: práctica 1, 2, 3 o 4. Se puede sobrescribir una nota ya puesta (corrección) o borrarla para dejarla pendiente.
- Al eliminar un alumno se eliminan también todas sus matrículas.

**Cálculos** (`utils/calculos.ts`, bien comentados):

- `promedioCurso`: promedio **solo de las notas ya registradas**, redondeado a 2 decimales. Si no hay ninguna nota devuelve `null`. Se evita así el problema del programa original, donde un 0 de relleno bajaba el promedio.
- `estadoCurso`:
  - `"SIN_NOTAS"`: ninguna práctica registrada.
  - `"EN_CURSO"`: entre 1 y 3 prácticas registradas.
  - `"APROBADO"` o `"DESAPROBADO"`: las 4 registradas, según el promedio frente a `NOTA_APROBATORIA`.
- `promedioGeneral` del alumno: promedio de los promedios de sus cursos que tengan al menos una nota. Si no tiene ninguno devuelve `null`.

## 6. Autenticación y roles

- Token **JWT** firmado con `JWT_SECRET` (del `.env`), con `rol` y el identificador (`usuario` o `codigo`). Expira según `JWT_EXPIRA_EN` (por defecto `8h`).
- Se envía en la cabecera `Authorization: Bearer <token>`.
- `autenticacion.ts`: verifica el token; si falta o es inválido responde 401.
- `autorizacion.ts`: función `soloRol("SECRETARIO")` que responde 403 si el rol no coincide. Comenta bien por qué se verifica el rol **en el servidor** y no solo ocultando botones en el frontend.
- Las claves del secretario se guardan con `bcryptjs` (hash), nunca en texto plano.
- El alumno entra solo con su código. El login valida el formato y la letra verificadora (`esCodigoValido`) y que el alumno exista. Si no existe, responde 401 con un mensaje genérico.
- Un alumno **solo puede ver sus propios datos**: el código sale del token, nunca de un parámetro que el cliente pueda cambiar.

## 7. Endpoints (contrato de la API)

Todas las rutas cuelgan de `/api`. Salvo las de login, todas requieren token.

| Método | Ruta | Rol | Qué hace |
|---|---|---|---|
| POST | `/auth/secretario/login` | público | Body `{usuario, clave}` → `{token, rol, nombre}` |
| POST | `/auth/alumno/login` | público | Body `{codigo}` → `{token, rol, nombre}` |
| GET | `/auth/yo` | cualquiera | Devuelve los datos de la sesión actual |
| GET | `/alumnos` | SECRETARIO | Lista de resúmenes. Query: `buscar`, `ordenarPor` (`edad` \| `promedio` \| `apellidos`), `orden` (`asc` \| `desc`) |
| POST | `/alumnos` | SECRETARIO | Body `{apellidos, nombres, edad}`. Genera el código y devuelve el alumno creado |
| GET | `/alumnos/extremos` | SECRETARIO | Alumnos con mayor y menor promedio general (ignora a quienes no tienen promedio) |
| GET | `/alumnos/:codigo` | SECRETARIO | Detalle del alumno con sus matrículas, notas, promedios y estados |
| PUT | `/alumnos/:codigo` | SECRETARIO | Edita apellidos, nombres o edad (el código **no** se puede cambiar) |
| DELETE | `/alumnos/:codigo` | SECRETARIO | Elimina al alumno y sus matrículas |
| POST | `/alumnos/:codigo/matriculas` | SECRETARIO | Body `{codigoCurso}`. Matricula al alumno en un curso |
| DELETE | `/alumnos/:codigo/matriculas/:codigoCurso` | SECRETARIO | Retira al alumno de un curso |
| PUT | `/alumnos/:codigo/matriculas/:codigoCurso/notas/:practica` | SECRETARIO | `practica` es 1 a 4. Body `{nota}` (0 a 20) o `{nota: null}` para dejarla pendiente |
| GET | `/cursos` | SECRETARIO | Lista de cursos, con la cantidad de alumnos matriculados |
| POST | `/cursos` | SECRETARIO | Body `{codigo, nombre}`. Crea un curso (código único de 3 dígitos) |
| GET | `/cursos/:codigo/matriculas` | SECRETARIO | Alumnos matriculados en ese curso con sus notas (para registrar notas por curso) |
| GET | `/mi-perfil` | ALUMNO | Sus datos, sus cursos, sus notas, promedios, estados y su promedio general |

Formas de respuesta que debes respetar (el frontend las usará tal cual):

```ts
interface AlumnoResumen {
  codigo: string; apellidos: string; nombres: string; edad: number;
  cantidadCursos: number; promedioGeneral: number | null;
}

interface MatriculaDetalle {
  curso: { codigo: string; nombre: string };
  notas: [number | null, number | null, number | null, number | null];
  promedio: number | null;
  estado: "SIN_NOTAS" | "EN_CURSO" | "APROBADO" | "DESAPROBADO";
}

interface AlumnoDetalle extends AlumnoResumen { matriculas: MatriculaDetalle[]; }
```

En `ordenarPor=promedio`, los alumnos sin promedio (`null`) van **siempre al final**, sea cual sea el sentido del orden.

## 8. Datos de prueba (`datosPrueba.ts`)

Se cargan al iniciar el servidor:

- 1 secretario: usuario `100`, clave `123` (la misma del programa original), nombre "Secretaría Académica".
- 5 cursos: `101` Matemática Básica, `102` Programación I, `103` Física General, `104` Estadística, `105` Comunicación.
- 6 alumnos con códigos generados por `generarCodigo()`, con apellidos y nombres peruanos variados y edades entre 17 y 25. Distribuye las situaciones para poder probar todo:
  - Uno **sin matrículas**.
  - Uno matriculado en 2 cursos **sin ninguna nota**.
  - Dos con notas parciales (1 a 3 prácticas).
  - Dos con las 4 notas completas, uno aprobado y otro desaprobado.
- Al arrancar, imprime en consola los códigos generados para poder iniciar sesión como alumno.

## 9. Scripts y configuración

- `npm run dev`: servidor con recarga automática (`tsx watch src/server.ts`).
- `npm run build`: compila a `dist/`. `npm start`: ejecuta lo compilado.
- Puerto por defecto `4000`. CORS habilitado para `http://localhost:5173` (el frontend con Vite).
- Ruta `GET /api/salud` pública que responde `{estado: "ok"}`, útil para comprobar que el servidor vive.

## 10. Criterios de aceptación

Al terminar, comprueba con `curl` o un cliente REST y confírmame los resultados:

1. El servidor arranca y muestra en consola los códigos de los alumnos de prueba.
2. El login del secretario con `100` / `123` devuelve un token; con una clave incorrecta devuelve 401.
3. El login del alumno con un código válido funciona; con un código con la letra cambiada se rechaza.
4. Con el token de un alumno, `GET /api/alumnos` devuelve 403, y `GET /api/mi-perfil` devuelve solo sus datos.
5. Se puede crear un alumno **sin notas**, matricularlo en un curso y registrar la práctica 1 por separado. El promedio del curso sale igual a esa nota, no dividido entre 4.
6. Matricular dos veces en el mismo curso devuelve 409. Una nota de 21 o de `-1` devuelve 400.
7. Ordenar por promedio deja a los alumnos sin promedio al final, tanto en ascendente como en descendente.
8. `/alumnos/extremos` ignora a los alumnos sin notas.
9. `tsc --noEmit` no da errores y no hay ningún `any` en el código.

No avances al Paso 2 hasta que estos puntos estén verificados.

## 11. Lo que NO debes hacer en este paso

- No crees ni toques nada dentro de `frontend/`.
- No agregues base de datos ni archivos de persistencia.
- No inventes endpoints distintos a los del contrato; el frontend dependerá de ellos.
