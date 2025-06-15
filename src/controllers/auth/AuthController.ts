import { Request, Response } from 'express';
import { AuthService } from '../../services/auth/AuthService.js';
import jwt from 'jsonwebtoken';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }    signup = async (req: Request, res: Response): Promise<void> => {
        try {            if (!req.body) {
                res.status(400).json({ 
                    success: false,
                    error: 'Request body is required' 
                });
                return;
            }

            const { email, password, nombre, zonaId, deporteId, nivel } = req.body;

            if (!email || !password || !nombre || !zonaId) {
                res.status(400).json({ 
                    success: false,
                    error: 'Email, password, nombre y zonaId son requeridos' 
                });
                return;
            }const result = await this.authService.signup(email, password, nombre, zonaId, deporteId, nivel);
            res.status(201).json({ 
                success: true,
                message: 'Usuario creado exitosamente',
                data: result 
            });        } catch (error: any) {
            console.error('Error en signup:', error);
            if (error.message === 'El usuario ya existe') {
                res.status(409).json({ 
                    success: false,
                    error: error.message 
                });
            } else if (error.message === 'La zona especificada no existe') {
                res.status(400).json({ 
                    success: false,
                    error: error.message 
                });
            } else if (error.message === 'El deporte especificado no existe') {
                res.status(400).json({ 
                    success: false,
                    error: error.message 
                });
            } else {
                res.status(500).json({ 
                    success: false,
                    error: 'Error al crear usuario', 
                    details: error.message 
                });
            }
        }
    };
    login = async (req: Request, res: Response): Promise<void> => {
        try {            if (!req.body) {
                res.status(400).json({ 
                    success: false,
                    error: 'Request body is required' 
                });
                return;
            }

            const { email, password } = req.body

            if (!email || !password) {
                res.status(400).json({ 
                    success: false,
                    error: 'Email and password are required' 
                });
                return;
            }// Buscar usuario real y verificar contraseña
            const result = await this.authService.login(email, password);
            if (result && result.user && result.token) {
                res.status(200).json({ 
                    success: true,
                    message: 'Login exitoso',
                    data: {
                        user: result.user,
                        token: result.token
                    }
                });
            } else {
                res.status(401).json({ 
                    success: false,
                    error: 'Credenciales inválidas' 
                });
            }        } catch (error: any) {
            console.error('Error en login:', error);
            res.status(500).json({ 
                success: false,
                error: 'Error interno del servidor',
                details: error.message 
            });
        }
    }
}

