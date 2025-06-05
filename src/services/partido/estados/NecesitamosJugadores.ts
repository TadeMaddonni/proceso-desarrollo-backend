// NecesitamosJugadores.ts - Estado inicial cuando un partido necesita jugadores
import { EstadoPartido } from './EstadoPartido.js';
import type { PartidoDTO } from '../../../DTOs/PartidoDTO.js';

export class NecesitamosJugadores extends EstadoPartido {
  permiteInvitaciones(): boolean {
    return true; // Permite invitaciones para completar el equipo
  }

  confirmar(partido: PartidoDTO): void {
    throw new Error('No se puede confirmar un partido que necesita jugadores');
  }

  cancelar(partido: PartidoDTO): void {
    // Puede ser cancelado por el organizador
    partido.estado = 'CANCELADO';
  }

  iniciar(partido: PartidoDTO): void {
    throw new Error('No se puede iniciar un partido que necesita jugadores');
  }

  finalizar(partido: PartidoDTO): void {
    throw new Error('No se puede finalizar un partido que necesita jugadores');
  }

  // Método específico para transicionar cuando se completa el equipo
  equipoCompleto(partido: PartidoDTO): void {
    partido.estado = 'ARMADO';
  }
}
