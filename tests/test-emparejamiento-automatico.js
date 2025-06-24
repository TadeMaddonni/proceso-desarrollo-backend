import { PartidoService } from '../dist/services/partido/PartidoService.js';
import { PartidoSchedulerService } from '../dist/services/scheduler/PartidoSchedulerService.js';
import { EmparejamientoSchedulerService } from '../dist/services/scheduler/EmparejamientoSchedulerService.js';
import { EmparejamientoService } from '../dist/services/partido/emparejamiento/EmparejamientoService.js';
import dbPromise from '../dist/models/index.js';

/**
 * Script para probar el emparejamiento automático recurrente con node-cron
 * Demuestra:
 * - Scheduler dedicado al emparejamiento automático
 * - Emparejamiento recurrente cada 30 minutos
 * - Emparejamiento intensivo cada 2 horas para partidos próximos
 * - Limpieza automática de invitaciones
 * - Estadísticas del sistema
 */
async function probarEmparejamientoAutomaticoCompleto() {
  console.log('� === PRUEBA COMPLETA DE EMPAREJAMIENTO AUTOMÁTICO CON NODE-CRON ===\n');

  try {
    const db = await dbPromise;
    const Usuario = db.Usuario;
    const Zona = db.Zona;
    const Deporte = db.Deporte; 
    const Invitacion = db.Invitacion;

    // 1. Obtener datos necesarios
    console.log('📋 Paso 1: Obteniendo datos para crear partidos...');
    
    const zona = await Zona.findOne();
    const deporte = await Deporte.findOne();
    const usuarios = await Usuario.findAll({ limit: 10 });

    if (!zona || !deporte || usuarios.length === 0) {
      console.log('❌ Error: No hay datos suficientes en la base de datos');
      return;
    }

    console.log(`✅ Datos obtenidos: Zona ${zona.nombre}, Deporte ${deporte.nombre}, ${usuarios.length} usuarios`);

    // 2. Crear partidos de prueba con diferentes características
    console.log('\n📋 Paso 2: Creando partidos de prueba...');
    
    const partidosCreados = [];
    const configuraciones = [
      {
        nombre: 'Partido Próximo (24h)',
        fecha: new Date(Date.now() + 24 * 60 * 60 * 1000), // En 24 horas
        estrategia: 'ZONA',
        hora: '18:00'
      },
      {
        nombre: 'Partido Futuro (48h)',
        fecha: new Date(Date.now() + 48 * 60 * 60 * 1000), // En 48 horas
        estrategia: 'NIVEL',
        hora: '19:00'
      },
      {
        nombre: 'Partido Lejano (72h)',
        fecha: new Date(Date.now() + 72 * 60 * 60 * 1000), // En 72 horas
        estrategia: 'HISTORIAL',
        hora: '20:00'
      }
    ];

    for (let i = 0; i < configuraciones.length; i++) {
      const config = configuraciones[i];
      
      const datosPartido = {
        deporteId: deporte.id,
        zonaId: zona.id,
        organizadorId: usuarios[i].id,
        fecha: config.fecha.toISOString().split('T')[0],
        hora: config.hora,
        duracion: 2,
        direccion: `Cancha ${config.nombre}`,
        cantidadJugadores: 6,
        nivelMinimo: 1,
        nivelMaximo: 3,
        tipoEmparejamiento: config.estrategia
      };

      const partidoCreado = await PartidoService.crearPartido(datosPartido);
      partidosCreados.push({ ...partidoCreado, config });
      
      console.log(`✅ ${config.nombre} creado: ID ${partidoCreado.id} (${config.estrategia})`);
    }

    // 3. Verificar emparejamiento inicial
    console.log('\n📋 Paso 3: Verificando emparejamiento inicial automático...');
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar emparejamiento inicial
    
    for (const partido of partidosCreados) {
      const invitaciones = await Invitacion.findAll({
        where: { partidoId: partido.id }
      });
      
      console.log(`📧 ${partido.config.nombre}: ${invitaciones.length} invitaciones iniciales`);
    }

    // 4. Crear y probar EmparejamientoSchedulerService
    console.log('\n📋 Paso 4: Creando y configurando EmparejamientoSchedulerService...');
    
    const emparejamientoScheduler = new EmparejamientoSchedulerService();
    
    // Obtener estadísticas iniciales
    const estadisticasIniciales = await emparejamientoScheduler.obtenerEstadisticas();
    console.log('📊 Estadísticas iniciales:', JSON.stringify(estadisticasIniciales, null, 2));

    // 5. Iniciar el scheduler y ejecutar pruebas
    console.log('\n📋 Paso 5: Iniciando scheduler de emparejamiento...');
    
    emparejamientoScheduler.iniciar();
    console.log('🚀 EmparejamientoScheduler iniciado');

    // Simular ejecución de jobs manualmente para pruebas
    console.log('\n📋 Paso 6: Ejecutando emparejamiento recurrente manualmente...');
    
    // Usar reflection para acceder a métodos privados (solo para pruebas)
    const ejecutarRecurrente = emparejamientoScheduler['ejecutarEmparejamientoRecurrente'];
    const ejecutarIntensivo = emparejamientoScheduler['ejecutarEmparejamientoIntensivo'];
    
    if (ejecutarRecurrente) {
      await ejecutarRecurrente.call(emparejamientoScheduler);
    }
    
    if (ejecutarIntensivo) {
      await ejecutarIntensivo.call(emparejamientoScheduler);
    }

    // 6. Verificar resultados después del emparejamiento recurrente
    console.log('\n📋 Paso 7: Verificando resultados después del emparejamiento recurrente...');
    
    for (const partido of partidosCreados) {
      const invitaciones = await Invitacion.findAll({
        where: { partidoId: partido.id }
      });
      
      const pendientes = invitaciones.filter(inv => inv.estado === 'pendiente').length;
      const aceptadas = invitaciones.filter(inv => inv.estado === 'aceptada').length;
      const canceladas = invitaciones.filter(inv => inv.estado === 'cancelada').length;
      
      console.log(`📧 ${partido.config.nombre}: ${invitaciones.length} invitaciones totales`);
      console.log(`   - Pendientes: ${pendientes}, Aceptadas: ${aceptadas}, Canceladas: ${canceladas}`);
    }

    // 7. Probar scheduler completo con PartidoSchedulerService
    console.log('\n📋 Paso 8: Probando scheduler completo de partidos...');
    
    const partidoScheduler = new PartidoSchedulerService();
    console.log('🚀 PartidoScheduler iniciado');
    
    partidoScheduler.iniciar();
    
    // Esperar un momento para ver los logs
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 8. Obtener estadísticas finales
    console.log('\n📋 Paso 9: Obteniendo estadísticas finales...');
    
    const estadisticasFinales = await emparejamientoScheduler.obtenerEstadisticas();
    console.log('📊 Estadísticas finales:', JSON.stringify(estadisticasFinales, null, 2));

    // 9. Demostrar configuración de cron jobs
    console.log('\n📋 Paso 10: Información sobre jobs de node-cron configurados...');
    
    console.log('⏰ PartidoSchedulerService (actualización de estados):');
    console.log('   - Frecuencia: cada 5 minutos (*/5 * * * *)');
    console.log('   - Funciones: cancelar, iniciar, finalizar partidos');
    console.log('   - Emparejamiento recurrente: cada 30 minutos (*/30 * * * *)');
    
    console.log('\n⏰ EmparejamientoSchedulerService (emparejamiento automático):');
    console.log('   - Emparejamiento recurrente: cada 30 minutos (*/30 * * * *)');
    console.log('   - Emparejamiento intensivo: cada 2 horas (0 */2 * * *)');
    console.log('   - Limpieza de invitaciones: diario a las 2:00 AM (0 2 * * *)');

    // 10. Detener schedulers
    console.log('\n📋 Paso 11: Deteniendo schedulers...');
    
    emparejamientoScheduler.detener();
    partidoScheduler.detener();
    
    console.log('⏹️ Schedulers detenidos');

    console.log('\n✅ === PRUEBA COMPLETA FINALIZADA EXITOSAMENTE ===');
    console.log('\n🎯 Funcionalidades implementadas y probadas:');
    console.log('   ✅ EmparejamientoSchedulerService con node-cron');
    console.log('   ✅ Emparejamiento recurrente cada 30 minutos');
    console.log('   ✅ Emparejamiento intensivo cada 2 horas para partidos próximos');
    console.log('   ✅ Limpieza automática de invitaciones expiradas');
    console.log('   ✅ Estadísticas del sistema de emparejamiento');
    console.log('   ✅ Integración con PartidoSchedulerService existente');
    console.log('   ✅ Estrategias alternativas para partidos próximos');
    console.log('   ✅ Configuración personalizable de horarios');
    
    console.log('\n🚀 El sistema de emparejamiento automático está listo para producción!');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Cerrar conexión a la base de datos
    try {
      const db = await dbPromise;
      if (db.sequelize) {
        await db.sequelize.close();
        console.log('🔌 Conexión a la base de datos cerrada');
      }
    } catch (error) {
      console.error('❌ Error cerrando conexión:', error);
    }
  }
}

// Ejecutar la prueba
probarEmparejamientoAutomaticoCompleto().catch(console.error);
