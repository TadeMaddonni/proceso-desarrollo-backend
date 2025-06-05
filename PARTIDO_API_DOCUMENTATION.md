# 🏆 API de Partidos - Documentación Completa

## 📋 Índice

- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
- [Endpoints Disponibles](#endpoints-disponibles)
- [DTOs y Modelos](#dtos-y-modelos)
- [Validaciones](#validaciones)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Estados del Partido](#estados-del-partido)
- [Códigos de Error](#códigos-de-error)
- [Testing](#testing)

## 📖 Descripción General

La API de Partidos permite gestionar el ciclo de vida completo de los partidos deportivos, desde su creación hasta su finalización. Incluye funcionalidades para:

- ✅ Crear nuevos partidos
- ✅ Consultar partidos existentes
- ✅ Sistema de emparejamiento automático
- ✅ Gestión de invitaciones (único método de participación)
- ✅ Actualizar estados de partidos
- ✅ Finalizar partidos con resultado
- ⚠️ **IMPORTANTE**: El sistema funciona únicamente con flujo de invitaciones. Los usuarios NO pueden unirse directamente a partidos.

## 🏗️ Arquitectura

### Estructura de Archivos

```
src/
├── routes/partido/Partido.ts        # Rutas y validaciones
├── controllers/partido/
│   ├── PartidoController.ts          # Lógica de negocio
│   └── EmparejamientoController.ts   # Sistema de emparejamiento
├── DTOs/
│   ├── PartidoDTO.ts                 # DTO principal
│   ├── PartidoCreationDTO.ts         # DTOs para operaciones
│   └── UsuarioPartidoDTO.ts          # DTO para participantes
├── models/
│   ├── partido.ts                    # Modelo de datos
│   └── usuariopartido.ts             # Relación usuarios-partidos
└── services/partido/emparejamiento/  # Estrategias de emparejamiento
```

### Tecnologías Utilizadas

- **Node.js** + **TypeScript**
- **Express.js** (Servidor web)
- **Sequelize** (ORM)
- **express-validator** (Validaciones)
- **UUID** (Identificadores únicos)

## 🛠️ Endpoints Disponibles

### Base URL

```
http://localhost:3000/api/partidos
```

### 1. Crear Partido

**`POST /api/partidos`**

Crea un nuevo partido deportivo.

#### Request Body

```json
{
  "deporteId": "9d120442-f856-4cef-8560-1d4dc2c1e8d2",
  "zonaId": "d6e8560a-b709-4d28-a096-11a2a7641c2b",
  "organizadorId": "2655ddee-4939-42b1-b72e-5009fb902199",
  "fecha": "2025-12-25",
  "hora": "19:00",
  "duracion": 2,
  "direccion": "Cancha Nueva Test - Palermo",
  "cantidadJugadores": 10,
  "tipoEmparejamiento": "ZONA",
  "nivelMinimo": 1,
  "nivelMaximo": 3
}
```

#### Response (201 Created)

```json
{
  "message": "Partido creado exitosamente",
  "partido": {
    "id": "65837a01-69ed-4f16-a495-4dbca9281a90",
    "deporteId": "9d120442-f856-4cef-8560-1d4dc2c1e8d2",
    "zonaId": "d6e8560a-b709-4d28-a096-11a2a7641c2b",
    "organizadorId": "2655ddee-4939-42b1-b72e-5009fb902199",
    "fecha": "2025-12-25T00:00:00.000Z",
    "hora": "19:00:00",
    "duracion": 2,
    "direccion": "Cancha Nueva Test - Palermo",
    "estado": "NECESITAMOS_JUGADORES",
    "equipoGanador": null,
    "tipoEmparejamiento": "ZONA",
    "cantidadJugadores": 10,
    "nivelMinimo": 1,
    "nivelMaximo": 3,
    "createdAt": "2025-05-31T19:34:32.624Z",
    "updatedAt": "2025-05-31T19:34:32.624Z"
  }
}
```

### 2. Obtener Todos los Partidos

**`GET /api/partidos`**

Obtiene la lista completa de partidos con información de organizador, deporte y zona.

#### Response (200 OK)

```json
{
  "message": "Partidos obtenidos exitosamente",
  "partidos": [
    {
      "id": "65837a01-69ed-4f16-a495-4dbca9281a90",
      "deporteId": "9d120442-f856-4cef-8560-1d4dc2c1e8d2",
      "zonaId": "d6e8560a-b709-4d28-a096-11a2a7641c2b",
      "organizadorId": "2655ddee-4939-42b1-b72e-5009fb902199",
      "fecha": "2025-12-25T00:00:00.000Z",
      "hora": "19:00:00",
      "duracion": 2,
      "direccion": "Cancha Nueva Test - Palermo",
      "estado": "NECESITAMOS_JUGADORES",
      "equipoGanador": null,
      "tipoEmparejamiento": "ZONA",
      "cantidadJugadores": 10,
      "nivelMinimo": 1,
      "nivelMaximo": 3,
      "organizador": {
        "id": "2655ddee-4939-42b1-b72e-5009fb902199",
        "nombre": "Juan",
        "email": "juan.pérez@email.com"
      },
      "deporte": {
        "id": "9d120442-f856-4cef-8560-1d4dc2c1e8d2",
        "nombre": "Fútbol 5"
      },
      "zona": {
        "id": "d6e8560a-b709-4d28-a096-11a2a7641c2b",
        "nombre": "Palermo"
      }
    }
  ],
  "total": 9
}
```

### 3. Obtener Partido por ID

**`GET /api/partidos/:id`**

Obtiene un partido específico con todos sus detalles incluyendo participantes.

#### Response (200 OK)

```json
{
  "message": "Partido obtenido exitosamente",
  "partido": {
    "id": "65837a01-69ed-4f16-a495-4dbca9281a90",
    "deporteId": "9d120442-f856-4cef-8560-1d4dc2c1e8d2",
    "zonaId": "d6e8560a-b709-4d28-a096-11a2a7641c2b",
    "organizadorId": "2655ddee-4939-42b1-b72e-5009fb902199",
    "fecha": "2025-12-25T00:00:00.000Z",
    "hora": "19:00:00",
    "duracion": 2,
    "direccion": "Cancha Nueva Test - Palermo",
    "estado": "NECESITAMOS_JUGADORES",
    "equipoGanador": null,
    "tipoEmparejamiento": "ZONA",
    "cantidadJugadores": 10,
    "nivelMinimo": 1,
    "nivelMaximo": 3,
    "organizador": {
      "id": "2655ddee-4939-42b1-b72e-5009fb902199",
      "nombre": "Juan",
      "email": "juan.pérez@email.com"
    },
    "deporte": {
      "id": "9d120442-f856-4cef-8560-1d4dc2c1e8d2",
      "nombre": "Fútbol 5"
    },
    "zona": {
      "id": "d6e8560a-b709-4d28-a096-11a2a7641c2b",
      "nombre": "Palermo"
    },
    "participantes": []
  }
}
```

### 4. Ejecutar Emparejamiento

**`POST /api/emparejamiento/ejecutar/:partidoId`**

Ejecuta el algoritmo de emparejamiento para encontrar usuarios compatibles y enviarles invitaciones al partido.

#### URL Parameters

- `partidoId` (string): ID del partido para ejecutar el emparejamiento

#### Request Body

```json
{
  "tipoEstrategia": "ZONA"
}
```

#### Response (200 OK)

```json
{
  "message": "Emparejamiento ejecutado exitosamente",
  "invitacionesEnviadas": 8,
  "usuariosEmparejados": [
    {
      "usuarioId": "7f2caf5f-1792-41ff-818d-bd7bfd900a8d",
      "nombre": "María García",
      "nivel": 2,
      "compatibilidad": 95
    }
  ]
}
```

**📝 Nota**: El sistema ahora funciona únicamente con flujo de invitaciones. Los usuarios no pueden unirse directamente a partidos, sino que deben ser invitados a través del sistema de emparejamiento.

````

### 5. Actualizar Estado del Partido

**`PUT /api/partidos/:id/estado`**

Actualiza el estado del partido.

#### Request Body

```json
{
  "estado": "ARMADO"
}
````

#### Response (200 OK)

```json
{
  "message": "Estado del partido actualizado exitosamente",
  "partidoId": "65837a01-69ed-4f16-a495-4dbca9281a90",
  "nuevoEstado": "ARMADO"
}
```

### 6. Finalizar Partido

**`PUT /api/partidos/:id/finalizar`**

Finaliza el partido y opcionalmente establece el equipo ganador.

#### Request Body

```json
{
  "equipoGanador": "A"
}
```

#### Response (200 OK)

```json
{
  "message": "Partido finalizado exitosamente",
  "partidoId": "65837a01-69ed-4f16-a495-4dbca9281a90",
  "equipoGanador": "A"
}
```

## 📊 DTOs y Modelos

### PartidoCreationDTO

```typescript
export interface PartidoCreationDTO {
  deporteId: string; // UUID del deporte
  zonaId: string; // UUID de la zona
  organizadorId: string; // UUID del organizador
  fecha: Date; // Fecha del partido (ISO 8601)
  hora: string; // Hora del partido (HH:MM)
  duracion: number; // Duración en horas (0.5 - 8)
  direccion: string; // Dirección de la cancha
  cantidadJugadores: number; // Cantidad de jugadores (2-50)
  tipoEmparejamiento?: "ZONA" | "NIVEL" | "HISTORIAL";
  nivelMinimo?: number; // Nivel mínimo (1-3)
  nivelMaximo?: number; // Nivel máximo (1-3)
}
```

### PartidoUpdateDTO

```typescript
export interface PartidoUpdateDTO {
  deporteId?: string;
  zonaId?: string;
  fecha?: Date;
  hora?: string;
  duracion?: number;
  direccion?: string;
  cantidadJugadores?: number; // Cantidad de jugadores (2-50)
  estado?:
    | "NECESITAMOS_JUGADORES"
    | "ARMADO"
    | "CONFIRMADO"
    | "EN_JUEGO"
    | "FINALIZADO"
    | "CANCELADO";
  tipoEmparejamiento?: "ZONA" | "NIVEL" | "HISTORIAL";
  nivelMinimo?: number;
  nivelMaximo?: number;
}
```

### UnirsePartidoDTO

```typescript
export interface UnirsePartidoDTO {
  usuarioId: string; // UUID del usuario
  equipo?: "A" | "B"; // Equipo asignado (opcional)
}
```

### PartidoFinalizarDTO

```typescript
export interface PartidoFinalizarDTO {
  equipoGanador?: "A" | "B"; // Equipo ganador (opcional)
}
```

## ✅ Validaciones

### Validaciones de Entrada

| Campo                | Tipo   | Validación                | Descripción                      |
| -------------------- | ------ | ------------------------- | -------------------------------- |
| `deporteId`          | UUID   | Requerido, UUID válido    | Debe existir en la base de datos |
| `zonaId`             | UUID   | Requerido, UUID válido    | Debe existir en la base de datos |
| `organizadorId`      | UUID   | Requerido, UUID válido    | Debe existir en la base de datos |
| `fecha`              | Date   | Requerido, ISO 8601       | No puede ser en el pasado        |
| `hora`               | String | Requerido, HH:MM          | Formato de 24 horas              |
| `duracion`           | Number | Requerido, 0.5-8          | Duración en horas                |
| `direccion`          | String | Requerido, 5-255 chars    | Dirección de la cancha           |
| `cantidadJugadores`  | Number | Requerido, 2-50           | Cantidad de jugadores            |
| `tipoEmparejamiento` | Enum   | Opcional                  | ZONA, NIVEL, HISTORIAL           |
| `nivelMinimo`        | Number | Opcional, 1-3             | Nivel mínimo de jugadores        |
| `nivelMaximo`        | Number | Opcional, 1-3             | Nivel máximo de jugadores        |
| `equipo`             | Enum   | Opcional                  | A o B                            |
| `estado`             | Enum   | Requerido para actualizar | Estados válidos del partido      |

### Validaciones de Negocio

- ✅ **Fecha futura**: No se pueden crear partidos en el pasado
- ✅ **Organizador existente**: El organizador debe existir en el sistema
- ✅ **Deporte y zona válidos**: Deben existir en el sistema
- ✅ **Niveles coherentes**: nivelMinimo ≤ nivelMaximo
- ✅ **Cantidad de jugadores válida**: Entre 2 y 50 jugadores
- ✅ **Usuario único**: Un usuario no puede unirse dos veces al mismo partido
- ✅ **Estado válido**: Solo se puede unir a partidos no finalizados

## 🔄 Estados del Partido

| Estado                  | Descripción                          | Transiciones Válidas |
| ----------------------- | ------------------------------------ | -------------------- |
| `NECESITAMOS_JUGADORES` | Estado inicial, buscando jugadores   | → ARMADO             |
| `ARMADO`                | Suficientes jugadores, partido listo | → CONFIRMADO         |
| `CONFIRMADO`            | Partido confirmado por organizador   | → EN_JUEGO           |
| `EN_JUEGO`              | Partido en progreso                  | → FINALIZADO         |
| `FINALIZADO`            | Partido terminado                    | (Estado final)       |
| `CANCELADO`             | Partido cancelado                    | (Estado final)       |

## 🎯 Ejemplos de Uso

### Flujo Completo de un Partido

```bash
# 1. Crear un partido
curl -X POST http://localhost:3000/api/partidos \
  -H "Content-Type: application/json" \
  -d '{
    "deporteId": "9d120442-f856-4cef-8560-1d4dc2c1e8d2",
    "zonaId": "d6e8560a-b709-4d28-a096-11a2a7641c2b",
    "organizadorId": "2655ddee-4939-42b1-b72e-5009fb902199",
    "fecha": "2025-12-25",    "hora": "19:00",
    "duracion": 2,
    "direccion": "Cancha Nueva Test - Palermo",
    "cantidadJugadores": 10,
    "tipoEmparejamiento": "ZONA",
    "nivelMinimo": 1,
    "nivelMaximo": 3
  }'

# 2. Unirse al partido
curl -X POST http://localhost:3000/api/partidos/65837a01-69ed-4f16-a495-4dbca9281a90/unirse \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "7f2caf5f-1792-41ff-818d-bd7bfd900a8d",
    "equipo": "A"
  }'

# 3. Actualizar estado
curl -X PUT http://localhost:3000/api/partidos/65837a01-69ed-4f16-a495-4dbca9281a90/estado \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "ARMADO"
  }'

# 4. Finalizar partido
curl -X PUT http://localhost:3000/api/partidos/65837a01-69ed-4f16-a495-4dbca9281a90/finalizar \
  -H "Content-Type: application/json" \
  -d '{
    "equipoGanador": "A"
  }'
```

### Ejemplo con PowerShell

```powershell
# Crear partido
$body = @{
    deporteId = "9d120442-f856-4cef-8560-1d4dc2c1e8d2"
    zonaId = "d6e8560a-b709-4d28-a096-11a2a7641c2b"
    organizadorId = "2655ddee-4939-42b1-b72e-5009fb902199"
    fecha = "2025-12-25"
    hora = "19:00"
    duracion = 2
    direccion = "Cancha Nueva Test - Palermo"
    cantidadJugadores = 10
    tipoEmparejamiento = "ZONA"
    nivelMinimo = 1
    nivelMaximo = 3
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/partidos" `
  -Method POST -Body $body -ContentType "application/json"
```

## ❌ Códigos de Error

### Errores 400 (Bad Request)

```json
{
  "error": "Datos de entrada inválidos",
  "details": [
    {
      "type": "field",
      "value": "invalid-uuid",
      "msg": "El ID del organizador debe ser un UUID válido",
      "path": "organizadorId",
      "location": "body"
    }
  ]
}
```

### Errores 404 (Not Found)

```json
{
  "error": "Usuario organizador no encontrado"
}
```

```json
{
  "error": "Partido no encontrado"
}
```

### Errores 500 (Internal Server Error)

```json
{
  "error": "Error interno del servidor al crear el partido"
}
```

## 💌 Sistema de Invitaciones

El sistema funciona únicamente con flujo de invitaciones. Los usuarios no pueden unirse directamente a partidos.

### Obtener Invitaciones de Usuario

**`GET /api/invitaciones/usuario/:usuarioId`**

Obtiene todas las invitaciones pendientes para un usuario.

#### Response (200 OK)

```json
{
  "message": "Invitaciones obtenidas exitosamente",
  "invitaciones": [
    {
      "id": "inv-uuid",
      "partidoId": "partido-uuid",
      "usuarioId": "usuario-uuid",
      "estado": "PENDIENTE",
      "fechaEnvio": "2025-06-01T10:00:00.000Z",
      "partido": {
        "id": "partido-uuid",
        "fecha": "2025-06-15",
        "hora": "18:00",
        "direccion": "Cancha Test",
        "deporte": { "nombre": "Fútbol 5" },
        "zona": { "nombre": "Palermo" }
      }
    }
  ]
}
```

### Responder Invitación

**`PUT /api/invitaciones/:id/responder`**

Permite al usuario aceptar o rechazar una invitación.

#### Request Body

```json
{
  "respuesta": "ACEPTADA",
  "equipo": "A"
}
```

#### Response (200 OK)

```json
{
  "message": "Invitación respondida exitosamente",
  "invitacion": {
    "id": "inv-uuid",
    "estado": "ACEPTADA",
    "equipo": "A",
    "fechaRespuesta": "2025-06-01T10:30:00.000Z"
  }
}
```

## 🧪 Testing

### Estados Probados

✅ **Crear Partido** - Estado: `NECESITAMOS_JUGADORES`  
✅ **Usuario se une** - Asignado a equipo `A`  
✅ **Actualizar Estado** - Cambio a `ARMADO`  
✅ **Finalizar Partido** - Estado: `FINALIZADO`, Ganador: `A`

### Validaciones Probadas

✅ UUIDs inválidos → Error 400  
✅ Fechas en el pasado → Error 400  
✅ Organizador inexistente → Error 404  
✅ Formatos de hora inválidos → Error 400  
✅ Duraciones fuera de rango → Error 400  
✅ Estados inválidos → Error 400  
✅ Equipos inválidos → Error 400

### Datos de Prueba

El sistema incluye un seeder que crea:

- 5 zonas (Palermo, Caballito, Belgrano, Recoleta, Flores)
- 5 deportes (Fútbol 5, Básquet, Tenis, Pádel, Vóley)
- 10 usuarios con diferentes niveles
- 8 partidos de ejemplo
- 32 relaciones usuario-partido
- 12 invitaciones

## 🚀 Ejecución

### Prerequisitos

```bash
npm install
```

### Iniciar Servidor

```bash
npm run dev
```

### Ejecutar Seeder

```bash
npm run seed
```

### Servidor en Producción

```bash
npm start
```

## 📝 Notas Técnicas

### Base de Datos

- **ORM**: Sequelize con TypeScript
- **Relaciones**: belongsTo, hasMany, belongsToMany
- **Migraciones**: Versionado de esquema
- **Seeds**: Datos de prueba automatizados

### Arquitectura

- **Patrón MVC**: Separación clara de responsabilidades
- **DTOs**: Validación y tipado de datos
- **Middleware**: Validaciones centralizadas
- **Error Handling**: Manejo consistente de errores

### Seguridad

- Validación exhaustiva de entrada
- Sanitización de datos
- Prevención de inyección SQL (ORM)
- Tipado estricto con TypeScript

---

**📅 Última actualización**: 1 de Junio de 2025  
**🏷️ Versión**: 1.1.0  
**👨‍💻 Estado**: Producción Ready ✅
**✨ Nuevo**: Agregado campo `cantidadJugadores` al modelo Partido
