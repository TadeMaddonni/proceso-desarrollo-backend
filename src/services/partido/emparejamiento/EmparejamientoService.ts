import dbPromise from '../../../models/index.js';
import type { PartidoDTO } from '../../../DTOs/PartidoDTO.js';

export class EmparejamientoService {
  /**
   * Ejecuta el emparejamiento y crea invitaciones para los candidatos
   */
  static async ejecutarYCrearInvitaciones(partido: PartidoDTO): Promise<void> {
    const db = await dbPromise;
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

    // Crear invitaciones para cada candidato (si no existe ya)
    const Invitacion = db.Invitacion as any;
    for (const usuario of candidatos) {
      const existe = await Invitacion.findOne({
        where: { partidoId: partido.id, usuarioId: usuario.id }
      });
      if (!existe) {
        await Invitacion.create({
          partidoId: partido.id,
          usuarioId: usuario.id,
          estado: 'pendiente',
          criterioOrigen: 'emparejamiento',
          fechaEnvio: new Date()
        });
      }
    }
  }
}
