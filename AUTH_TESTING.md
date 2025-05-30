# Guía de Pruebas - Flujo de Autenticación JWT

## Arquitectura Implementada

El flujo de autenticación sigue la arquitectura de capas correcta:

```
Route → Middleware → Controller → Service → Model
```

### 📋 Responsabilidades por Capa:

1. **Routes (`/src/routes/auth/Auth.ts`)**:

   - Definición de endpoints
   - Aplicación de middleware de autenticación
   - Delegación a controllers

2. **Middleware (`/src/middleware/authMiddleware.ts`)**:

   - Validación de tokens JWT
   - Extracción de datos de usuario
   - Protección de rutas

3. **Controllers (`/src/controllers/auth/AuthController.ts`)**:

   - Validación de datos de entrada
   - Manejo de errores HTTP
   - Generación de tokens JWT
   - Delegación a services

4. **Services (`/src/services/auth/AuthService.ts`)**:

   - Lógica de negocio
   - Hasheo y verificación de contraseñas
   - Interacción con base de datos
   - Validaciones de duplicados
   - Validación de existencia de zonas y deportes

5. **Models (Sequelize)**:
   - Definición de estructura de datos
   - Operaciones CRUD

## 🧪 Pruebas con Postman

### 1. Registro de Usuario (POST /auth/signup)

**URL:** `http://localhost:3000/auth/signup`

**Headers:**

```
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "miPassword123",
  "nombre": "Juan Pérez",
  "zonaId": "uuid-de-zona-valido",
  "deporteId": "uuid-de-deporte-valido",
  "nivel": 2
}
```

**Respuesta exitosa (201):**

```json
{
  "user": {
    "id": "uuid-generado",
    "correo": "usuario@ejemplo.com",
    "nombre": "Juan Pérez",
    "nivel": 2,
    "zonaId": "uuid-de-zona-valido",
    "deporteId": "uuid-de-deporte-valido",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

**Respuesta error - Usuario existe (409):**

```json
{
  "error": "El usuario ya existe"
}
```

**Respuesta error - Zona no existe (400):**

```json
{
  "error": "La zona especificada no existe"
}
```

**Respuesta error - Deporte no existe (400):**

```json
{
  "error": "El deporte especificado no existe"
}
```

**Respuesta error - Campos faltantes (400):**

```json
{
  "error": "Email, password, nombre y zonaId son requeridos"
}
```

### 2. Inicio de Sesión (POST /auth/login)

**URL:** `http://localhost:3000/auth/login`

**Headers:**

```
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "email": "usuario@ejemplo.com",
  "password": "miPassword123"
}
```

**Respuesta exitosa (200):**
  
```json
{
  "user": {
    "id": 1,
    "correo": "usuario@ejemplo.com",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta error - Credenciales inválidas (401):**

```json
{
  "error": "Credenciales inválidas"
}
```

### 3. Ruta Protegida (GET /auth/protected)

**URL:** `http://localhost:3000/auth/protected`

**Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa (200):**

```json
{
  "message": "Acceso autorizado",
  "user": {
    "correo": "usuario@ejemplo.com",
    "id": 1,
    "iat": 1640995200,
    "exp": 1641002400
  }
}
```

**Respuesta error - Sin token (401):**

```json
{
  "error": "Token no proporcionado"
}
```

**Respuesta error - Token inválido (403):**

```json
{
  "error": "Token inválido o expirado"
}
```

## 🔒 Características de Seguridad

- **Contraseñas hasheadas**: Uso de bcrypt con salt rounds de 10
- **Tokens JWT**: Expiración de 2 horas
- **Validación de entrada**: Verificación de campos requeridos (email, password, nombre, zonaId)
- **Protección de duplicados**: Verificación de usuarios existentes
- **Validación de integridad**: Verificación de existencia de zonas y deportes
- **Error handling**: Manejo consistente de errores con mensajes específicos

## ✅ Validación del Flujo Completo

1. **Registro**: Usuario → Route → Controller → Service (validar zona/deporte + hash password) → Model → DB
2. **Login**: Usuario → Route → Controller → Service (verify password) → Model → DB → JWT
3. **Acceso protegido**: Usuario → Route → Middleware (verify JWT) → Controller → Response

## 🛠️ Variables de Entorno

Asegúrate de tener configurado:

```env
JWT_SECRET=tu_clave_secreta_muy_segura
NODE_ENV=development
```

## 📝 Notas Importantes

- Las contraseñas se hashean automáticamente en el service
- Los tokens incluyen `id` y `correo` del usuario
- Los errores se manejan de forma consistente
- La separación de responsabilidades está correctamente implementada
- **Campos requeridos para registro**: email, password, nombre, zonaId
- **Campos opcionales para registro**: deporteId, nivel
- **Validaciones**: Se verifica que zonaId y deporteId (si se proporciona) existan en la base de datos

## 🗂️ Obtener IDs de Zona y Deporte

Para obtener los IDs válidos de zonas y deportes, puedes ejecutar el seeder:

```bash
npm run seed
```

O consultar directamente la base de datos. Los UUIDs generados tendrán el formato:

- **Zonas**: Palermo, Caballito, Belgrano, Recoleta, Flores
- **Deportes**: Fútbol 5, Básquet, Tenis, Pádel, Vóley

## 🧪 Ejemplo de Registro Completo

```json
{
  "email": "maria.garcia@email.com",
  "password": "miPassword123",
  "nombre": "María García",
  "zonaId": "8f4783fa-1a51-4a1b-a7ca-61dc6867df91",
  "deporteId": "0452f3e6-de91-4a70-95b5-1cf83e9e33fb",
  "nivel": 3
}
```
