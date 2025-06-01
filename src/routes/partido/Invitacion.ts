import { Router } from 'express';
import { InvitacionController } from '../../controllers/partido/InvitacionController.js';
import { InvitacionValidationMiddleware } from '../../middleware/invitacionValidationMiddleware.js';

const router = Router();
const invitacionController = new InvitacionController();

// Helper para middlewares async
function wrapAsync(fn: any) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Aceptar invitación
router.put('/:id/aceptar',
  wrapAsync(InvitacionValidationMiddleware.validarInvitacionExiste),
  wrapAsync(InvitacionValidationMiddleware.validarUsuarioInvitado),
  wrapAsync(InvitacionValidationMiddleware.validarEstadoPendiente),
  wrapAsync(invitacionController.aceptar)
);

// Cancelar invitación
router.put('/:id/cancelar',
  wrapAsync(InvitacionValidationMiddleware.validarInvitacionExiste),
  wrapAsync(InvitacionValidationMiddleware.validarUsuarioInvitado),
  wrapAsync(InvitacionValidationMiddleware.validarEstadoPendiente),
  wrapAsync(invitacionController.cancelar)
);

export default router;
