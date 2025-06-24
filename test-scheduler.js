/**
 * Script para probar el scheduler automático creando partidos con fechas pasadas
 */
import { PartidoService } from './dist/services/partido/PartidoService.js';
import dbPromise from './dist/models/index.js';

async function probarScheduler() {
  console.log('🧪 === PRUEBA DEL SCHEDULER AUTOMÁTICO ===\n');

  try {
    const db = await dbPromise;
    const Usuario = db.Usuario;
    const Zona = db.Zona;
    const Deporte = db.Deporte;

    // 1. Obtener datos básicos
    console.log('📋 Paso 1: Obteniendo datos básicos...');
    
    const zona = await Zona.findOne();
    const deporte = await Deporte.findOne();
    const organizador = await Usuario.findOne();

    if (!zona || !deporte || !organizador) {
      console.log('❌ No hay suficientes datos en la base para la prueba');
      return;
    }

    console.log(`✅ Datos obtenidos - Organizador: ${organizador.nombre}\n`);

    // 2. Crear partido que ya pasó su fecha (para cancelación automática)
    console.log('📋 Paso 2: Creando partido que ya pasó su fecha...');
    
    const fechaPasada = new Date();
    fechaPasada.setDate(fechaPasada.getDate() - 2); // 2 días atrás

    const partidoPasado = {
      deporteId: deporte.id,
      zonaId: zona.id,
      organizadorId: organizador.id,
      fecha: fechaPasada.toISOString().split('T')[0],
      hora: '18:00',
      duracion: 2,
      direccion: 'Cancha de Prueba - Scheduler (Pasado)',
      cantidadJugadores: 4,
      nivelMinimo: 1,
      nivelMaximo: 3,
      tipoEmparejamiento: 'ZONA'
    };

    const partidoCreado1 = await PartidoService.crearPartido(partidoPasado);
    console.log(`✅ Partido pasado creado: ${partidoCreado1.id} (Estado: ${partidoCreado1.estado})`);

    // 3. Crear partido confirmado que debería iniciarse ahora
    console.log('\n📋 Paso 3: Creando partido confirmado para iniciar...');
    
    const horaInicio = new Date();
    horaInicio.setMinutes(horaInicio.getMinutes() - 10); // 10 minutos atrás

    const partidoParaIniciar = {
      deporteId: deporte.id,
      zonaId: zona.id,
      organizadorId: organizador.id,
      fecha: horaInicio.toISOString().split('T')[0],
      hora: `${horaInicio.getHours().toString().padStart(2, '0')}:${horaInicio.getMinutes().toString().padStart(2, '0')}`,
      duracion: 2,
      direccion: 'Cancha de Prueba - Scheduler (Para Iniciar)',
      cantidadJugadores: 4,
      nivelMinimo: 1,
      nivelMaximo: 3,
      tipoEmparejamiento: 'ZONA'
    };

    const partidoCreado2 = await PartidoService.crearPartido(partidoParaIniciar);
    // Cambiar manualmente a CONFIRMADO
    await PartidoService.actualizarEstadoPartido(partidoCreado2.id, 'CONFIRMADO');
    console.log(`✅ Partido confirmado creado: ${partidoCreado2.id} (Estado: CONFIRMADO)`);

    // 4. Crear partido en juego que debería finalizarse
    console.log('\n📋 Paso 4: Creando partido en juego para finalizar...');
    
    const horaJuego = new Date();
    horaJuego.setHours(horaJuego.getHours() - 4); // 4 horas atrás

    const partidoEnJuego = {
      deporteId: deporte.id,
      zonaId: zona.id,
      organizadorId: organizador.id,
      fecha: horaJuego.toISOString().split('T')[0],
      hora: `${horaJuego.getHours().toString().padStart(2, '0')}:${horaJuego.getMinutes().toString().padStart(2, '0')}`,
      duracion: 2,
      direccion: 'Cancha de Prueba - Scheduler (En Juego)',
      cantidadJugadores: 4,
      nivelMinimo: 1,
      nivelMaximo: 3,
      tipoEmparejamiento: 'ZONA'
    };

    const partidoCreado3 = await PartidoService.crearPartido(partidoEnJuego);
    // Cambiar manualmente a EN_JUEGO
    await PartidoService.actualizarEstadoPartido(partidoCreado3.id, 'EN_JUEGO');
    console.log(`✅ Partido en juego creado: ${partidoCreado3.id} (Estado: EN_JUEGO)`);

    console.log('\n🕐 === PARTIDOS CREADOS PARA PRUEBA DEL SCHEDULER ===');
    console.log(`📅 Partido pasado (NECESITAMOS_JUGADORES): ${partidoCreado1.id}`);
    console.log(`⏰ Partido para iniciar (CONFIRMADO): ${partidoCreado2.id}`);
    console.log(`🏃 Partido para finalizar (EN_JUEGO): ${partidoCreado3.id}`);
    console.log('\n⏱️  El scheduler ejecutará automáticamente cada 5 minutos...');
    console.log('🔍 Observa los logs del servidor para ver las actualizaciones automáticas!');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }

  process.exit(0);
}

probarScheduler();
