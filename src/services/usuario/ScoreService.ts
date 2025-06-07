import dbPromise from '../../models/index.js';

/**
 * Servicio para manejar el sistema de puntuación de usuarios
 * Sigue el principio de responsabilidad única (SRP) - solo maneja scores de forma interna
 */
export class ScoreService {
  
  /**
   * Actualizar scores de los jugadores cuando un partido es finalizado
   * @param partidoId ID del partido finalizado
   * @param equipoGanador Equipo ganador ('A' | 'B' | null para empate)
   * @returns Información sobre los jugadores afectados
   */
  static async actualizarScoresPartidoFinalizado(
    partidoId: string, 
    equipoGanador: 'A' | 'B' | null
  ): Promise<{ jugadoresGanadores: number; jugadoresPerdedores: number }> {
    
    // Si hay empate, no se modifican los scores
    if (!equipoGanador) {
      return { jugadoresGanadores: 0, jugadoresPerdedores: 0 };
    }

    const db = await dbPromise;
    const UsuarioPartido = db.UsuarioPartido as any;
    const Usuario = db.Usuario as any;

    // Obtener todos los participantes del partido
    const participantes = await UsuarioPartido.findAll({
      where: { partidoId },
      include: [{
        model: Usuario,
        attributes: ['id', 'score']
      }]
    });

    if (!participantes || participantes.length === 0) {
      return { jugadoresGanadores: 0, jugadoresPerdedores: 0 };
    }

    // Separar ganadores y perdedores
    const jugadoresGanadores = participantes.filter((p: any) => p.equipo === equipoGanador);
    const jugadoresPerdedores = participantes.filter((p: any) => p.equipo !== equipoGanador);

    // Actualizar scores de los ganadores (+1 punto)
    for (const jugador of jugadoresGanadores) {
      await Usuario.increment('score', {
        by: 1,
        where: { id: jugador.usuarioId }
      });
    }

    // Actualizar scores de los perdedores (-1 punto)
    for (const jugador of jugadoresPerdedores) {
      await Usuario.decrement('score', {
        by: 1,
        where: { id: jugador.usuarioId }
      });
    }

    return {
      jugadoresGanadores: jugadoresGanadores.length,
      jugadoresPerdedores: jugadoresPerdedores.length
    };
  }
}