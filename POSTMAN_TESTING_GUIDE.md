# 🧪 Guía de Testing con Postman - Sistema de Partidos y Emparejamiento

Esta guía te ayudará a probar completamente el sistema refactorizado con principios SOLID, incluyendo el nuevo flujo de invitaciones y la gestión de partidos.

## 📋 Configuración Inicial

### 1. Variables de Entorno en Postman

Crea las siguientes variables en tu colección:

- `baseUrl`: `http://localhost:3000` (o tu puerto configurado)
- `token`: Se actualizará automáticamente después del login
- `usuarioId`: Se actualizará con el ID del usuario logueado
- `partidoId`: Se actualizará con IDs de partidos creados
- `invitacionId`: Se actualizará con IDs de invitaciones

### 2. Iniciar el Servidor

```bash
npm run dev
```

## 🔑 1. AUTENTICACIÓN

### 1.1 Registrar Usuario

```http
POST {{baseUrl}}/auth/signup
Content-Type: application/json

{
  "nombre": "Test User",
  "email": "test@email.com",
  "password": "password123",
  "nivel": 2,
  "zonaId": "{{zonaId}}",
  "deporteId": "{{deporteId}}"
}
```

**📝 Nota**: Los campos requeridos son `email`, `password`, `nombre` y `zonaId`. Los campos `nivel` y `deporteId` son opcionales.

### 1.2 Login

```http
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "juan.pérez@email.com",
  "password": "password123"
}
```

**✅ Test**: Guarda el `token` y `usuarioId` en variables de entorno.

### 1.3 Verificar Token

```http
GET {{baseUrl}}/auth/protected
Authorization: Bearer {{token}}
```

## 📍 2. DATOS MAESTROS

### 2.1 Obtener Zonas

```http
GET {{baseUrl}}/api/zonas
```

**✅ Test**: Guarda un `zonaId` para usar en otros endpoints.

### 2.2 Obtener Deportes

```http
GET {{baseUrl}}/api/deportes
```

**✅ Test**: Guarda un `deporteId` para usar en otros endpoints.

### 2.3 Obtener Usuarios

```http
GET {{baseUrl}}/api/usuarios
Authorization: Bearer {{token}}
```

**✅ Test**: Obtén IDs de diferentes usuarios para las pruebas.

## ⚽ 3. GESTIÓN DE PARTIDOS

### 3.1 Crear Partido

```http
POST {{baseUrl}}/api/partidos
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "deporteId": "{{deporteId}}",
  "zonaId": "{{zonaId}}",
  "organizadorId": "{{usuarioId}}",
  "fecha": "2025-06-15",
  "hora": "18:00",
  "duracion": 2.0,
  "direccion": "Cancha Test - Palermo",
  "tipoEmparejamiento": "ZONA",
  "nivelMinimo": 1,
  "nivelMaximo": 3
}
```

**✅ Test**: Guarda el `partidoId` devuelto.

### 3.2 Obtener Todos los Partidos

```http
GET {{baseUrl}}/api/partidos
Authorization: Bearer {{token}}
```

### 3.3 Obtener Partido por ID

```http
GET {{baseUrl}}/api/partidos/{{partidoId}}
Authorization: Bearer {{token}}
```

### 3.4 Actualizar Estado del Partido

```http
PUT {{baseUrl}}/api/partidos/{{partidoId}}/estado
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "estado": "ARMADO"
}
```

**✅ Test**: Prueba diferentes estados: `NECESITAMOS_JUGADORES`, `ARMADO`, `CONFIRMADO`, `EN_JUEGO`, `FINALIZADO`, `CANCELADO`.

### 3.5 Finalizar Partido

```http
PUT {{baseUrl}}/api/partidos/{{partidoId}}/finalizar
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "equipoGanador": "A"
}
```

## 🤝 4. SISTEMA DE EMPAREJAMIENTO

### 4.1 Ejecutar Emparejamiento Manual

```http
POST {{baseUrl}}/api/emparejamiento/ejecutar
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "partidoId": "{{partidoId}}"
}
```

**✅ Test**: Verifica que se crean invitaciones para usuarios compatibles.

### 4.2 Obtener Candidatos para Emparejamiento

```http
GET {{baseUrl}}/api/emparejamiento/{{partidoId}}/candidatos
Authorization: Bearer {{token}}
```

## 💌 5. SISTEMA DE INVITACIONES (NUEVA FUNCIONALIDAD)

### 5.1 Obtener Invitaciones del Usuario

```http
GET {{baseUrl}}/api/invitaciones/usuario/{{usuarioId}}
Authorization: Bearer {{token}}
```

### 5.2 Obtener Invitaciones de un Partido

```http
GET {{baseUrl}}/api/invitaciones/partido/{{partidoId}}
Authorization: Bearer {{token}}
```

### 5.3 Aceptar Invitación

```http
PUT {{baseUrl}}/api/invitaciones/{{invitacionId}}/aceptar
Authorization: Bearer {{token}}
```

**✅ Test**: Verifica que el usuario se une al partido y la invitación cambia a estado `aceptada`.

