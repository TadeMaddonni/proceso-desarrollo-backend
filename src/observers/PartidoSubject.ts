import { PartidoObserver } from './PartidoObserver.js';
import type { PartidoDTO } from '../DTOs/PartidoDTO.js';

/**
 * Clase Subject del patrón Observer
 * Maneja una lista de observadores y los notifica cuando ocurren cambios
 */
export class PartidoSubject {
  private observadores: PartidoObserver[] = [];

  /**
   * Agregar un observador a la lista
   */
  agregarObservador(observador: PartidoObserver): void {
    this.observadores.push(observador);
  }


  /**
   * Notificar a todos los observadores sobre un cambio de estado
   */
  async notificarObservadores(partido: PartidoDTO, estadoAnterior: string, estadoNuevo: string): Promise<void> {
    
    // Ejecutar notificaciones en paralelo para mejor rendimiento
    const promesas = this.observadores.map(observador => 
      observador.actualizar(partido, estadoAnterior, estadoNuevo)
        .catch(error => {
          console.error(`[PartidoSubject] Error en observador:`, error);
          // No interrumpir otros observadores si uno falla
        })
    );

    await Promise.allSettled(promesas);
  }

  /**
   * Obtener el número de observadores registrados
   */
  getNumeroObservadores(): number {
    return this.observadores.length;
  }
}
