import { PartidoObserver } from './PartidoObserver.js';
import { NotificacionService } from '../services/notificacion/NotificacionService.js';
import type { PartidoDTO } from '../DTOs/PartidoDTO.js';

/**
 * Observador que maneja las notificaciones cuando cambia el estado de un partido
 * Implementa el patrón Observer para notificar a usuarios sobre cambios de estado
 */
export class NotificacionObserver implements PartidoObserver {
  private notificacionService: NotificacionService;

  constructor() {
    this.notificacionService = new NotificacionService();
  }
  /**
   * Se ejecuta cuando el partido cambia de estado
   * Notifica a los usuarios relevantes sobre el cambio
   */
  async actualizar(partido: PartidoDTO, estadoAnterior: string, estadoNuevo: string): Promise<void> {
    try {
      console.log(`[NotificacionObserver] Partido ${partido.id} cambió de ${estadoAnterior} a ${estadoNuevo}`);

      // Determinar si es necesario notificar según el cambio de estado
      const estadosNotificables = ['ARMADO', 'CONFIRMADO', 'EN_JUEGO', 'FINALIZADO', 'CANCELADO'];
      
      if (estadosNotificables.includes(estadoNuevo)) {
        console.log(`[NotificacionObserver] Enviando notificación para estado: ${estadoNuevo}`);
        await this.notificacionService.notificarCambioEstado(partido);
      }

      // Caso especial: cuando vuelve a necesitar jugadores
      if (estadoNuevo === 'NECESITAMOS_JUGADORES' && estadoAnterior === 'ARMADO') {
        console.log(`[NotificacionObserver] Enviando notificación: partido necesita más jugadores`);
        await this.notificacionService.notificarCambioEstado(partido);
      }

    } catch (error) {
      console.error(`[NotificacionObserver] Error al notificar cambio de estado:`, error);
      // No relanzamos el error para no interrumpir el flujo principal
    }
  }
}
