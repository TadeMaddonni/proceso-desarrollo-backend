// EstadoPartido.ts - Interface base para el patrón State
import type { PartidoDTO } from '../../../DTOs/PartidoDTO.js';

export abstract class EstadoPartido {
  abstract permiteInvitaciones(): boolean;
  abstract confirmar(partido: PartidoDTO): void;
  abstract cancelar(partido: PartidoDTO): void;
  abstract iniciar(partido: PartidoDTO): void;
  abstract finalizar(partido: PartidoDTO): void;
}