### 5.4 Cancelar Invitación

```http
PUT {{baseUrl}}/api/invitaciones/{{invitacionId}}/cancelar
Authorization: Bearer {{token}}
```

**✅ Test**: Verifica que la invitación cambia a estado `cancelada`.

## 🔧 6. HEALTH CHECK

### 6.1 Verificar Estado del Servidor

```http
GET {{baseUrl}}/api/health
```

### 6.2 Verificar Estado de la Base de Datos

```http
GET {{baseUrl}}/api/health/db
```

## 📊 7. FLUJOS DE PRUEBA COMPLETOS

### 7.1 Flujo Completo: Crear Partido y Unirse por Invitación

1. **Login** como usuario organizador
2. **Crear partido** → Obtener `partidoId`
3. **Ejecutar emparejamiento** para ese partido
4. **Login** como otro usuario
5. **Obtener invitaciones** del segundo usuario
6. **Aceptar invitación** → Verificar que se une al partido
7. **Verificar** que el partido ahora tiene al usuario en la lista de participantes

### 7.2 Flujo de Validaciones de Invitación

1. **Intentar aceptar invitación inexistente** → Error 404
2. **Intentar aceptar invitación ya aceptada** → Error 400
3. **Intentar aceptar invitación de otro usuario** → Error 403
4. **Intentar cancelar invitación ya cancelada** → Error 400

### 7.3 Flujo de Estados del Partido

1. **Crear partido** (estado inicial: `NECESITAMOS_JUGADORES`)
2. **Cambiar a `ARMADO`** → Verificar cambio exitoso
3. **Cambiar a `CONFIRMADO`** → Verificar cambio exitoso
4. **Cambiar a `EN_JUEGO`** → Verificar cambio exitoso
5. **Finalizar partido** con equipo ganador → Estado: `FINALIZADO`

## ❌ 8. CASOS DE ERROR A PROBAR

### 8.1 Autenticación

- Login con credenciales incorrectas
- Acceso a endpoints protegidos sin token
- Acceso con token expirado/inválido

### 8.2 Validaciones de Partido

- Crear partido con fecha en el pasado
- Crear partido con datos inválidos (deporteId inexistente, etc.)
- Actualizar estado a valor inválido

### 8.3 Validaciones de Invitación

- Aceptar invitación que no existe
- Aceptar invitación de otro usuario
- Aceptar invitación ya procesada
- Intentar unirse a partido directamente (endpoint eliminado)

## 🔍 9. VERIFICACIONES IMPORTANTES

### 9.1 Principios SOLID Implementados

- **Single Responsibility**: Cada controller, service y middleware tiene una responsabilidad específica
- **Open/Closed**: Sistema de emparejamiento extensible con estrategias
- **Liskov Substitution**: Estrategias de emparejamiento intercambiables
- **Interface Segregation**: DTOs específicos para cada operación
- **Dependency Inversion**: Services inyectados en controllers

### 9.2 Flujo Obligatorio de Invitaciones

- ✅ **NO existe** endpoint `/api/partidos/:id/unirse`
- ✅ La **única forma** de unirse a un partido es aceptando una invitación
- ✅ El emparejamiento **automático** crea invitaciones pendientes
- ✅ Las invitaciones tienen **estados controlados**: `pendiente`, `aceptada`, `cancelada`

## 📝 10. DATOS DE PRUEBA DISPONIBLES

El seed genera:

- **5 Zonas**: Palermo, Caballito, Belgrano, Recoleta, Flores
- **5 Deportes**: Fútbol 5, Básquet, Tenis, Pádel, Vóley
- **10 Usuarios** con contraseña: `password123`
- **8 Partidos** con diferentes fechas y estados
- **32 UsuarioPartidos** (asignaciones a equipos)
- **12 Invitaciones** con diferentes estados

### Usuarios de Prueba

```
juan.pérez@email.com
maría.garcía@email.com
carlos.lópez@email.com
ana.martínez@email.com
diego.rodríguez@email.com
lucía.fernández@email.com
roberto.silva@email.com
sofía.gonzález@email.com
alejandro.torres@email.com
valentina.ruiz@email.com
```

**Contraseña para todos**: `password123`

## ✅ Lista de Verificación Final

- [ ] Autenticación funciona correctamente
- [ ] Creación de partidos exitosa
- [ ] Sistema de emparejamiento genera invitaciones
- [ ] Aceptación de invitaciones une usuario al partido
- [ ] Cancelación de invitaciones funciona
- [ ] No existe forma de unirse directamente sin invitación
- [ ] Validaciones de middleware funcionan correctamente
- [ ] Estados de partido se actualizan correctamente
- [ ] Health checks responden adecuadamente
- [ ] Manejo de errores es consistente

---

## 🚀 Comandos Útiles

```bash
# Iniciar servidor en desarrollo
npm run dev

# Limpiar y recargar base de datos
npm run db:setup

# Solo ejecutar migraciones
npm run db:migrate

# Solo ejecutar seed
npm run seed
```

¡Happy Testing! 🎉
