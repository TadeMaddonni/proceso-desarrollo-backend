import { Request, Response, NextFunction } from 'express';
import dbPromise from '../models/index.js';

export class InvitacionValidationMiddleware {  static async validarInvitacionExiste(req: Request, res: Response, next: NextFunction): Promise<void> {
    const db = await dbPromise;
    const Invitacion = db.Invitacion as any;
    const invitacion = await Invitacion.findByPk(req.params.id);
    if (!invitacion) {
      res.status(404).json({ success: false, message: 'Invitación no encontrada' });
      return;
    }
    req.invitacion = invitacion;
    next();
  }  static async validarUsuarioInvitado(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Intentar obtener usuarioId de diferentes fuentes
    const usuarioId = req.body.usuarioId || 
                     req.body.usuario_id || 
                     (req as any).user?.id || 
                     (req as any).user?.usuarioId;
    
    if (!usuarioId) {
      res.status(400).json({ 
        success: false, 
        message: 'Usuario ID requerido. Debe enviarse en el cuerpo de la petición como usuarioId o mediante autenticación.' 
      });
      return;
    }
    
    if (!req.invitacion || req.invitacion.usuarioId !== usuarioId) {
      res.status(403).json({ success: false, message: 'No autorizado para operar sobre esta invitación' });
      return;
    }
    next();
  }
  static async validarEstadoPendiente(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.invitacion || req.invitacion.estado !== 'pendiente') {
      res.status(409).json({ success: false, message: 'La invitación no está pendiente' });
      return;
    }
    next();
  }
}
