import type { PartidoDTO } from '../DTOs/PartidoDTO.js';

/**
 * Interfaz Observer para el patrón Observer aplicado a partidos
 * Define el contrato que deben cumplir todos los observadores de partido
 */
export interface PartidoObserver {
  /**
   * Método que se ejecuta cuando el partido notifica un cambio de estado
   * @param partido - Datos del partido que cambió de estado
   * @param estadoAnterior - Estado anterior del partido
   * @param estadoNuevo - Nuevo estado del partido
   */
  actualizar(partido: PartidoDTO, estadoAnterior: string, estadoNuevo: string): Promise<void>;
}