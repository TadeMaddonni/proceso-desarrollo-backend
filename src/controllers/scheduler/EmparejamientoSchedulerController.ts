import { Request, Response } from 'express';
import { EmparejamientoSchedulerService } from '../../services/scheduler/EmparejamientoSchedulerService.js';

/**
 * Controlador para estadísticas y administración del emparejamiento automático
 */
export class EmparejamientoSchedulerController {
  private static schedulerInstance: EmparejamientoSchedulerService | null = null;

  /**
   * Establecer la instancia del scheduler (llamado desde app.ts)
   */
  static setSchedulerInstance(scheduler: EmparejamientoSchedulerService): void {
    this.schedulerInstance = scheduler;
  }

  /**
   * Obtener estadísticas del emparejamiento automático
   * GET /api/emparejamiento-scheduler/estadisticas
   */
  static obtenerEstadisticas = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!this.schedulerInstance) {
        res.status(503).json({
          success: false,
          message: 'Scheduler de emparejamiento no disponible'
        });
        return;
      }

      const estadisticas = await this.schedulerInstance.obtenerEstadisticas();
      
      if (!estadisticas) {
        res.status(500).json({
          success: false,
          message: 'Error obteniendo estadísticas del scheduler'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: estadisticas
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas del scheduler:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Reiniciar el scheduler de emparejamiento
   * POST /api/emparejamiento-scheduler/reiniciar
   */
  static reiniciarScheduler = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!this.schedulerInstance) {
        res.status(503).json({
          success: false,
          message: 'Scheduler de emparejamiento no disponible'
        });
        return;
      }

      // Detener y reiniciar
      this.schedulerInstance.detener();
      setTimeout(() => {
        this.schedulerInstance?.iniciar();
      }, 1000);

      res.status(200).json({
        success: true,
        message: 'Scheduler de emparejamiento reiniciado exitosamente'
      });

    } catch (error) {
      console.error('Error reiniciando scheduler:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
}
