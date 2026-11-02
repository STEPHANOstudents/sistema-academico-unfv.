# Paso 3 de 3: Pantallas del secretario y del alumno, integración y cierre

> Cómo usar este archivo: pégalo como prompt en tu asistente de código, dentro de `sistema-academico-unfv`, **después de terminar y verificar los Pasos 1 y 2**. Aquí se completa toda la funcionalidad y se conecta el frontend con el backend.

---

## 1. Contexto

Ya existen:

- `backend/` (Node + Express + TypeScript) con toda la API, corriendo en `http://localhost:4000`.
- `frontend/` (React + TypeScript + Vite) con el tema visual institucional (`styles/tema.css`), login, contexto de sesión, rutas protegidas por rol, layouts y componentes `ui/` básicos.

Ahora construyes las **pantallas reales** de los dos roles. Es la réplica web, mejorada, del programa de consola original: matricular, consultar, corregir, ordenar y ver mayor y menor promedio, con una diferencia importante: **la matrícula y el registro de notas son procesos separados**. Un alumno se matricula primero y sus notas se registran después, práctica por práctica.

## 2. Reglas generales de código (obligatorias)

1. TypeScript `strict`, sin `any`.
2. **Comentarios en español, claros y útiles**, que expliquen el porqué. Comentarios más extensos en lo importante: el registro de notas por práctica, el manejo de notas pendientes (`null`), la actualización del estado tras cada cambio y la confirmación de eliminaciones.
3. Se mantiene todo lo definido en el Paso 2: componentes funcionales, un componente por archivo con su CSS, **ningún color escrito directamente fuera de `tema.css`**, y solo `react`, `react-dom` y `react-router-dom` como dependencias.
4. Toda llamada a la API pasa por `api/cliente.ts`. Los componentes no usan `fetch` directamente.
5. Cada pantalla maneja tres estados visibles: **cargando**, **error** (con botón "Reintentar") y **vacío** (con un mensaje que oriente, por ejemplo "Aún no hay alumnos. Registra el primero.").
6. Estética universitaria sobria, igual que en el Paso 2. Si necesitas un color nuevo (por ejemplo, para una advertencia), agrégalo como variable en `tema.css`.

## 3. Estructura de carpetas: lo que se agrega o completa

```
frontend/src/
├── api/
│   ├── alumnosApi.ts        # COMPLETAR: listar, crear, obtener, editar, eliminar, extremos,
│   │                        #            matricular, retirar, registrarNota
│   ├── cursosApi.ts         # COMPLETAR: listar, crear, matriculasDeCurso
│   └── miPerfilApi.ts       # COMPLETAR: obtenerMiPerfil
├── hooks/
│   ├── useCarga.ts          # Hook genérico: ejecuta una llamada y devuelve {datos, cargando, error, recargar}
│   └── useDebounce.ts       # Retrasa la búsqueda mientras el usuario escribe
├── utils/
│   ├── formato.ts           # Formatear promedio ("14.50" o "—"), nombre completo, etc.
│   └── notas.ts             # NOTA_APROBATORIA = 11, helpers de color según la nota
├── components/
│   ├── ui/
│   │   ├── Modal.tsx               # Ventana emergente accesible (Esc cierra, foco atrapado)
│   │   ├── ModalConfirmacion.tsx   # "¿Seguro que deseas eliminar…?"
│   │   ├── TablaDatos.tsx          # Tabla reutilizable (columnas, filas, vacío)
│   │   ├── EncabezadoPagina.tsx    # Título + descripción + acciones de la pantalla
│   │   ├── EstadoCarga.tsx         # Muestra cargando / error / vacío de forma uniforme
│   │   ├── AvisoTemporal.tsx       # Mensaje breve de éxito ("Nota guardada")
│   │   └── CeldaNota.tsx           # Muestra una nota o "—" si está pendiente
│   └── secretario/
│       ├── FormularioAlumno.tsx    # Crear y editar alumno (apellidos, nombres, edad)
│       ├── FormularioMatricula.tsx # Elegir un curso para matricular
│       ├── FilaNotasEditable.tsx   # 4 casillas de nota con guardado por práctica
│       └── TarjetaExtremo.tsx      # Alumno con mayor / menor promedio
└── pages/
    ├── secretario/
    │   ├── PanelSecretario.tsx     # REEMPLAZAR el provisional: resumen general
    │   ├── ListaAlumnos.tsx        # Tabla con búsqueda, orden, crear, editar, eliminar
    │   ├── DetalleAlumno.tsx       # Datos del alumno + sus cursos + matricular + notas
    │   ├── ListaCursos.tsx         # Cursos existentes + crear curso
    │   └── RegistroNotas.tsx       # Elegir un curso y poner notas a todos sus alumnos
    └── alumno/
        └── MisNotas.tsx            # REEMPLAZAR el provisional: vista de notas del alumno
```

