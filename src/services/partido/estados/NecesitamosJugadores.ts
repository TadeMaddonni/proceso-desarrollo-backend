// NecesitamosJugadores.ts - Estado inicial cuando un partido necesita jugadores
import { EstadoPartido } from './EstadoPartido.js';
import type { PartidoDTO } from '../../../DTOs/PartidoDTO.js';
import type { UnirsePartidoDTO } from '../../../DTOs/PartidoCreationDTO.js';
import dbPromise from '../../../models/index.js';

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
  finalizar(partido: PartidoDTO, equipoGanador?: 'A' | 'B'): void {
    throw new Error('No se puede finalizar un partido que necesita jugadores');
  }

  // Método específico para transicionar cuando se completa el equipo
  equipoCompleto(partido: PartidoDTO): void {
    partido.estado = 'ARMADO';
  }

  /**
   * Verificar si el partido está completo y realizar transición automática
   * Esta lógica estaba en PartidoService.verificarYTransicionarArmado
   */
  async verificarYTransicionar(partido: PartidoDTO): Promise<boolean> {
    // Importar dinámicamente para evitar dependencias circulares
    const { PartidoService } = await import('../PartidoService.js');
    
    try {      const estaCompleto = await PartidoService.verificarPartidoCompleto(partido.id);
      if (estaCompleto) {
        this.equipoCompleto(partido);
        await PartidoService.actualizarEstadoEnBD(partido.id, 'ARMADO');
        return true;
      }
      return false;
    } catch (error) {
      console.error('[NecesitamosJugadores] Error al verificar transición:', error);
      return false;
    }
  }

  /**
   * Unir un usuario al partido (lógica específica del estado NECESITAMOS_JUGADORES)
   */
  async unirUsuario(partidoId: string, datosUnirse: UnirsePartidoDTO): Promise<any> {
    const db = await dbPromise;
    const UsuarioPartido = db.UsuarioPartido as any;
    const Partido = db.Partido as any;

    // Si no se especifica equipo, auto-asignar balanceando
    let equipoAsignado = datosUnirse.equipo;
    if (!equipoAsignado) {
      equipoAsignado = await this.autoAsignarEquipo(partidoId);
    }

    // Crear la relación usuario-partido
    const usuarioPartido = await UsuarioPartido.create({
      usuarioId: datosUnirse.usuarioId,
      partidoId: partidoId,
      equipo: equipoAsignado
    });

    // Incrementar jugadoresConfirmados en el partido
    await Partido.increment('jugadoresConfirmados', {
      where: { id: partidoId }
    });

    // Verificar transición automática (usando importación dinámica para evitar dependencias circulares)
    const { PartidoService } = await import('../PartidoService.js');
    const partido = await PartidoService.obtenerPartidoPorId(partidoId);
    if (partido) {
      await this.verificarYTransicionar(partido);
    }

    return {
      id: usuarioPartido.id,
      usuarioId: usuarioPartido.usuarioId,
      partidoId: usuarioPartido.partidoId,
      equipo: usuarioPartido.equipo,
      fechaUnion: usuarioPartido.createdAt
    };
  }

  /**
   * Auto-asignar equipo balanceando la cantidad de jugadores
   */
  private async autoAsignarEquipo(partidoId: string): Promise<'A' | 'B'> {
    const conteos = await this.contarParticipantesPorEquipo(partidoId);
    
    // Asignar al equipo con menos jugadores
    return conteos.equipoA <= conteos.equipoB ? 'A' : 'B';
  }

  /**
   * Contar participantes por equipo
   */
  private async contarParticipantesPorEquipo(partidoId: string): Promise<{ equipoA: number; equipoB: number }> {
    const db = await dbPromise;
    const UsuarioPartido = db.UsuarioPartido as any;

    const participantes = await UsuarioPartido.findAll({
      where: { partidoId },
      attributes: ['equipo']
    });

    const equipoA = participantes.filter((p: any) => p.equipo === 'A').length;
    const equipoB = participantes.filter((p: any) => p.equipo === 'B').length;

    return { equipoA, equipoB };
  }
}
