import { AuthController } from "../../controllers/auth/AuthController.js";
import { Router } from 'express';

const authRouter = Router();
const authController = new AuthController();

authRouter.post('/signup', (req, res) => {
  authController.signup(req, res);
});


authRouter.post('/login', (req, res) => {
  res.send('Login');
});

export default authRouter;