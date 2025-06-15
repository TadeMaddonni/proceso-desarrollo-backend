import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    nombre: string;
    zonaId: string;
    deporteId?: string;
  };
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ 
      error: 'Token no proporcionado',
      message: 'Se requiere autenticación. Incluye el token en el header Authorization: Bearer <token>' 
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      nombre: decoded.nombre,
      zonaId: decoded.zonaId,
      deporteId: decoded.deporteId
    };
    next();
  } catch (err) {
    res.status(403).json({ 
      error: 'Token inválido o expirado',
      message: 'El token proporcionado no es válido o ha expirado. Por favor, inicia sesión nuevamente.' 
    });
    return;
  }
}

/**
 * Middleware opcional para rutas que pueden funcionar con o sin autenticación
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Si no hay token, continuar sin usuario
    req.user = undefined;
    next();
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      nombre: decoded.nombre,
      zonaId: decoded.zonaId,
      deporteId: decoded.deporteId
    };
  } catch (err) {
    // Si el token es inválido, continuar sin usuario
    req.user = undefined;
  }
  
  next();
}