Rutas nuevas dentro de `/secretario` (actualiza `App.tsx` y activa el menú lateral):

| Ruta | Pantalla |
|---|---|
| `/secretario` | `PanelSecretario` |
| `/secretario/alumnos` | `ListaAlumnos` |
| `/secretario/alumnos/:codigo` | `DetalleAlumno` |
| `/secretario/cursos` | `ListaCursos` |
| `/secretario/notas` | `RegistroNotas` |

## 4. Contrato de la API (ya implementado en el backend)

Todas las rutas cuelgan de `/api`. Los errores llegan como `{ "mensaje": "..." }` y debes mostrar ese texto al usuario.

| Método | Ruta | Rol | Qué hace |
|---|---|---|---|
| GET | `/alumnos` | SECRETARIO | Lista de `AlumnoResumen`. Query: `buscar`, `ordenarPor` (`edad` \| `promedio` \| `apellidos`), `orden` (`asc` \| `desc`) |
| POST | `/alumnos` | SECRETARIO | Body `{apellidos, nombres, edad}`. Devuelve el alumno con su código generado |
| GET | `/alumnos/extremos` | SECRETARIO | Alumnos con mayor y menor promedio general |
| GET | `/alumnos/:codigo` | SECRETARIO | `AlumnoDetalle` |
| PUT | `/alumnos/:codigo` | SECRETARIO | Edita apellidos, nombres o edad |
| DELETE | `/alumnos/:codigo` | SECRETARIO | Elimina al alumno y sus matrículas |
| POST | `/alumnos/:codigo/matriculas` | SECRETARIO | Body `{codigoCurso}`. 409 si ya está matriculado |
| DELETE | `/alumnos/:codigo/matriculas/:codigoCurso` | SECRETARIO | Retira al alumno del curso |
| PUT | `/alumnos/:codigo/matriculas/:codigoCurso/notas/:practica` | SECRETARIO | `practica` 1 a 4. Body `{nota}` (0 a 20) o `{nota: null}` |
| GET | `/cursos` | SECRETARIO | Lista de `Curso` con `cantidadAlumnos` |
| POST | `/cursos` | SECRETARIO | Body `{codigo, nombre}` (código de 3 dígitos) |
| GET | `/cursos/:codigo/matriculas` | SECRETARIO | Alumnos matriculados en el curso, con sus notas |
| GET | `/mi-perfil` | ALUMNO | Datos del alumno con sus cursos, notas, promedios y estados |

Los tipos (`AlumnoResumen`, `AlumnoDetalle`, `MatriculaDetalle`, `Curso`, `EstadoCurso`, `Notas`) ya están en `types/modelos.ts`. Agrega ahí los que falten (por ejemplo, el de la respuesta de `/alumnos/extremos` y la de `/cursos/:codigo/matriculas`) leyendo las respuestas reales del backend.

## 5. Pantallas del secretario

**5.1 `PanelSecretario` (inicio).** Una vista general, con tarjetas de datos y dos bloques:

