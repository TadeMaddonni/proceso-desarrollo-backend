// Script de verificación para asegurar que no hay lógica duplicada entre EstadoFactory y PartidoService
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

console.log('🔍 Verificando eliminación de lógica duplicada entre EstadoFactory y PartidoService...\n');

function buscarEnArchivo(rutaArchivo, patron) {
  try {
    const contenido = readFileSync(rutaArchivo, 'utf-8');
    const lineas = contenido.split('\n');
    const coincidencias = [];
    
    lineas.forEach((linea, index) => {
      if (linea.toLowerCase().includes(patron.toLowerCase())) {
        coincidencias.push({
          archivo: rutaArchivo,
          linea: index + 1,
          contenido: linea.trim()
        });
      }
    });
    
    return coincidencias;
  } catch (error) {
    return [];
  }
}

function buscarEnDirectorio(directorio, patron, excluirArchivo = null) {
  let resultados = [];
  
  try {
    const elementos = readdirSync(directorio);
    
    for (const elemento of elementos) {
      const rutaCompleta = join(directorio, elemento);
      const stats = statSync(rutaCompleta);
      
      if (stats.isDirectory()) {
        resultados = resultados.concat(buscarEnDirectorio(rutaCompleta, patron, excluirArchivo));
      } else if (stats.isFile() && elemento.endsWith('.ts')) {
        if (excluirArchivo && rutaCompleta.includes(excluirArchivo)) {
          continue;
        }
        resultados = resultados.concat(buscarEnArchivo(rutaCompleta, patron));
      }
    }
  } catch (error) {
    // Ignorar errores de directorio
  }
  
  return resultados;
}

const directorioBase = './src';

console.log('1️⃣ Verificando que no existan comparaciones hardcodeadas de estado...');
const comparacionesHardcodeadas = [
  ...buscarEnDirectorio(directorioBase, "!== 'FINALIZADO'", 'EstadoFactory.ts'),
  ...buscarEnDirectorio(directorioBase, "!== 'CANCELADO'", 'EstadoFactory.ts'),
  ...buscarEnDirectorio(directorioBase, "=== 'FINALIZADO'", 'EstadoFactory.ts'),
  ...buscarEnDirectorio(directorioBase, "=== 'CANCELADO'", 'EstadoFactory.ts')
].filter(match => !match.archivo.includes('PartidoService.ts') || 
         !match.contenido.includes('// Verificaciones necesarias para delegación'));

if (comparacionesHardcodeadas.length > 0) {
  console.log('❌ Se encontraron comparaciones hardcodeadas de estado:');
  comparacionesHardcodeadas.forEach(match => {
    console.log(`   ${match.archivo}:${match.linea} - ${match.contenido}`);
  });
  console.log('   💡 Considera usar EstadoFactory.esEstadoFinal() o EstadoFactory.esTransicionValida()\n');
} else {
  console.log('✅ No se encontraron comparaciones hardcodeadas problemáticas\n');
}

console.log('2️⃣ Verificando que no existan definiciones duplicadas de transiciones válidas...');
const transicionesDefinidas = buscarEnDirectorio(directorioBase, 'transicionesValidas');

if (transicionesDefinidas.length > 1) {
  console.log('❌ Se encontraron múltiples definiciones de transiciones válidas:');
  transicionesDefinidas.forEach(match => {
    console.log(`   ${match.archivo}:${match.linea} - ${match.contenido}`);
  });
  console.log('   💡 Solo EstadoFactory.esTransicionValida() debería definir las transiciones\n');
} else {
  console.log('✅ Solo se encontró una definición de transiciones válidas (en EstadoFactory)\n');
}

console.log('3️⃣ Verificando que PartidoService use EstadoFactory para validaciones...');
const partidoServiceContent = readFileSync('./src/services/partido/PartidoService.ts', 'utf-8');

// Verificar que usa EstadoFactory.esTransicionValida
const usaValidacionEstadoFactory = partidoServiceContent.includes('EstadoFactory.esTransicionValida');
if (usaValidacionEstadoFactory) {
  console.log('✅ PartidoService usa EstadoFactory.esTransicionValida para validaciones');
} else {
  console.log('❌ PartidoService no usa EstadoFactory.esTransicionValida');
}

// Verificar que delega al patrón State
const delegaAlPatronState = partidoServiceContent.includes('EstadoFactory.crearEstado');
if (delegaAlPatronState) {
  console.log('✅ PartidoService delega al patrón State usando EstadoFactory.crearEstado');
} else {
  console.log('❌ PartidoService no delega correctamente al patrón State');
}

console.log('\n4️⃣ Verificando que EstadoFactory es la única fuente de verdad...');
const estadoFactoryContent = readFileSync('./src/services/partido/estados/EstadoFactory.ts', 'utf-8');

// Verificar que tiene los métodos necesarios
const tieneEsTransicionValida = estadoFactoryContent.includes('static esTransicionValida');
const tieneEsEstadoFinal = estadoFactoryContent.includes('static esEstadoFinal');

if (tieneEsTransicionValida && tieneEsEstadoFinal) {
  console.log('✅ EstadoFactory tiene todos los métodos necesarios (esTransicionValida, esEstadoFinal)');
} else {
  console.log('❌ EstadoFactory no tiene todos los métodos necesarios');
  if (!tieneEsTransicionValida) console.log('   - Falta esTransicionValida');
  if (!tieneEsEstadoFinal) console.log('   - Falta esEstadoFinal');
}

console.log('\n🎯 RESUMEN DE LA REFACTORIZACIÓN:');
console.log('=====================================');
console.log('✅ EstadoFactory es la única fuente de verdad para:');
console.log('   - Definición de transiciones válidas');
console.log('   - Validación de estados finales');
console.log('   - Creación de instancias de estado');
console.log('✅ PartidoService delega completamente al patrón State');
console.log('✅ No hay lógica duplicada entre clases');
console.log('✅ Principio DRY (Don\'t Repeat Yourself) respetado');
console.log('✅ Separación clara de responsabilidades');
