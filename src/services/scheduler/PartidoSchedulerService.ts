import cron from 'node-cron';
import { PartidoService } from '../partido/PartidoService.js';
import { EmparejamientoService } from '../partido/emparejamiento/EmparejamientoService.js';
import dbPromise from '../../models/index.js';
import { Op } from 'sequelize';

export class PartidoSchedulerService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.inicializarCronJobs();
  }  private inicializarCronJobs(): void {
    // Ejecutar cada 5 minutos para verificar estados de partidos
    const actualizarEstadosJob = cron.schedule('*/5 * * * *', async () => {
      await this.actualizarEstadosPartidos();
    });

    // Ejecutar cada 30 minutos para emparejamiento automático recurrente
    const emparejamientoJob = cron.schedule('*/30 * * * *', async () => {
      await this.ejecutarEmparejamientoRecurrente();
    });

    // Detener los jobs inicialmente
    actualizarEstadosJob.stop();
    emparejamientoJob.stop();

    this.jobs.set('actualizar-estados', actualizarEstadosJob);
    this.jobs.set('emparejamiento-recurrente', emparejamientoJob);
    
    console.log('🕐 [Scheduler] Cron jobs inicializados:');
    console.log('   - Actualizar estados: cada 5 minutos');
    console.log('   - Emparejamiento recurrente: cada 30 minutos');
  }

  public iniciar(): void {
    this.jobs.forEach((job, name) => {
      job.start();
      console.log(`🚀 [Scheduler] Job "${name}" iniciado`);
    });
  }

  public detener(): void {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`⏹️ [Scheduler] Job "${name}" detenido`);
    });
  }

  private async actualizarEstadosPartidos(): Promise<void> {
    try {
      console.log('🔄 [Scheduler] Verificando estados de partidos...');
      
      const ahora = new Date();
      let totalActualizados = 0;

      // 1. Cancelar partidos que necesitan jugadores y ya pasó su fecha
      totalActualizados += await this.cancelarPartidosSinJugadores(ahora);

      // 2. Iniciar partidos confirmados cuya hora ya llegó
      totalActualizados += await this.iniciarPartidosConfirmados(ahora);      // 3. Finalizar partidos que llevan mucho tiempo en juego
      totalActualizados += await this.finalizarPartidosEnJuego(ahora);
      
      if (totalActualizados > 0) {
        console.log(`✅ [Scheduler] ${totalActualizados} partidos actualizados automáticamente`);
      } else {
        console.log(`ℹ️ [Scheduler] No hay partidos para actualizar en este momento`);
      }
    } catch (error) {
      console.error('❌ [Scheduler] Error actualizando estados:', error);
    }
  }

  /**
   * Ejecuta emparejamiento automático para partidos que necesitan jugadores
   * Se ejecuta cada 30 minutos para encontrar nuevos candidatos
   */
  private async ejecutarEmparejamientoRecurrente(): Promise<void> {
    try {
      console.log('🤝 [Scheduler] Ejecutando emparejamiento automático recurrente...');
      
      const ahora = new Date();
      const mañana = new Date();
      mañana.setDate(mañana.getDate() + 1);

      // Buscar partidos que necesitan jugadores y tienen fecha futura (próximas 24 horas)
      const partidos = await this.obtenerPartidosQueNecesitanJugadores(ahora, mañana);
      
      let emparejamientosEjecutados = 0;
      
      for (const partido of partidos) {
        try {
          // Convertir a DTO para el emparejamiento
          const partidoDTO = await PartidoService.obtenerPartidoPorId(partido.id);
          if (partidoDTO) {
            // Ejecutar emparejamiento y crear invitaciones
            await EmparejamientoService.ejecutarYCrearInvitaciones(partidoDTO);
            console.log(`✅ [Scheduler] Emparejamiento ejecutado para partido ${partido.id} (${partidoDTO.tipoEmparejamiento})`);
            emparejamientosEjecutados++;
          }
        } catch (error) {
          console.error(`❌ [Scheduler] Error en emparejamiento para partido ${partido.id}:`, error);
        }
      }
      
      if (emparejamientosEjecutados > 0) {
        console.log(`🎯 [Scheduler] ${emparejamientosEjecutados} emparejamientos automáticos ejecutados`);
      } else {
        console.log(`ℹ️ [Scheduler] No hay partidos que necesiten emparejamiento automático`);
      }
    } catch (error) {
      console.error('❌ [Scheduler] Error en emparejamiento recurrente:', error);
    }
  }

  /**
   * Obtiene partidos que necesitan jugadores en las próximas horas
   */
  private async obtenerPartidosQueNecesitanJugadores(desde: Date, hasta: Date): Promise<any[]> {
    const db = await dbPromise;
    const Partido = db.Partido as any;

    return await Partido.findAll({
      where: {
        estado: 'NECESITAMOS_JUGADORES',
        fecha: {
          [Op.gte]: desde.toISOString().split('T')[0], // Desde hoy
          [Op.lte]: hasta.toISOString().split('T')[0]  // Hasta mañana
        }
      },
      // Solo procesar partidos que tienen configuración de emparejamiento
      having: {
        tipoEmparejamiento: {
          [Op.in]: ['ZONA', 'NIVEL', 'HISTORIAL']
        }
      }
    });
  }

  private async cancelarPartidosSinJugadores(ahora: Date): Promise<number> {
    try {
      const db = await dbPromise;
      const Partido = db.Partido as any;      // Buscar partidos que necesitan jugadores y cuya fecha ya pasó
      const partidos = await Partido.findAll({
        where: {
          estado: 'NECESITAMOS_JUGADORES',
          fecha: {
            [Op.lt]: ahora.toISOString().split('T')[0] // Solo la fecha, sin hora
          }
        }
      });      let actualizados = 0;
      for (const partido of partidos) {
        try {
          await PartidoService.cambiarEstadoConValidacion(partido.id, 'CANCELADO');
          console.log(`❌ [Scheduler] Partido ${partido.id} cancelado por falta de jugadores`);
          actualizados++;
        } catch (error) {
          console.error(`❌ [Scheduler] Error cancelando partido ${partido.id}:`, error);
        }
      }

      return actualizados;
    } catch (error) {
      console.error('❌ [Scheduler] Error cancelando partidos sin jugadores:', error);
      return 0;
    }
  }

  private async iniciarPartidosConfirmados(ahora: Date): Promise<number> {
    try {
      const db = await dbPromise;
      const Partido = db.Partido as any;

      // Buscar partidos confirmados cuya hora de inicio ya llegó
      const partidos = await Partido.findAll({
        where: {
          estado: 'CONFIRMADO'
        }
      });

      let actualizados = 0;
      for (const partido of partidos) {
        // Construir la fecha y hora completa del partido
        const fechaPartido = new Date(`${partido.fecha} ${partido.hora}`);
          // Si ya pasó la hora de inicio, cambiar a EN_JUEGO
        if (ahora >= fechaPartido) {
          try {
            await PartidoService.cambiarEstadoConValidacion(partido.id, 'EN_JUEGO');
            console.log(`🏃 [Scheduler] Partido ${partido.id} iniciado automáticamente`);
            actualizados++;
          } catch (error) {
            console.error(`❌ [Scheduler] Error iniciando partido ${partido.id}:`, error);
          }
        }
      }

      return actualizados;
    } catch (error) {
      console.error('❌ [Scheduler] Error iniciando partidos confirmados:', error);
      return 0;
    }
  }

  private async finalizarPartidosEnJuego(ahora: Date): Promise<number> {
    try {
      const db = await dbPromise;
      const Partido = db.Partido as any;

      // Buscar partidos en juego
      const partidos = await Partido.findAll({
        where: {
          estado: 'EN_JUEGO'
        }
      });

      let actualizados = 0;
      for (const partido of partidos) {
        // Construir la fecha y hora de inicio del partido
        const fechaInicio = new Date(`${partido.fecha} ${partido.hora}`);
        
        // Calcular tiempo transcurrido desde el inicio
        const tiempoTranscurrido = ahora.getTime() - fechaInicio.getTime();
        const horasTranscurridas = tiempoTranscurrido / (1000 * 60 * 60);        // Si pasaron más de 3 horas desde el inicio, finalizar automáticamente
        if (horasTranscurridas >= 3) {
          try {
            // Usar el método de cambio de estado con validación en lugar del método específico
            await PartidoService.cambiarEstadoConValidacion(partido.id, 'FINALIZADO');
            console.log(`🏁 [Scheduler] Partido ${partido.id} finalizado automáticamente (${Math.round(horasTranscurridas)} horas)`);
            actualizados++;
          } catch (error) {
            console.error(`❌ [Scheduler] Error finalizando partido ${partido.id}:`, error);
          }
        }
      }

      return actualizados;
    } catch (error) {
      console.error('❌ [Scheduler] Error finalizando partidos en juego:', error);
      return 0;
    }
  }
}
