/**
 * Módulo de inicialización de datos de prueba en memoria.
 * Precarga el secretario por defecto, catálogo de cursos y alumnos con diversos escenarios de prueba.
 */

import bcrypt from 'bcryptjs';
import { secretariosDB, alumnosDB, cursosDB, matriculasDB } from './baseDatosMemoria';
import { generarCodigo } from '../utils/codigoAlumno';

/**
 * Carga los datos iniciales de prueba en las colecciones en memoria
 * y muestra en la consola del servidor los accesos disponibles.
 */
export function cargarDatosPrueba(): void {
  // Limpieza inicial para evitar duplicación si se llama varias veces
  secretariosDB.length = 0;
  alumnosDB.length = 0;
  cursosDB.length = 0;
  matriculasDB.length = 0;

  // 1. Carga del usuario Secretario
  // Usuario: 100 / Clave: 123 (hasheada con bcrypt para seguridad)
  const claveHash = bcrypt.hashSync('123', 10);
  secretariosDB.push({
    usuario: '100',
    claveHash,
    nombre: 'Secretaría Académica'
  });

  // 2. Carga de los 5 Cursos oficiales
  cursosDB.push(
    { codigo: '101', nombre: 'Matemática Básica' },
    { codigo: '102', nombre: 'Programación I' },
    { codigo: '103', nombre: 'Física General' },
    { codigo: '104', nombre: 'Estadística' },
    { codigo: '105', nombre: 'Comunicación' }
  );

  // 3. Generación y registro de los 6 Alumnos de prueba
  const codigos: string[] = [];

  const personas = [
    { apellidos: 'Quispe Flores', nombres: 'Carlos', edad: 19 },
    { apellidos: 'Mendoza Ramos', nombres: 'Valeria', edad: 21 },
    { apellidos: 'Huamán Castillo', nombres: 'Diego', edad: 20 },
    { apellidos: 'Flores Rojas', nombres: 'Ana María', edad: 22 },
    { apellidos: 'Salazar Torres', nombres: 'Luis Fernando', edad: 23 },
    { apellidos: 'Paredes Vega', nombres: 'Lucía', edad: 18 }
  ];

  for (const p of personas) {
    const nuevoCodigo = generarCodigo(codigos);
    codigos.push(nuevoCodigo);
    alumnosDB.push({
      codigo: nuevoCodigo,
      apellidos: p.apellidos,
      nombres: p.nombres,
      edad: p.edad
    });
  }

  // Escenario 1: Alumno 0 sin matrículas
  // (No se le agregan matrículas a codigos[0])

  // Escenario 2: Alumno 1 matriculado en 2 cursos sin ninguna nota (prácticas en null)
  matriculasDB.push(
    { codigoAlumno: codigos[1], codigoCurso: '101', notas: [null, null, null, null] },
    { codigoAlumno: codigos[1], codigoCurso: '102', notas: [null, null, null, null] }
  );

  // Escenario 3: Alumno 2 con notas parciales (2 prácticas)
  matriculasDB.push(
    { codigoAlumno: codigos[2], codigoCurso: '101', notas: [14, 15, null, null] }
  );

  // Escenario 4: Alumno 3 con notas parciales en 2 cursos (1 práctica y 3 prácticas)
  matriculasDB.push(
    { codigoAlumno: codigos[3], codigoCurso: '102', notas: [13, null, null, null] },
    { codigoAlumno: codigos[3], codigoCurso: '103', notas: [16, 17, 18, null] }
  );

  // Escenario 5: Alumno 4 con 4 notas completas en 2 cursos - APROBADO
  matriculasDB.push(
    { codigoAlumno: codigos[4], codigoCurso: '101', notas: [15, 16, 17, 18] },
    { codigoAlumno: codigos[4], codigoCurso: '104', notas: [14, 15, 13, 16] }
  );

  // Escenario 6: Alumno 5 con 4 notas completas en 2 cursos - DESAPROBADO
  matriculasDB.push(
    { codigoAlumno: codigos[5], codigoCurso: '101', notas: [8, 9, 7, 10] },
    { codigoAlumno: codigos[5], codigoCurso: '103', notas: [6, 8, 9, 7] }
  );

  // Salida en consola informativa para pruebas de desarrollo
  console.log('\n======================================================');
  console.log('🎓 SISTEMA ACADÉMICO UNFV - DATOS DE PRUEBA CARGADOS');
  console.log('======================================================');
  console.log('Acceso Secretario:');
  console.log('  Usuario: 100');
  console.log('  Clave:   123\n');
  console.log('Accesos Alumnos (Iniciar sesión con el código):');
  console.log(`  1. [${codigos[0]}] ${personas[0].apellidos}, ${personas[0].nombres} (Sin matrículas)`);
  console.log(`  2. [${codigos[1]}] ${personas[1].apellidos}, ${personas[1].nombres} (2 cursos, sin notas)`);
  console.log(`  3. [${codigos[2]}] ${personas[2].apellidos}, ${personas[2].nombres} (Parcial: 2 prácticas)`);
  console.log(`  4. [${codigos[3]}] ${personas[3].apellidos}, ${personas[3].nombres} (Parcial: 1 y 3 prácticas)`);
  console.log(`  5. [${codigos[4]}] ${personas[4].apellidos}, ${personas[4].nombres} (Completo: APROBADO)`);
  console.log(`  6. [${codigos[5]}] ${personas[5].apellidos}, ${personas[5].nombres} (Completo: DESAPROBADO)`);
  console.log('======================================================\n');
}
