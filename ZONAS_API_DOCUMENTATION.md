# API de Zonas - Documentación

## Descripción

Este documento describe la API REST para la gestión de zonas en el sistema. La API proporciona operaciones CRUD completas para administrar zonas geográficas.

## Base URL

```
http://localhost:3000/api/zonas
```

## Endpoints Disponibles

### 1. Obtener todas las zonas

**GET** `/api/zonas`

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Zonas obtenidas exitosamente",
  "data": [
    {
      "id": "6ea4996c-5ff6-4048-a961-e1efbe5a959d",
      "nombre": "Belgrano",
      "createdAt": "2025-06-07T10:30:00.000Z",
      "updatedAt": "2025-06-07T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

### 2. Obtener una zona por ID

**GET** `/api/zonas/:id`

**Parámetros:**

- `id` (string, required): UUID de la zona

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Zona obtenida exitosamente",
  "data": {
    "id": "6ea4996c-5ff6-4048-a961-e1efbe5a959d",
    "nombre": "Belgrano",
    "createdAt": "2025-06-07T10:30:00.000Z",
    "updatedAt": "2025-06-07T10:30:00.000Z"
  }
}
```

**Respuesta de error (404):**

```json
{
  "success": false,
  "message": "Zona no encontrada"
}
```

### 3. Crear una nueva zona

**POST** `/api/zonas`

**Cuerpo de la petición:**

```json
{
  "nombre": "Villa Carlos Paz"
}
```

**Validaciones:**

- `nombre`: Requerido, entre 2 y 100 caracteres

**Respuesta exitosa (201):**

```json
{
  "success": true,
  "message": "Zona creada exitosamente",
  "data": {
    "id": "fd6704ac-a3c8-4b72-9994-b98b60d4668a",
    "nombre": "Villa Carlos Paz",
    "createdAt": "2025-06-07T10:35:00.000Z",
    "updatedAt": "2025-06-07T10:35:00.000Z"
  }
}
```

### 4. Actualizar una zona

**PUT** `/api/zonas/:id`

**Parámetros:**

- `id` (string, required): UUID de la zona

**Cuerpo de la petición:**

```json
{
  "nombre": "Carlos Paz"
}
```

**Validaciones:**

- `nombre`: Requerido, entre 2 y 100 caracteres

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Zona actualizada exitosamente",
  "data": {
    "id": "fd6704ac-a3c8-4b72-9994-b98b60d4668a",
    "nombre": "Carlos Paz"
  }
}
```

### 5. Eliminar una zona

**DELETE** `/api/zonas/:id`

**Parámetros:**

- `id` (string, required): UUID de la zona

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Zona eliminada exitosamente"
}
```

**Respuesta de error (404):**

```json
{
  "success": false,
  "message": "Zona no encontrada"
}
```

## Códigos de Estado HTTP

| Código | Descripción                                        |
| ------ | -------------------------------------------------- |
| 200    | OK - Operación exitosa                             |
| 201    | Created - Recurso creado exitosamente              |
| 400    | Bad Request - Error de validación                  |
| 404    | Not Found - Recurso no encontrado                  |
| 500    | Internal Server Error - Error interno del servidor |

## Validaciones

### Validación de ID

- Debe ser un UUID válido (v4)
- Se valida en parámetros de URL

### Validación de nombre

- Campo requerido
- Longitud mínima: 2 caracteres
- Longitud máxima: 100 caracteres
- Se aplica trim automáticamente

## Ejemplos de uso con PowerShell

### Obtener todas las zonas

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/zonas" -Method GET
```

### Crear una zona

```powershell
$body = '{"nombre":"Nueva Córdoba"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/zonas" -Method POST -Body $body -ContentType "application/json"
```

### Actualizar una zona

```powershell
$body = '{"nombre":"Córdoba Centro"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/zonas/[ID]" -Method PUT -Body $body -ContentType "application/json"
```

### Eliminar una zona

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/zonas/[ID]" -Method DELETE
```

## Errores Comunes

### Error de validación (400)

```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "type": "field",
      "value": "",
      "msg": "El nombre de la zona es requerido",
      "path": "nombre",
      "location": "body"
    }
  ]
}
```

### Error de ID inválido (400)

```json
{
  "success": false,
  "message": "Errores de validación",
  "errors": [
    {
      "type": "field",
      "value": "invalid-id",
      "msg": "El ID de la zona debe ser un UUID válido",
      "path": "id",
      "location": "params"
    }
  ]
}
```

## Arquitectura

### Estructura del proyecto

- **Controlador**: `src/controllers/zona/ZonaController.ts`
- **Servicio**: `src/services/zona/ZonaService.ts`
- **Rutas**: `src/routes/zona/Zona.ts`
- **DTO**: `src/DTOs/ZonaDTO.ts`
- **Modelo**: `src/models/zona.ts`

### Patrones implementados

- **Repository Pattern**: A través de los servicios
- **DTO Pattern**: Para transferencia de datos
- **MVC Pattern**: Separación de responsabilidades
- **Validation Middleware**: Validación con express-validator

## Relaciones con otras entidades

- **Usuario**: Una zona puede tener muchos usuarios (`zonaId` en Usuario)
- **Partido**: Una zona puede tener muchos partidos (`zonaId` en Partido)

## Casos de uso

- Gestión de zonas geográficas para organización de partidos
- Filtrado de usuarios por zona
- Emparejamiento de jugadores por proximidad geográfica
- Administración de ubicaciones disponibles

## Estado de implementación

✅ **COMPLETADO** - Todas las operaciones CRUD están implementadas y funcionando correctamente.

### Funcionalidades implementadas:

- ✅ GET /api/zonas - Obtener todas las zonas
- ✅ GET /api/zonas/:id - Obtener zona por ID
- ✅ POST /api/zonas - Crear nueva zona
- ✅ PUT /api/zonas/:id - Actualizar zona
- ✅ DELETE /api/zonas/:id - Eliminar zona
- ✅ Validaciones con express-validator
- ✅ Manejo de errores
- ✅ Respuestas estandarizadas
- ✅ Documentación completa

### Pruebas realizadas:

- ✅ Creación de zonas
- ✅ Consulta de zonas (individual y lista)
- ✅ Actualización de zonas
- ✅ Eliminación de zonas
- ✅ Validaciones de campos requeridos
- ✅ Validaciones de formato UUID
- ✅ Manejo de errores 404 y 400

## Comparación con API de Deportes

La API de Zonas sigue exactamente el mismo patrón que la API de Deportes:

- ✅ Estructura idéntica de archivos y carpetas
- ✅ Validaciones similares (adaptadas para zonas)
- ✅ Respuestas estandarizadas consistentes
- ✅ Manejo de errores uniforme
- ✅ Documentación completa

### Diferencias específicas:

- **Validación de nombre**: Zonas permite hasta 100 caracteres (vs 50 para deportes)
- **Casos de uso**: Orientado a ubicaciones geográficas
- **Relaciones**: Vinculado con usuarios y partidos por ubicación
