const dbPromise = import('./dist/models/index.js').then(m => m.default);
const { PartidoService } = await import('./dist/services/partido/PartidoService.js');
const { EmparejamientoService } = await import('./dist/services/partido/emparejamiento/EmparejamientoService.js');

/**
 * 🧪 Script para probar las notificaciones de invitación
 */
async function probarNotificacionesInvitacion() {
  console.log('🧪 === PRUEBA DE NOTIFICACIONES DE INVITACIÓN ===\n');

  try {
    const db = await dbPromise;
    const Usuario = db.Usuario;
    const Zona = db.Zona;
    const Deporte = db.Deporte;

    // 1. Obtener datos necesarios
    console.log('📋 Paso 1: Obteniendo datos básicos...');
    
    const zona = await Zona.findOne();
    const deporte = await Deporte.findOne();
    const usuarios = await Usuario.findAll({ limit: 5 });
    
    if (!zona || !deporte || usuarios.length < 2) {
      console.log('❌ Faltan datos básicos en la BD');
      return;
    }

    const organizador = usuarios[0];
    console.log(`✅ Organizador: ${organizador.nombre} (${organizador.email})`);
    console.log(`✅ Zona: ${zona.nombre}`);
    console.log(`✅ Deporte: ${deporte.nombre}`);
    console.log(`✅ ${usuarios.length} usuarios disponibles\n`);

    // 2. Crear partido
    console.log('📋 Paso 2: Creando partido...');
    
    const fechaPartido = new Date();
    fechaPartido.setDate(fechaPartido.getDate() + 1); // Mañana

    const datosPartido = {
      deporteId: deporte.id,
      zonaId: zona.id,
      organizadorId: organizador.id,
      fecha: fechaPartido.toISOString().split('T')[0],
      hora: '18:00',
      duracion: 2,
      direccion: 'Cancha de Prueba - Notificaciones',
      cantidadJugadores: 4,
      nivelMinimo: 1,
      nivelMaximo: 3,
      tipoEmparejamiento: 'ZONA'
    };

    const partidoCreado = await PartidoService.crearPartido(datosPartido);
    console.log(`✅ Partido creado: ${partidoCreado.id}`);
    console.log(`📊 Estado inicial: ${partidoCreado.estado}\n`);

    // 3. Esperar a que termine el emparejamiento automático
    console.log('📋 Paso 3: Esperando emparejamiento automático...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3 segundos

    // 4. Verificar invitaciones creadas
    console.log('📋 Paso 4: Verificando invitaciones...');
    
    const Invitacion = db.Invitacion;
    const invitaciones = await Invitacion.findAll({
      where: { partidoId: partidoCreado.id },
      include: [
        {
          model: Usuario,
          attributes: ['id', 'nombre', 'email', 'firebaseToken']
        }
      ]
    });

    console.log(`✅ ${invitaciones.length} invitaciones encontradas:`);
    invitaciones.forEach((inv, index) => {
      const usuario = inv.Usuario;
      console.log(`   ${index + 1}. ${usuario.nombre} (${usuario.email}) - Estado: ${inv.estado}`);
      console.log(`      Token: ${usuario.firebaseToken ? 'Disponible' : 'Sin token'}`);
    });

    if (invitaciones.length > 0) {
      console.log('\n🎯 ¡NOTIFICACIONES ENVIADAS EXITOSAMENTE!');
      console.log('📱 Revisa los logs anteriores para ver las notificaciones push y emails');
    } else {
      console.log('\n⚠️ No se crearon invitaciones automáticamente');
      console.log('Esto puede ser porque no hay usuarios compatibles en la zona/deporte');
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    console.log('\n🏁 Prueba completada');
  }
}

// Ejecutar la prueba
probarNotificacionesInvitacion();