- Tarjetas: total de alumnos, total de cursos y cantidad de alumnos **sin ninguna nota** (calculada con los datos que ya devuelve la API).
- Bloque "Mejor y menor promedio": dos `TarjetaExtremo` (datos de `/alumnos/extremos`). Si aún no hay notas, muestra un mensaje explicativo en lugar de dejarlo vacío.
- Accesos directos a "Matricular alumno" y "Registrar notas".

**5.2 `ListaAlumnos`.** Es el reemplazo de las opciones 2 a 8 y 11 a 12 del programa original.

- Tabla con: código, apellidos y nombres, edad, cantidad de cursos, promedio general. El promedio pendiente se muestra como "—".
- Campo de búsqueda por apellido, nombre o código, con `useDebounce` (espera unos 300 ms antes de consultar).
- Orden: el usuario hace clic en los encabezados "Edad", "Promedio" y "Apellidos" para ordenar; un segundo clic invierte el sentido. Muestra una flecha en la columna activa. Comenta que el orden lo calcula el backend.
- Botón "Matricular alumno" que abre un `Modal` con `FormularioAlumno`. Al guardar, muestra un aviso con el **código generado** y ofrece "Ir al detalle" para matricularlo en cursos y registrar notas luego.
- Cada fila tiene "Ver detalle", "Editar" (modal con el mismo formulario, sin poder cambiar el código) y "Eliminar" (con `ModalConfirmacion`, que advierte que se borrarán también sus matrículas y notas).
- Validación en el formulario antes de enviar: apellidos y nombres no vacíos, edad entre 15 y 89, con mensajes bajo cada campo.

**5.3 `DetalleAlumno`.** Aquí ocurre lo nuevo respecto al programa original.

- Encabezado con código, nombre completo, edad, promedio general y un botón "Volver a alumnos".
- Sección "Cursos matriculados": una `Tarjeta` por curso, con el nombre, la `InsigniaEstado`, el promedio del curso y una `FilaNotasEditable` con las 4 prácticas.
- `FilaNotasEditable`: cada práctica es una casilla numérica (0 a 20, enteros). Una casilla vacía significa "pendiente". Se guarda **por práctica** al salir de la casilla (evento `blur`) o al pulsar Enter, llamando a `registrarNota`. Si el usuario borra el valor, se envía `{nota: null}`. Mientras guarda, la casilla muestra un indicador sutil; si falla, vuelve al valor anterior y muestra el error. Tras guardar, se actualizan el promedio y el estado del curso.
- Las notas con valor se colorean según aprueben o no (`NOTA_APROBATORIA = 11`), usando las variables de estado de `tema.css`. Nunca uses solo el color: acompáñalo de un texto o ícono para que no dependa de distinguir colores.
- Botón "Matricular en un curso": abre un modal con `FormularioMatricula`, que lista solo los cursos en los que el alumno **todavía no** está matriculado. Si no quedan cursos disponibles, lo indica.
- Cada curso tiene un botón "Retirar del curso" con confirmación.
- Si el alumno no tiene cursos, muestra un estado vacío que invite a matricularlo.

**5.4 `ListaCursos`.** Tabla de cursos con código, nombre y cantidad de alumnos. Botón "Nuevo curso" con modal (código de 3 dígitos y nombre). Si el código ya existe, muestra el error del servidor (409).

**5.5 `RegistroNotas`.** Pantalla pensada para el trabajo diario del secretario: poner las notas de una práctica a todo un curso.

- Selector de curso arriba. Al elegir uno, carga `/cursos/:codigo/matriculas`.
- Tabla con una fila por alumno matriculado: código, apellidos y nombres, y 4 casillas de nota (mismo comportamiento de guardado por práctica que en el detalle), más promedio y estado.
- Opción "Resaltar pendientes de la práctica…" (selector 1 a 4) que marca visualmente las casillas vacías de esa práctica, para detectar a quién le falta nota.
- Navegación con teclado: Tab pasa a la casilla siguiente y Enter baja al mismo campo del alumno de abajo (comenta cómo lo resolviste).

