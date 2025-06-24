import { AuthController } from "../../controllers/auth/AuthController.js";
import { Router } from 'express';
import { authenticateJWT } from '../../middleware/authMiddleware.js';

const authRouter = Router();
const authController = new AuthController();

// Signup - ahora el hasheo se hace en el service
authRouter.post('/signup', function (req, res) {
  authController.signup(req, res);
});

// Login
authRouter.post('/login', function (req, res) {
  authController.login(req, res);
});

// Ruta protegida de ejemplo para verificar autenticación
// Puedes probar accediendo a /auth/protected con un token válido

authRouter.get('/protected', function (req, res, next) {
  authenticateJWT(req, res, function () {
    const user = (req as any).user;
    res.json({ message: 'Acceso autorizado', user });
  });
});

export default authRouter;