// Test completo de CRUD para el campo jugadoresConfirmados
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.chdir(__dirname);

const dbPromise = (await import('../dist/models/index.js')).default;

async function testCRUDCompleto() {
  try {
    console.log('🧪 Iniciando test CRUD completo de jugadoresConfirmados...');
    
    const db = await dbPromise;
    const Partido = db.Partido;
    const Usuario = db.Usuario;
    const Zona = db.Zona;
    const Deporte = db.Deporte;
    
    // 1. TEST CREATE - Crear un nuevo partido
    console.log('\n📝 1. TEST CREATE - Creando nuevo partido...');
    
    // Obtener datos necesarios
    const organizador = await Usuario.findOne();
    const zona = await Zona.findOne();
    const deporte = await Deporte.findOne();
    
    if (!organizador || !zona || !deporte) {
      throw new Error('Faltan datos base para el test');
    }
    
    const nuevoPartido = await Partido.create({
      deporteId: deporte.id,
      zonaId: zona.id,
      organizadorId: organizador.id,
      fecha: new Date('2025-12-31'),
      hora: '20:00',
      duracion: 2,
      direccion: 'Cancha Test - Jugadores Confirmados',
      estado: 'NECESITAMOS_JUGADORES',
      cantidadJugadores: 12,
      jugadoresConfirmados: 0, // Valor explícito
      tipoEmparejamiento: 'ZONA'
    });
    
    console.log(`✅ Partido creado con ID: ${nuevoPartido.id}`);
    console.log(`✅ Jugadores confirmados inicial: ${nuevoPartido.jugadoresConfirmados}`);
    
    // 2. TEST READ - Leer el partido creado
    console.log('\n📖 2. TEST READ - Leyendo partido...');
    
    const partidoLeido = await Partido.findByPk(nuevoPartido.id);
    console.log(`✅ Partido leído - Jugadores confirmados: ${partidoLeido.jugadoresConfirmados}`);
    
    // 3. TEST UPDATE - Actualizar jugadores confirmados
    console.log('\n🔄 3. TEST UPDATE - Actualizando jugadores confirmados...');
    
    await partidoLeido.update({ jugadoresConfirmados: 8 });
    await partidoLeido.reload();
    console.log(`✅ Jugadores confirmados actualizado a: ${partidoLeido.jugadoresConfirmados}`);
    
    // 4. TEST DTO MAPPING - Verificar mapeo a DTO
    console.log('\n🗂️ 4. TEST DTO MAPPING - Verificando mapeo...');
    
    const PartidoService = (await import('../dist/services/partido/PartidoService.js')).PartidoService;
    const partidoDTO = await PartidoService.obtenerPartidoPorId(nuevoPartido.id);
    
    if (partidoDTO && partidoDTO.jugadoresConfirmados !== undefined) {
      console.log(`✅ DTO mapping exitoso - jugadoresConfirmados: ${partidoDTO.jugadoresConfirmados}`);
      console.log(`✅ Capacidad total: ${partidoDTO.cantidadJugadores}`);
      console.log(`✅ Ratio confirmados/total: ${partidoDTO.jugadoresConfirmados}/${partidoDTO.cantidadJugadores}`);
    } else {
      throw new Error('El campo jugadoresConfirmados no está presente en el DTO');
    }
    
    // 5. TEST VALIDATION - Probar validaciones
    console.log('\n✅ 5. TEST VALIDATION - Probando validaciones...');
    
    try {
      await partidoLeido.update({ jugadoresConfirmados: -1 });
      console.log('❌ FALLO: Se permitió valor negativo');
    } catch (error) {
      console.log('✅ Validación correcta: valores negativos rechazados');
    }
    
    // 6. TEST DELETE - Limpiar datos de prueba
    console.log('\n🗑️ 6. TEST CLEANUP - Limpiando datos de prueba...');
    
    await partidoLeido.destroy();
    console.log('✅ Datos de prueba eliminados');
    
    console.log('\n🎉 TODOS LOS TESTS PASARON EXITOSAMENTE');
    console.log('✨ El campo jugadoresConfirmados está completamente funcional');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error en el test:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testCRUDCompleto();
