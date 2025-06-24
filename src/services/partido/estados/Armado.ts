// Armado.ts - Estado cuando el partido tiene suficientes jugadores pero no está confirmado
import { EstadoPartido } from './EstadoPartido.js';
import type { PartidoDTO } from '../../../DTOs/PartidoDTO.js';

export class Armado extends EstadoPartido {
  permiteInvitaciones(): boolean {
    return false; // Ya no permite más invitaciones, el equipo está completo
  }

  confirmar(partido: PartidoDTO): void {
    // Todos los jugadores deben aceptar la participación
    partido.estado = 'CONFIRMADO';
  }

  cancelar(partido: PartidoDTO): void {
    // Puede ser cancelado por el organizador
    partido.estado = 'CANCELADO';
  }

  iniciar(partido: PartidoDTO): void {
    throw new Error('El partido debe estar confirmado antes de iniciarse');
  }

  finalizar(partido: PartidoDTO): void {
    throw new Error('No se puede finalizar un partido que no ha iniciado');
  }

  // Método específico para volver a necesitar jugadores si alguien se retira
  jugadorSeRetira(partido: PartidoDTO): void {
    partido.estado = 'NECESITAMOS_JUGADORES';
  }
}
