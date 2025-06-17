import cron from 'node-cron';
import { PartidoService } from '../partido/PartidoService.js';
import { EmparejamientoService } from '../partido/emparejamiento/EmparejamientoService.js';
import dbPromise from '../../models/index.js';
import { Op } from 'sequelize';

/**
 * Servicio dedicado al emparejamiento automático recurrente
 * Utiliza node-cron para ejecutar emparejamientos periódicamente
 */
export class EmparejamientoSchedulerService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private isRunning: boolean = false;

  /**
   * Configurar trabajos de emparejamiento automático
   */
  constructor() {
    this.configurarJobs();
  }

  /**
   * Configura los trabajos cron para emparejamiento automático
   */
  private configurarJobs(): void {
    // Emparejamiento cada 30 minutos para partidos que necesitan jugadores
    const emparejamientoJob = cron.schedule('*/30 * * * *', async () => {
      if (this.isRunning) {
        await this.ejecutarEmparejamientoRecurrente();
      }
    });

    // Emparejamiento intensivo cada 2 horas para partidos próximos (menos de 24h)
    const emparejamientoIntensivoJob = cron.schedule('0 */2 * * *', async () => {
      if (this.isRunning) {
        await this.ejecutarEmparejamientoIntensivo();
      }
    });

    // Limpieza de invitaciones expiradas cada día a las 2:00 AM
    const limpiezaJob = cron.schedule('0 2 * * *', async () => {
      if (this.isRunning) {
        await this.limpiarInvitacionesExpiradas();
      }
    });

    // Detener jobs inicialmente
    emparejamientoJob.stop();
    emparejamientoIntensivoJob.stop();
    limpiezaJob.stop();

    this.jobs.set('emparejamiento-recurrente', emparejamientoJob);
    this.jobs.set('emparejamiento-intensivo', emparejamientoIntensivoJob);
    this.jobs.set('limpieza-invitaciones', limpiezaJob);

    console.log('🤝 [EmparejamientoScheduler] Jobs configurados:');
    console.log('   - Emparejamiento recurrente: cada 30 minutos');
    console.log('   - Emparejamiento intensivo: cada 2 horas');
    console.log('   - Limpieza de invitaciones: diario a las 2:00 AM');
  }

  /**
   * Iniciar el scheduler de emparejamiento
   */
  public iniciar(): void {
    this.isRunning = true;
    this.jobs.forEach((job, name) => {
      job.start();
      console.log(`🚀 [EmparejamientoScheduler] Job "${name}" iniciado`);
    });
    console.log('✅ [EmparejamientoScheduler] Scheduler de emparejamiento iniciado');
  }

  /**
   * Detener el scheduler de emparejamiento
   */
  public detener(): void {
    this.isRunning = false;
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`⏹️ [EmparejamientoScheduler] Job "${name}" detenido`);
    });
    console.log('🛑 [EmparejamientoScheduler] Scheduler de emparejamiento detenido');
  }

  /**
   * Ejecutar emparejamiento recurrente para partidos que necesitan jugadores
   */
  private async ejecutarEmparejamientoRecurrente(): Promise<void> {
    try {
      console.log('🤝 [EmparejamientoScheduler] Ejecutando emparejamiento recurrente...');
      
      const ahora = new Date();
      const en48Horas = new Date();
      en48Horas.setHours(en48Horas.getHours() + 48);

      // Buscar partidos que necesitan jugadores en las próximas 48 horas
      const partidos = await this.obtenerPartidosQueNecesitanJugadores(ahora, en48Horas);
      
      let emparejamientosEjecutados = 0;
      
      for (const partido of partidos) {
        try {
          const partidoDTO = await PartidoService.obtenerPartidoPorId(partido.id);
          if (partidoDTO) {
            await EmparejamientoService.ejecutarYCrearInvitaciones(partidoDTO);
            console.log(`✅ [EmparejamientoScheduler] Emparejamiento para partido ${partido.id} (${partidoDTO.tipoEmparejamiento})`);
            emparejamientosEjecutados++;
          }        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`❌ [EmparejamientoScheduler] Error en partido ${partido.id}:`, errorMessage);
        }
      }
      
      console.log(`🎯 [EmparejamientoScheduler] ${emparejamientosEjecutados} emparejamientos recurrentes ejecutados`);
    } catch (error) {
      console.error('❌ [EmparejamientoScheduler] Error en emparejamiento recurrente:', error);
    }
  }

  /**
   * Ejecutar emparejamiento intensivo para partidos próximos (menos de 24 horas)
   */
  private async ejecutarEmparejamientoIntensivo(): Promise<void> {
    try {
      console.log('🔥 [EmparejamientoScheduler] Ejecutando emparejamiento intensivo...');
      
      const ahora = new Date();
      const en24Horas = new Date();
      en24Horas.setHours(en24Horas.getHours() + 24);

      // Buscar partidos que necesitan jugadores en las próximas 24 horas
      const partidos = await this.obtenerPartidosQueNecesitanJugadores(ahora, en24Horas);
      
      let emparejamientosEjecutados = 0;
      
      for (const partido of partidos) {
        try {
          // Para partidos próximos, ejecutar múltiples estrategias si es necesario
          const partidoDTO = await PartidoService.obtenerPartidoPorId(partido.id);
          if (partidoDTO) {
            // Ejecutar emparejamiento principal
            await EmparejamientoService.ejecutarYCrearInvitaciones(partidoDTO);
            
            // Si aún necesita jugadores, probar otras estrategias
            const partidoActualizado = await PartidoService.obtenerPartidoPorId(partido.id);
            if (partidoActualizado && partidoActualizado.estado === 'NECESITAMOS_JUGADORES') {
              await this.probarEstrategiasAlternativas(partidoActualizado);
            }
            
            console.log(`🔥 [EmparejamientoScheduler] Emparejamiento intensivo para partido ${partido.id}`);
            emparejamientosEjecutados++;
          }        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`❌ [EmparejamientoScheduler] Error intensivo en partido ${partido.id}:`, errorMessage);
        }
      }
      
      console.log(`🎯 [EmparejamientoScheduler] ${emparejamientosEjecutados} emparejamientos intensivos ejecutados`);
    } catch (error) {
      console.error('❌ [EmparejamientoScheduler] Error en emparejamiento intensivo:', error);
    }
  }

  /**
   * Probar estrategias alternativas de emparejamiento para partidos que aún necesitan jugadores
   */
  private async probarEstrategiasAlternativas(partido: any): Promise<void> {
    const estrategiasAlternativas = ['ZONA', 'NIVEL', 'HISTORIAL'].filter(
      estrategia => estrategia !== partido.tipoEmparejamiento
    );

    for (const estrategia of estrategiasAlternativas) {
      try {
        const partidoConEstrategia = { ...partido, tipoEmparejamiento: estrategia };
        await EmparejamientoService.ejecutarYCrearInvitaciones(partidoConEstrategia);
        console.log(`🔄 [EmparejamientoScheduler] Estrategia alternativa ${estrategia} aplicada a partido ${partido.id}`);      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ [EmparejamientoScheduler] Error con estrategia ${estrategia}:`, errorMessage);
      }
    }
  }

  /**
   * Limpiar invitaciones expiradas o de partidos cancelados
   */
  private async limpiarInvitacionesExpiradas(): Promise<void> {
    try {
      console.log('🧹 [EmparejamientoScheduler] Limpiando invitaciones expiradas...');
      
      const db = await dbPromise;
      const Invitacion = db.Invitacion as any;
      const Partido = db.Partido as any;

      // Obtener invitaciones de partidos cancelados o finalizados
      const invitacionesExpiradas = await Invitacion.findAll({
        include: [{
          model: Partido,
          where: {
            estado: {
              [Op.in]: ['CANCELADO', 'FINALIZADO']
            }
          }
        }],
        where: {
          estado: 'pendiente'
        }
      });

      let invitacionesLimpiadas = 0;
      
      for (const invitacion of invitacionesExpiradas) {
        await invitacion.update({
          estado: 'cancelada',
          motivo: 'Partido cancelado o finalizado'
        });
        invitacionesLimpiadas++;
      }

      console.log(`🧹 [EmparejamientoScheduler] ${invitacionesLimpiadas} invitaciones expiradas limpiadas`);
    } catch (error) {
      console.error('❌ [EmparejamientoScheduler] Error limpiando invitaciones:', error);
    }
  }

  /**
   * Obtener partidos que necesitan jugadores en un rango de fechas
   */
  private async obtenerPartidosQueNecesitanJugadores(desde: Date, hasta: Date): Promise<any[]> {
    const db = await dbPromise;
    const Partido = db.Partido as any;

    return await Partido.findAll({
      where: {
        estado: 'NECESITAMOS_JUGADORES',
        fecha: {
          [Op.gte]: desde.toISOString().split('T')[0],
          [Op.lte]: hasta.toISOString().split('T')[0]
        },
        tipoEmparejamiento: {
          [Op.in]: ['ZONA', 'NIVEL', 'HISTORIAL']
        }
      },
      order: [['fecha', 'ASC'], ['hora', 'ASC']]
    });
  }

  /**
   * Obtener estadísticas del emparejamiento automático
   */
  public async obtenerEstadisticas(): Promise<any> {
    try {
      const db = await dbPromise;
      const Partido = db.Partido as any;
      const Invitacion = db.Invitacion as any;

      const ahora = new Date();
      const en24Horas = new Date();
      en24Horas.setHours(en24Horas.getHours() + 24);

      const [
        partidosQueNecesitanJugadores,
        partidosProximos,
        invitacionesPendientes,
        invitacionesHoy
      ] = await Promise.all([
        Partido.count({
          where: { estado: 'NECESITAMOS_JUGADORES' }
        }),
        Partido.count({
          where: {
            estado: 'NECESITAMOS_JUGADORES',
            fecha: {
              [Op.gte]: ahora.toISOString().split('T')[0],
              [Op.lte]: en24Horas.toISOString().split('T')[0]
            }
          }
        }),
        Invitacion.count({
          where: { estado: 'pendiente' }
        }),
        Invitacion.count({
          where: {
            estado: 'pendiente',
            fechaEnvio: {
              [Op.gte]: ahora.toISOString().split('T')[0]
            }
          }
        })
      ]);

      return {
        isRunning: this.isRunning,
        partidosQueNecesitanJugadores,
        partidosProximos,
        invitacionesPendientes,
        invitacionesEnviadasHoy: invitacionesHoy,
        jobsConfigurados: Array.from(this.jobs.keys())
      };
    } catch (error) {
      console.error('❌ [EmparejamientoScheduler] Error obteniendo estadísticas:', error);
      return null;
    }
  }
}
