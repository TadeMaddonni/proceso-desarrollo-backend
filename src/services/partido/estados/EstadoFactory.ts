// EstadoFactory.ts - Factory para crear instancias de estados de partido
import { EstadoPartido } from './EstadoPartido.js';
import { NecesitamosJugadores } from './NecesitamosJugadores.js';
import { Armado } from './Armado.js';
import { Confirmado } from './Confirmado.js';
import { EnJuego } from './EnJuego.js';
import { Finalizado } from './Finalizado.js';
import { Cancelado } from './Cancelado.js';

export type EstadoPartidoType = 
  | 'NECESITAMOS_JUGADORES' 
  | 'ARMADO' 
  | 'CONFIRMADO' 
  | 'EN_JUEGO' 
  | 'FINALIZADO' 
  | 'CANCELADO';

export class EstadoFactory {
  private static instancias: Map<EstadoPartidoType, EstadoPartido> = new Map();

  /**
   * Crear una instancia del estado correspondiente (patrón Singleton por tipo)
   */
  static crearEstado(tipoEstado: EstadoPartidoType): EstadoPartido {
    // Usar singleton para cada tipo de estado para optimizar memoria
    if (!this.instancias.has(tipoEstado)) {
      switch (tipoEstado) {
        case 'NECESITAMOS_JUGADORES':
          this.instancias.set(tipoEstado, new NecesitamosJugadores());
          break;
        case 'ARMADO':
          this.instancias.set(tipoEstado, new Armado());
          break;
        case 'CONFIRMADO':
          this.instancias.set(tipoEstado, new Confirmado());
          break;
        case 'EN_JUEGO':
          this.instancias.set(tipoEstado, new EnJuego());
          break;
        case 'FINALIZADO':
          this.instancias.set(tipoEstado, new Finalizado());
          break;
        case 'CANCELADO':
          this.instancias.set(tipoEstado, new Cancelado());
          break;
        default:
          throw new Error(`Estado de partido no válido: ${tipoEstado}`);
      }
    }

    return this.instancias.get(tipoEstado)!;
  }

  /**
   * Obtener todos los estados válidos
   */
  static obtenerEstadosValidos(): EstadoPartidoType[] {
    return [
      'NECESITAMOS_JUGADORES',
      'ARMADO', 
      'CONFIRMADO',
      'EN_JUEGO',
      'FINALIZADO',
      'CANCELADO'
    ];
  }
  /**
   * Validar si una transición de estado es válida
   */
  static esTransicionValida(estadoActual: EstadoPartidoType, nuevoEstado: EstadoPartidoType): boolean {
    const transicionesValidas: Record<EstadoPartidoType, EstadoPartidoType[]> = {
      'NECESITAMOS_JUGADORES': ['ARMADO', 'CANCELADO'],
      'ARMADO': ['CONFIRMADO', 'CANCELADO', 'NECESITAMOS_JUGADORES'],
      'CONFIRMADO': ['EN_JUEGO'],
      'EN_JUEGO': ['FINALIZADO'],
      'FINALIZADO': [], // Estado final, no permite transiciones
      'CANCELADO': []   // Estado final, no permite transiciones
    };

    return transicionesValidas[estadoActual].includes(nuevoEstado);
  }

  /**
   * Limpiar instancias (útil para testing)
   */
  static limpiarInstancias(): void {
    this.instancias.clear();
  }
}
