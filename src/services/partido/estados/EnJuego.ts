// EnJuego.ts - Estado cuando el partido está en curso
import { EstadoPartido } from './EstadoPartido.js';
import type { PartidoDTO } from '../../../DTOs/PartidoDTO.js';
import type { PartidoFinalizarDTO } from '../../../DTOs/PartidoCreationDTO.js';
import dbPromise from '../../../models/index.js';
import { ScoreService } from '../../usuario/ScoreService.js';

export class EnJuego extends EstadoPartido {
  permiteInvitaciones(): boolean {
    return false; // No permite invitaciones cuando ya está en juego
  }

  confirmar(partido: PartidoDTO): void {
    throw new Error('El partido ya está en juego, no se puede confirmar');
  }

  cancelar(partido: PartidoDTO): void {
    throw new Error('No se puede cancelar un partido que ya está en juego');
  }

  iniciar(partido: PartidoDTO): void {
    throw new Error('El partido ya está en juego');
  }
  async finalizar(partido: PartidoDTO, equipoGanador?: 'A' | 'B'): Promise<void> {
    // Actualizar scores si hay un equipo ganador
    if (equipoGanador) {
      try {
        await ScoreService.actualizarScoresPartidoFinalizado(partido.id, equipoGanador);
      } catch (error) {
        console.error('[EnJuego] Error al actualizar scores del partido:', error);
        // No fallar la finalización del partido si hay error en scores
      }
    }

    // El partido puede ser finalizado
    partido.estado = 'FINALIZADO';
    if (equipoGanador) {
      partido.equipoGanador = equipoGanador;
    }
  }

  // Método para registrar eventos durante el juego
  registrarEvento(partido: PartidoDTO, evento: string): void {
    // Aquí se pueden registrar eventos como goles, tarjetas, etc.
    console.log(`Evento en partido ${partido.id}: ${evento}`);
  }
}
