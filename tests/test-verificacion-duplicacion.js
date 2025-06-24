/**
 * Script de verificación de duplicación de lógica entre EstadoFactory y PartidoService
 * Verifica que no haya lógica redundante entre ambos archivos
 */

const fs = require('fs');
const path = require('path');

// Rutas de los archivos principales
const estadoFactoryPath = path.join(__dirname, '..', 'src', 'services', 'partido', 'estados', 'EstadoFactory.ts');
const partidoServicePath = path.join(__dirname, '..', 'src', 'services', 'partido', 'PartidoService.ts');

function leerArchivo(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`❌ Error al leer archivo ${filePath}:`, error.message);
    return null;
  }
}

function verificarLogicaDuplicada() {
  console.log('🔍 Verificando duplicación de lógica entre EstadoFactory y PartidoService...\n');
  
  const estadoFactoryContent = leerArchivo(estadoFactoryPath);
  const partidoServiceContent = leerArchivo(partidoServicePath);
  
  if (!estadoFactoryContent || !partidoServiceContent) {
    return false;
  }

  const checks = [];

  // 1. Verificar que solo EstadoFactory tiene la validación de transiciones
  console.log('1️⃣ Verificando validación de transiciones...');
  const partidoServiceTieneValidacionTransiciones = partidoServiceContent.includes('transicionesValidas');
  if (partidoServiceTieneValidacionTransiciones) {
    checks.push({
      name: 'Validación de transiciones duplicada',
      status: 'ERROR',
      details: 'PartidoService tiene lógica de validación de transiciones que debería estar solo en EstadoFactory'
    });
  } else {
    checks.push({
      name: 'Validación de transiciones',
      status: 'OK',
      details: 'Solo EstadoFactory contiene la lógica de validación de transiciones'
    });
  }

  // 2. Verificar que PartidoService delega en EstadoFactory para validaciones
  console.log('2️⃣ Verificando delegación a EstadoFactory...');
  const usaEsTransicionValida = partidoServiceContent.includes('EstadoFactory.esTransicionValida');
  if (usaEsTransicionValida) {
    checks.push({
      name: 'Delegación a EstadoFactory',
      status: 'OK',
      details: 'PartidoService usa EstadoFactory.esTransicionValida correctamente'
    });
  } else {
    checks.push({
      name: 'Delegación a EstadoFactory',
      status: 'WARNING',
      details: 'PartidoService no parece usar EstadoFactory.esTransicionValida'
    });
  }

  // 3. Verificar que no hay comparaciones hardcodeadas de estados finales
  console.log('3️⃣ Verificando comparaciones hardcodeadas...');
  const comparacionesHardcodeadas = [
    /estado.*!==.*['"]FINALIZADO['"].*&&.*estado.*!==.*['"]CANCELADO['"]/.test(partidoServiceContent),
    /estado.*===.*['"]FINALIZADO['"].*\|\|.*estado.*===.*['"]CANCELADO['"]/.test(partidoServiceContent)
  ];
  
  if (comparacionesHardcodeadas.some(found => found)) {
    checks.push({
      name: 'Comparaciones hardcodeadas de estados finales',
      status: 'WARNING',
      details: 'Se encontraron comparaciones hardcodeadas que podrían usar EstadoFactory.esEstadoFinal'
    });
  } else {
    checks.push({
      name: 'Comparaciones hardcodeadas',
      status: 'OK',
      details: 'No se encontraron comparaciones hardcodeadas problemáticas'
    });
  }

  // 4. Verificar que no hay métodos de validación duplicados
  console.log('4️⃣ Verificando métodos de validación duplicados...');
  const metodosValidacion = ['permiteInvitaciones', 'esTransicionValida', 'obtenerEstadosValidos'];
  let validacionDuplicada = false;
  
  metodosValidacion.forEach(metodo => {
    const enEstadoFactory = estadoFactoryContent.includes(`${metodo}(`);
    const enPartidoService = partidoServiceContent.includes(`${metodo}(`);
    
    if (enEstadoFactory && enPartidoService && metodo !== 'permiteInvitaciones') {
      validacionDuplicada = true;
      checks.push({
        name: `Método ${metodo} duplicado`,
        status: 'ERROR',
        details: `El método ${metodo} está implementado en ambos archivos`
      });
    }
  });

  if (!validacionDuplicada) {
    checks.push({
      name: 'Métodos de validación',
      status: 'OK',
      details: 'No se encontraron métodos de validación duplicados'
    });
  }

  // 5. Verificar uso del método esEstadoFinal si existe
  console.log('5️⃣ Verificando uso de método esEstadoFinal...');
  const tieneEsEstadoFinal = estadoFactoryContent.includes('esEstadoFinal');
  if (tieneEsEstadoFinal) {
    checks.push({
      name: 'Método esEstadoFinal',
      status: 'OK',
      details: 'EstadoFactory tiene método esEstadoFinal para centralizar lógica de estados finales'
    });
  }

  // Mostrar resultados
  console.log('\n📊 RESULTADOS DE LA VERIFICACIÓN:\n');
  
  let errores = 0;
  let warnings = 0;
  
  checks.forEach((check, index) => {
    const icon = check.status === 'OK' ? '✅' : check.status === 'WARNING' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name}: ${check.details}`);
    
    if (check.status === 'ERROR') errores++;
    if (check.status === 'WARNING') warnings++;
  });

  console.log('\n📈 RESUMEN:');
  console.log(`✅ Verificaciones exitosas: ${checks.length - errores - warnings}`);
  if (warnings > 0) console.log(`⚠️ Advertencias: ${warnings}`);
  if (errores > 0) console.log(`❌ Errores: ${errores}`);

  if (errores === 0 && warnings === 0) {
    console.log('\n🎉 ¡Excelente! No se encontró lógica duplicada entre EstadoFactory y PartidoService.');
    console.log('La refactorización del patrón State está correctamente implementada.');
  } else if (errores === 0) {
    console.log('\n✅ No se encontraron errores críticos, pero hay algunas oportunidades de mejora.');
  } else {
    console.log('\n🚨 Se encontraron problemas que deben ser corregidos.');
  }

  return errores === 0;
}

// Ejecutar verificación
if (require.main === module) {
  verificarLogicaDuplicada();
}

module.exports = { verificarLogicaDuplicada };