## 6. Pantalla del alumno: `MisNotas`

El alumno **solo visualiza**. No debe haber botones de edición ni acciones de escritura.

- Encabezado de bienvenida con su nombre, su código y su **promedio general** (o "Aún sin notas" si no tiene).
- Una `Tarjeta` por curso en el que está matriculado, con: nombre del curso, `InsigniaEstado`, promedio del curso y las 4 prácticas en una fila (cada una con su nota o "Pendiente").
- Un texto breve que explique la regla de estados, por ejemplo: "El curso se marca como aprobado o desaprobado cuando las 4 prácticas tienen nota. La nota aprobatoria es 11."
- Estado vacío amable si aún no tiene cursos: "Todavía no tienes cursos matriculados. Consulta en Secretaría."
- Debe verse especialmente bien en celular, porque es probable que los alumnos consulten desde el teléfono.

## 7. Integración y cierre

1. **Manejo de errores uniforme:** todos los errores de la API llegan al usuario con el texto del servidor, en un `MensajeError` o un aviso, sin mostrar jamás una pantalla en blanco.
2. **Sin duplicar tipos:** la forma de las respuestas se define una sola vez en `types/modelos.ts`.
3. **README.md** en la raíz del proyecto, en español, con: qué es el sistema, cómo está organizado (árbol de carpetas), cómo instalar y ejecutar cada parte (`cd backend && npm install && npm run dev` y lo mismo en `frontend`), las credenciales de prueba (secretario `100` / `123`; alumnos: usar los códigos que imprime el backend al arrancar), una tabla de roles y permisos, y una nota clara de que **los datos no se conservan** al reiniciar el backend.
4. **Script opcional en la raíz:** un `package.json` con el script `dev` que levante backend y frontend a la vez (con `concurrently`, que se permite aquí como única dependencia extra de desarrollo).
5. **Revisión de comentarios:** repasa todo el frontend y confirma que las partes clave tienen comentarios claros en español.

## 8. Criterios de aceptación

Prueba cada punto y confírmame el resultado:

1. **Matrícula separada de las notas:** el secretario crea un alumno sin poner ninguna nota, lo matricula en 2 cursos y recién después registra la práctica 1 de un curso. El promedio de ese curso es igual a esa nota (no dividido entre 4) y el estado es "En curso".
2. Al completar las 4 prácticas, el estado cambia solo a "Aprobado" o "Desaprobado" según el promedio.
3. Borrar el contenido de una casilla deja la práctica como pendiente y recalcula el promedio.
4. No es posible matricular dos veces al mismo alumno en el mismo curso: el curso ya matriculado no aparece como opción, y si el servidor responde 409, se muestra su mensaje.
5. En la lista de alumnos, ordenar por promedio deja a los que no tienen notas al final, en ambos sentidos. La búsqueda por apellido filtra la tabla.
6. Eliminar un alumno pide confirmación y, al aceptar, desaparece de la lista y del panel.
7. En `RegistroNotas`, el secretario puede poner notas de un curso completo moviéndose solo con el teclado.
8. El alumno entra con su código y ve **únicamente** sus cursos y notas, sin ningún control de edición. Si intenta abrir `/secretario/alumnos`, ve "No autorizado".
9. Con el backend apagado, las pantallas muestran un error claro con el botón "Reintentar", no una pantalla en blanco.
10. Todo se ve bien a 1280 px y a 375 px de ancho.
11. `tsc --noEmit` pasa sin errores en `backend/` y `frontend/`, no hay ningún `any` y no hay colores en hexadecimal fuera de `tema.css`.

## 9. Lo que NO debes hacer

- No agregues base de datos ni persistencia. Los datos de prueba se pierden al reiniciar, y es lo esperado.
- No modifiques el contrato de la API. Si detectas que falta o sobra algo, avísame antes de cambiarlo.
- No agregues librerías de UI ni de estilos.
- No permitas que el alumno vea o edite datos de otros alumnos, ni siquiera cambiando la URL a mano.
