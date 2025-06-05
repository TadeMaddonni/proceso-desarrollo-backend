// Confirmado.ts - Estado cuando el partido está confirmado y listo para jugar
import { EstadoPartido } from './EstadoPartido.js';
import type { PartidoDTO } from '../../../DTOs/PartidoDTO.js';

export class Confirmado extends EstadoPartido {
  permiteInvitaciones(): boolean {
    return false; // No permite más invitaciones, está confirmado
  }

  confirmar(partido: PartidoDTO): void {
    throw new Error('El partido ya está confirmado');
  }

  cancelar(partido: PartidoDTO): void {
    // Puede ser cancelado por el organizador antes del inicio
    partido.estado = 'CANCELADO';
  }

  iniciar(partido: PartidoDTO): void {
    // Se transiciona automáticamente cuando llega la fecha y hora
    partido.estado = 'EN_JUEGO';
  }

  finalizar(partido: PartidoDTO): void {
    throw new Error('El partido debe estar en juego para poder finalizarse');
  }

  // Método para verificar si es hora de iniciar el partido
  esHoraDeIniciar(partido: PartidoDTO): boolean {
    const ahora = new Date();
    const fechaPartido = new Date(`${partido.fecha} ${partido.hora}`);
    return ahora >= fechaPartido;
  }
}
