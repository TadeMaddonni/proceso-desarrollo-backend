import dbPromise from '../src/models/index.js';
import { PartidoService } from '../src/services/partido/PartidoService.js';

async function testPartidoFinalizacionConScores() {
  try {
    console.log('🧪 Probando finalización de partido con actualización de scores...');
    
    const db = await dbPromise;
    const Usuario = db.Usuario as any;
    const Partido = db.Partido as any;
    const UsuarioPartido = db.UsuarioPartido as any;

    // 1. Obtener usuarios existentes
    const usuarios = await Usuario.findAll({ limit: 4 });
    if (usuarios.length < 4) {
      console.log('❌ No hay suficientes usuarios');
      return;
    }

    // 2. Crear un partido en estado EN_JUEGO
    const partido = await Partido.create({
      deporteId: usuarios[0].deporteId,
      zonaId: usuarios[0].zonaId,
      organizadorId: usuarios[0].id,
      fecha: new Date(),
      hora: '16:00',
      duracion: 2,
      direccion: 'Cancha Test Integración',
      cantidadJugadores: 4,
      estado: 'EN_JUEGO'
    });

    console.log(`✅ Partido creado en estado EN_JUEGO: ${partido.id}`);

    // 3. Agregar usuarios al partido
    await UsuarioPartido.create({
      usuarioId: usuarios[0].id,
      partidoId: partido.id,
      equipo: 'A'
    });

    await UsuarioPartido.create({
      usuarioId: usuarios[1].id,
      partidoId: partido.id,
      equipo: 'A'
    });

    await UsuarioPartido.create({
      usuarioId: usuarios[2].id,
      partidoId: partido.id,
      equipo: 'B'
    });

    await UsuarioPartido.create({
      usuarioId: usuarios[3].id,
      partidoId: partido.id,
      equipo: 'B'
    });

    console.log('✅ Usuarios agregados al partido');

    // 4. Verificar scores antes de finalizar
    console.log('📊 Scores antes de finalizar:');
    const participantes = await UsuarioPartido.findAll({
      where: { partidoId: partido.id },
      include: [{
        model: Usuario,
        attributes: ['id', 'nombre', 'score']
      }]
    });

    participantes.forEach((p: any) => {
      console.log(`   👤 ${p.Usuario.nombre} (Equipo ${p.equipo}): ${p.Usuario.score || 0} puntos`);
    });

    // 5. Finalizar partido usando PartidoService (esto debería actualizar scores automáticamente)
    console.log('🏁 Finalizando partido con equipo A como ganador...');
    const resultado = await PartidoService.finalizarPartido(partido.id, {
      equipoGanador: 'A'
    });

    console.log(`✅ Partido finalizado: ${resultado}`);

    // 6. Verificar que el partido se finalizó correctamente
    const partidoFinalizado = await Partido.findByPk(partido.id);
    console.log(`📋 Estado del partido: ${partidoFinalizado.estado}`);
    console.log(`🏆 Equipo ganador: ${partidoFinalizado.equipoGanador}`);

    // 7. Verificar scores después de finalizar
    console.log('📊 Scores después de finalizar:');
    const participantesFinales = await UsuarioPartido.findAll({
      where: { partidoId: partido.id },
      include: [{
        model: Usuario,
        attributes: ['id', 'nombre', 'score']
      }]
    });

    participantesFinales.forEach((p: any) => {
      const scoreAnterior = participantes.find((orig: any) => orig.usuarioId === p.usuarioId)?.Usuario.score || 0;
      const scoreActual = p.Usuario.score || 0;
      const cambio = scoreActual - scoreAnterior;
      console.log(`   👤 ${p.Usuario.nombre} (Equipo ${p.equipo}): ${scoreActual} puntos (${cambio >= 0 ? '+' : ''}${cambio})`);
    });

    // 8. Limpiar datos de prueba
    console.log('🧹 Limpiando datos de prueba...');
    await UsuarioPartido.destroy({ where: { partidoId: partido.id } });
    await Partido.destroy({ where: { id: partido.id } });

    console.log('🎉 ¡Prueba de integración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    process.exit(0);
  }
}

testPartidoFinalizacionConScores();
