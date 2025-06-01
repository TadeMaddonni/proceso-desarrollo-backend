import { Request, Response, NextFunction } from 'express';
import dbPromise from '../models/index.js';

export class InvitacionValidationMiddleware {
  static async validarInvitacionExiste(req: Request, res: Response, next: NextFunction) {
    const db = await dbPromise;
    const Invitacion = db.Invitacion as any;
    const invitacion = await Invitacion.findByPk(req.params.id);
    if (!invitacion) {
      return res.status(404).json({ success: false, message: 'Invitación no encontrada' });
    }
    req.invitacion = invitacion;
    next();
  }

  static async validarUsuarioInvitado(req: Request, res: Response, next: NextFunction) {
    const usuarioId = req.body.usuarioId;
    if (!req.invitacion || req.invitacion.usuarioId !== usuarioId) {
      return res.status(403).json({ success: false, message: 'No autorizado para operar sobre esta invitación' });
    }
    next();
  }

  static async validarEstadoPendiente(req: Request, res: Response, next: NextFunction) {
    if (!req.invitacion || req.invitacion.estado !== 'pendiente') {
      return res.status(409).json({ success: false, message: 'La invitación no está pendiente' });
    }
    next();
  }
}
