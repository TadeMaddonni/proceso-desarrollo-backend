import dbPromise from '../models/index.js';
import { ScoreService } from '../services/usuario/ScoreService.js';

async function testScoreSystemWithRealData() {
  try {
    console.log('🧪 Probando sistema de scores con datos reales...');
    
    const db = await dbPromise;
    const Usuario = db.Usuario as any;
    const Partido = db.Partido as any;
    const UsuarioPartido = db.UsuarioPartido as any;    // 1. Obtener un partido existente
    let partido = await Partido.findOne({
      where: { estado: 'FINALIZADO' }
    });

    if (!partido) {
      console.log('❌ No hay partidos finalizados. Creando uno...');
      
      // Obtener usuarios existentes
      const usuarios = await Usuario.findAll({ limit: 4 });
      if (usuarios.length < 4) {
        console.log('❌ No hay suficientes usuarios');
        return;
      }

      // Crear partido
      const nuevoPartido = await Partido.create({
        deporteId: usuarios[0].deporteId,
        zonaId: usuarios[0].zonaId,
        organizadorId: usuarios[0].id,
        fecha: new Date(),
        hora: '15:00',
        duracion: 2,
        direccion: 'Cancha Test Score',
        cantidadJugadores: 4,
        estado: 'FINALIZADO',
        equipoGanador: 'A'
      });

      // Agregar usuarios al partido
      await UsuarioPartido.create({
        usuarioId: usuarios[0].id,
        partidoId: nuevoPartido.id,
        equipo: 'A'
      });

      await UsuarioPartido.create({
        usuarioId: usuarios[1].id,
        partidoId: nuevoPartido.id,
        equipo: 'A'
      });

      await UsuarioPartido.create({
        usuarioId: usuarios[2].id,
        partidoId: nuevoPartido.id,
        equipo: 'B'
      });

      await UsuarioPartido.create({
        usuarioId: usuarios[3].id,
        partidoId: nuevoPartido.id,
        equipo: 'B'
      });

      console.log(`✅ Partido creado: ${nuevoPartido.id}`);
      
      // Usar el nuevo partido
      partido = nuevoPartido;
    }

    // 2. Verificar scores antes de la actualización
    console.log('📊 Scores antes de la actualización:');
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

    // 3. Probar actualización de scores
    console.log('🏆 Actualizando scores...');
    const resultado = await ScoreService.actualizarScoresPartidoFinalizado(
      partido.id,
      partido.equipoGanador
    );

    console.log(`✅ Resultado:`, resultado);

    // 4. Verificar scores después de la actualización
    console.log('📊 Scores después de la actualización:');
    const participantesActualizados = await UsuarioPartido.findAll({
      where: { partidoId: partido.id },
      include: [{
        model: Usuario,
        attributes: ['id', 'nombre', 'score']
      }]
    });

    participantesActualizados.forEach((p: any) => {
      const scoreAnterior = participantes.find((orig: any) => orig.usuarioId === p.usuarioId)?.Usuario.score || 0;
      const scoreActual = p.Usuario.score || 0;
      const cambio = scoreActual - scoreAnterior;
      console.log(`   👤 ${p.Usuario.nombre} (Equipo ${p.equipo}): ${scoreActual} puntos (${cambio >= 0 ? '+' : ''}${cambio})`);
    });

    // 5. Probar caso de empate
    console.log('🤝 Probando caso de empate...');
    const resultadoEmpate = await ScoreService.actualizarScoresPartidoFinalizado(
      partido.id,
      null
    );

    console.log(`✅ Resultado empate:`, resultadoEmpate);

    console.log('🎉 ¡Pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    process.exit(0);
  }
}

testScoreSystemWithRealData();
