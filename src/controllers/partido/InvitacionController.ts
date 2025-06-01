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
}
