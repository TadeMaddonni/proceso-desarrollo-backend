# Formato Estandarizado de Respuestas API

## 📋 Estructura de Respuestas

Todas las respuestas de la API siguen un formato consistente para facilitar el manejo en el frontend.

### ✅ Respuestas Exitosas

#### Estructura General
```json
{
  "success": true,
  "message": "Descripción del éxito",
  "data": {
    // Datos de respuesta específicos
  }
}
```

#### Ejemplos

**Login Exitoso:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "uuid-del-usuario",
      "nombre": "Juan Pérez",
      "email": "juan@email.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Registro Exitoso:**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "user": {
      "id": "uuid-del-usuario",
      "nombre": "Juan Pérez",
      "email": "juan@email.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### ❌ Respuestas de Error

#### Estructura General
```json
{
  "success": false,
  "error": "Descripción del error"
}
```

#### Ejemplos

**Error de Validación:**
```json
{
  "success": false,
  "error": "Email and password are required"
}
```

**Credenciales Inválidas:**
```json
{
  "success": false,
  "error": "Credenciales inválidas"
}
```

**Usuario Ya Existe:**
```json
{
  "success": false,
  "error": "El usuario ya existe"
}
```

**Error del Servidor:**
```json
{
  "success": false,
  "error": "Error interno del servidor",
  "details": "Detalles específicos del error (solo en desarrollo)"
}
```

## 🔧 Manejo en el Frontend

### JavaScript/React

#### Ejemplo de Login
```javascript
const login = async (email, password) => {
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    // Verificar si la respuesta fue exitosa
    if (response.ok && result.success) {
      // Login exitoso
      const { user, token } = result.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, user, token };
    } else {
      // Error en login
      throw new Error(result.error || 'Error desconocido');
    }
  } catch (error) {
    console.error('Error durante login:', error);
    throw error;
  }
};
```

#### Ejemplo de Uso en Componente React
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const result = await login(email, password);
    console.log('Login exitoso:', result);
    // Redirigir o actualizar estado
    navigate('/dashboard');
  } catch (error) {
    console.error('Error en login:', error.message);
    setError(error.message);
  }
};
```

## 🛡️ Códigos de Estado HTTP

### Exitosos (2xx)
- **200 OK**: Login exitoso, consulta exitosa
- **201 Created**: Usuario creado exitosamente

### Errores del Cliente (4xx)
- **400 Bad Request**: Datos faltantes o inválidos
- **401 Unauthorized**: Credenciales inválidas, token inválido
- **409 Conflict**: Usuario ya existe

### Errores del Servidor (5xx)
- **500 Internal Server Error**: Error interno del servidor

## 📝 Recomendaciones para el Frontend

### 1. Verificación de Respuesta
Siempre verificar tanto el código de estado HTTP como el campo `success`:

```javascript
if (response.ok && result.success) {
  // Manejar éxito
} else {
  // Manejar error
}
```

### 2. Manejo de Errores
Usar el campo `error` para mostrar mensajes al usuario:

```javascript
if (!result.success) {
  setErrorMessage(result.error);
}
```

### 3. Acceso a Datos
Los datos siempre están en `result.data`:

```javascript
const { user, token } = result.data;
```

### 4. Validación de Token
Para rutas protegidas, incluir el token en los headers:

```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
```

## 🚨 Errores Comunes a Evitar

### 1. No verificar el campo `success`
```javascript
// ❌ Incorrecto
if (response.ok) {
  // Puede fallar si success es false
}

// ✅ Correcto
if (response.ok && result.success) {
  // Verificación completa
}
```

### 2. Acceder a datos incorrectamente
```javascript
// ❌ Incorrecto
const user = result.user; // undefined

// ✅ Correcto
const user = result.data.user;
```

### 3. No manejar errores específicos
```javascript
// ❌ Incorrecto
catch (error) {
  console.log('Error genérico');
}

// ✅ Correcto
catch (error) {
  console.log('Error específico:', error.message);
  setErrorMessage(error.message);
}
```

## 🔄 Migración desde Formato Anterior

Si el frontend estaba esperando el formato anterior:

### Antes:
```json
{
  "message": "Login exitoso",
  "user": {...},
  "token": "..."
}
```

### Ahora:
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {...},
    "token": "..."
  }
}
```

### Código de Migración:
```javascript
// Cambiar de:
const { user, token } = result;

// A:
const { user, token } = result.data;
```

Este formato estandarizado garantiza consistencia en toda la API y facilita el manejo de errores en el frontend.
