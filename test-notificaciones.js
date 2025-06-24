/**
 * Script para probar notificaciones de Firebase con un partido real
 */
import { PartidoService } from './dist/services/partido/PartidoService.js';
import dbPromise from './dist/models/index.js';

async function probarNotificaciones() {
  console.log('🧪 === PRUEBA DE NOTIFICACIONES FIREBASE ===\n');

  try {
    const db = await dbPromise;
    const Usuario = db.Usuario;
    const Zona = db.Zona;
    const Deporte = db.Deporte;

    // 1. Obtener datos para crear partido
    console.log('📋 Paso 1: Obteniendo datos para crear partido...');
    
    const usuarios = await Usuario.findAll({ limit: 5 });
    const zona = await Zona.findOne();
    const deporte = await Deporte.findOne();

    if (!usuarios.length || !zona || !deporte) {
      console.log('❌ No hay suficientes datos en la base para la prueba');
      return;
    }    // Buscar un usuario con token para ser organizador
    console.log('🔍 Buscando usuario con token Firebase...');
    const usuariosConToken = await Usuario.findAll({
      where: {
        firebaseToken: {
          [db.Sequelize.Op.not]: null
        }
      }
    });
    
    const organizador = usuariosConToken.length > 0 ? usuariosConToken[0] : usuarios[0];
    
    console.log(`✅ Organizador: ${organizador.nombre} (${organizador.email})`);
    console.log(`📱 Token del organizador: ${organizador.firebaseToken ? organizador.firebaseToken.substring(0, 20) + '...' : 'Sin token'}`);
    console.log(`✅ Zona: ${zona.nombre}, Deporte: ${deporte.nombre}\n`);

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
      direccion: 'Cancha de Prueba - Notificaciones Firebase',
      cantidadJugadores: 4,
      nivelMinimo: 1,
      nivelMaximo: 3, // Cambié de 5 a 3
      tipoEmparejamiento: 'ZONA'
    };

    const partidoCreado = await PartidoService.crearPartido(datosPartido);
    console.log(`✅ Partido creado con ID: ${partidoCreado.id}`);
    console.log(`📊 Estado inicial: ${partidoCreado.estado}\n`);    // 3. Cambiar estado para disparar notificación
    console.log('📋 Paso 3: Cambiando estado para disparar notificación...');
    console.log('⏱️  Esperando logs de Firebase...\n');
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Pausa para ver logs
    
    // Usar el método directo de actualización de estado
    const cambio = await PartidoService.actualizarEstadoPartido(partidoCreado.id, 'ARMADO');
    
    if (cambio) {
      console.log('✅ Estado cambiado a ARMADO');
      console.log('🔔 Se deberían haber enviado notificaciones Firebase\n');
    }

    // 4. Esperar para que se procesen las notificaciones
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🏁 Prueba completada. Revisa los logs del servidor para ver los detalles de Firebase.');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
  }

  process.exit(0);
}

probarNotificaciones();
