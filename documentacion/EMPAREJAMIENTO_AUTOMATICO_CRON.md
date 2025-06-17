# 🤖 Sistema de Emparejamiento Automático con Node-Cron

## 📋 Descripción

El sistema de emparejamiento automático utiliza **node-cron** para ejecutar tareas programadas que mejoran la experiencia del usuario automatizando la búsqueda de jugadores para partidos deportivos.

## 🏗️ Arquitectura

### Servicios Implementados

#### 1. **PartidoSchedulerService** (Extendido)

- **Ubicación**: `src/services/scheduler/PartidoSchedulerService.ts`
- **Funcionalidad Principal**: Actualización automática de estados de partidos
- **Nueva Funcionalidad**: Emparejamiento recurrente cada 30 minutos

#### 2. **EmparejamientoSchedulerService** (Nuevo)

- **Ubicación**: `src/services/scheduler/EmparejamientoSchedulerService.ts`
- **Funcionalidad**: Servicio dedicado exclusivamente al emparejamiento automático

## ⏰ Configuración de Cron Jobs

### PartidoSchedulerService

```javascript
// Actualización de estados cada 5 minutos
'*/5 * * * *' → Cancelar/Iniciar/Finalizar partidos

// Emparejamiento recurrente cada 30 minutos
'*/30 * * * *' → Buscar jugadores para partidos que lo necesiten
```

### EmparejamientoSchedulerService

```javascript
// Emparejamiento recurrente cada 30 minutos
'*/30 * * * *' → Partidos en próximas 48 horas

// Emparejamiento intensivo cada 2 horas
'0 */2 * * *' → Partidos próximos (24 horas) + estrategias alternativas

// Limpieza diaria a las 2:00 AM
'0 2 * * *' → Eliminar invitaciones de partidos cancelados/finalizados
```

## 🚀 Funcionalidades Implementadas

### 1. Emparejamiento Recurrente

- **Frecuencia**: Cada 30 minutos
- **Alcance**: Partidos que necesitan jugadores en las próximas 48 horas
- **Estrategias**: Utiliza la estrategia configurada del partido (ZONA, NIVEL, HISTORIAL)

### 2. Emparejamiento Intensivo

- **Frecuencia**: Cada 2 horas
- **Alcance**: Partidos próximos (menos de 24 horas)
- **Estrategias Múltiples**: Si un partido sigue necesitando jugadores, prueba estrategias alternativas automáticamente

### 3. Limpieza Automática

- **Frecuencia**: Diaria a las 2:00 AM
- **Función**: Cancela invitaciones pendientes de partidos ya cancelados o finalizados

### 4. Estadísticas en Tiempo Real

- Partidos que necesitan jugadores
- Partidos próximos (24 horas)
- Invitaciones pendientes totales
- Invitaciones enviadas hoy

## 🛠️ Integración con la Aplicación

### En `app.ts`

```typescript
import { PartidoSchedulerService } from "./services/scheduler/PartidoSchedulerService.js";
import { EmparejamientoSchedulerService } from "./services/scheduler/EmparejamientoSchedulerService.js";

// Inicializar schedulers
const schedulerService = new PartidoSchedulerService();
const emparejamientoScheduler = new EmparejamientoSchedulerService();

schedulerService.iniciar();
emparejamientoScheduler.iniciar();

// Graceful shutdown
process.on("SIGTERM", () => {
  schedulerService.detener();
  emparejamientoScheduler.detener();
});
```

## 📊 API Endpoints

### Estadísticas del Scheduler

```http
GET /api/emparejamiento-scheduler/estadisticas
Authorization: Bearer {token}
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "isRunning": true,
    "partidosQueNecesitanJugadores": 8,
    "partidosProximos": 1,
    "invitacionesPendientes": 25,
    "invitacionesEnviadasHoy": 17,
    "jobsConfigurados": [
      "emparejamiento-recurrente",
      "emparejamiento-intensivo",
      "limpieza-invitaciones"
    ]
  }
}
```

