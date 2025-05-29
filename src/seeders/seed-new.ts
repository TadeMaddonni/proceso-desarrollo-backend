import { Sequelize, ModelStatic, Model } from 'sequelize';
import dotenv from 'dotenv';

console.log('📦 Cargando script de seed...');
dotenv.config();

async function runSeed(): Promise<void> {
  console.log('🚀 Iniciando el proceso de seed...');
  try {
    console.log('📦 Importando models...');
    const db = await import('../models/index.js');
    
    const { 
      Zona, 
      Deporte, 
      Usuario, 
      Partido, 
      Equipo, 
      UsuarioEquipo, 
      Invitacion, 
      Historial, 
      sequelize 
    } = db.default;

    // Type assertions for proper model typing
    const ZonaModel = Zona as ModelStatic<Model<any, any>>;
    const DeporteModel = Deporte as ModelStatic<Model<any, any>>;
    const UsuarioModel = Usuario as ModelStatic<Model<any, any>>;
    const PartidoModel = Partido as ModelStatic<Model<any, any>>;
    const EquipoModel = Equipo as ModelStatic<Model<any, any>>;
    const UsuarioEquipoModel = UsuarioEquipo as ModelStatic<Model<any, any>>;
    const InvitacionModel = Invitacion as ModelStatic<Model<any, any>>;
    const HistorialModel = Historial as ModelStatic<Model<any, any>>;
    
    console.log('🔌 Intentando conectar a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Limpiar datos anteriores en orden correcto (respetando foreign keys)
    console.log('🧹 Limpiando datos anteriores...');
    await HistorialModel.destroy({ where: {} });
    await InvitacionModel.destroy({ where: {} });
    await UsuarioEquipoModel.destroy({ where: {} });
    await EquipoModel.destroy({ where: {} });
    await PartidoModel.destroy({ where: {} });
    await UsuarioModel.destroy({ where: {} });
    await DeporteModel.destroy({ where: {} });
    await ZonaModel.destroy({ where: {} });    console.log('📍 Creando Zonas...');
    const zona1 = await ZonaModel.create({ nombre: 'Palermo' }) as any;
    const zona2 = await ZonaModel.create({ nombre: 'Caballito' }) as any;
    const zona3 = await ZonaModel.create({ nombre: 'Belgrano' }) as any;
    const zona4 = await ZonaModel.create({ nombre: 'Recoleta' }) as any;
    const zona5 = await ZonaModel.create({ nombre: 'Flores' }) as any;
    const zonas = [zona1, zona2, zona3, zona4, zona5];
    console.log(`   ✅ Zonas creadas: ${zonas.length}`);    console.log('⚽ Creando Deportes...');
    const futbol = await DeporteModel.create({ nombre: 'Fútbol 5' }) as any;
    const basket = await DeporteModel.create({ nombre: 'Básquet' }) as any;
    const tenis = await DeporteModel.create({ nombre: 'Tenis' }) as any;
    const padel = await DeporteModel.create({ nombre: 'Pádel' }) as any;
    const voley = await DeporteModel.create({ nombre: 'Vóley' }) as any;
    const deportes = [futbol, basket, tenis, padel, voley];
    console.log(`   ✅ Deportes creados: ${deportes.length}`);console.log('👥 Creando Usuarios...');
    const usuarios = [];
    const nombresUsuarios = [
      'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Diego Rodríguez',
      'Lucía Fernández', 'Roberto Silva', 'Sofía González', 'Alejandro Torres', 'Valentina Ruiz'
    ];
      for (let i = 0; i < nombresUsuarios.length; i++) {
      const [nombre, apellido] = nombresUsuarios[i].split(' ');
        const selectedZona = zonas[i % zonas.length];
      const selectedDeporte = deportes[i % deportes.length];
      
      const usuario = await UsuarioModel.create({
        nombre: nombre,
        correo: `${nombre.toLowerCase()}.${apellido.toLowerCase()}@email.com`,
        contraseña: 'password123',
        nivel: Math.floor(Math.random() * 3) + 1, // Nivel del 1 al 3 (corregido)
        zonaId: selectedZona.id,
        deporteId: selectedDeporte.id
      }) as any;
      usuarios.push(usuario);
    }
    console.log(`   ✅ Usuarios creados: ${usuarios.length}`);

    console.log('⚽ Creando Partidos...');
    const partidos = [];
    const fechasPartidos = [
      new Date('2024-06-01 10:00:00'),
      new Date('2024-06-03 15:00:00'),
      new Date('2024-06-05 18:00:00'),
      new Date('2024-06-07 20:00:00'),
      new Date('2024-06-10 16:00:00'),
      new Date('2024-06-12 19:00:00'),
      new Date('2024-06-15 17:00:00'),
      new Date('2024-06-18 21:00:00')
    ];    for (let i = 0; i < fechasPartidos.length; i++) {
      const partido = await PartidoModel.create({
        zonaId: zonas[i % zonas.length].id,
        deporteId: deportes[i % deportes.length].id,
        fecha: fechasPartidos[i],
        hora: '20:00:00', // Hora fija para simplificar
        duracion: 2.0, // 2 horas
        direccion: `Cancha ${i + 1} - ${zonas[i % zonas.length].nombre}`,
        estado: 'pendiente',
        organizadorId: usuarios[i % usuarios.length].id
      }) as any;
      partidos.push(partido);
    }
    console.log(`   ✅ Partidos creados: ${partidos.length}`);

    console.log('👤 Creando Equipos...');
    const equipos = [];
    const nombresEquipos = [
      'Los Tigres', 'Águilas FC', 'Leones Dorados', 'Tiburones Azules',
      'Dragones Rojos', 'Lobos Grises', 'Halcones Negros', 'Panteras Verdes'
    ];    for (let i = 0; i < nombresEquipos.length; i++) {
      const equipo = await EquipoModel.create({
        nombre: nombresEquipos[i],
        partidoId: partidos[i % partidos.length].id
      }) as any;
      equipos.push(equipo);
    }
    console.log(`   ✅ Equipos creados: ${equipos.length}`);

    console.log('🤝 Creando UsuarioEquipos...');
    const usuarioEquipos = [];
    
    // Asignar 2-3 usuarios por equipo
    for (let i = 0; i < equipos.length; i++) {
      const equipo = equipos[i];
      const miembrosCount = 2 + (i % 2); // 2 o 3 miembros por equipo
      
      for (let j = 0; j < miembrosCount; j++) {
        const usuarioIndex = (i * miembrosCount + j) % usuarios.length;        const usuarioEquipo = await UsuarioEquipoModel.create({
          usuarioId: usuarios[usuarioIndex].id,
          equipoId: equipo.id
        }) as any;
        usuarioEquipos.push(usuarioEquipo);
      }
    }
    console.log(`   ✅ UsuarioEquipos creados: ${usuarioEquipos.length}`);    console.log('💌 Creando Invitaciones...');
    const invitaciones = [];
    const estadosInvitacion = ['pendiente', 'aceptada', 'rechazada'] as const;

    for (let i = 0; i < 12; i++) {
      const invitacion = await InvitacionModel.create({
        partidoId: partidos[i % partidos.length].id,
        usuarioId: usuarios[(i + 1) % usuarios.length].id,
        estado: estadosInvitacion[i % estadosInvitacion.length],
        criterioOrigen: 'sistema',
        fechaEnvio: new Date(2024, 4, 15 + i) // Mayo 2024
      }) as any;
      invitaciones.push(invitacion);
    }
    console.log(`   ✅ Invitaciones creadas: ${invitaciones.length}`);    console.log('📋 Creando Historial...');
    const historiales = [];
    const resultados = ['victoria', 'derrota', 'empate'] as const;

    for (let i = 0; i < usuarios.length; i++) {
      const usuario = usuarios[i];
      
      // Crear múltiples entradas de historial por usuario
      for (let j = 0; j < 6; j++) {
        const partidoIndex = (i + j) % partidos.length;
        const historial = await HistorialModel.create({
          usuarioId: usuario.id,
          partidoId: partidos[partidoIndex].id,
          resultado: resultados[j % resultados.length]
        }) as any;
        historiales.push(historial);
      }
    }
    console.log(`   ✅ Registros de historial creados: ${historiales.length}`);

    console.log('🎉 ¡Seed ejecutado exitosamente!');
    console.log('📊 Resumen de datos creados:');
    console.log(`   📍 Zonas: ${zonas.length}`);
    console.log(`   ⚽ Deportes: ${deportes.length}`);
    console.log(`   👥 Usuarios: ${usuarios.length}`);
    console.log(`   🏆 Partidos: ${partidos.length}`);
    console.log(`   👤 Equipos: ${equipos.length}`);
    console.log(`   🤝 UsuarioEquipos: ${usuarioEquipos.length}`);
    console.log(`   💌 Invitaciones: ${invitaciones.length}`);
    console.log(`   📋 Registros de historial: ${historiales.length}`);

  } catch (error) {
    console.error('❌ Error ejecutando el seed:', error);
    throw error;
  } finally {
    console.log('🔌 Cerrando conexión a la base de datos...');
    // Importar nuevamente para obtener sequelize si es necesario
    const db = await import('../models/index.js');
    await db.default.sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

runSeed().catch(console.error);
