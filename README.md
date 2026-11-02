# Sistema de Gestión Académica - UNFV

Sistema web institucional desarrollado con **TypeScript de extremo a extremo**, inspirado en un prototipo original de consola en Python y evolucionado a una aplicación cliente-servidor desacoplada, moderna y accesible para la **Universidad Nacional Federico Villarreal (UNFV)**.

> ⚠️ **Aviso de Persistencia:** Los datos residen exclusivamente en memoria volátil (`in-memory arrays`). Los registros, matrículas y calificaciones no se conservan tras reiniciar el servidor backend, lo cual es el comportamiento esperado para este entorno de demostración.

---

## 🏛️ Características Principales y Mejoras

1. **Separación de Procesos:** La matrícula y el registro de notas son procesos independientes. Un alumno se inscribe con 4 prácticas pendientes (`null`) y el secretario califica práctica por práctica según el avance semestral.
2. **Cómputo Justo de Calificaciones:** El promedio de una asignatura computa **únicamente sobre las notas rendidas** (no se rellena con ceros automáticos que distorsionen el promedio parcial).
3. **Control de Acceso Basado en Roles (RBAC):**
   - **Secretario:** Acceso integral con usuario y contraseña (hash `bcrypt`), administración de padrón estudiantil, catálogo de asignaturas, matrículas y calificaciones.
   - **Alumno:** Acceso simplificado **únicamente mediante su código oficial**, consulta exclusiva de su propio récord académico en modo solo lectura.
4. **Algoritmo Ponderado de Código Institucional:** Generación y validación matemática de código de 9 caracteres (8 dígitos + letra verificadora calculada mediante inversión de dígitos y ponderación con factores `[7, 6, 5, 4, 3, 2]` en módulo 11).
5. **Identidad Visual UNFV:** Paleta de colores oficial (guinda institucional `#7A1226`, tonos oscuros y plateados) gobernada estrictamente a través de variables CSS centralizadas en `styles/tema.css`.
6. **Navegación Ágil por Teclado:** En el módulo de registro masivo de calificaciones, la tecla `Tab` avanza a la siguiente práctica y la tecla `Enter` guarda y desciende automáticamente a la misma columna del alumno siguiente.

---

## 📂 Organización del Proyecto

