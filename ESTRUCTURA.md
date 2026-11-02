# Estructura del Proyecto: Sistema de Gestión Académica UNFV

Organización general del repositorio en arquitectura **Full-Stack (Monorepo)**, detallando únicamente los módulos, capas y archivos esenciales del sistema.

```text
sistema-academico-unfv/
├── package.json             # Configuración raíz (workspaces para backend y frontend)
├── vercel.json               # Configuración de despliegue y rewrites en Vercel
├── README.md                 # Documentación general y credenciales de prueba
├── .gitignore                # Exclusión de dependencias (node_modules), compilados y .env
│
├── backend/                  # Servidor API REST (Node.js + Express + TypeScript)
│   ├── package.json          # Dependencias (express, jsonwebtoken, bcryptjs, zod, cors)
│   ├── tsconfig.json         # Configuración TypeScript estricta (strict: true)
│   └── src/
│       ├── server.ts         # Punto de entrada: arranca el servidor HTTP en el puerto 4000
│       ├── app.ts            # Ensamblaje Express, middlewares globales y CORS
│       │
│       ├── config/           # Constantes de negocio (límites de notas 0-20, nota aprobatoria 11)
│       │   └── constantes.ts
│       │
│       ├── data/             # Capa de almacenamiento en memoria RAM (sin base de datos)
│       │   ├── baseDatosMemoria.ts  # Colecciones tipadas: secretariosDB, alumnosDB, cursosDB, matriculasDB
│       │   └── datosPrueba.ts       # Semilla inicial (secretario 100/123, 5 cursos, 6 alumnos)
│       │
│       ├── models/           # Interfaces y tipos de datos (TypeScript)
│       │   ├── alumno.ts     # Modelo Alumno (código, nombres, apellidos, edad)
│       │   ├── curso.ts      # Modelo Curso (código, nombre)
│       │   ├── matricula.ts  # Modelo Matrícula (tupla de 4 notas, promedio, estado)
│       │   └── usuario.ts    # Modelo de credenciales y payload JWT
│       │
│       ├── services/         # Lógica y Reglas de Negocio Centrales
│       │   ├── alumnoServicio.ts    # CRUD de alumnos, ordenamiento y cálculo de extremos
│       │   ├── cursoServicio.ts     # Catálogo de asignaturas y alumnos matriculados
│       │   ├── matriculaServicio.ts # Matrícula independiente y registro nota por práctica
│       │   └── authServicio.ts      # Autenticación, hashing bcrypt y emisión de JWT
│       │
│       ├── controllers/      # Controladores HTTP (Mapeo de peticiones y respuestas)
│       │   ├── alumnoControlador.ts
│       │   ├── cursoControlador.ts
│       │   ├── matriculaControlador.ts
│       │   ├── authControlador.ts
│       │   └── miPerfilControlador.ts # Vista privada del alumno (código extraído del JWT)
│       │
│       ├── routes/           # Definición de rutas Express bajo el prefijo /api
│       │   └── index.ts      # Enrutador central (/api/auth, /api/alumnos, /api/cursos, etc.)
│       │
│       ├── middlewares/      # Interceptores de peticiones
│       │   ├── autenticacion.ts     # Verificación criptográfica del Bearer JWT
│       │   ├── autorizacion.ts      # Control de acceso basado en roles (RBAC: SECRETARIO / ALUMNO)
│       │   └── manejoErrores.ts     # Manejador centralizado de excepciones (ErrorApp)
│       │
│       └── utils/            # Algoritmos y cálculos
│           ├── calculos.ts          # Promedio sobre notas no nulas y determinación de estado
│           └── codigoAlumno.ts      # Generador y letra verificadora oficial (Módulo 11)
│
└── frontend/                 # Aplicación Cliente Web (React + Vite + TypeScript)
    ├── package.json          # Dependencias cliente (react, react-dom, react-router-dom)
    ├── vite.config.ts        # Configuración de Vite y proxy inverso local (/api -> localhost:4000)
    ├── index.html            # Plantilla HTML base con fuentes institucionales
    │
    ├── public/
    │   └── speaki/           # Recursos multimedia de la mascota Speaki (audios mp3 e imágenes)
    │
    └── src/
        ├── main.tsx          # Montaje de React en el DOM
        ├── App.tsx           # Enrutamiento global (BrowserRouter) y rutas protegidas
        │
        ├── styles/           # Estilos institucionales UNFV (Cero colores hexadecimales externos)
        │   ├── tema.css      # Variables de diseño (#7A1226 granate, fuentes, radios, sombras)
        │   └── global.css    # Reseteo y reglas CSS globales
        │
        ├── context/          # Estado global de la aplicación
        │   └── AuthContext.tsx # Proveedor de autenticación (token en sessionStorage, rol y logout)
        │
        ├── routes/           # Guardias de navegación
        │   └── RutaProtegida.tsx # Redirige según autenticación y rol permitido
        │
        ├── api/              # Cliente HTTP centralizado (Consume /api con inyección de JWT)
        │   ├── cliente.ts    # Fetch genérico tipado y purga de sesión en error 401
        │   ├── alumnosApi.ts # Peticiones de gestión de alumnos y calificaciones
        │   ├── cursosApi.ts  # Peticiones del catálogo de cursos
        │   └── miPerfilApi.ts# Consulta del expediente del estudiante autenticado
        │
        ├── components/
        │   ├── layout/       # Estructura de página (LayoutSecretario, LayoutAlumno, Navbar, Sidebar)
        │   ├── ui/           # Componentes atómicos reutilizables (Boton, Modal, TablaDatos, etc.)
        │   ├── secretario/   # Componentes de gestión (FormularioAlumno, FilaNotasEditable, etc.)
        │   └── speaki/       # SpeakiWidget (Mascota interactiva, frases y animaciones)
        │
        ├── pages/            # Vistas principales del sistema
        │   ├── Login.tsx     # Acceso dual (Secretaría con usuario/clave, Alumno solo con código)
        │   ├── NoAutorizado.tsx  # Pantalla de error HTTP 403
        │   ├── NoEncontrada.tsx  # Pantalla de error HTTP 404
        │   ├── alumno/
        │   │   └── MisNotas.tsx  # Expediente académico y notas individuales del alumno
        │   └── secretario/
        │       ├── PanelSecretario.tsx  # Dashboard analítico con métricas y extremos
        │       ├── ListaAlumnos.tsx     # Padrón estudiantil, filtros y ordenamiento
        │       ├── DetalleAlumno.tsx    # Ficha del alumno, historial de cursos y matrícula
        │       ├── ListaCursos.tsx      # Catálogo institucional de cursos
        │       └── RegistroNotas.tsx    # Planilla de notas editable con navegación por teclado
        │
        └── utils/            # Formateadores auxiliares
            ├── formato.ts    # Formateo de nombres, códigos y promedios ("14.50" o "—")
            └── notas.ts      # Constantes y badges de color según nota aprobatoria (11)
```
