const axios = require('axios');

/**
 * Script para probar las nuevas rutas de invitaciones
 * Verifica que se puedan obtener invitaciones por usuario y por partido
 */

const BASE_URL = 'http://localhost:3000/api';

// Configuración de prueba
const TEST_CONFIG = {
  // Estos IDs deben existir en tu base de datos
  usuarioId: '550e8400-e29b-41d4-a716-446655440001', // Cambia por un ID real
  partidoId: '550e8400-e29b-41d4-a716-446655440002', // Cambia por un ID real
  token: 'Bearer tu_jwt_token_aqui' // Cambia por un token JWT válido
};

async function testObtenerInvitacionesPorUsuario() {
  console.log('\n🔍 Probando: Obtener invitaciones por usuario');
  console.log('=' .repeat(50));
  
  try {
    const response = await axios.get(
      `${BASE_URL}/invitaciones/usuario/${TEST_CONFIG.usuarioId}`,
      {
        headers: {
          'Authorization': TEST_CONFIG.token,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Respuesta exitosa:', response.status);
    console.log('📊 Datos recibidos:', {
      success: response.data.success,
      message: response.data.message,
      invitaciones: response.data.data?.length || 0
    });
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('📝 Primera invitación:');
      const primeraInvitacion = response.data.data[0];
      console.log(`   - ID: ${primeraInvitacion.id}`);
      console.log(`   - Estado: ${primeraInvitacion.estado}`);
      console.log(`   - Partido: ${primeraInvitacion.Partido?.Deporte?.nombre || 'N/A'}`);
      console.log(`   - Fecha: ${primeraInvitacion.createdAt}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('🔍 Status:', error.response?.status);
  }
}

async function testObtenerInvitacionesPorPartido() {
  console.log('\n🔍 Probando: Obtener invitaciones por partido');
  console.log('=' .repeat(50));
  
  try {
    const response = await axios.get(
      `${BASE_URL}/invitaciones/partido/${TEST_CONFIG.partidoId}`,
      {
        headers: {
          'Authorization': TEST_CONFIG.token,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Respuesta exitosa:', response.status);
    console.log('📊 Datos recibidos:', {
      success: response.data.success,
      message: response.data.message,
      invitaciones: response.data.data?.length || 0
    });
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('📝 Primera invitación:');
      const primeraInvitacion = response.data.data[0];
      console.log(`   - ID: ${primeraInvitacion.id}`);
      console.log(`   - Estado: ${primeraInvitacion.estado}`);
      console.log(`   - Usuario: ${primeraInvitacion.Usuario?.nombre || 'N/A'}`);
      console.log(`   - Email: ${primeraInvitacion.Usuario?.email || 'N/A'}`);
      console.log(`   - Fecha: ${primeraInvitacion.createdAt}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('🔍 Status:', error.response?.status);
  }
}

async function testRutasInvitaciones() {
  console.log('🧪 PRUEBA DE RUTAS DE INVITACIONES');
  console.log('==================================');
  console.log('📝 Configuración de prueba:');
  console.log(`   - Base URL: ${BASE_URL}`);
  console.log(`   - Usuario ID: ${TEST_CONFIG.usuarioId}`);
  console.log(`   - Partido ID: ${TEST_CONFIG.partidoId}`);
  console.log(`   - Token: ${TEST_CONFIG.token.substring(0, 20)}...`);
  
  // Ejecutar tests
  await testObtenerInvitacionesPorUsuario();
  await testObtenerInvitacionesPorPartido();
  
  console.log('\n✅ PRUEBAS COMPLETADAS');
  console.log('======================');
  console.log('📋 Resumen:');
  console.log('   - GET /api/invitaciones/usuario/:usuarioId');
  console.log('   - GET /api/invitaciones/partido/:partidoId');
  console.log('\n💡 Notas:');
  console.log('   - Asegúrate de tener un token JWT válido');
  console.log('   - Los IDs deben existir en la base de datos');
  console.log('   - El servidor debe estar ejecutándose en localhost:3000');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testRutasInvitaciones().catch(console.error);
}

module.exports = {
  testObtenerInvitacionesPorUsuario,
  testObtenerInvitacionesPorPartido,
  testRutasInvitaciones
};
