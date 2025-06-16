/**
 * Script para probar notificaciones de Firebase con participantes
 */
import { PartidoService } from './dist/services/partido/PartidoService.js';
import dbPromise from './dist/models/index.js';

async function probarNotificacionesConParticipantes() {
  console.log('🧪 === PRUEBA DE NOTIFICACIONES FIREBASE CON PARTICIPANTES ===\n');

  try {
    const db = await dbPromise;
    const Usuario = db.Usuario;
    const UsuarioPartido = db.UsuarioPartido;
    const Zona = db.Zona;
    const Deporte = db.Deporte;

    // 1. Obtener datos para crear partido
    console.log('📋 Paso 1: Obteniendo datos para crear partido...');
    
    const zona = await Zona.findOne();
    const deporte = await Deporte.findOne();

    // Obtener usuarios con tokens para usar como organizador y participantes
    const usuariosConToken = await Usuario.findAll({
      where: {
        firebaseToken: {
          [db.Sequelize.Op.not]: null
        }
      },
      limit: 5
    });

    // Obtener usuarios adicionales sin token también
    const todosUsuarios = await Usuario.findAll({ limit: 10 });

    if (!todosUsuarios.length || !zona || !deporte) {
      console.log('❌ No hay suficientes datos en la base para la prueba');
      return;
    }

    const organizador = usuariosConToken.length > 0 ? usuariosConToken[0] : todosUsuarios[0];
    
    console.log(`✅ Organizador: ${organizador.nombre} (${organizador.email})`);
    console.log(`📱 Token del organizador: ${organizador.firebaseToken ? organizador.firebaseToken.substring(0, 20) + '...' : 'Sin token'}`);
    console.log(`👥 Usuarios con tokens disponibles: ${usuariosConToken.length}`);
    console.log(`👥 Total usuarios disponibles: ${todosUsuarios.length}\n`);

    // 2. Crear partido de prueba
    console.log('📋 Paso 2: Creando partido de prueba...');
    
    const fechaPartido = new Date();
    fechaPartido.setDate(fechaPartido.getDate() + 7);

    const datosPartido = {
      deporteId: deporte.id,
      zonaId: zona.id,
      organizadorId: organizador.id,
      fecha: fechaPartido.toISOString().split('T')[0],
      hora: '18:00',
      duracion: 2,
      direccion: 'Cancha de Prueba - Notificaciones con Participantes',
      cantidadJugadores: 4,
      nivelMinimo: 1,
      nivelMaximo: 3,
      tipoEmparejamiento: 'ZONA'
    };

    const partidoCreado = await PartidoService.crearPartido(datosPartido);
    console.log(`✅ Partido creado con ID: ${partidoCreado.id}`);
    console.log(`📊 Estado inicial: ${partidoCreado.estado}\n`);

    // 3. Agregar participantes al partido
    console.log('📋 Paso 3: Agregando participantes al partido...');
    
    // Agregar 2-3 participantes, incluyendo algunos con tokens
    const participantesAAgregar = todosUsuarios
      .filter(u => u.id !== organizador.id)
      .slice(0, 3);

    for (let i = 0; i < participantesAAgregar.length; i++) {
      const usuario = participantesAAgregar[i];
      try {
        await UsuarioPartido.create({
          usuarioId: usuario.id,
          partidoId: partidoCreado.id,
          equipo: i % 2 === 0 ? 'A' : 'B',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`✅ Participante agregado: ${usuario.nombre} (${usuario.email}) - Token: ${usuario.firebaseToken ? usuario.firebaseToken.substring(0, 20) + '...' : 'Sin token'}`);
      } catch (error) {
        console.log(`⚠️ Error agregando ${usuario.nombre}: ${error.message}`);
      }
    }

    console.log('');

    // 4. Cambiar estado para disparar notificación
    console.log('📋 Paso 4: Cambiando estado para disparar notificación...');
    console.log('⏱️  Esperando logs de Firebase...\n');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const cambio = await PartidoService.actualizarEstadoPartido(partidoCreado.id, 'CONFIRMADO');
    
    if (cambio) {
      console.log('✅ Estado cambiado a CONFIRMADO');
      console.log('🔔 Se deberían haber enviado notificaciones Firebase a organizador Y participantes\n');
    }

    // 5. Esperar para que se procesen las notificaciones
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🏁 Prueba completada. Revisa los logs del servidor para verificar que se encontraron múltiples tokens.');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }

  process.exit(0);
}

probarNotificacionesConParticipantes();
