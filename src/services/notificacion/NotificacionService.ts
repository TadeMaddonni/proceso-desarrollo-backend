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
}
