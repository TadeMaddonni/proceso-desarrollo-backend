import { Request, Response } from 'express';
import { AuthService } from '../../services/auth/AuthService.js';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    signup = (req: Request, res: Response): void => {
        if (!req.body) {
            res.status(400).json({ error: 'Request body is required' });
            return;
        }

        const { email, password } = req.body

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const user = this.authService.signup(email, password);
        res.json(user);
    };
}