```text
sistema-academico-unfv/
├── README.md                          # Documentación oficial del sistema
├── .gitignore                         # Exclusión de dependencias, entornos y compilados
├── package.json                       # Script raíz unificado para levantar ambos entornos
├── backend/                           # API REST (Node.js + Express + TypeScript)
│   ├── package.json
│   ├── tsconfig.json                  # TypeScript en modo strict (sin 'any')
│   ├── .env.example                   # Variables de entorno de referencia
│   ├── .env                           # Configuración local de puerto y JWT
│   └── src/
│       ├── server.ts                  # Punto de entrada HTTP y arranque
│       ├── app.ts                     # Configuración Express, CORS y enrutador
│       ├── config/
│       │   └── constantes.ts          # Constantes de negocio y límites académicos
│       ├── models/
│       │   ├── usuario.ts             # Tipos Secretario, Rol y Payload JWT
│       │   ├── alumno.ts              # Modelos Alumno, Resumen y Detalle
│       │   ├── curso.ts               # Modelos Curso y CursoConCantidad
│       │   └── matricula.ts           # Modelos Matricula, Detalle y Estados
│       ├── data/
│       │   ├── baseDatosMemoria.ts    # Arreglos volátiles en memoria
│       │   └── datosPrueba.ts         # Precarga de secretario, 5 cursos y 6 alumnos
│       ├── utils/
│       │   ├── codigoAlumno.ts        # Algoritmo de letra verificadora ponderada mod 11
│       │   └── calculos.ts            # Cálculo de promedios parciales y estados
│       ├── middlewares/
│       │   ├── autenticacion.ts       # Extracción y verificación de JWT Bearer
│       │   ├── autorizacion.ts        # Restricción obligatoria de roles en servidor
│       │   └── manejoErrores.ts       # Respuestas estándar { "mensaje": "..." }
│       ├── services/
│       │   ├── authServicio.ts
│       │   ├── alumnoServicio.ts
│       │   ├── cursoServicio.ts
│       │   └── matriculaServicio.ts
│       ├── controllers/
│       │   ├── authControlador.ts
│       │   ├── alumnoControlador.ts
│       │   ├── cursoControlador.ts
│       │   ├── matriculaControlador.ts
│       │   └── miPerfilControlador.ts
│       └── routes/
│           ├── index.ts               # Prefijo /api y endpoint /api/salud
│           ├── authRutas.ts
│           ├── alumnoRutas.ts
│           ├── cursoRutas.ts
│           └── miPerfilRutas.ts
└── frontend/                          # Interfaz de Usuario (React + TypeScript + Vite)
    ├── package.json                   # Dependencias oficiales: react, react-dom, react-router-dom
    ├── tsconfig.json
    ├── vite.config.ts                 # Proxy inverso: /api → http://localhost:4000
    ├── index.html                     # Tipografías Merriweather e Inter
    └── src/
        ├── main.tsx                   # Punto de entrada ReactDOM
        ├── App.tsx                    # Enrutamiento protegido por rol
        ├── styles/
        │   ├── tema.css               # ÚNICO archivo con colores institucionales
        │   └── global.css             # Reseteo y estilos base
        ├── types/
        │   └── modelos.ts             # Tipos y contratos compartidos
        ├── api/
        │   ├── cliente.ts             # Inyección de Bearer y redirección automática 401
        │   ├── authApi.ts             # Endpoints de autenticación
        │   ├── alumnosApi.ts          # CRUD, ordenamiento, matrículas y notas
        │   ├── cursosApi.ts           # Catálogo y matrículas por materia
        │   └── miPerfilApi.ts         # Expediente personal del alumno conectado
        ├── context/
        │   └── AuthContext.tsx        # Sesión reactiva en sessionStorage y restauración /auth/yo
        ├── routes/
        │   └── RutaProtegida.tsx      # Bloqueo de rutas por rol en cliente
        ├── hooks/
        │   ├── useCarga.ts            # Hook genérico para llamadas asíncronas
        │   └── useDebounce.ts         # Retardo reactivo para optimización de búsqueda
        ├── utils/
        │   ├── formato.ts             # Formateo de promedios ("14.50" o "—") y nombres
        │   └── notas.ts               # Calificación aprobatoria (11) y clases CSS semánticas
        ├── components/
        │   ├── layout/
        │   │   ├── LayoutSecretario.tsx & .css
        │   │   ├── LayoutAlumno.tsx & .css
        │   │   ├── CabeceraInstitucional.tsx & .css
        │   │   ├── MenuLateral.tsx & .css
        │   │   └── PiePagina.tsx & .css
        │   ├── ui/
        │   │   ├── Escudo.tsx & .css
        │   │   ├── Boton.tsx & .css
        │   │   ├── CampoTexto.tsx & .css
        │   │   ├── Tarjeta.tsx & .css
        │   │   ├── InsigniaEstado.tsx & .css
        │   │   ├── MensajeError.tsx & .css
        │   │   ├── Modal.tsx & .css
        │   │   ├── ModalConfirmacion.tsx & .css
        │   │   ├── TablaDatos.tsx & .css
        │   │   ├── EncabezadoPagina.tsx & .css
        │   │   ├── EstadoCarga.tsx & .css
        │   │   ├── AvisoTemporal.tsx & .css
        │   │   └── CeldaNota.tsx & .css
        │   └── secretario/
        │       ├── FormularioAlumno.tsx & .css
        │       ├── FormularioMatricula.tsx & .css
        │       ├── FilaNotasEditable.tsx & .css
        │       └── TarjetaExtremo.tsx & .css
        └── pages/
            ├── Login.tsx & .css
            ├── NoAutorizado.tsx & .css
            ├── NoEncontrada.tsx & .css
            ├── secretario/
            │   ├── PanelSecretario.tsx & .css
            │   ├── ListaAlumnos.tsx & .css
            │   ├── DetalleAlumno.tsx & .css
            │   ├── ListaCursos.tsx & .css
            │   └── RegistroNotas.tsx & .css
            └── alumno/
                └── MisNotas.tsx & .css
```

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js** v18 o superior instalado.
- **npm** v9 o superior.

