// Finalizado.ts - Estado cuando el partido ha terminado
import { EstadoPartido } from './EstadoPartido.js';
import type { PartidoDTO } from '../../../DTOs/PartidoDTO.js';

export class Finalizado extends EstadoPartido {
  permiteInvitaciones(): boolean {
    return false; // No permite invitaciones cuando ya finalizó
  }

  confirmar(partido: PartidoDTO): void {
    throw new Error('El partido ya ha finalizado');
  }

  cancelar(partido: PartidoDTO): void {
    throw new Error('No se puede cancelar un partido que ya finalizó');
  }

  iniciar(partido: PartidoDTO): void {
    throw new Error('El partido ya ha finalizado');
  }

  finalizar(partido: PartidoDTO, equipoGanador?: 'A' | 'B'): void {
    throw new Error('El partido ya está finalizado');
  }

  // Método para registrar el equipo ganador
  registrarGanador(partido: PartidoDTO, equipoGanador: 'A' | 'B'): void {
    if (partido.equipoGanador) {
      throw new Error('El ganador ya fue registrado');
    }
    partido.equipoGanador = equipoGanador;
  }

  // Método para obtener estadísticas del partido
  obtenerEstadisticas(partido: PartidoDTO): any {
    return {
      equipoGanador: partido.equipoGanador,
      duracion: partido.duracion,
      fecha: partido.fecha,
      participantes: partido.participantes?.length || 0
    };
  }
}
