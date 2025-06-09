import { Request, Response } from 'express';

/**
 * Controlador para el sistema de puntuación interno
 * Nota: El ScoreService es interno y se actualiza automáticamente,
 * este controlador es para posibles consultas futuras
 */
export class ScoreController {
  
  /**
   * Obtener información de puntuación (placeholder)
   */
  obtenerInfo = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: 'Sistema de score interno - Se actualiza automáticamente al finalizar partidos'
    });
  };
}