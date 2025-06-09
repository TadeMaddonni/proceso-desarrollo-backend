import { PartidoObserver } from './PartidoObserver.js';
import { InvitacionService } from '../services/partido/InvitacionService.js';
import type { PartidoDTO } from '../DTOs/PartidoDTO.js';

/**
 * Observador que maneja las invitaciones cuando cambia el estado de un partido
 * Implementa el patrón Observer para cancelar invitaciones según el estado del partido
 */
export class InvitacionObserver implements PartidoObserver {
    /**
   * Se ejecuta cuando el partido cambia de estado
   * Gestiona invitaciones según las reglas de negocio optimizadas
   */
  async actualizar(partido: PartidoDTO, estadoAnterior: string, estadoNuevo: string): Promise<void> {
    try {
      console.log(`[InvitacionObserver] Procesando cambio de estado: ${estadoAnterior} -> ${estadoNuevo} para partido ${partido.id}`);

      // Cancelar invitaciones cuando el partido está lleno (ARMADO)
      // Las invitaciones se cancelan UNA SOLA VEZ cuando el partido se llena
      if (estadoNuevo === 'ARMADO' && estadoAnterior === 'NECESITAMOS_JUGADORES') {
        await this.cancelarInvitaciones(partido.id, 'El partido ya está completo');
      }

      // Reactivar invitaciones cuando el partido vuelve a necesitar jugadores
      // Solo si venía del estado ARMADO
      else if (estadoNuevo === 'NECESITAMOS_JUGADORES' && estadoAnterior === 'ARMADO') {
        await this.reactivarInvitaciones(partido.id);
      }

      // Cancelar invitaciones SOLO cuando el partido se cancela
      // Esto puede ocurrir desde cualquier estado
      else if (estadoNuevo === 'CANCELADO') {
        await this.cancelarInvitaciones(partido.id, 'El partido ha sido cancelado');
      }

      // Para CONFIRMADO y EN_JUEGO no hacemos nada porque las invitaciones
      // ya están canceladas desde que el partido se puso en ARMADO

    } catch (error) {
      console.error(`[InvitacionObserver] Error al procesar cambio de estado:`, error);
      // No relanzamos el error para no interrumpir el flujo principal
    }
  }
  /**
   * Cancela invitaciones pendientes de un partido
   */
  private async cancelarInvitaciones(partidoId: string, motivo: string): Promise<void> {
    try {
      const resultado = await InvitacionService.cancelarInvitacionesPorPartido(
        partidoId, 
        motivo
      );
      
      console.log(`[InvitacionObserver] Canceladas ${resultado.invitacionesCanceladas} invitaciones: ${motivo} - Partido ${partidoId}`);
    } catch (error) {
      console.error(`[InvitacionObserver] Error al cancelar invitaciones:`, error);
    }
  }

  /**
   * Reactiva invitaciones canceladas de un partido
   */
  private async reactivarInvitaciones(partidoId: string): Promise<void> {
    try {
      const resultado = await InvitacionService.reactivarInvitacionesPartido(
        partidoId, 
        'El partido vuelve a necesitar jugadores'
      );
      
      console.log(`[InvitacionObserver] Reactivadas ${resultado.invitacionesReactivadas} invitaciones por falta de jugadores en partido ${partidoId}`);
    } catch (error) {
      console.error(`[InvitacionObserver] Error al reactivar invitaciones:`, error);
    }
  }
}
