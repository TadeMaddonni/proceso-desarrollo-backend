import dbPromise from '../models/index.js';
import { ScoreService } from '../services/usuario/ScoreService.js';

/**
 * Script para probar el sistema de scores
 */
async function testScoreSystem() {
  try {
    console.log('🧪 Iniciando pruebas del sistema de scores...');
    
    const db = await dbPromise;
    const Usuario = db.Usuario as any;
    const Partido = db.Partido as any;
    const UsuarioPartido = db.UsuarioPartido as any;

    // 1. Crear usuarios de prueba
    console.log('👥 Creando usuarios de prueba...');
    
    const usuario1 = await Usuario.create({
      nombre: 'Test Player 1',
      email: 'test1@score.com',
      contraseña: 'password123',
      nivel: 2,
      zonaId: '123e4567-e89b-12d3-a456-426614174000', // Usar un UUID válido existente
      deporteId: '123e4567-e89b-12d3-a456-426614174001', // Usar un UUID válido existente
      score: 0
    });

    const usuario2 = await Usuario.create({
      nombre: 'Test Player 2',
      email: 'test2@score.com',
      contraseña: 'password123',
      nivel: 2,
      zonaId: '123e4567-e89b-12d3-a456-426614174000',
      deporteId: '123e4567-e89b-12d3-a456-426614174001',
      score: 0
    });

    console.log(`✅ Usuarios creados: ${usuario1.id}, ${usuario2.id}`);

    // 2. Crear un partido de prueba
    console.log('⚽ Creando partido de prueba...');
    
    const partido = await Partido.create({
      deporteId: '123e4567-e89b-12d3-a456-426614174001',
      zonaId: '123e4567-e89b-12d3-a456-426614174000',
      organizadorId: usuario1.id,
      fecha: new Date(),
      hora: '15:00',
      duracion: 2,
      direccion: 'Cancha de prueba',
      cantidadJugadores: 4,
      estado: 'FINALIZADO',
      equipoGanador: 'A'
    });

    console.log(`✅ Partido creado: ${partido.id}`);

    // 3. Agregar usuarios al partido en diferentes equipos
    console.log('👥 Agregando usuarios al partido...');
    
    await UsuarioPartido.create({
      usuarioId: usuario1.id,
      partidoId: partido.id,
      equipo: 'A' // Equipo ganador
    });

    await UsuarioPartido.create({
      usuarioId: usuario2.id,
      partidoId: partido.id,
      equipo: 'B' // Equipo perdedor
    });

    console.log('✅ Usuarios agregados al partido');

    // 4. Probar el sistema de scores
    console.log('🏆 Probando actualización de scores...');
    
    const resultado = await ScoreService.actualizarScoresPartidoFinalizado(
      partido.id,
      'A' // Equipo A gana
    );

    console.log(`✅ Scores actualizados:`, resultado);

    // 5. Verificar scores finales
    console.log('📊 Verificando scores finales...');
    
    const usuario1Actualizado = await Usuario.findByPk(usuario1.id);
    const usuario2Actualizado = await Usuario.findByPk(usuario2.id);

    console.log(`👤 ${usuario1Actualizado.nombre}: ${usuario1Actualizado.score} puntos (debería ser 1)`);
    console.log(`👤 ${usuario2Actualizado.nombre}: ${usuario2Actualizado.score} puntos (debería ser -1)`);

    // 6. Probar caso de empate
    console.log('🤝 Probando caso de empate...');
    
    const resultadoEmpate = await ScoreService.actualizarScoresPartidoFinalizado(
      partido.id,
      null // Empate
    );

    console.log(`✅ Resultado empate:`, resultadoEmpate);

    // 7. Limpiar datos de prueba
    console.log('🧹 Limpiando datos de prueba...');
    
    await UsuarioPartido.destroy({ where: { partidoId: partido.id } });
    await Partido.destroy({ where: { id: partido.id } });
    await Usuario.destroy({ where: { id: [usuario1.id, usuario2.id] } });

    console.log('✅ Datos de prueba eliminados');
    console.log('🎉 ¡Pruebas del sistema de scores completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar las pruebas
testScoreSystem();
