#!/usr/bin/env node

/**
 * Script de verificación de la implementación correcta del patrón State
 * Verifica que no haya usos directos de actualizarEstadoPartido desde fuera del PartidoService
 * y que se usen los métodos correctos del patrón State
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando implementación del patrón State...\n');

// Directorio base del proyecto
const baseDir = path.join(__dirname, '../src');

// Función para buscar en archivos
function searchInFile(filePath, searchPattern, excludeFile = null) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const matches = [];
        
        // Si es el archivo excluido, no buscar
        if (excludeFile && filePath.includes(excludeFile)) {
            return matches;
        }
        
        lines.forEach((line, index) => {
            if (line.includes(searchPattern)) {
                matches.push({
                    file: filePath,
                    line: index + 1,
                    content: line.trim()
                });
            }
        });
        
        return matches;
    } catch (error) {
        return [];
    }
}

// Función para buscar recursivamente en directorios
function searchInDirectory(dir, searchPattern, excludeFile = null) {
    let allMatches = [];
    
    try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isDirectory()) {
                allMatches = allMatches.concat(searchInDirectory(itemPath, searchPattern, excludeFile));
            } else if (item.endsWith('.ts') || item.endsWith('.js')) {
                allMatches = allMatches.concat(searchInFile(itemPath, searchPattern, excludeFile));
            }
        }
    } catch (error) {
        console.error('Error leyendo directorio:', error.message);
    }
    
    return allMatches;
}

// 1. Verificar que no hay llamadas directas a actualizarEstadoPartido desde fuera
console.log('1️⃣ Verificando llamadas directas a actualizarEstadoPartido...');
const directCalls = searchInDirectory(baseDir, 'actualizarEstadoPartido', 'PartidoService.ts');

if (directCalls.length > 0) {
    console.log('❌ Se encontraron llamadas directas a actualizarEstadoPartido desde fuera del PartidoService:');
    directCalls.forEach(match => {
        console.log(`   📁 ${match.file}:${match.line} - ${match.content}`);
    });
    console.log('   💡 Estas llamadas deberían usar cambiarEstadoConValidacion() o finalizarPartido()\n');
} else {
    console.log('✅ No se encontraron llamadas directas incorrectas a actualizarEstadoPartido\n');
}

// 2. Verificar uso de métodos del patrón State
console.log('2️⃣ Verificando uso de métodos del patrón State...');
const stateMethodCalls = searchInDirectory(baseDir, 'cambiarEstadoConValidacion');
const finalizarCalls = searchInDirectory(baseDir, 'finalizarPartido');

console.log(`✅ Encontradas ${stateMethodCalls.length} llamadas a cambiarEstadoConValidacion()`);
console.log(`✅ Encontradas ${finalizarCalls.length} llamadas a finalizarPartido()\n`);

// 3. Verificar que los estados usen actualizarEstadoEnBD
console.log('3️⃣ Verificando que los estados usen actualizarEstadoEnBD...');
const estadosDir = path.join(baseDir, 'services/partido/estados');
const estadosMethodCalls = searchInDirectory(estadosDir, 'actualizarEstadoEnBD');

if (estadosMethodCalls.length > 0) {
    console.log('✅ Los estados usan correctamente actualizarEstadoEnBD():');
    estadosMethodCalls.forEach(match => {
        console.log(`   📁 ${path.basename(match.file)}:${match.line}`);
    });
    console.log('');
} else {
    console.log('⚠️  No se encontraron llamadas a actualizarEstadoEnBD en los estados\n');
}

// 4. Verificar implementación en controladores
console.log('4️⃣ Verificando controladores...');
const controllerStateUsage = searchInDirectory(
    path.join(baseDir, 'controllers'), 
    'cambiarEstadoConValidacion'
);

if (controllerStateUsage.length > 0) {
    console.log('✅ Los controladores usan métodos del patrón State:');
    controllerStateUsage.forEach(match => {
        console.log(`   📁 ${path.basename(match.file)}:${match.line}`);
    });
    console.log('');
} else {
    console.log('⚠️  Los controladores no usan métodos del patrón State\n');
}

// 5. Verificar implementación en scheduler
console.log('5️⃣ Verificando scheduler...');
const schedulerStateUsage = searchInDirectory(
    path.join(baseDir, 'services/scheduler'), 
    'cambiarEstadoConValidacion'
);
const schedulerFinalizarUsage = searchInDirectory(
    path.join(baseDir, 'services/scheduler'), 
    'finalizarPartido'
);

console.log(`✅ Scheduler usa cambiarEstadoConValidacion: ${schedulerStateUsage.length} veces`);
console.log(`✅ Scheduler usa finalizarPartido: ${schedulerFinalizarUsage.length} veces\n`);

// Resumen final
console.log('📋 RESUMEN DE VERIFICACIÓN:');
console.log('═══════════════════════════');

if (directCalls.length === 0) {
    console.log('✅ Patrón State correctamente implementado - no hay bypass');
} else {
    console.log('❌ Hay llamadas directas que bypasean el patrón State');
}

if (stateMethodCalls.length > 0 && finalizarCalls.length > 0) {
    console.log('✅ Se usan métodos del patrón State en la aplicación');
} else {
    console.log('⚠️  Uso limitado de métodos del patrón State');
}

if (estadosMethodCalls.length > 0) {
    console.log('✅ Los estados usan la API correcta para actualizar BD');
} else {
    console.log('⚠️  Los estados no usan la API recomendada');
}

console.log('\n🎉 Verificación completada!');

// Si hay problemas, salir con código de error
if (directCalls.length > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
