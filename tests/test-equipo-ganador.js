/**
 * Test para probar el endpoint de actualización de equipo ganador
 * Este script debe ejecutarse después de haber finalizado un partido
 */

const axios = require('axios');
const BASE_URL = 'http://localhost:3000/api';

// Configuración de la prueba (ajustar según tu entorno)
const CONFIG = {
  // Estos IDs deben existir en tu base de datos
  partidoId: '550e8400-e29b-41d4-a716-446655440002', // Cambia por un ID real
  token: 'Bearer tu_jwt_token_aquí', // Cambia por un token válido
};

/**
 * Finaliza un partido (si no está finalizado)
 */
async function finalizarPartido() {
  console.log(`\n🏁 Finalizando partido ${CONFIG.partidoId} si es necesario...`);
  try {
    const response = await axios.put(
      `${BASE_URL}/partidos/${CONFIG.partidoId}/estado`,
      { nuevoEstado: 'FINALIZADO' },
      { headers: { Authorization: CONFIG.token } }
    );
    console.log('✅ Partido finalizado correctamente');
    return true;
  } catch (error) {
    if (error.response?.data?.message?.includes('ya está finalizado')) {
      console.log('ℹ️ El partido ya estaba finalizado');
      return true;
    } else {
      console.error('❌ Error al finalizar partido:', error.response?.data || error.message);
      return false;
    }
  }
}

/**
 * Establece el equipo ganador
 */
async function establecerEquipoGanador(equipo) {
  console.log(`\n🏆 Estableciendo equipo ganador: ${equipo}`);
  try {
    const response = await axios.put(
      `${BASE_URL}/partidos/${CONFIG.partidoId}/ganador`,
      { equipoGanador: equipo },
      { headers: { Authorization: CONFIG.token } }
    );
    console.log('✅ Respuesta:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Obtiene los detalles del partido
 */
async function obtenerPartido() {
  console.log(`\n📋 Verificando partido ${CONFIG.partidoId}`);
  try {
    const response = await axios.get(
      `${BASE_URL}/partidos/${CONFIG.partidoId}`,
      { headers: { Authorization: CONFIG.token } }
    );
    
    const partido = response.data.data;
    console.log('📊 Detalles del partido:');
    console.log(`  - Estado: ${partido.estado}`);
    console.log(`  - Equipo ganador: ${partido.equipoGanador || 'No definido'}`);
    
    return partido;
  } catch (error) {
    console.error('❌ Error al obtener partido:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Ejecuta la prueba completa
 */
async function ejecutarPrueba() {
  console.log('🧪 PRUEBA DE EQUIPO GANADOR');
  console.log('==========================');
  
  // Primero verificamos el partido
  const partidoInicial = await obtenerPartido();
  if (!partidoInicial) {
    console.error('❌ No se pudo obtener el partido, verifica el ID');
    return;
  }
  
  // Si el partido no está finalizado, lo finalizamos
  if (partidoInicial.estado !== 'FINALIZADO') {
    const finalizado = await finalizarPartido();
    if (!finalizado) {
      console.error('❌ No se pudo finalizar el partido, prueba cancelada');
      return;
    }
  }
  
  // Establecer equipo A como ganador
  await establecerEquipoGanador('A');
  
  // Verificar cambio
  const partidoActualizado = await obtenerPartido();
  if (partidoActualizado && partidoActualizado.equipoGanador === 'A') {
    console.log('✅ Prueba exitosa: Equipo A establecido como ganador');
  } else {
    console.error('❌ Error: El equipo ganador no se actualizó correctamente');
  }
  
  console.log('\n📝 RESUMEN:');
  console.log('1. PUT /api/partidos/:id/ganador - Actualizar equipo ganador');
  console.log('\nREQUERIMIENTOS:');
  console.log('- Partido debe estar FINALIZADO');
  console.log('- equipoGanador debe ser "A" o "B"');
}

// Ejecutar la prueba
ejecutarPrueba().catch(console.error);
