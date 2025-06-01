import dbPromise from '../../models/index.js';
import { PartidoService } from './PartidoService.js';

export class InvitacionService {
  static async aceptarInvitacion(invitacionId: string, usuarioId: string) {
    const db = await dbPromise;
    const Invitacion = db.Invitacion as any;
    const invitacion = await Invitacion.findByPk(invitacionId);
    if (!invitacion) return { success: false, message: 'Invitación no encontrada', status: 404 };
    if (invitacion.usuarioId !== usuarioId) return { success: false, message: 'No autorizado', status: 403 };
    if (invitacion.estado !== 'pendiente') return { success: false, message: 'La invitación no está pendiente', status: 409 };
    invitacion.estado = 'aceptada';
    await invitacion.save();
    // Unir usuario al partido
    await PartidoService.unirUsuarioAPartido(invitacion.partidoId, { usuarioId });
    return { success: true };
  }

  static async cancelarInvitacion(invitacionId: string, usuarioId: string) {
    const db = await dbPromise;
    const Invitacion = db.Invitacion as any;
    const invitacion = await Invitacion.findByPk(invitacionId);
    if (!invitacion) return { success: false, message: 'Invitación no encontrada', status: 404 };
    if (invitacion.usuarioId !== usuarioId) return { success: false, message: 'No autorizado', status: 403 };
    if (invitacion.estado !== 'pendiente') return { success: false, message: 'La invitación no está pendiente', status: 409 };
    invitacion.estado = 'cancelada';
    await invitacion.save();
    return { success: true };
  }
}
