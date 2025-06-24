# 📋 DOCUMENTACIÓN DE RUTAS DE INVITACIONES

## Descripción General

Este documento describe las rutas disponibles para gestionar invitaciones en el sistema de partidos deportivos. Las invitaciones son el único mecanismo para que los usuarios se unan a partidos.

## 🔗 Rutas Disponibles

### 1. Obtener Invitaciones por Usuario

**Endpoint:** `GET /api/invitaciones/usuario/:usuarioId`

**Descripción:** Obtiene todas las invitaciones recibidas por un usuario específico.

**Parámetros:**

- `usuarioId` (path): ID del usuario (UUID)

**Autenticación:** Requerida (JWT)

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Invitaciones obtenidas correctamente",
  "data": [
    {
      "id": "uuid-invitacion",
      "estado": "pendiente",
      "usuarioId": "uuid-usuario",
      "partidoId": "uuid-partido",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z",
      "Partido": {
        "id": "uuid-partido",
        "fecha": "2024-01-20",
        "hora": "18:00",
        "direccion": "Cancha Municipal",
        "estado": "NECESITAMOS_JUGADORES",
        "organizador": {
          "id": "uuid-organizador",
          "nombre": "Juan Pérez",
          "email": "juan@email.com"
        },
        "Deporte": {
          "id": "uuid-deporte",
          "nombre": "Fútbol"
        },
        "Zona": {
          "id": "uuid-zona",
          "nombre": "Centro"
        }
      }
    }
  ]
}
```

**Estados posibles de invitación:**

- `pendiente`: Invitación enviada, esperando respuesta
- `aceptada`: Usuario aceptó y se unió al partido
- `cancelada`: Invitación cancelada (por usuario o sistema)

---

### 2. Obtener Invitaciones por Partido

**Endpoint:** `GET /api/invitaciones/partido/:partidoId`

**Descripción:** Obtiene todas las invitaciones enviadas para un partido específico.

**Parámetros:**

- `partidoId` (path): ID del partido (UUID)

**Autenticación:** Requerida (JWT)

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Invitaciones del partido obtenidas correctamente",
  "data": [
    {
      "id": "uuid-invitacion",
      "estado": "pendiente",
      "usuarioId": "uuid-usuario",
      "partidoId": "uuid-partido",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z",
      "Usuario": {
        "id": "uuid-usuario",
        "nombre": "María García",
        "email": "maria@email.com"
      }
    }
  ]
}
```

---

### 3. Aceptar Invitación

**Endpoint:** `PUT /api/invitaciones/:id/aceptar`

**Descripción:** Acepta una invitación pendiente y une al usuario al partido.

**Parámetros:**

- `id` (path): ID de la invitación (UUID)

**Body:**

```json
{
  "usuarioId": "uuid-usuario"
}
```

**Autenticación:** Opcional

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Invitación aceptada correctamente."
}
```

---

### 4. Cancelar Invitación

**Endpoint:** `PUT /api/invitaciones/:id/cancelar`

**Descripción:** Cancela una invitación pendiente.

**Parámetros:**

- `id` (path): ID de la invitación (UUID)

**Body:**

```json
{
  "usuarioId": "uuid-usuario"
}
```

**Autenticación:** Opcional

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Invitación cancelada correctamente."
}
```

---

## 🔧 Validaciones y Middleware

### Middleware de Autenticación

- **JWT requerido** para obtener invitaciones por usuario/partido
- **JWT opcional** para aceptar/cancelar invitaciones

### Validaciones Automáticas

- Verificación de existencia de invitación
- Validación de que el usuario es el destinatario
- Verificación de estado pendiente para aceptar/cancelar

---

## 📊 Casos de Uso

### 1. Usuario consulta sus invitaciones

```bash
GET /api/invitaciones/usuario/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer jwt_token
```

### 2. Organizador consulta invitaciones de su partido

```bash
GET /api/invitaciones/partido/550e8400-e29b-41d4-a716-446655440002
Authorization: Bearer jwt_token
```

### 3. Usuario acepta invitación desde app móvil

```bash
PUT /api/invitaciones/uuid-invitacion/aceptar
Content-Type: application/json

{
  "usuarioId": "550e8400-e29b-41d4-a716-446655440001"
}
```

---

## 🔄 Integración con Sistema de Emparejamiento

Las invitaciones se crean automáticamente cuando:

1. **Emparejamiento manual**: Organizador ejecuta emparejamiento
2. **Emparejamiento automático**: Sistema cron ejecuta cada 30 minutos
3. **Reactivación**: Partido vuelve a necesitar jugadores

### Notificaciones Automáticas

- **Push notification** (Firebase) si usuario tiene token
- **Email** como respaldo
- **Logs detallados** para debugging

---

## 🧪 Testing

Utilizar el script `test-rutas-invitaciones.js` para probar las rutas:

```bash
node test-rutas-invitaciones.js
```

**Configuración requerida:**

- Token JWT válido
- IDs de usuario y partido existentes
- Servidor ejecutándose en localhost:3000

---

## ⚠️ Notas Importantes

1. **Solo usuarios invitados** pueden unirse a partidos
2. **Estados de invitación** son inmutables una vez cambiados
3. **Limpieza automática** de invitaciones expiradas (cron diario)
4. **Reactivación automática** cuando partido necesita jugadores
5. **Asociaciones Sequelize** optimizadas sin alias para evitar errores

---

## 🔍 Troubleshooting

### Error 404 - Invitación no encontrada

- Verificar que el ID de invitación existe
- Confirmar formato UUID correcto

### Error 403 - No autorizado

- Usuario no es el destinatario de la invitación
- Token JWT inválido o expirado

### Error 409 - Estado inválido

- Invitación ya no está pendiente
- Partido no permite más participantes

### Error 500 - Error interno

- Verificar logs del servidor
- Confirmar conexión a base de datos
- Revisar asociaciones Sequelize
