// EstadoPartido.ts - Interface base para el patrón State
import type { PartidoDTO } from '../../../DTOs/PartidoDTO.js';
import type { PartidoFinalizarDTO } from '../../../DTOs/PartidoCreationDTO.js';

export abstract class EstadoPartido {
  abstract permiteInvitaciones(): boolean;
  abstract confirmar(partido: PartidoDTO): void;
  abstract cancelar(partido: PartidoDTO): void;
  abstract iniciar(partido: PartidoDTO): void;
  abstract finalizar(partido: PartidoDTO, equipoGanador?: 'A' | 'B'): Promise<void> | void;
  
  // Métodos opcionales específicos de cada estado
  verificarYTransicionar?(partido: PartidoDTO): Promise<boolean> {
    return Promise.resolve(false);
  }
}
