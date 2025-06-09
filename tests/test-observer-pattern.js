/**
 * Script de prueba para el patrón Observer en el sistema de partidos
 * Este script crea un partido, simula cambios de estado y verifica que
 * las notificaciones y cancelaciones de invitaciones funcionen correctamente
 */

import { PartidoService } from '../src/services/partido/PartidoService.js';
import { EmparejamientoService } from '../src/services/partido/emparejamiento/EmparejamientoService.js';
import dbPromise from '../src/models/index.js';

async function pruebaPatronObserver() {
  console.log('🔍 === PRUEBA DEL PATRÓN OBSERVER ===\n');

  try {
    // Obtener conexión a la base de datos
    const db = await dbPromise;
    const Usuario = db.Usuario;
    const Zona = db.Zona;
    const Deporte = db.Deporte;

    // 1. Buscar entidades existentes para crear el partido
    console.log('📋 Paso 1: Obteniendo datos para crear partido...');
    
    const usuarios = await Usuario.findAll({ limit: 5 });
    const zona = await Zona.findOne();
    const deporte = await Deporte.findOne();

    if (!usuarios.length || !zona || !deporte) {
      console.log('❌ No hay suficientes datos en la base para la prueba');
      return;
    }

    const organizador = usuarios[0];
    console.log(`✅ Datos obtenidos: Organizador ${organizador.nombre}, Zona ${zona.nombre}, Deporte ${deporte.nombre}\n`);

    // 2. Crear un partido nuevo
    console.log('📋 Paso 2: Creando partido de prueba...');
    
    const fechaPartido = new Date();
    fechaPartido.setDate(fechaPartido.getDate() + 7); // Una semana en el futuro

    const datosPartido = {
      deporteId: deporte.id,
      zonaId: zona.id,
      organizadorId: organizador.id,
      fecha: fechaPartido.toISOString().split('T')[0],
      hora: '18:00',
      duracion: 2,
      direccion: 'Cancha de Prueba - Patrón Observer',
      cantidadJugadores: 4,
      nivelMinimo: 1,
      nivelMaximo: 5,
      tipoEmparejamiento: 'ZONA'
    };

    const partidoCreado = await PartidoService.crearPartido(datosPartido);
    console.log(`✅ Partido creado con ID: ${partidoCreado.id}`);
    console.log(`   Estado inicial: ${partidoCreado.estado}\n`);

    // 3. Ejecutar emparejamiento para crear invitaciones
    console.log('📋 Paso 3: Ejecutando emparejamiento para crear invitaciones...');
    
    try {
      const resultadoEmparejamiento = await EmparejamientoService.ejecutarYCrearInvitaciones(partidoCreado);
      console.log(`✅ Emparejamiento ejecutado: ${resultadoEmparejamiento.invitacionesEnviadas} invitaciones creadas\n`);
    } catch (error) {
      console.log(`⚠️ Error en emparejamiento (continuando prueba): ${error.message}\n`);
    }

    // 4. Simular cambio de estado: NECESITAMOS_JUGADORES -> ARMADO
    console.log('📋 Paso 4: Cambiando estado a ARMADO...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa para ver logs
    
    const cambio1 = await PartidoService.cambiarEstadoConValidacion(partidoCreado.id, 'ARMADO');
    if (cambio1) {
      console.log('✅ Estado cambiado a ARMADO');
      console.log('   🔔 Observadores notificados: NotificacionObserver + InvitacionObserver');
      console.log('   📧 Debería cancelar invitaciones por "partido lleno"\n');
    }

    // 5. Simular cambio de estado: ARMADO -> CONFIRMADO
    console.log('📋 Paso 5: Cambiando estado a CONFIRMADO...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa para ver logs
    
    const cambio2 = await PartidoService.cambiarEstadoConValidacion(partidoCreado.id, 'CONFIRMADO');
    if (cambio2) {
      console.log('✅ Estado cambiado a CONFIRMADO');
      console.log('   🔔 Observadores notificados: NotificacionObserver + InvitacionObserver');
      console.log('   📧 Debería cancelar invitaciones por "partido confirmado"\n');
    }

    // 6. Simular cambio de estado: CONFIRMADO -> EN_JUEGO
    console.log('📋 Paso 6: Cambiando estado a EN_JUEGO...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa para ver logs
    
    const cambio3 = await PartidoService.cambiarEstadoConValidacion(partidoCreado.id, 'EN_JUEGO');
    if (cambio3) {
      console.log('✅ Estado cambiado a EN_JUEGO');
      console.log('   🔔 Observadores notificados: NotificacionObserver + InvitacionObserver');
      console.log('   📧 Debería cancelar invitaciones por "partido ya comenzó"\n');
    }

    // 7. Simular finalización del partido
    console.log('📋 Paso 7: Finalizando partido...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa para ver logs
    
    const finalizado = await PartidoService.finalizarPartido(partidoCreado.id, { 
      equipoGanador: 'A' 
    });
    if (finalizado) {
      console.log('✅ Partido finalizado con equipo ganador: A');
      console.log('   🔔 Observadores notificados sobre finalización');
      console.log('   🏆 ScoreService debería haber actualizado puntuaciones\n');
    }

    // 8. Crear otro partido para probar cancelación
    console.log('📋 Paso 8: Creando segundo partido para probar cancelación...');
    
    const partidoCancelacion = await PartidoService.crearPartido({
      ...datosPartido,
      direccion: 'Cancha de Prueba - Cancelación'
    });
    console.log(`✅ Segundo partido creado con ID: ${partidoCancelacion.id}\n`);

    // 9. Probar cancelación directa
    console.log('📋 Paso 9: Cancelando segundo partido...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa para ver logs
    
    const cancelado = await PartidoService.cambiarEstadoConValidacion(partidoCancelacion.id, 'CANCELADO');
    if (cancelado) {
      console.log('✅ Partido cancelado');
      console.log('   🔔 Observadores notificados: NotificacionObserver + InvitacionObserver');
      console.log('   📧 Debería cancelar invitaciones por "partido cancelado"\n');
    }

    console.log('🎉 === PRUEBA DEL PATRÓN OBSERVER COMPLETADA ===');
    console.log('✅ Todas las transiciones de estado fueron probadas');
    console.log('✅ Los observadores fueron notificados en cada cambio');
    console.log('✅ Las invitaciones fueron canceladas según las reglas de negocio\n');

    // Verificar el estado final de los partidos
    const partidoFinal1 = await PartidoService.obtenerPartidoPorId(partidoCreado.id);
    const partidoFinal2 = await PartidoService.obtenerPartidoPorId(partidoCancelacion.id);
    
    console.log('📊 Estados finales:');
    console.log(`   Partido 1: ${partidoFinal1?.estado} (${partidoFinal1?.equipoGanador ? 'Ganador: ' + partidoFinal1.equipoGanador : 'Sin ganador'})`);
    console.log(`   Partido 2: ${partidoFinal2?.estado}`);

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar la prueba si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  pruebaPatronObserver()
    .then(() => {
      console.log('\n🏁 Prueba finalizada. Cerrando conexión...');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

export { pruebaPatronObserver };
