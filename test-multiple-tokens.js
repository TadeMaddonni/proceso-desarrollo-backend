/**
 * Script para agregar un token Firebase a un usuario y probar notificaciones
 */
import dbPromise from './dist/models/index.js';
import { PartidoService } from './dist/services/partido/PartidoService.js';

async function probarConTokenReal() {
  console.log('🧪 === AGREGANDO TOKEN Y PROBANDO NOTIFICACIONES ===\n');

  try {
    const db = await dbPromise;
    const Usuario = db.Usuario;
    const UsuarioPartido = db.UsuarioPartido;
    const Zona = db.Zona;
    const Deporte = db.Deporte;

    // 1. Agregar token Firebase a un usuario sin token
    console.log('📋 Paso 1: Agregando token Firebase a un usuario...');
    
    const usuarioSinToken = await Usuario.findOne({
      where: {
        firebaseToken: null
      }
    });

    if (usuarioSinToken) {
      // Agregar un token de prueba
      await usuarioSinToken.update({
        firebaseToken: 'token_prueba_participante_123456789abcdef'
      });
      console.log(`✅ Token agregado a ${usuarioSinToken.nombre} (${usuarioSinToken.email})`);
    }

    // 2. Obtener usuarios con tokens
    const usuariosConToken = await Usuario.findAll({
      where: {
        firebaseToken: {
          [db.Sequelize.Op.not]: null
        }
      }
    });

    console.log(`📱 Usuarios con tokens ahora: ${usuariosConToken.length}`);
    usuariosConToken.forEach(u => {
      console.log(`- ${u.nombre}: ${u.firebaseToken.substring(0, 20)}...`);
    });

    // 3. Crear partido con organizador con token
    console.log('\n📋 Paso 2: Creando partido...');
    
    const zona = await Zona.findOne();
    const deporte = await Deporte.findOne();
    const organizador = usuariosConToken[0];

    const fechaPartido = new Date();
    fechaPartido.setDate(fechaPartido.getDate() + 7);

    const datosPartido = {
      deporteId: deporte.id,
      zonaId: zona.id,
      organizadorId: organizador.id,
      fecha: fechaPartido.toISOString().split('T')[0],
      hora: '18:00',
      duracion: 2,
      direccion: 'Cancha de Prueba - Múltiples Tokens',
      cantidadJugadores: 4,
      nivelMinimo: 1,
      nivelMaximo: 3,
      tipoEmparejamiento: 'ZONA'
    };

    const partidoCreado = await PartidoService.crearPartido(datosPartido);
    console.log(`✅ Partido creado con ID: ${partidoCreado.id}`);

    // 4. Agregar participantes con tokens
    console.log('\n📋 Paso 3: Agregando participantes con tokens...');
    
    const participantesConToken = usuariosConToken.filter(u => u.id !== organizador.id);
    
    for (let i = 0; i < Math.min(2, participantesConToken.length); i++) {
      const usuario = participantesConToken[i];
      await UsuarioPartido.create({
        usuarioId: usuario.id,
        partidoId: partidoCreado.id,
        equipo: i % 2 === 0 ? 'A' : 'B',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Participante con token agregado: ${usuario.nombre}`);
    }

    // 5. Cambiar estado para disparar notificaciones
    console.log('\n📋 Paso 4: Cambiando estado para disparar notificaciones...');
    console.log('⏱️  Esperando logs de Firebase...\n');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const cambio = await PartidoService.actualizarEstadoPartido(partidoCreado.id, 'EN_JUEGO');
    
    if (cambio) {
      console.log('✅ Estado cambiado a EN_JUEGO');
      console.log('🔔 Se deberían haber encontrado MÚLTIPLES tokens Firebase\n');
    }

    // 6. Esperar resultados
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🏁 Prueba completada. Revisa los logs para ver múltiples tokens encontrados.');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }

  process.exit(0);
}

probarConTokenReal();
