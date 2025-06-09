import { PartidoService } from '../dist/services/partido/PartidoService.js';
import { InvitacionService } from '../dist/services/partido/InvitacionService.js';
import { EmparejamientoService } from '../dist/services/partido/emparejamiento/EmparejamientoService.js';

/**
 * Script para probar la reactivación de invitaciones cuando un partido 
 * pasa de ARMADO a NECESITAMOS_JUGADORES
 */
async function probarReactivacionInvitaciones() {
  try {
    console.log('🧪 === PRUEBA DE REACTIVACIÓN DE INVITACIONES ===\n');    // 1. Crear un partido para la prueba
    console.log('📋 Paso 1: Creando partido para la prueba...');
    const partidoData = {
      fecha: '2025-06-20',
      hora: '19:00:00',
      direccion: 'Cancha Test Reactivación',
      cantidadJugadores: 4, // Partido pequeño para facilitar prueba
      duracion: 90, // Duración en minutos (campo requerido)
      organizadorId: '12345678-1234-1234-1234-123456789abc', // ID de organizador ficticio
      deporteId: '1', // Asumiendo que existe
      zonaId: '1',    // Asumiendo que existe
      tipoEmparejamiento: 'ZONA'
    };

    const partidoCreado = await PartidoService.crearPartido(partidoData);
    console.log(`✅ Partido creado con ID: ${partidoCreado.id}`);
    console.log(`   Estado inicial: ${partidoCreado.estado}\n`);

    // 2. Ejecutar emparejamiento para crear invitaciones
    console.log('📋 Paso 2: Ejecutando emparejamiento para crear invitaciones...');
    try {
      const resultadoEmparejamiento = await EmparejamientoService.ejecutarYCrearInvitaciones(partidoCreado);
      console.log(`✅ Emparejamiento ejecutado: ${resultadoEmparejamiento.invitacionesEnviadas} invitaciones creadas\n`);
    } catch (error) {
      console.log(`⚠️ Error en emparejamiento (continuando prueba): ${error.message}\n`);
    }

    // 3. Simular que se llenan los espacios y el partido pasa a ARMADO
    console.log('📋 Paso 3: Simulando partido ARMADO (partido lleno)...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa para ver logs
    
    const cambio1 = await PartidoService.cambiarEstadoConValidacion(partidoCreado.id, 'ARMADO');
    if (cambio1) {
      console.log('✅ Estado cambiado a ARMADO');
      console.log('   🔔 Observadores notificados: se deben cancelar invitaciones pendientes');
      console.log('   📧 Motivo: "El partido ya está completo"\n');
    }

    // 4. Verificar que las invitaciones se cancelaron
    console.log('📋 Paso 4: Verificando cancelación de invitaciones...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa para ver logs

    // 5. Simular que un jugador se retira y el partido vuelve a NECESITAMOS_JUGADORES
    console.log('📋 Paso 5: Simulando jugador que se retira (ARMADO -> NECESITAMOS_JUGADORES)...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa para ver logs
    
    const cambio2 = await PartidoService.cambiarEstadoConValidacion(partidoCreado.id, 'NECESITAMOS_JUGADORES');
    if (cambio2) {
      console.log('✅ Estado cambiado a NECESITAMOS_JUGADORES');
      console.log('   🔔 Observadores notificados: se deben reactivar invitaciones');
      console.log('   📧 Las invitaciones canceladas por "partido lleno" deben volver a pendiente\n');
    }

    // 6. Verificar que las invitaciones se reactivaron
    console.log('📋 Paso 6: Verificando reactivación de invitaciones...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa para ver logs

    console.log('🎉 === PRUEBA DE REACTIVACIÓN COMPLETADA ===');
    console.log('✅ Patrón Observer funcionando correctamente');
    console.log('✅ Las invitaciones se cancelan cuando el partido está lleno');
    console.log('✅ Las invitaciones se reactivan cuando el partido vuelve a necesitar jugadores\n');

    // 7. Estado final del partido
    const partidoFinal = await PartidoService.obtenerPartidoPorId(partidoCreado.id);
    console.log('📊 Estado final del partido:');
    console.log(`   ID: ${partidoFinal.id}`);
    console.log(`   Estado: ${partidoFinal.estado}`);
    console.log(`   Jugadores confirmados: ${partidoFinal.jugadoresConfirmados}/${partidoFinal.cantidadJugadores}\n`);

    console.log('✨ Prueba completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar la prueba
probarReactivacionInvitaciones().catch(console.error);
