// EnJuego.ts - Estado cuando el partido está en curso
import { EstadoPartido } from './EstadoPartido.js';
import type { PartidoDTO } from '../../../DTOs/PartidoDTO.js';

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

  finalizar(partido: PartidoDTO): void {
    // El partido puede ser finalizado con el equipo ganador
    partido.estado = 'FINALIZADO';
  }

  // Método para registrar eventos durante el juego
  registrarEvento(partido: PartidoDTO, evento: string): void {
    // Aquí se pueden registrar eventos como goles, tarjetas, etc.
    console.log(`Evento en partido ${partido.id}: ${evento}`);
  }
}
