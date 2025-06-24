# Documentación Completa - Sistema CRUD de Partidos

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Modelos y DTOs](#modelos-y-dtos)
4. [Rutas y Endpoints](#rutas-y-endpoints)
5. [Validaciones](#validaciones)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Testing](#testing)
8. [Códigos de Error](#códigos-de-error)
9. [Instalación y Configuración](#instalación-y-configuración)

## Introducción

Este documento describe el sistema completo de gestión de partidos implementado en la aplicación backend. El sistema proporciona operaciones CRUD completas para la gestión de partidos deportivos, incluyendo creación, consulta, actualización de estado, finalización y sistema de invitaciones.

### Características principales:

- ✅ **CRUD completo** para partidos
- ✅ **Sistema de equipos** (A y B)
- ✅ **Estados de partido** con transiciones válidas
- ✅ **Validaciones robustas** con express-validator
- ✅ **Sistema de emparejamiento** por zona, nivel o historial
- ✅ **Sistema de invitaciones** (único método de participación)
- ✅ **Finalización de partidos** con equipo ganador
- ⚠️ **IMPORTANTE**: Los usuarios NO pueden unirse directamente a partidos, solo por invitaciones

## Arquitectura del Sistema

### Estructura de Archivos

```
src/
├── routes/partido/
│   └── Partido.ts              # Rutas y validaciones
├── controllers/partido/
│   └── PartidoController.ts     # Lógica de negocio
├── DTOs/
│   ├── PartidoDTO.ts           # DTO principal
│   └── PartidoCreationDTO.ts   # DTOs para operaciones
├── models/
│   └── partido.ts              # Modelo de base de datos
└── app.ts                      # Registro de rutas
```

### Flujo de Datos

```
Request → Validaciones → Controller → Service → Model → Database
                ↓
Response ← DTOs ← Controller ← Service ← Model ← Database
```

## Modelos y DTOs

### Modelo Principal - Partido

```typescript
interface Partido {
  id: string; // UUID
  deporteId: string; // UUID del deporte
  zonaId: string; // UUID de la zona
  organizadorId: string; // UUID del organizador
  fecha: Date; // Fecha del partido
  hora: string; // Hora en formato HH:MM
  duracion: number; // Duración en horas
  direccion: string; // Dirección del partido
  estado: EstadoPartido; // Estado actual
  tipoEmparejamiento?: string; // Tipo de emparejamiento
  nivelMinimo?: number; // Nivel mínimo requerido
  nivelMaximo?: number; // Nivel máximo permitido
  equipoGanador?: "A" | "B"; // Equipo ganador (solo cuando finalizado)
  createdAt: Date;
  updatedAt: Date;
}
```

### Estados de Partido

```typescript
enum EstadoPartido {
  NECESITAMOS_JUGADORES = "NECESITAMOS_JUGADORES",
  ARMADO = "ARMADO",
  CONFIRMADO = "CONFIRMADO",
  EN_JUEGO = "EN_JUEGO",
  FINALIZADO = "FINALIZADO",
  CANCELADO = "CANCELADO",
}
```

### DTOs Implementados

#### PartidoCreationDTO

```typescript
interface PartidoCreationDTO {
  deporteId: string; // Requerido
  zonaId: string; // Requerido
  organizadorId: string; // Requerido
  fecha: Date; // Requerido
  hora: string; // Requerido (HH:MM)
  duracion: number; // Requerido (0.5 - 8 horas)
  direccion: string; // Requerido
  tipoEmparejamiento?: "ZONA" | "NIVEL" | "HISTORIAL";
  nivelMinimo?: number; // 1-10
  nivelMaximo?: number; // 1-10
}
```

#### PartidoUpdateDTO

```typescript
interface PartidoUpdateDTO {
  deporteId?: string;
  zonaId?: string;
  fecha?: Date;
  hora?: string;
  duracion?: number;
  direccion?: string;
  estado?: EstadoPartido;
  tipoEmparejamiento?: "ZONA" | "NIVEL" | "HISTORIAL";
  nivelMinimo?: number;
  nivelMaximo?: number;
}
```

#### PartidoFinalizarDTO

```typescript
interface PartidoFinalizarDTO {
  equipoGanador?: "A" | "B"; // Opcional (puede ser empate)
}
```

## Rutas y Endpoints

### Base URL

```
/api/partidos
```

### Endpoints Disponibles

#### 1. Crear Partido

```http
POST /api/partidos
Content-Type: application/json

{
  "deporteId": "uuid",
  "zonaId": "uuid",
  "organizadorId": "uuid",
  "fecha": "2025-06-15T00:00:00.000Z",
  "hora": "18:30",
  "duracion": 2,
  "direccion": "Cancha Central",
  "tipoEmparejamiento": "NIVEL",
  "nivelMinimo": 3,
  "nivelMaximo": 7
}
```

**Respuesta exitosa (201):**

```json
{
  "success": true,
  "message": "Partido creado exitosamente",
  "data": {
    "id": "uuid-del-partido",
    "deporteId": "uuid",
    "zonaId": "uuid",
    "organizadorId": "uuid",
    "fecha": "2025-06-15T00:00:00.000Z",
    "hora": "18:30",
    "duracion": 2,
    "direccion": "Cancha Central",
    "estado": "NECESITAMOS_JUGADORES",
    "tipoEmparejamiento": "NIVEL",
    "nivelMinimo": 3,
    "nivelMaximo": 7,
    "equipoGanador": null,
    "createdAt": "2025-05-31T...",
    "updatedAt": "2025-05-31T..."
  }
}
```

#### 2. Obtener Todos los Partidos

```http
GET /api/partidos
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Partidos obtenidos exitosamente",
  "data": [
    {
      "id": "uuid",
      "deporteId": "uuid",
      "zonaId": "uuid",
      "organizadorId": "uuid",
      "fecha": "2025-06-15T00:00:00.000Z",
      "hora": "18:30",
      "duracion": 2,
      "direccion": "Cancha Central",
      "estado": "NECESITAMOS_JUGADORES",
      "tipoEmparejamiento": "NIVEL",
      "nivelMinimo": 3,
      "nivelMaximo": 7,
      "equipoGanador": null,
      "createdAt": "2025-05-31T...",
      "updatedAt": "2025-05-31T...",
      "deporte": {
        "id": "uuid",
        "nombre": "Fútbol",
        "cantidadJugadores": 22
      },
      "zona": {
        "id": "uuid",
        "nombre": "CABA",
        "provincia": "Buenos Aires"
      },
      "organizador": {
        "id": "uuid",
        "nombre": "Juan",
        "apellido": "Pérez",
        "email": "juan@example.com"
      }
    }
  ]
}
```

#### 3. Obtener Partido por ID

```http
GET /api/partidos/{id}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Partido obtenido exitosamente",
  "data": {
    "id": "uuid",
    "deporteId": "uuid",
    "zonaId": "uuid",
    "organizadorId": "uuid",
    "fecha": "2025-06-15T00:00:00.000Z",
    "hora": "18:30",
    "duracion": 2,
    "direccion": "Cancha Central",
    "estado": "ARMADO",
    "tipoEmparejamiento": "NIVEL",
    "nivelMinimo": 3,
    "nivelMaximo": 7,
    "equipoGanador": null,
    "createdAt": "2025-05-31T...",
    "updatedAt": "2025-05-31T...",
    "deporte": {
      /* datos del deporte */
    },
    "zona": {
      /* datos de la zona */
    },
    "organizador": {
      /* datos del organizador */
    },
    "participantes": [
      {
        "id": "uuid",
        "usuarioId": "uuid",
        "partidoId": "uuid",
        "equipo": "A",
        "fechaUnion": "2025-05-31T...",
        "usuario": {
          "id": "uuid",
          "nombre": "María",
          "apellido": "García",
          "email": "maria@example.com",
          "nivel": 5
        }
      }
    ]
  }
}
```

#### 4. Sistema de Emparejamiento e Invitaciones

⚠️ **IMPORTANTE**: El sistema funciona únicamente con flujo de invitaciones. Los usuarios NO pueden unirse directamente a partidos.

```http
POST /api/emparejamiento/ejecutar
Content-Type: application/json

{
  "partidoId": "uuid"
}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Emparejamiento ejecutado exitosamente",
  "data": {
    "invitacionesEnviadas": 8,
    "usuariosEmparejados": [
      {
        "usuarioId": "uuid",
        "nombre": "Usuario Ejemplo",
        "nivel": 3,
        "compatibilidad": 95
      }
    ]
  }
}
```

````

#### 5. Actualizar Estado del Partido

```http
PUT /api/partidos/{id}/estado
Content-Type: application/json

{
  "estado": "CONFIRMADO"
}
````

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Estado del partido actualizado exitosamente",
  "data": {
    "id": "uuid",
    "estado": "CONFIRMADO",
    "updatedAt": "2025-05-31T..."
  }
}
```

#### 6. Finalizar Partido

```http
PUT /api/partidos/{id}/finalizar
Content-Type: application/json

{
  "equipoGanador": "A"
}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Partido finalizado exitosamente",
  "data": {
    "id": "uuid",
    "estado": "FINALIZADO",
    "equipoGanador": "A",
    "updatedAt": "2025-05-31T..."
  }
}
```

## Validaciones

### Validaciones de Creación de Partido

| Campo                | Validaciones                                   |
| -------------------- | ---------------------------------------------- |
| `deporteId`          | UUID válido, requerido, debe existir en BD     |
| `zonaId`             | UUID válido, requerido, debe existir en BD     |
| `organizadorId`      | UUID válido, requerido, debe existir en BD     |
| `fecha`              | ISO 8601, requerido, no puede ser en el pasado |
| `hora`               | Formato HH:MM, requerido                       |
| `duracion`           | Número entre 0.5 y 8, requerido                |
| `direccion`          | String no vacío, máximo 255 caracteres         |
| `tipoEmparejamiento` | Enum: 'ZONA', 'NIVEL', 'HISTORIAL'             |
| `nivelMinimo`        | Entero entre 1 y 10                            |
| `nivelMaximo`        | Entero entre 1 y 10, >= nivelMinimo            |

### Validaciones de Estado

| Estado                  | Transiciones Válidas    |
| ----------------------- | ----------------------- |
| `NECESITAMOS_JUGADORES` | → ARMADO, CANCELADO     |
| `ARMADO`                | → CONFIRMADO, CANCELADO |
| `CONFIRMADO`            | → EN_JUEGO              |
| `EN_JUEGO`              | → FINALIZADO            |
| `FINALIZADO`            | Sin transiciones        |
| `CANCELADO`             | Sin transiciones        |

### Validaciones de Participación

- Un usuario no puede unirse al mismo partido más de una vez
- No se puede unir a partidos FINALIZADOS o CANCELADOS
- Si se especifica equipo, debe ser 'A' o 'B'
- Auto-balanceo de equipos si no se especifica equipo

## Ejemplos de Uso

### Flujo Completo con cURL

#### 1. Crear un nuevo partido

```bash
curl -X POST http://localhost:3000/api/partidos \
  -H "Content-Type: application/json" \
  -d '{
    "deporteId": "550e8400-e29b-41d4-a716-446655440001",
    "zonaId": "550e8400-e29b-41d4-a716-446655440002",
    "organizadorId": "550e8400-e29b-41d4-a716-446655440003",
    "fecha": "2025-06-15T00:00:00.000Z",
    "hora": "18:30",
    "duracion": 2,
    "direccion": "Cancha Central",
    "tipoEmparejamiento": "NIVEL",
    "nivelMinimo": 3,
    "nivelMaximo": 7
  }'
```

#### 2. Obtener todos los partidos

```bash
curl -X GET http://localhost:3000/api/partidos
```

#### 3. Unir usuario al partido

```bash
curl -X POST http://localhost:3000/api/partidos/{partido-id}/unirse \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": "550e8400-e29b-41d4-a716-446655440004",
    "equipo": "A"
  }'
```

#### 4. Actualizar estado del partido

```bash
curl -X PUT http://localhost:3000/api/partidos/{partido-id}/estado \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "CONFIRMADO"
  }'
```

#### 5. Finalizar partido

```bash
curl -X PUT http://localhost:3000/api/partidos/{partido-id}/finalizar \
  -H "Content-Type: application/json" \
  -d '{
    "equipoGanador": "A"
  }'
```

### Flujo Completo con PowerShell

#### 1. Crear un nuevo partido

```powershell
$body = @{
    deporteId = "550e8400-e29b-41d4-a716-446655440001"
    zonaId = "550e8400-e29b-41d4-a716-446655440002"
    organizadorId = "550e8400-e29b-41d4-a716-446655440003"
    fecha = "2025-06-15T00:00:00.000Z"
    hora = "18:30"
    duracion = 2
    direccion = "Cancha Central"
    tipoEmparejamiento = "NIVEL"
    nivelMinimo = 3
    nivelMaximo = 7
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/partidos" -Method POST -Body $body -ContentType "application/json"
```

#### 2. Obtener todos los partidos

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/partidos" -Method GET
```

#### 3. Unir usuario al partido

```powershell
$unirseBody = @{
    usuarioId = "550e8400-e29b-41d4-a716-446655440004"
    equipo = "A"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/partidos/{partido-id}/unirse" -Method POST -Body $unirseBody -ContentType "application/json"
```

## Testing

### Configuración del Servidor de Pruebas

```bash
# Instalar dependencias
npm install

# Configurar base de datos
npm run migrate
npm run seed

# Iniciar servidor
npm run dev
```

### Tests Manuales Realizados

#### ✅ Test 1: Crear Partido

- **Endpoint**: POST `/api/partidos`
- **Resultado**: Partido creado exitosamente con ID `65837a01-69ed-4f16-a495-4dbca9281a90`
- **Estado inicial**: `NECESITAMOS_JUGADORES`

#### ✅ Test 2: Obtener Todos los Partidos

- **Endpoint**: GET `/api/partidos`
- **Resultado**: 9 partidos retornados (8 del seed + 1 creado)
- **Incluye**: Relaciones con deporte, zona y organizador

#### ✅ Test 3: Obtener Partido por ID

- **Endpoint**: GET `/api/partidos/65837a01-69ed-4f16-a495-4dbca9281a90`
- **Resultado**: Partido individual con todas las relaciones
- **Incluye**: Lista de participantes vacía inicialmente

#### ✅ Test 4: Unirse a Partido

- **Endpoint**: POST `/api/partidos/65837a01-69ed-4f16-a495-4dbca9281a90/unirse`
- **Datos**: Usuario `550e8400-e29b-41d4-a716-446655440001` se une al equipo A
- **Resultado**: Participación registrada exitosamente

#### ✅ Test 5: Actualizar Estado

- **Endpoint**: PUT `/api/partidos/65837a01-69ed-4f16-a495-4dbca9281a90/estado`
- **Transición**: `NECESITAMOS_JUGADORES` → `ARMADO`
- **Resultado**: Estado actualizado correctamente

#### ✅ Test 6: Finalizar Partido

- **Endpoint**: PUT `/api/partidos/65837a01-69ed-4f16-a495-4dbca9281a90/finalizar`
- **Datos**: Equipo ganador: A
- **Resultado**: Estado cambiado a `FINALIZADO`, equipo ganador registrado

### Tests Automatizados Pendientes

```javascript
// Ejemplo de test con Jest
describe("Partido CRUD", () => {
  test("Crear partido con datos válidos", async () => {
    const partidoData = {
      deporteId: "550e8400-e29b-41d4-a716-446655440001",
      zonaId: "550e8400-e29b-41d4-a716-446655440002",
      organizadorId: "550e8400-e29b-41d4-a716-446655440003",
      fecha: "2025-06-15T00:00:00.000Z",
      hora: "18:30",
      duracion: 2,
      direccion: "Cancha Central",
    };

    const response = await request(app)
      .post("/api/partidos")
      .send(partidoData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.estado).toBe("NECESITAMOS_JUGADORES");
  });
});
```

## Códigos de Error

### Códigos HTTP Utilizados

| Código | Significado           | Uso                                   |
| ------ | --------------------- | ------------------------------------- |
| 200    | OK                    | Operación exitosa (GET, PUT)          |
| 201    | Created               | Recurso creado exitosamente (POST)    |
| 400    | Bad Request           | Datos de entrada inválidos            |
| 404    | Not Found             | Recurso no encontrado                 |
| 409    | Conflict              | Conflicto (ej: usuario ya en partido) |
| 422    | Unprocessable Entity  | Validaciones fallidas                 |
| 500    | Internal Server Error | Error del servidor                    |

### Errores Comunes de Validación

#### Error 400: Datos Inválidos

```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "errors": [
    {
      "field": "fecha",
      "message": "La fecha no puede ser en el pasado"
    },
    {
      "field": "hora",
      "message": "El formato de hora debe ser HH:MM"
    }
  ]
}
```

#### Error 404: Partido No Encontrado

```json
{
  "success": false,
  "message": "Partido no encontrado",
  "data": null
}
```

#### Error 409: Usuario Ya en Partido

```json
{
  "success": false,
  "message": "El usuario ya está participando en este partido",
  "data": null
}
```

#### Error 422: Validación Fallida

```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "type": "field",
      "value": "invalid-uuid",
      "msg": "El deporteId debe ser un UUID válido",
      "path": "deporteId",
      "location": "body"
    }
  ]
}
```

## Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- PostgreSQL 12+
- npm o yarn

### Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd proceso-desarrollo-backend
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
# Editar .env con los valores correctos
```

4. **Configurar base de datos**

```bash
# Ejecutar migraciones
npm run migrate

# Poblar con datos de prueba
npm run seed
```

5. **Iniciar servidor**

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

### Variables de Entorno Requeridas

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=partido_db
DB_USER=postgres
DB_PASSWORD=password

# Servidor
PORT=3000
NODE_ENV=development

# JWT (si se implementa autenticación)
JWT_SECRET=your-secret-key
```

## Arquitectura de Base de Datos

### Tabla: partidos

```sql
CREATE TABLE partidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deporte_id UUID NOT NULL REFERENCES deportes(id),
  zona_id UUID NOT NULL REFERENCES zonas(id),
  organizador_id UUID NOT NULL REFERENCES usuarios(id),
  fecha DATE NOT NULL,
  hora VARCHAR(5) NOT NULL,
  duracion DECIMAL(3,1) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'NECESITAMOS_JUGADORES',
  tipo_emparejamiento VARCHAR(50),
  nivel_minimo INTEGER,
  nivel_maximo INTEGER,
  equipo_ganador VARCHAR(1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: usuario_partidos

```sql
CREATE TABLE usuario_partidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  partido_id UUID NOT NULL REFERENCES partidos(id),
  equipo VARCHAR(1) NOT NULL CHECK (equipo IN ('A', 'B')),
  fecha_union TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, partido_id)
);
```

## Conclusión

El sistema CRUD de partidos está completamente implementado y probado, proporcionando:

- ✅ **API RESTful completa** con 6 endpoints principales
- ✅ **Validaciones robustas** en todos los niveles
- ✅ **Gestión de estados** con transiciones controladas
- ✅ **Sistema de equipos** con balanceo automático
- ✅ **Documentación completa** con ejemplos
- ✅ **Testing manual** exitoso de todos los endpoints

### Próximos Pasos Sugeridos

1. **Implementar tests automatizados** con Jest
2. **Agregar autenticación y autorización**
3. **Implementar sistema de notificaciones**
4. **Optimizar consultas de base de datos**
5. **Agregar logs y monitoreo**
6. **Implementar cache para consultas frecuentes**

---

**Documentación generada el:** 31 de mayo de 2025  
**Versión del sistema:** 1.0.0  
**Autor:** Sistema de Desarrollo Backend
