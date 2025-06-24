import dbPromise from '../../../models/index.js';
import type { PartidoDTO } from '../../../DTOs/PartidoDTO.js';
import { NotificacionService } from '../../notificacion/NotificacionService.js';

export class EmparejamientoService {
  private static notificacionService = new NotificacionService();

  /**
   * Ejecuta el emparejamiento y crea invitaciones para los candidatos
   */
  static async ejecutarYCrearInvitaciones(partido: PartidoDTO): Promise<{ invitacionesEnviadas: number }> {
    const db = await dbPromise;
    let invitacionesCreadas = 0;
    
    // Determinar la estrategia
    let estrategia: any;
    switch (partido.tipoEmparejamiento) {
      case 'NIVEL':
        estrategia = (await import('./EmparejamientoPorNivel.js')).EmparejamientoPorNivel;
        break;
      case 'HISTORIAL':
        estrategia = (await import('./EmparejamientoPorHistorial.js')).EmparejamientoPorHistorial;
        break;
      case 'ZONA':
      default:
        estrategia = (await import('./EmparejamientoPorZona.js')).EmparejamientoPorZona;
        break;
    }
    
    // Ejecutar emparejamiento
    const instancia = new estrategia();
    const candidatos = await instancia.emparejar(partido);

    console.log(`[EmparejamientoService] Encontrados ${candidatos.length} candidatos para partido ${partido.id}`);

    // Crear invitaciones para cada candidato (si no existe ya)
    const Invitacion = db.Invitacion as any;
    for (const usuario of candidatos) {
      const existe = await Invitacion.findOne({
        where: { partidoId: partido.id, usuarioId: usuario.id }
      });
      
      if (!existe) {
        // Crear la invitación
        const nuevaInvitacion = await Invitacion.create({
          partidoId: partido.id,
          usuarioId: usuario.id,
          estado: 'pendiente',
          criterioOrigen: 'emparejamiento',
          fechaEnvio: new Date()
        });
        
        invitacionesCreadas++;
        console.log(`[EmparejamientoService] ✅ Invitación creada para usuario ${usuario.email}`);
        
        // 🔔 ENVIAR NOTIFICACIÓN AUTOMÁTICAMENTE
        try {
          await this.notificacionService.notificarNuevaInvitacion(nuevaInvitacion.id);
        } catch (error) {
          console.error(`[EmparejamientoService] ❌ Error enviando notificación para invitación ${nuevaInvitacion.id}:`, error);
          // No interrumpir el flujo principal por errores de notificación
        }
      } else {
        console.log(`[EmparejamientoService] ℹ️ Ya existe invitación para usuario ${usuario.email}`);
      }
    }

    console.log(`[EmparejamientoService] ✅ Proceso completado: ${invitacionesCreadas} nuevas invitaciones con notificaciones`);
    return { invitacionesEnviadas: invitacionesCreadas };
  }
}
