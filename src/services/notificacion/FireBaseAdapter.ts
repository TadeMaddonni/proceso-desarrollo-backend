import type { Notificador } from './NotificadorInterface.js';
import type { PartidoDTO } from '../../DTOs/PartidoDTO.js';

export class FireBaseAdapter implements Notificador {
  async notificarNuevoPartido(partido: PartidoDTO): Promise<void> {
    console.log(`[Push] Nuevo partido creado: ${partido.id}`);
  }

  async notificarCambioEstado(partido: PartidoDTO): Promise<void> {
    console.log(`[Push] Estado del partido: ${partido.estado}`);
  }
}
