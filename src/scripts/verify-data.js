import dotenv from 'dotenv';
dotenv.config();

import db from '../models/index.js';

const { 
  Zona, 
  Deporte, 
  Usuario, 
  Partido, 
  Equipo, 
  UsuarioEquipo, 
  Invitacion, 
  Historial 
} = db;

async function verifyData() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await db.sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos\n');

    console.log('📍 Verificando Zonas:');
    const zonas = await Zona.findAll();
    console.log(`   Total de zonas: ${zonas.length}`);
    zonas.forEach(zona => {
      console.log(`   - ${zona.nombre} (ID: ${zona.id.substring(0, 8)}...)`);
    });

    console.log('\n🏃 Verificando Deportes:');
    const deportes = await Deporte.findAll();
    console.log(`   Total de deportes: ${deportes.length}`);
    deportes.forEach(deporte => {
      console.log(`   - ${deporte.nombre} (ID: ${deporte.id.substring(0, 8)}...)`);
    });

    console.log('\n👥 Verificando Usuarios:');
    const usuarios = await Usuario.findAll({
      include: [
        { model: Zona, as: 'Zona' },
        { model: Deporte, as: 'Deporte' }
      ]
    });
    console.log(`   Total de usuarios: ${usuarios.length}`);
    usuarios.forEach(usuario => {
      console.log(`   - ${usuario.nombre} (${usuario.correo}) - Nivel: ${usuario.nivel} - Zona: ${usuario.Zona?.nombre} - Deporte: ${usuario.Deporte?.nombre}`);
    });

    console.log('\n⚽ Verificando Partidos:');
    const partidos = await Partido.findAll({
      include: [
        { model: Zona, as: 'Zona' },
        { model: Deporte, as: 'Deporte' },
        { model: Usuario, as: 'organizador' },
        { model: Equipo, as: 'equipoGanador' }
      ]
    });
    console.log(`   Total de partidos: ${partidos.length}`);
    partidos.forEach(partido => {
      const ganador = partido.equipoGanador ? ` - Ganador: ${partido.equipoGanador.nombre}` : '';
      console.log(`   - ${partido.Deporte?.nombre} en ${partido.Zona?.nombre} - Organizado por: ${partido.organizador?.nombre} - Estado: ${partido.estado}${ganador}`);
    });

    console.log('\n🏆 Verificando Equipos:');
    const equipos = await Equipo.findAll({
      include: [
        { model: Partido, as: 'Partido' }
      ]
    });
    console.log(`   Total de equipos: ${equipos.length}`);
    equipos.forEach(equipo => {
      console.log(`   - ${equipo.nombre} (Partido: ${equipo.Partido?.id.substring(0, 8)}...)`);
    });

    console.log('\n👥⚽ Verificando relaciones Usuario-Equipo:');
    const usuarioEquipos = await UsuarioEquipo.findAll({
      include: [
        { model: Usuario, as: 'Usuario' },
        { model: Equipo, as: 'Equipo' }
      ]
    });
    console.log(`   Total de relaciones: ${usuarioEquipos.length}`);
    usuarioEquipos.forEach(rel => {
      console.log(`   - ${rel.Usuario?.nombre || 'Usuario no encontrado'} → ${rel.Equipo?.nombre || 'Equipo no encontrado'}`);
    });

    console.log('\n📧 Verificando Invitaciones:');
    const invitaciones = await Invitacion.findAll({
      include: [
        { model: Usuario, as: 'Usuario' },
        { model: Partido, as: 'Partido' }
      ]
    });
    console.log(`   Total de invitaciones: ${invitaciones.length}`);
    invitaciones.forEach(inv => {
      console.log(`   - ${inv.Usuario?.nombre || 'Usuario no encontrado'} - Estado: ${inv.estado} - Criterio: ${inv.criterioOrigen}`);
    });

    console.log('\n📊 Verificando Historial:');
    const historiales = await Historial.findAll({
      include: [
        { model: Usuario, as: 'Usuario' },
        { model: Partido, as: 'Partido' }
      ]
    });
    console.log(`   Total de registros de historial: ${historiales.length}`);
    historiales.forEach(hist => {
      console.log(`   - ${hist.Usuario?.nombre || 'Usuario no encontrado'} - Resultado: ${hist.resultado}`);
    });

    console.log('\n✅ Verificación completada exitosamente');
    console.log('\n📊 RESUMEN FINAL:');
    console.log(`   🏢 Zonas: ${zonas.length}`);
    console.log(`   🏃 Deportes: ${deportes.length}`);
    console.log(`   👥 Usuarios: ${usuarios.length}`);
    console.log(`   ⚽ Partidos: ${partidos.length}`);
    console.log(`   🏆 Equipos: ${equipos.length}`);
    console.log(`   🔗 Usuario-Equipos: ${usuarioEquipos.length}`);
    console.log(`   📧 Invitaciones: ${invitaciones.length}`);
    console.log(`   📊 Historial: ${historiales.length}`);
    
  } catch (error) {
    console.error('❌ Error verificando datos:', error);
  } finally {
    await db.sequelize.close();
  }
}

verifyData();
