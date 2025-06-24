import { Request, Response } from 'express';
import { InvitacionService } from '../../services/partido/InvitacionService.js';

export class InvitacionController {
  async aceptar(req: Request, res: Response) {
    const invitacionId = req.params.id;
    const usuarioId = req.body.usuarioId;
    const result = await InvitacionService.aceptarInvitacion(invitacionId, usuarioId);
    if (result.success) {
      res.json({ success: true, message: 'Invitación aceptada correctamente.' });
    } else {
      res.status(result.status || 400).json({ success: false, message: result.message });
    }
  }

  async cancelar(req: Request, res: Response) {
    const invitacionId = req.params.id;
    const usuarioId = req.body.usuarioId;
    const result = await InvitacionService.cancelarInvitacion(invitacionId, usuarioId);
    if (result.success) {
      res.json({ success: true, message: 'Invitación cancelada correctamente.' });
    } else {
      res.status(result.status || 400).json({ success: false, message: result.message });
    }
  }

  /**
   * Obtener todas las invitaciones de un usuario
   */
  async obtenerPorUsuario(req: Request, res: Response) {
    const usuarioId = req.params.usuarioId;
    const result = await InvitacionService.obtenerInvitacionesPorUsuario(usuarioId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.invitaciones,
        message: 'Invitaciones obtenidas correctamente'
      });
    } else {
      res.status(result.status || 500).json({
        success: false,
        message: result.message
      });
    }
  }

  /**
   * Obtener todas las invitaciones de un partido
   */
  async obtenerPorPartido(req: Request, res: Response) {
    const partidoId = req.params.partidoId;
    const result = await InvitacionService.obtenerInvitacionesPorPartido(partidoId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.invitaciones,
        message: 'Invitaciones del partido obtenidas correctamente'
      });
    } else {
      res.status(result.status || 500).json({
        success: false,
        message: result.message
      });
    }
  }
}
