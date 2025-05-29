import { Sequelize } from 'sequelize';
import db from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

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
} = db;

async function runSeed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');

    // Limpiar datos anteriores en orden correcto (respetando foreign keys)
    console.log('🧹 Limpiando datos anteriores...');
    await Historial.destroy({ where: {} });
    await Invitacion.destroy({ where: {} });
    await UsuarioEquipo.destroy({ where: {} });
    await Equipo.destroy({ where: {} });
    await Partido.destroy({ where: {} });
    await Usuario.destroy({ where: {} });
    await Deporte.destroy({ where: {} });
    await Zona.destroy({ where: {} });
    
    console.log('📍 Creando Zonas...');
    const zona1 = await Zona.create({ nombre: 'Palermo' });
    const zona2 = await Zona.create({ nombre: 'Caballito' });
    const zona3 = await Zona.create({ nombre: 'Belgrano' });
    const zona4 = await Zona.create({ nombre: 'Recoleta' });
    const zona5 = await Zona.create({ nombre: 'Flores' });
    const zonas = [zona1, zona2, zona3, zona4, zona5];
    console.log(`✅ Creadas ${zonas.length} zonas`);

    console.log('🏃 Creando Deportes...');
    const deporte1 = await Deporte.create({ nombre: 'Fútbol' });
    const deporte2 = await Deporte.create({ nombre: 'Pádel' });
    const deporte3 = await Deporte.create({ nombre: 'Básquet' });
    const deporte4 = await Deporte.create({ nombre: 'Tenis' });
    const deportes = [deporte1, deporte2, deporte3, deporte4];
    console.log(`✅ Creados ${deportes.length} deportes`);

    console.log('👥 Creando Usuarios...');
    const usuario1 = await Usuario.create({
      nombre: 'Juan Pérez',
      correo: 'juan@example.com',
      contraseña: '123456',
      nivel: 3,
      zonaId: zonas[0].id,
      deporteId: deportes[0].id
    });

    const usuario2 = await Usuario.create({
      nombre: 'Ana García',
      correo: 'ana@example.com',
      contraseña: '123456',
      nivel: 2,
      zonaId: zonas[1].id,
      deporteId: deportes[1].id
    });

    const usuario3 = await Usuario.create({
      nombre: 'Carlos Ruiz',
      correo: 'carlos@example.com',
      contraseña: '123456',
      nivel: 4,
      zonaId: zonas[2].id,
      deporteId: deportes[0].id
    });

    const usuario4 = await Usuario.create({
      nombre: 'María López',
      correo: 'maria@example.com',
      contraseña: '123456',
      nivel: 3,
      zonaId: zonas[0].id,
      deporteId: deportes[2].id
    });

    const usuario5 = await Usuario.create({
      nombre: 'Pedro González',
      correo: 'pedro@example.com',
      contraseña: '123456',
      nivel: 2,
      zonaId: zonas[3].id,
      deporteId: deportes[0].id
    });

    const usuario6 = await Usuario.create({
      nombre: 'Laura Martín',
      correo: 'laura@example.com',
      contraseña: '123456',
      nivel: 4,
      zonaId: zonas[1].id,
      deporteId: deportes[3].id
    });

    const usuarios = [usuario1, usuario2, usuario3, usuario4, usuario5, usuario6];
    console.log(`✅ Creados ${usuarios.length} usuarios`);

    console.log('⚽ Creando Partidos...');
    const partido1 = await Partido.create({
      deporteId: deportes[0].id, // Fútbol
      zonaId: zonas[0].id, // Palermo
      organizadorId: usuario1.id,
      fecha: new Date('2025-06-15'),
      hora: '18:00:00',
      duracion: 2.0,
      direccion: 'Cancha Central Palermo, Av. del Libertador 1200',
      estado: 'confirmado'
    });

    const partido2 = await Partido.create({
      deporteId: deportes[1].id, // Pádel
      zonaId: zonas[1].id, // Caballito
      organizadorId: usuario2.id,
      fecha: new Date('2025-06-16'),
      hora: '19:30:00',
      duracion: 1.5,
      direccion: 'Club Pádel Caballito, Rivadavia 5678',
      estado: 'abierto'
    });

    const partido3 = await Partido.create({
      deporteId: deportes[2].id, // Básquet
      zonaId: zonas[2].id, // Belgrano
      organizadorId: usuario4.id,
      fecha: new Date('2025-06-17'),
      hora: '20:00:00',
      duracion: 2.5,
      direccion: 'Polideportivo Belgrano, Cabildo 3456',
      estado: 'abierto'
    });

    const partidos = [partido1, partido2, partido3];
    console.log(`✅ Creados ${partidos.length} partidos`);

    console.log('🏆 Creando Equipos...');
    const equipo1 = await Equipo.create({
      partidoId: partido1.id,
      nombre: 'Los Tigres'
    });

    const equipo2 = await Equipo.create({
      partidoId: partido1.id,
      nombre: 'Los Leones'
    });

    const equipo3 = await Equipo.create({
      partidoId: partido2.id,
      nombre: 'Dupla Dinámica'
    });

    const equipo4 = await Equipo.create({
      partidoId: partido2.id,
      nombre: 'Parejas Perfectas'
    });

    const equipo5 = await Equipo.create({
      partidoId: partido3.id,
      nombre: 'Basquet Stars'
    });

    const equipos = [equipo1, equipo2, equipo3, equipo4, equipo5];
    console.log(`✅ Creados ${equipos.length} equipos`);

    console.log('👥⚽ Creando relaciones Usuario-Equipo...');
    // Partido de fútbol - equipos de 3 jugadores cada uno
    await UsuarioEquipo.create({ usuarioId: usuario1.id, equipoId: equipo1.id });
    await UsuarioEquipo.create({ usuarioId: usuario3.id, equipoId: equipo1.id });
    await UsuarioEquipo.create({ usuarioId: usuario5.id, equipoId: equipo1.id });
    
    await UsuarioEquipo.create({ usuarioId: usuario2.id, equipoId: equipo2.id });
    await UsuarioEquipo.create({ usuarioId: usuario4.id, equipoId: equipo2.id });
    await UsuarioEquipo.create({ usuarioId: usuario6.id, equipoId: equipo2.id });

    // Partido de pádel - equipos de 2 jugadores cada uno
    await UsuarioEquipo.create({ usuarioId: usuario2.id, equipoId: equipo3.id });
    await UsuarioEquipo.create({ usuarioId: usuario6.id, equipoId: equipo3.id });
    
    await UsuarioEquipo.create({ usuarioId: usuario1.id, equipoId: equipo4.id });
    await UsuarioEquipo.create({ usuarioId: usuario3.id, equipoId: equipo4.id });

    // Partido de básquet - equipo de 3 jugadores
    await UsuarioEquipo.create({ usuarioId: usuario4.id, equipoId: equipo5.id });
    await UsuarioEquipo.create({ usuarioId: usuario1.id, equipoId: equipo5.id });
    await UsuarioEquipo.create({ usuarioId: usuario5.id, equipoId: equipo5.id });

    console.log('✅ Creadas relaciones Usuario-Equipo');

    console.log('📧 Creando Invitaciones...');
    await Invitacion.create({
      partidoId: partido1.id,
      usuarioId: usuario2.id,
      estado: 'aceptada',
      criterioOrigen: 'nivel_similar',
      fechaEnvio: new Date('2025-06-10')
    });

    await Invitacion.create({
      partidoId: partido1.id,
      usuarioId: usuario3.id,
      estado: 'aceptada',
      criterioOrigen: 'zona_cercana',
      fechaEnvio: new Date('2025-06-10')
    });

    await Invitacion.create({
      partidoId: partido2.id,
      usuarioId: usuario1.id,
      estado: 'pendiente',
      criterioOrigen: 'invitacion_directa',
      fechaEnvio: new Date('2025-06-12')
    });

    await Invitacion.create({
      partidoId: partido3.id,
      usuarioId: usuario2.id,
      estado: 'rechazada',
      criterioOrigen: 'nivel_similar',
      fechaEnvio: new Date('2025-06-11')
    });

    console.log('✅ Creadas invitaciones');

    console.log('📊 Creando Historial...');
    // Actualizar partido 1 como finalizado con equipo ganador
    await partido1.update({ 
      estado: 'finalizado',
      equipoGanadorId: equipo1.id 
    });

    await Historial.create({
      usuarioId: usuario1.id,
      partidoId: partido1.id,
      resultado: 'victoria'
    });

    await Historial.create({
      usuarioId: usuario3.id,
      partidoId: partido1.id,
      resultado: 'victoria'
    });

    await Historial.create({
      usuarioId: usuario5.id,
      partidoId: partido1.id,
      resultado: 'victoria'
    });

    await Historial.create({
      usuarioId: usuario2.id,
      partidoId: partido1.id,
      resultado: 'derrota'
    });

    await Historial.create({
      usuarioId: usuario4.id,
      partidoId: partido1.id,
      resultado: 'derrota'
    });

    await Historial.create({
      usuarioId: usuario6.id,
      partidoId: partido1.id,
      resultado: 'derrota'
    });

    console.log('✅ Creado historial de partidos');

    console.log('🎉 Seed completado con éxito');
    console.log(`📊 Resumen:`);
    console.log(`   - ${zonas.length} zonas`);
    console.log(`   - ${deportes.length} deportes`);
    console.log(`   - ${usuarios.length} usuarios`);
    console.log(`   - ${partidos.length} partidos`);
    console.log(`   - ${equipos.length} equipos`);
    console.log(`   - 11 relaciones usuario-equipo`);
    console.log(`   - 4 invitaciones`);
    console.log(`   - 6 registros de historial`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
}

runSeed();
