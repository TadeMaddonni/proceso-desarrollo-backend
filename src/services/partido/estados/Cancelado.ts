// Cancelado.ts - Estado cuando el partido ha sido cancelado
import { EstadoPartido } from './EstadoPartido.js';
import type { PartidoDTO } from '../../../DTOs/PartidoDTO.js';

export class Cancelado extends EstadoPartido {
  permiteInvitaciones(): boolean {
    return false; // No permite invitaciones cuando está cancelado
  }

  confirmar(partido: PartidoDTO): void {
    throw new Error('No se puede confirmar un partido cancelado');
  }

  cancelar(partido: PartidoDTO): void {
    throw new Error('El partido ya está cancelado');
  }

  iniciar(partido: PartidoDTO): void {
    throw new Error('No se puede iniciar un partido cancelado');
  }
  finalizar(partido: PartidoDTO, equipoGanador?: 'A' | 'B'): void {
    throw new Error('No se puede finalizar un partido cancelado');
  }

  // Método para obtener la razón de la cancelación
  obtenerRazonCancelacion(partido: PartidoDTO): string {
    return `Partido cancelado el ${new Date().toISOString()}`;
  }

  // Método para verificar si se puede reactivar (solo si no pasó la fecha)
  puedeReactivarse(partido: PartidoDTO): boolean {
    const ahora = new Date();
    const fechaPartido = new Date(`${partido.fecha} ${partido.hora}`);
    return ahora < fechaPartido;
  }
}
