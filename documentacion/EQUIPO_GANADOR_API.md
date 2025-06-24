# Endpoint para actualizar equipo ganador de partido

## Descripción

Este endpoint permite establecer cuál de los dos equipos (A o B) ganó un partido que ya ha sido finalizado.
La funcionalidad está diseñada para ser usada después de que un partido ha cambiado su estado a FINALIZADO.

## Endpoint

```
PUT /api/partidos/{partidoId}/ganador
```

## Autenticación

**Requerida**: Token JWT en el header `Authorization`

## Parámetros de la ruta

| Nombre    | Tipo | Descripción          |
| --------- | ---- | -------------------- |
| partidoId | UUID | ID único del partido |

## Body (JSON)

```json
{
  "equipoGanador": "A" // Valores permitidos: "A" o "B"
}
```

## Respuesta exitosa

```json
{
  "success": true,
  "message": "Equipo A marcado como ganador",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "fecha": "2025-06-24T18:00:00.000Z",
    "hora": "18:00:00",
    "duracion": 1.5,
    "direccion": "Cancha Norte",
    "estado": "FINALIZADO",
    "equipoGanador": "A",
    "organizador": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "nombre": "Juan Pérez",
      "email": "juan@example.com"
    }
    // otros campos del partido...
  }
}
```

## Códigos de estado

| Código | Descripción                                   |
| ------ | --------------------------------------------- |
| 200    | OK - Equipo ganador establecido correctamente |
| 400    | Error de validación o partido no finalizado   |
| 401    | No autenticado                                |
| 403    | No autorizado                                 |
| 404    | Partido no encontrado                         |
| 500    | Error interno del servidor                    |

## Errores posibles

### Partido no finalizado

```json
{
  "success": false,
  "message": "Solo se puede establecer el equipo ganador en un partido finalizado"
}
```

### Valor de equipo ganador inválido

```json
{
  "success": false,
  "message": "El equipo ganador debe ser A o B"
}
```

### Partido no encontrado

```json
{
  "success": false,
  "message": "Partido no encontrado"
}
```

## Notas

1. Este endpoint solo funciona en partidos que ya están en estado FINALIZADO
2. Solo el organizador del partido debe poder establecer el equipo ganador (esto se controla a través del token JWT)
3. El equipo ganador solo puede ser "A" o "B", no se acepta "EMPATE" (quedará como null)
4. Es posible modificar el equipo ganador múltiples veces

## Pruebas

Se puede probar este endpoint utilizando el script `test-equipo-ganador.js`:

```bash
node test-equipo-ganador.js
```

Asegúrate de configurar un ID de partido válido y un token JWT en el script antes de ejecutarlo.