### Opción A: Ejecución Simultánea desde la Raíz (Recomendado)
Desde la raíz del proyecto (`sistema-academico-unfv/`):
```bash
npm install
npm run dev
```
Este comando arrancará el servidor backend en `http://localhost:4000` y el cliente Vite en `http://localhost:5173` de forma concurrente.

### Opción B: Ejecución Independiente por Carpetas
**1. Backend:**
```bash
cd backend
npm install
npm run dev
```
El servidor backend escuchará en el puerto `4000`.

**2. Frontend:**
```bash
cd frontend
npm install
npm run dev
```
La interfaz de usuario estará disponible en `http://localhost:5173`.

---

## 🔑 Credenciales y Cuentas de Prueba

### 1. Personal Administrativo (Secretaría Académica)
- **Modalidad en el Login:** Pestaña "Soy Secretario"
- **Usuario:** `100`
- **Contraseña:** `123`

### 2. Estudiantes (Alumnos)
- **Modalidad en el Login:** Pestaña "Soy Alumno"
- **Código:** Ingrese cualquiera de los códigos de 9 caracteres impresos por la consola del backend al iniciar el servidor (ejemplos generados por el sorteo con letra verificadora):
  - Alumno 1 (Sin matrículas)
  - Alumno 2 (2 asignaturas matriculadas, sin notas)
  - Alumno 3 (Notas parciales en 2 prácticas)
  - Alumno 4 (Notas parciales en 1 y 3 prácticas)
  - Alumno 5 (4 notas completas - Condición: Aprobado)
  - Alumno 6 (4 notas completas - Condición: Desaprobado)

---

## 👥 Matriz de Roles y Permisos

| Funcionalidad / Recurso | SECRETARIO | ALUMNO | Público |
|---|:---:|:---:|:---:|
| Inicio de Sesión (`/login`) | ✅ | ✅ | ✅ |
| Consulta de Salud API (`/api/salud`) | ✅ | ✅ | ✅ |
| Panel General con Métricas y Extremos (`/secretario`) | ✅ | ❌ | ❌ |
| Listado, Búsqueda y Ordenamiento de Alumnos | ✅ | ❌ | ❌ |
| Matricular Nuevo Alumno (Generación de Código) | ✅ | ❌ | ❌ |
| Edición y Eliminación en Cascada de Alumnos | ✅ | ❌ | ❌ |
| Catálogo y Alta de Nuevas Asignaturas | ✅ | ❌ | ❌ |
| Inscribir y Retirar Asignaturas por Alumno | ✅ | ❌ | ❌ |
| Registro y Edición de Notas (P1 a P4) | ✅ | ❌ | ❌ |
| Matriz de Calificaciones por Curso con Teclado | ✅ | ❌ | ❌ |
| Consulta de Expediente Propio (`/alumno`) | ❌ | ✅ | ❌ |
| Consulta de Expedientes Ajenos | ❌ | ❌ | ❌ |

---

## 🧪 Pruebas de Calidad y Criterios Cumplidos

- **Verificación Estricta de TypeScript:** Cero advertencias con `tsc --noEmit` tanto en `backend/` como en `frontend/`.
- **Cero 'any':** Todas las funciones y modelos cuentan con tipado explícito o inferido riguroso.
- **Identidad Centralizada:** Ningún archivo CSS fuera de `tema.css` contiene colores hexadecimales codificados directamente.
- **Seguridad en Servidor:** Si un usuario con rol de Alumno intenta invocar rutas administrativas con su token (ej. `GET /api/alumnos`), el servidor responde `HTTP 403 Forbidden`. En las consultas de notas del estudiante, el identificador se extrae de la firma del JWT y jamás de parámetros que el cliente pueda alterar.
