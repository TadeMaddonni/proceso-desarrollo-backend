import { Router } from 'express';
import { InvitacionController } from '../../controllers/partido/InvitacionController.js';
import { InvitacionValidationMiddleware } from '../../middleware/invitacionValidationMiddleware.js';
import { authenticateJWT } from '../../middleware/authMiddleware.js';

const router = Router();
const invitacionController = new InvitacionController();

// Helper para middlewares async
function wrapAsync(fn: any) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Middleware opcional de autenticación (no falla si no hay token)
function optionalAuth(req: any, res: any, next: any): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    authenticateJWT(req, res, next);
    return;
  }
  next();
}

// Aceptar invitación
router.put('/:id/aceptar',
  optionalAuth,
  wrapAsync(InvitacionValidationMiddleware.validarInvitacionExiste),
  wrapAsync(InvitacionValidationMiddleware.validarUsuarioInvitado),
  wrapAsync(InvitacionValidationMiddleware.validarEstadoPendiente),
  wrapAsync(invitacionController.aceptar)
);

// Cancelar invitación
router.put('/:id/cancelar',
  optionalAuth,
  wrapAsync(InvitacionValidationMiddleware.validarInvitacionExiste),
  wrapAsync(InvitacionValidationMiddleware.validarUsuarioInvitado),
  wrapAsync(InvitacionValidationMiddleware.validarEstadoPendiente),
  wrapAsync(invitacionController.cancelar)
);

export default router;
