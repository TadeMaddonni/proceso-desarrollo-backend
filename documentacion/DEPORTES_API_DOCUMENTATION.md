# API de Deportes - Documentación

## Descripción

Este documento describe la API REST para la gestión de deportes en el sistema. La API proporciona operaciones CRUD completas para administrar deportes.

## Base URL

```
http://localhost:3000/api/deportes
```

## Endpoints Disponibles

### 1. Obtener todos los deportes

**GET** `/api/deportes`

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Deportes obtenidos exitosamente",
  "data": [
    {
      "id": "dc82025b-60a4-499e-8724-f8225080d03e",
      "nombre": "Básquet",
      "createdAt": "2025-06-07T10:30:00.000Z",
      "updatedAt": "2025-06-07T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

### 2. Obtener un deporte por ID

**GET** `/api/deportes/:id`

**Parámetros:**

- `id` (string, required): UUID del deporte

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Deporte obtenido exitosamente",
  "data": {
    "id": "dc82025b-60a4-499e-8724-f8225080d03e",
    "nombre": "Básquet",
    "createdAt": "2025-06-07T10:30:00.000Z",
    "updatedAt": "2025-06-07T10:30:00.000Z"
  }
}
```

**Respuesta de error (404):**

```json
{
  "success": false,
  "message": "Deporte no encontrado"
}
```

### 3. Crear un nuevo deporte

**POST** `/api/deportes`

**Cuerpo de la petición:**

```json
{
  "nombre": "Volleyball"
}
```

**Validaciones:**

- `nombre`: Requerido, entre 2 y 50 caracteres

**Respuesta exitosa (201):**

```json
{
  "success": true,
  "message": "Deporte creado exitosamente",
  "data": {
    "id": "6c266305-9914-416e-8216-4065f6374fd5",
    "nombre": "Volleyball",
    "createdAt": "2025-06-07T10:35:00.000Z",
    "updatedAt": "2025-06-07T10:35:00.000Z"
  }
}
```

### 4. Actualizar un deporte

**PUT** `/api/deportes/:id`

**Parámetros:**

- `id` (string, required): UUID del deporte

**Cuerpo de la petición:**

```json
{
  "nombre": "Voleibol"
}
```

**Validaciones:**

- `nombre`: Requerido, entre 2 y 50 caracteres

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Deporte actualizado exitosamente",
  "data": {
    "id": "6c266305-9914-416e-8216-4065f6374fd5",
    "nombre": "Voleibol"
  }
}
```

### 5. Eliminar un deporte

**DELETE** `/api/deportes/:id`

**Parámetros:**

- `id` (string, required): UUID del deporte

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "message": "Deporte eliminado exitosamente"
}
```

**Respuesta de error (404):**

```json
{
  "success": false,
  "message": "Deporte no encontrado"
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
- Longitud máxima: 50 caracteres
- Se aplica trim automáticamente

## Ejemplos de uso con PowerShell

### Obtener todos los deportes

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/deportes" -Method GET
```

### Crear un deporte

```powershell
$body = '{"nombre":"Tenis"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/deportes" -Method POST -Body $body -ContentType "application/json"
```

### Actualizar un deporte

```powershell
$body = '{"nombre":"Tenis de Mesa"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/deportes/[ID]" -Method PUT -Body $body -ContentType "application/json"
```

### Eliminar un deporte

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/deportes/[ID]" -Method DELETE
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
      "msg": "El nombre del deporte es requerido",
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
      "msg": "El ID del deporte debe ser un UUID válido",
      "path": "id",
      "location": "params"
    }
  ]
}
```

## Arquitectura

### Estructura del proyecto

- **Controlador**: `src/controllers/deporte/DeporteController.ts`
- **Servicio**: `src/services/deporte/DeporteService.ts`
- **Rutas**: `src/routes/deporte/Deporte.ts`
- **DTO**: `src/DTOs/DeporteDTO.ts`
- **Modelo**: `src/models/deporte.ts`

### Patrones implementados

- **Repository Pattern**: A través de los servicios
- **DTO Pattern**: Para transferencia de datos
- **MVC Pattern**: Separación de responsabilidades
- **Validation Middleware**: Validación con express-validator

## Estado de implementación

✅ **COMPLETADO** - Todas las operaciones CRUD están implementadas y funcionando correctamente.

### Funcionalidades implementadas:

- ✅ GET /api/deportes - Obtener todos los deportes
- ✅ GET /api/deportes/:id - Obtener deporte por ID
- ✅ POST /api/deportes - Crear nuevo deporte
- ✅ PUT /api/deportes/:id - Actualizar deporte
- ✅ DELETE /api/deportes/:id - Eliminar deporte
- ✅ Validaciones con express-validator
- ✅ Manejo de errores
- ✅ Respuestas estandarizadas
- ✅ Documentación completa

### Pruebas realizadas:

- ✅ Creación de deportes
- ✅ Consulta de deportes (individual y lista)
- ✅ Actualización de deportes
- ✅ Eliminación de deportes
- ✅ Validaciones de campos requeridos
- ✅ Validaciones de formato UUID
- ✅ Manejo de errores 404 y 400
