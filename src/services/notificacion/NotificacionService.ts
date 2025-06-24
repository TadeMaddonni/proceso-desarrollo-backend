import type { PartidoDTO } from '../../DTOs/PartidoDTO.js';
import { Notificador } from './NotificadorInterface.js';
import { FireBaseAdapter } from './FireBaseAdapter.js';
import { MailAdapter } from './MailAdapter.js';

export class NotificacionService {
  private canales: Notificador[] = [];
  constructor() {
    this.canales.push(new FireBaseAdapter());
    this.canales.push(new MailAdapter());
  }

  async notificarNuevoPartido(partido: PartidoDTO): Promise<void> {
    for (const canal of this.canales) {
      await canal.notificarNuevoPartido(partido);
    }
  }
  async notificarCambioEstado(partido: PartidoDTO): Promise<void> {
    for (const canal of this.canales) {
      await canal.notificarCambioEstado(partido);
    }
  }
  /**
   * Notifica cuando se crea una nueva invitación para un usuario
   */
  async notificarNuevaInvitacion(invitacionId: string): Promise<void> {
    console.log(`[NotificacionService] Nueva invitación creada: ${invitacionId}`);
    
    try {
      // Enviar notificación a través de todos los canales
      for (const canal of this.canales) {
        if ('enviarNotificacionInvitacion' in canal) {
          await (canal as any).enviarNotificacionInvitacion(invitacionId);
        }
      }
      
      console.log(`[NotificacionService] ✅ Notificación de invitación enviada exitosamente`);
    } catch (error) {
      console.error('[NotificacionService] ❌ Error enviando notificación de invitación:', error);
      throw error;
    }
  }
}
