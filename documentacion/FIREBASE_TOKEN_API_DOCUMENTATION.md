# 📱 Firebase Token Management API

Esta documentación describe los endpoints para manejar tokens de Firebase para notificaciones push.

## 📋 **Endpoints Disponibles**

### **Base URL:** `http://localhost:3000/api/usuarios`

---

## 🔹 **1. Actualizar Token de Firebase**

**Endpoint:** `PUT /api/usuarios/{usuarioId}/firebase-token`

**Descripción:** Actualiza o registra el token de Firebase de un usuario para recibir notificaciones push.

### **Parámetros:**

- **usuarioId** (string, required): UUID del usuario

### **Body:**

```json
{
  "firebaseToken": "string (50-500 caracteres)"
}
```

### **Ejemplo de Request:**

```bash
PUT http://localhost:3000/api/usuarios/12345678-1234-1234-1234-123456789abc/firebase-token
Content-Type: application/json

{
  "firebaseToken": "dA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6abcdefghijklmnopqrstuvwxyz"
}
```

### **Respuestas:**

#### ✅ **200 - Éxito**

```json
{
  "success": true,
  "message": "Token de Firebase actualizado exitosamente"
}
```

#### ❌ **400 - Error de Validación**

```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "msg": "El token de Firebase debe tener entre 50 y 500 caracteres",
      "param": "firebaseToken",
      "location": "body"
    }
  ]
}
```

#### ❌ **404 - Usuario No Encontrado**

```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

---

## 🔹 **2. Eliminar Token de Firebase (Logout)**

**Endpoint:** `DELETE /api/usuarios/{usuarioId}/firebase-token`

**Descripción:** Elimina el token de Firebase del usuario (útil para logout).

### **Parámetros:**

- **usuarioId** (string, required): UUID del usuario

### **Ejemplo de Request:**

```bash
DELETE http://localhost:3000/api/usuarios/12345678-1234-1234-1234-123456789abc/firebase-token
```

### **Respuestas:**

#### ✅ **200 - Éxito**

```json
{
  "success": true,
  "message": "Token de Firebase eliminado exitosamente"
}
```

#### ❌ **404 - Usuario No Encontrado**

```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

---

## 🔹 **3. Obtener Usuario por ID**

**Endpoint:** `GET /api/usuarios/{usuarioId}`

**Descripción:** Obtiene información de un usuario (sin datos sensibles).

### **Parámetros:**

- **usuarioId** (string, required): UUID del usuario

### **Ejemplo de Request:**

```bash
GET http://localhost:3000/api/usuarios/12345678-1234-1234-1234-123456789abc
```

### **Respuestas:**

#### ✅ **200 - Éxito**

```json
{
  "success": true,
  "data": {
    "id": "12345678-1234-1234-1234-123456789abc",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "nivel": 2,
    "zonaId": "zona-uuid",
    "deporteId": "deporte-uuid",
    "score": 85.5,
    "createdAt": "2025-01-01T10:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

---

## 🔹 **4. Obtener Todos los Usuarios**

**Endpoint:** `GET /api/usuarios`

**Descripción:** Obtiene lista de todos los usuarios (para admin).

### **Ejemplo de Request:**

```bash
GET http://localhost:3000/api/usuarios
```

### **Respuestas:**

#### ✅ **200 - Éxito**

```json
{
  "success": true,
  "data": [
    {
      "id": "user1-uuid",
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "nivel": 2,
      "zonaId": "zona-uuid",
      "deporteId": "deporte-uuid",
      "score": 85.5
    },
    {
      "id": "user2-uuid",
      "nombre": "María García",
      "email": "maria@example.com",
      "nivel": 1,
      "zonaId": "zona-uuid",
      "deporteId": "deporte-uuid",
      "score": 92.3
    }
  ]
}
```

---

## 🔧 **Configuración de Base de Datos**

### **Nueva Columna Agregada:**

```sql
ALTER TABLE usuarios ADD COLUMN firebase_token VARCHAR(500) NULL;
```

**Características:**

- **Nombre:** `firebase_token`
- **Tipo:** `VARCHAR(500)`
- **Nullable:** `true`
- **Propósito:** Almacenar tokens de Firebase para notificaciones push

---

## 📱 **Integración con Cliente (Frontend)**

### **1. Registrar Token al Login:**

```javascript
// Después del login exitoso
const firebaseToken = await getFirebaseMessagingToken();

await fetch(`/api/usuarios/${userId}/firebase-token`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwtToken}`,
  },
  body: JSON.stringify({
    firebaseToken: firebaseToken,
  }),
});
```

### **2. Eliminar Token al Logout:**

```javascript
// Al hacer logout
await fetch(`/api/usuarios/${userId}/firebase-token`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${jwtToken}`,
  },
});
```

---

## 🔔 **Notificaciones Automáticas**

### **Cuándo se Envían Notificaciones:**

1. **Nuevo Partido:** Cuando se crea un partido
2. **Cambio de Estado:** Cuando cambia el estado de un partido
3. **Invitaciones:** Cuando se recibe una invitación (futuro)

### **Tipos de Notificaciones:**

#### **📧 Email (Ethereal - Testing)**

- Se envían a través de nodemailer
- Visibles en: https://ethereal.email/messages
- Credenciales en `.env`

#### **📱 Push (Firebase - Simulado)**

- Actualmente en modo simulación
- Logs en consola del servidor
- Para activar: descomentar Firebase Admin SDK

---

## 🧪 **Testing con Postman**

### **Colección de Endpoints:**

1. **Crear usuario token:**

   ```
   PUT {{baseUrl}}/api/usuarios/{{userId}}/firebase-token
   Body: {"firebaseToken": "test_token_abc123..."}
   ```

2. **Probar cambio de estado de partido:**

   ```
   PUT {{baseUrl}}/api/partidos/{{partidoId}}/cambiar-estado
   Body: {"nuevoEstado": "CONFIRMADO"}
   ```

3. **Verificar logs de notificaciones en consola del servidor**

---

## 📝 **Notas Importantes**

1. **Seguridad:** Los tokens de Firebase no se retornan en las consultas GET por seguridad
2. **Validación:** Los tokens deben tener entre 50 y 500 caracteres
3. **Base de Datos:** Se requiere ejecutar la migración para agregar la columna
4. **Testing:** Actualmente usando Ethereal para emails y simulación para push notifications

---

## 🚀 **Próximos Pasos**

1. **Configurar Firebase Admin SDK** para notificaciones push reales
2. **Implementar autenticación JWT** en los endpoints
3. **Agregar filtros y paginación** a la lista de usuarios
4. **Crear sistema de preferencias** de notificaciones por usuario
