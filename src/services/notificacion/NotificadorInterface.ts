import type { PartidoDTO } from '../../DTOs/PartidoDTO.js';

export interface Notificador {
  notificarNuevoPartido(partido: PartidoDTO): Promise<void>;
  notificarCambioEstado(partido: PartidoDTO): Promise<void>;
}
