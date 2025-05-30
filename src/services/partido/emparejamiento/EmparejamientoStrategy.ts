import type { UsuarioDTO } from '../../../DTOs/UsuarioDTO.js';
import type { PartidoDTO } from '../../../DTOs/PartidoDTO.js';

export abstract class EstrategiaEmparejamiento {
  abstract emparejar(partido: PartidoDTO): Promise<UsuarioDTO[]>;
}
