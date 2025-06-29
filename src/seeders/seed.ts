import { Sequelize, ModelStatic, Model } from 'sequelize';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

console.log('📦 Cargando script de seed...');
dotenv.config();

async function runSeed(): Promise<void> {
  console.log('🚀 Iniciando el proceso de seed...');
  try {
    console.log('📦 Importando models...');
    const db = await import('../models/index.js');    const { 
      Zona, 
      Deporte, 
      Usuario, 
      Partido, 
      UsuarioPartido, 
      Invitacion, 
      sequelize 
    } = db.default;    // Type assertions for proper model typing
    const ZonaModel = Zona as ModelStatic<Model<any, any>>;
    const DeporteModel = Deporte as ModelStatic<Model<any, any>>;
    const UsuarioModel = Usuario as ModelStatic<Model<any, any>>;
    const PartidoModel = Partido as ModelStatic<Model<any, any>>;
    const UsuarioPartidoModel = UsuarioPartido as ModelStatic<Model<any, any>>;
    const InvitacionModel = Invitacion as ModelStatic<Model<any, any>>;
    
    console.log('🔌 Intentando conectar a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');    // Limpiar datos anteriores en orden correcto (respetando foreign keys)
    console.log('🧹 Limpiando datos anteriores...');
    await InvitacionModel.destroy({ where: {} });
    await UsuarioPartidoModel.destroy({ where: {} });
    await PartidoModel.destroy({ where: {} });
    await UsuarioModel.destroy({ where: {} });
    await DeporteModel.destroy({ where: {} });
    await ZonaModel.destroy({ where: {} });console.log('📍 Creando Zonas...');
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
    console.log(`   ✅ Deportes creados: ${deportes.length}`);    console.log('👥 Creando Usuarios...');
    const usuarios = [];
    const nombresUsuarios = [
      'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Diego Rodríguez',
      'Lucía Fernández', 'Roberto Silva', 'Sofía González', 'Alejandro Torres', 'Valentina Ruiz'
    ];
      // Hashear la contraseña una vez para todos los usuarios
    // Contraseña original: 'password123' - Hasheada con bcrypt (salt rounds: 10)
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    for (let i = 0; i < nombresUsuarios.length; i++) {
      const [nombre, apellido] = nombresUsuarios[i].split(' ');
      const selectedZona = zonas[i % zonas.length];
      const selectedDeporte = deportes[i % deportes.length];
      
      const usuario = await UsuarioModel.create({
        nombre: nombre,
        email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}@email.com`,
        contraseña: hashedPassword, // Contraseña hasheada
        nivel: Math.floor(Math.random() * 3) + 1, // Nivel del 1 al 3 (corregido)
        score: Math.floor(Math.random() * 50) + 50, // Score inicial entre 50 y 100
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
    ];    for (let i = 0; i < fechasPartidos.length; i++) {      const partido = await PartidoModel.create({
        zonaId: zonas[i % zonas.length].id,
        deporteId: deportes[i % deportes.length].id,
        fecha: fechasPartidos[i],
        hora: '20:00:00', // Hora fija para simplificar
        duracion: 2.0, // 2 horas
        direccion: `Cancha ${i + 1} - ${zonas[i % zonas.length].nombre}`,
        estado: 'NECESITAMOS_JUGADORES', // Usar el valor correcto del enum
        cantidadJugadores: 10, // Cantidad de jugadores por defecto
        nivelMinimo: 1 + (i % 3), // Nivel mínimo entre 1 y 3
        nivelMaximo: 3, // Nivel máximo siempre 3
        organizadorId: usuarios[i % usuarios.length].id
      }) as any;
      partidos.push(partido);
    }    console.log(`   ✅ Partidos creados: ${partidos.length}`);

    console.log('🤝 Creando UsuarioPartidos...');
    const usuarioPartidos = [];
    
    // Asignar usuarios a partidos con equipos A y B
    for (let i = 0; i < partidos.length; i++) {
      const partido = partidos[i];
      const jugadoresPorPartido = 4; // 2 por cada equipo (A y B)
      
      for (let j = 0; j < jugadoresPorPartido; j++) {
        const usuarioIndex = (i * jugadoresPorPartido + j) % usuarios.length;
        const equipo = j < 2 ? 'A' : 'B'; // Primeros 2 van al equipo A, los otros 2 al B
        
        const usuarioPartido = await UsuarioPartidoModel.create({
          usuarioId: usuarios[usuarioIndex].id,
          partidoId: partido.id,
          equipo: equipo
        }) as any;
        usuarioPartidos.push(usuarioPartido);
      }
    }
    console.log(`   ✅ UsuarioPartidos creados: ${usuarioPartidos.length}`);console.log('💌 Creando Invitaciones...');
    const invitaciones = [];
    const estadosInvitacion = ['pendiente', 'aceptada', 'cancelada'] as const;

    for (let i = 0; i < 12; i++) {
      const invitacion = await InvitacionModel.create({
        partidoId: partidos[i % partidos.length].id,
        usuarioId: usuarios[(i + 1) % usuarios.length].id,
        estado: estadosInvitacion[i % estadosInvitacion.length],
        criterioOrigen: 'sistema',
        fechaEnvio: new Date(2024, 4, 15 + i) // Mayo 2024
      }) as any;
      invitaciones.push(invitacion);
    }    console.log(`   ✅ Invitaciones creadas: ${invitaciones.length}`);    console.log('🎉 ¡Seed ejecutado exitosamente!');
    console.log('📊 Resumen de datos creados:');
    console.log(`   📍 Zonas: ${zonas.length}`);
    console.log(`   ⚽ Deportes: ${deportes.length}`);
    console.log(`   👥 Usuarios: ${usuarios.length}`);
    console.log(`   🏆 Partidos: ${partidos.length}`);
    console.log(`   🤝 UsuarioPartidos: ${usuarioPartidos.length}`);
    console.log(`   💌 Invitaciones: ${invitaciones.length}`);

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
