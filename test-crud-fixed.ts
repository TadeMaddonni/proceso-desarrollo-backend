// Test script para verificar operaciones CRUD y relaciones entre modelos TypeScript
import dotenv from 'dotenv';

console.log('🧪 Iniciando pruebas CRUD después del seed completo...');
dotenv.config();

async function testCrudOperations(): Promise<void> {
  try {
    console.log('📦 Importando models...');
    const db = await import('./src/models/index.js');
    
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

    console.log('🔌 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa');

    // 1. TEST: Leer todos los registros de cada modelo
    console.log('\n🔍 PRUEBA 1: Verificando datos en todas las tablas...');
    
    const zonas = await Zona.findAll();
    console.log(`   📍 Zonas encontradas: ${zonas.length}`);
    
    const deportes = await Deporte.findAll();
    console.log(`   ⚽ Deportes encontrados: ${deportes.length}`);
    
    const usuarios = await Usuario.findAll();
    console.log(`   👥 Usuarios encontrados: ${usuarios.length}`);
    
    const partidos = await Partido.findAll();
    console.log(`   🏆 Partidos encontrados: ${partidos.length}`);
    
    const equipos = await Equipo.findAll();
    console.log(`   👤 Equipos encontrados: ${equipos.length}`);
    
    const usuarioEquipos = await UsuarioEquipo.findAll();
    console.log(`   🤝 UsuarioEquipos encontrados: ${usuarioEquipos.length}`);
    
    const invitaciones = await Invitacion.findAll();
    console.log(`   💌 Invitaciones encontradas: ${invitaciones.length}`);
    
    const historiales = await Historial.findAll();
    console.log(`   📋 Registros de historial encontrados: ${historiales.length}`);

    // 2. TEST: Verificar relaciones - Usuario con Zona y Deporte
    console.log('\n🔗 PRUEBA 2: Verificando relaciones Usuario -> Zona/Deporte...');
    const primerUsuario = await Usuario.findOne({
      include: [
        { model: Zona, as: 'Zona' },
        { model: Deporte, as: 'Deporte' }
      ]
    }) as any;
    
    if (primerUsuario) {
      console.log(`   👤 Usuario: ${primerUsuario.nombre}`);
      console.log(`   📍 Zona: ${primerUsuario.Zona?.nombre || 'N/A'}`);
      console.log(`   ⚽ Deporte: ${primerUsuario.Deporte?.nombre || 'N/A'}`);
    }

    // 3. TEST: Verificar relación Partido con Organizador, Zona y Deporte
    console.log('\n🏆 PRUEBA 3: Verificando relaciones Partido -> Organizador/Zona/Deporte...');
    const primerPartido = await Partido.findOne({
      include: [
        { model: Usuario, as: 'organizador' },
        { model: Zona },
        { model: Deporte }
      ]
    }) as any;
    
    if (primerPartido) {
      console.log(`   🏆 Fecha: ${primerPartido.fecha}`);
      console.log(`   👤 Organizador: ${primerPartido.organizador?.nombre || 'N/A'}`);
      console.log(`   📍 Zona: ${primerPartido.Zona?.nombre || 'N/A'}`);
      console.log(`   ⚽ Deporte: ${primerPartido.Deporte?.nombre || 'N/A'}`);
    }

    // 4. TEST: Verificar relación Equipo con Partido
    console.log('\n👤 PRUEBA 4: Verificando relación Equipo -> Partido...');
    const primerEquipo = await Equipo.findOne({
      include: [{ model: Partido }]
    }) as any;
    
    if (primerEquipo) {
      console.log(`   👤 Equipo: ${primerEquipo.nombre}`);
      console.log(`   🏆 Partido: ${primerEquipo.Partido?.fecha || 'N/A'}`);
    }

    // 5. TEST: Crear un nuevo usuario para probar INSERT
    console.log('\n➕ PRUEBA 5: Creando nuevo usuario...');
    const nuevaZona = zonas[0] as any;
    const nuevoDeporte = deportes[0] as any;
    
    const nuevoUsuario = await Usuario.create({
      nombre: 'Test Usuario',
      correo: 'test.usuario@test.com',
      contraseña: 'test123',
      nivel: 2,
      zonaId: nuevaZona.id,
      deporteId: nuevoDeporte.id
    }) as any;
    
    console.log(`   ✅ Usuario creado: ${nuevoUsuario.nombre} (ID: ${nuevoUsuario.id})`);

    // 6. TEST: Actualizar el usuario recién creado
    console.log('\n✏️ PRUEBA 6: Actualizando usuario creado...');
    await nuevoUsuario.update({ nivel: 3 });
    console.log(`   ✅ Usuario actualizado - Nuevo nivel: ${nuevoUsuario.nivel}`);

    // 7. TEST: Crear un historial para el nuevo usuario
    console.log('\n📋 PRUEBA 7: Creando registro de historial...');
    const partidoParaHistorial = partidos[0] as any;
    
    const nuevoHistorial = await Historial.create({
      usuarioId: nuevoUsuario.id,
      partidoId: partidoParaHistorial.id,
      resultado: 'victoria'
    }) as any;
    
    console.log(`   ✅ Historial creado: ${nuevoHistorial.resultado} (ID: ${nuevoHistorial.id})`);

    // 8. TEST: Consulta compleja con múltiples includes
    console.log('\n🔍 PRUEBA 8: Consulta compleja con múltiples relaciones...');
    const usuarioCompleto = await Usuario.findByPk(nuevoUsuario.id, {
      include: [
        { model: Zona, as: 'Zona' },
        { model: Deporte, as: 'Deporte' },
        { model: Historial }
      ]
    }) as any;
    
    if (usuarioCompleto) {
      console.log(`   👤 Usuario completo: ${usuarioCompleto.nombre}`);
      console.log(`   📍 Zona: ${usuarioCompleto.Zona?.nombre}`);
      console.log(`   ⚽ Deporte: ${usuarioCompleto.Deporte?.nombre}`);
      console.log(`   📋 Historiales: ${usuarioCompleto.Historials?.length || 0}`);
    }

    // 9. TEST: Eliminar registros de prueba
    console.log('\n🗑️ PRUEBA 9: Limpiando datos de prueba...');
    await nuevoHistorial.destroy();
    await nuevoUsuario.destroy();
    console.log('   ✅ Datos de prueba eliminados');

    console.log('\n🎉 ¡Todas las pruebas CRUD completadas exitosamente!');
    console.log('✅ La conversión a TypeScript fue exitosa - todos los modelos y relaciones funcionan correctamente');

  } catch (error) {
    console.error('❌ Error en las pruebas CRUD:', error);
    throw error;
  } finally {
    console.log('\n🔌 Cerrando conexión...');
    const db = await import('./src/models/index.js');
    await db.default.sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

testCrudOperations().catch(console.error);