### Reiniciar Scheduler

```http
POST /api/emparejamiento-scheduler/reiniciar
Authorization: Bearer {token}
```

## 🔄 Flujo Automático

### Creación de Partido

1. **Usuario crea partido** → `PartidoService.crearPartido()`
2. **Emparejamiento inicial inmediato** → `EmparejamientoService.ejecutarYCrearInvitaciones()`
3. **Scheduler recurrente** → Cada 30 minutos busca más candidatos
4. **Scheduler intensivo** → Cada 2 horas con estrategias alternativas (si el partido es próximo)

### Estados de Partido

- **NECESITAMOS_JUGADORES** → Aplica emparejamiento automático
- **ARMADO** → No necesita más jugadores
- **CANCELADO/FINALIZADO** → Limpia invitaciones pendientes

## 🧪 Testing

### Script de Prueba

```bash
node test-emparejamiento-automatico.js
```

**Funciones probadas:**

- ✅ Creación de partidos con diferentes estrategias
- ✅ Emparejamiento automático inicial y recurrente
- ✅ Emparejamiento intensivo con estrategias alternativas
- ✅ Estadísticas del sistema
- ✅ Configuración de múltiples cron jobs
- ✅ Inicialización y detención correcta de schedulers

## 🔧 Configuración Avanzada

### Personalizar Frecuencias

En `EmparejamientoSchedulerService.ts`:

```typescript
// Cambiar frecuencia de emparejamiento recurrente
const emparejamientoJob = cron.schedule("*/15 * * * *", async () => {
  // Cada 15 minutos en lugar de 30
});

// Cambiar frecuencia de emparejamiento intensivo
const intensivoJob = cron.schedule("0 */1 * * *", async () => {
  // Cada hora en lugar de cada 2 horas
});
```

### Filtros Personalizados

```typescript
// Modificar criterios de selección en obtenerPartidosQueNecesitanJugadores()
where: {
  estado: 'NECESITAMOS_JUGADORES',
  fecha: {
    [Op.gte]: desde.toISOString().split('T')[0],
    [Op.lte]: hasta.toISOString().split('T')[0]
  },
  // Agregar filtros adicionales
  cantidadJugadores: { [Op.gte]: 4 }, // Solo partidos de 4+ jugadores
  nivelMinimo: { [Op.lte]: 2 }         // Solo partidos nivel 1-2
}
```

## 🎯 Beneficios del Sistema

### Para Usuarios

- **Invitaciones automáticas**: No necesitan buscar partidos manualmente
- **Mejor matching**: El sistema encuentra partidos compatibles continuamente
- **Experiencia fluida**: Los partidos se llenan automáticamente

### Para Organizadores

- **Menos gestión manual**: El sistema busca jugadores automáticamente
- **Partidos completos**: Mayor probabilidad de llenar los partidos
- **Notificaciones inteligentes**: Solo cuando es necesario

### Para el Sistema

- **Escalabilidad**: Maneja múltiples partidos simultáneamente
- **Eficiencia**: Evita búsquedas manuales repetitivas
- **Limpieza automática**: Mantiene la base de datos organizada

## 🚨 Consideraciones de Producción

### Monitoreo

- Logs detallados en cada ejecución
- Métricas de rendimiento en estadísticas
- Manejo de errores sin interrumpir el servicio

### Recursos

- Los cron jobs son ligeros y no bloquean el hilo principal
- Base de datos optimizada con índices en campos consultados frecuentemente
- Graceful shutdown para evitar corruption de datos

### Mantenimiento

- Configuración centralizada en servicios dedicados
- Fácil ajuste de frecuencias sin reiniciar el servidor
- API para monitoreo y control en tiempo real

---

**🎉 El sistema de emparejamiento automático con node-cron está listo para producción y mejorará significativamente la experiencia del usuario en la plataforma deportiva.**
