// Script de pruebas para verificar la implementación de JWT
// Ejecutar con: node tests/test-jwt-implementation.js

const baseURL = 'http://localhost:3000';

// Función para hacer peticiones HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(baseURL + url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { error: error.message };
  }
}

// Datos de prueba
const testUser = {
  nombre: 'Usuario Test JWT',
  email: `test-jwt-${Date.now()}@email.com`,
  password: 'password123'
};

async function runJWTTests() {
  console.log('🔐 Iniciando pruebas de implementación JWT...\n');

  let authToken = null;

  try {
    // 1. Registro de usuario
    console.log('1️⃣ Probando registro de usuario...');
    const signupResult = await makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(testUser)
    });
    
    if (signupResult.status === 201) {
      console.log('✅ Registro exitoso');
    } else {
      console.log('❌ Error en registro:', signupResult);
    }

    // 2. Login y obtención de token
    console.log('\n2️⃣ Probando login...');
    const loginResult = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    if (loginResult.status === 200 && loginResult.data.data?.token) {
      authToken = loginResult.data.data.token;
      console.log('✅ Login exitoso, token obtenido');
    } else {
      console.log('❌ Error en login:', loginResult);
      return;
    }

    // 3. Probar ruta protegida SIN token (debe fallar)
    console.log('\n3️⃣ Probando ruta protegida SIN token...');
    const protectedWithoutTokenResult = await makeRequest('/api/usuarios');
    
    if (protectedWithoutTokenResult.status === 401) {
      console.log('✅ Ruta protegida rechaza correctamente peticiones sin token');
    } else {
      console.log('❌ Ruta protegida debería rechazar peticiones sin token:', protectedWithoutTokenResult);
    }

    // 4. Probar ruta protegida CON token (debe funcionar)
    console.log('\n4️⃣ Probando ruta protegida CON token válido...');
    const protectedWithTokenResult = await makeRequest('/api/usuarios', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (protectedWithTokenResult.status === 200) {
      console.log('✅ Ruta protegida acepta correctamente token válido');
    } else {
      console.log('❌ Ruta protegida debería aceptar token válido:', protectedWithTokenResult);
    }

    // 5. Probar ruta con autenticación opcional SIN token
    console.log('\n5️⃣ Probando ruta con autenticación opcional SIN token...');
    const optionalWithoutTokenResult = await makeRequest('/api/deportes');
    
    if (optionalWithoutTokenResult.status === 200) {
      console.log('✅ Ruta con autenticación opcional funciona sin token');
    } else {
      console.log('❌ Ruta con autenticación opcional debería funcionar sin token:', optionalWithoutTokenResult);
    }

    // 6. Probar ruta con autenticación opcional CON token
    console.log('\n6️⃣ Probando ruta con autenticación opcional CON token...');
    const optionalWithTokenResult = await makeRequest('/api/deportes', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (optionalWithTokenResult.status === 200) {
      console.log('✅ Ruta con autenticación opcional funciona con token');
    } else {
      console.log('❌ Ruta con autenticación opcional debería funcionar con token:', optionalWithTokenResult);
    }

    // 7. Probar token inválido
    console.log('\n7️⃣ Probando token inválido...');
    const invalidTokenResult = await makeRequest('/api/usuarios', {
      headers: {
        'Authorization': 'Bearer token_invalido'
      }
    });

    if (invalidTokenResult.status === 401) {
      console.log('✅ Token inválido es rechazado correctamente');
    } else {
      console.log('❌ Token inválido debería ser rechazado:', invalidTokenResult);
    }

    // 8. Probar operaciones CRUD protegidas
    console.log('\n8️⃣ Probando operaciones CRUD protegidas...');
    
    // Crear deporte (requiere JWT)
    const createDeporteResult = await makeRequest('/api/deportes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        nombre: 'Deporte Test JWT'
      })
    });

    if (createDeporteResult.status === 201) {
      console.log('✅ Creación de deporte con JWT exitosa');
    } else {
      console.log('❌ Error al crear deporte con JWT:', createDeporteResult);
    }

    // Intentar crear deporte sin JWT (debe fallar)
    const createDeporteSinJWTResult = await makeRequest('/api/deportes', {
      method: 'POST',
      body: JSON.stringify({
        nombre: 'Deporte Test Sin JWT'
      })
    });

    if (createDeporteSinJWTResult.status === 401) {
      console.log('✅ Creación de deporte sin JWT es rechazada correctamente');
    } else {
      console.log('❌ Creación de deporte sin JWT debería ser rechazada:', createDeporteSinJWTResult);
    }

    console.log('\n🎉 Pruebas de JWT completadas');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
}

// Verificar si Node.js tiene fetch (Node 18+) o usar alternativa
if (typeof fetch === 'undefined') {
  console.log('⚠️  Este script requiere Node.js 18+ o la instalación de node-fetch');
  console.log('💡 Alternativa: Usar Postman o curl para las pruebas');
  console.log('\n📝 Comandos curl de ejemplo:');
  console.log('# Registro:');
  console.log('curl -X POST http://localhost:3000/auth/signup -H "Content-Type: application/json" -d \'{"nombre":"Test","email":"test@email.com","password":"123"}\'');
  console.log('\n# Login:');
  console.log('curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d \'{"email":"test@email.com","password":"123"}\'');
  console.log('\n# Ruta protegida:');
  console.log('curl -X GET http://localhost:3000/api/usuarios -H "Authorization: Bearer YOUR_TOKEN"');
} else {
  // Ejecutar las pruebas
  runJWTTests();
}

module.exports = { runJWTTests };
