import { Request, Response } from 'express';
import dbPromise from '../../models/index.js';
import { EmparejamientoPorZona } from '../../services/partido/emparejamiento/EmparejamientoPorZona.js';
import { EmparejamientoPorNivel } from '../../services/partido/emparejamiento/EmparejamientoPorNivel.js';
import { EmparejamientoPorHistorial } from '../../services/partido/emparejamiento/EmparejamientoPorHistorial.js';
import type { EstrategiaEmparejamiento } from '../../services/partido/emparejamiento/EmparejamientoStrategy.js';
import type { PartidoDTO } from '../../DTOs/PartidoDTO.js';

export class EmparejamientoController {
  private estrategias: Map<string, EstrategiaEmparejamiento>;

  constructor() {
    this.estrategias = new Map([
      ['ZONA', new EmparejamientoPorZona()],
      ['NIVEL', new EmparejamientoPorNivel()],
      ['HISTORIAL', new EmparejamientoPorHistorial()]
    ]);
  }

  /**
   * Obtiene candidatos para un partido usando su estrategia configurada
   * GET /api/emparejamiento/candidatos/:partidoId
   */
  obtenerCandidatos = async (req: Request, res: Response): Promise<void> => {
    try {
      const { partidoId } = req.params;

      if (!partidoId) {
        res.status(400).json({ 
          error: 'ID del partido es requerido' 
        });
        return;
      }      // Obtener el partido de la base de datos
      const db = await dbPromise;
      const Partido = (db.Partido && typeof db.Partido === 'function' && 'findByPk' in db.Partido)
        ? db.Partido as any
        : null;
      
      if (!Partido) {
        res.status(500).json({ 
          error: 'Modelo Partido no disponible' 
        });
        return;
      }

      const partido = await Partido.findByPk(partidoId);
      
      if (!partido) {
        res.status(404).json({ 
          error: 'Partido no encontrado' 
        });
        return;
      }      // Convertir a DTO
      const partidoData = partido.get();
      const partidoDTO: PartidoDTO = {
        id: partidoData.id,
        deporteId: partidoData.deporteId,
        zonaId: partidoData.zonaId,        organizadorId: partidoData.organizadorId,
        fecha: partidoData.fecha,
        hora: partidoData.hora,
        duracion: partidoData.duracion,
        direccion: partidoData.direccion,
        estado: partidoData.estado,
        equipoGanador: partidoData.equipoGanador,
        tipoEmparejamiento: partidoData.tipoEmparejamiento,
        cantidadJugadores: partidoData.cantidadJugadores,
        nivelMinimo: partidoData.nivelMinimo,
        nivelMaximo: partidoData.nivelMaximo
      };

      // Obtener la estrategia configurada
      const estrategia = this.estrategias.get(partidoDTO.tipoEmparejamiento);
      
      if (!estrategia) {
        res.status(400).json({ 
          error: `Estrategia de emparejamiento '${partidoDTO.tipoEmparejamiento}' no válida` 
        });
        return;
      }

      // Ejecutar emparejamiento
      const candidatos = await estrategia.emparejar(partidoDTO);

      res.status(200).json({
        message: 'Candidatos encontrados exitosamente',
        partido: {
          id: partidoDTO.id,
          tipoEmparejamiento: partidoDTO.tipoEmparejamiento
        },
        candidatos,
        total: candidatos.length
      });

    } catch (error) {
      console.error('Error al obtener candidatos:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor al obtener candidatos' 
      });
    }
  };

  /**
   * Ejecuta emparejamiento con una estrategia específica para un partido
   * POST /api/emparejamiento/ejecutar
   */
  ejecutarEmparejamiento = async (req: Request, res: Response): Promise<void> => {
    try {
      const { partidoId, tipoEstrategia } = req.body;

      if (!partidoId || !tipoEstrategia) {
        res.status(400).json({ 
          error: 'ID del partido y tipo de estrategia son requeridos' 
        });
        return;
      }

      // Validar que la estrategia existe
      const estrategia = this.estrategias.get(tipoEstrategia);
      
      if (!estrategia) {
        res.status(400).json({ 
          error: `Estrategia '${tipoEstrategia}' no válida. Estrategias disponibles: ${Array.from(this.estrategias.keys()).join(', ')}` 
        });
        return;
      }      // Obtener el partido
      const db = await dbPromise;
      const Partido = (db.Partido && typeof db.Partido === 'function' && 'findByPk' in db.Partido)
        ? db.Partido as any
        : null;
      
      if (!Partido) {
        res.status(500).json({ 
          error: 'Modelo Partido no disponible' 
        });
        return;
      }

      const partido = await Partido.findByPk(partidoId);
      
      if (!partido) {
        res.status(404).json({ 
          error: 'Partido no encontrado' 
        });
        return;
      }      // Convertir a DTO
      const partidoData = partido.get();
      const partidoDTO: PartidoDTO = {
        id: partidoData.id,
        deporteId: partidoData.deporteId,
        zonaId: partidoData.zonaId,
        organizadorId: partidoData.organizadorId,
        fecha: partidoData.fecha,        hora: partidoData.hora,
        duracion: partidoData.duracion,
        direccion: partidoData.direccion,
        estado: partidoData.estado,
        equipoGanador: partidoData.equipoGanador,
        tipoEmparejamiento: tipoEstrategia, // Usar la estrategia solicitada
        cantidadJugadores: partidoData.cantidadJugadores,
        nivelMinimo: partidoData.nivelMinimo,
        nivelMaximo: partidoData.nivelMaximo
      };

      // Ejecutar emparejamiento
      const candidatos = await estrategia.emparejar(partidoDTO);

      res.status(200).json({
        message: `Emparejamiento ejecutado exitosamente con estrategia '${tipoEstrategia}'`,
        partido: {
          id: partidoDTO.id,
          tipoEstrategia
        },
        candidatos,
        total: candidatos.length
      });

    } catch (error) {
      console.error('Error al ejecutar emparejamiento:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor al ejecutar emparejamiento' 
      });
    }
  };

  /**
   * Actualiza la estrategia de emparejamiento de un partido
   * PUT /api/emparejamiento/estrategia/:partidoId
   */
  actualizarEstrategia = async (req: Request, res: Response): Promise<void> => {
    try {
      const { partidoId } = req.params;
      const { tipoEmparejamiento } = req.body;

      if (!partidoId || !tipoEmparejamiento) {
        res.status(400).json({ 
          error: 'ID del partido y tipo de emparejamiento son requeridos' 
        });
        return;
      }

      // Validar que la estrategia existe
      if (!this.estrategias.has(tipoEmparejamiento)) {
        res.status(400).json({ 
          error: `Estrategia '${tipoEmparejamiento}' no válida. Estrategias disponibles: ${Array.from(this.estrategias.keys()).join(', ')}` 
        });
        return;
      }      // Actualizar el partido
      const db = await dbPromise;
      const Partido = (db.Partido && typeof db.Partido === 'function' && 'update' in db.Partido)
        ? db.Partido as any
        : null;
      
      if (!Partido) {
        res.status(500).json({ 
          error: 'Modelo Partido no disponible' 
        });
        return;
      }

      const [rowsUpdated] = await Partido.update(
        { tipoEmparejamiento },
        { where: { id: partidoId } }
      );

      if (rowsUpdated === 0) {
        res.status(404).json({ 
          error: 'Partido no encontrado' 
        });
        return;
      }

      res.status(200).json({
        message: 'Estrategia de emparejamiento actualizada exitosamente',
        partidoId,
        tipoEmparejamiento
      });

    } catch (error) {
      console.error('Error al actualizar estrategia:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor al actualizar estrategia' 
      });
    }
  };

  /**
   * Obtiene las estrategias de emparejamiento disponibles
   * GET /api/emparejamiento/estrategias
   */
  obtenerEstrategias = async (req: Request, res: Response): Promise<void> => {
    try {
      const estrategias = Array.from(this.estrategias.keys()).map(key => ({
        tipo: key,
        descripcion: this.getDescripcionEstrategia(key)
      }));

      res.status(200).json({
        message: 'Estrategias de emparejamiento disponibles',
        estrategias
      });

    } catch (error) {
      console.error('Error al obtener estrategias:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor al obtener estrategias' 
      });
    }
  };

  /**
   * Obtiene información detallada de una estrategia específica
   * GET /api/emparejamiento/estrategias/:tipo
   */
  obtenerDetalleEstrategia = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tipo } = req.params;

      if (!this.estrategias.has(tipo)) {
        res.status(404).json({ 
          error: `Estrategia '${tipo}' no encontrada` 
        });
        return;
      }

      res.status(200).json({
        tipo,
        descripcion: this.getDescripcionEstrategia(tipo),
        disponible: true
      });

    } catch (error) {
      console.error('Error al obtener detalle de estrategia:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor al obtener detalle de estrategia' 
      });
    }
  };

  /**
   * Método privado para obtener descripción de estrategias
   */
  private getDescripcionEstrategia(tipo: string): string {
    const descripciones: { [key: string]: string } = {
      'ZONA': 'Empareja usuarios de la misma zona geográfica y deporte favorito',
      'NIVEL': 'Empareja usuarios dentro del rango de nivel especificado y deporte favorito',
      'HISTORIAL': 'Empareja usuarios con score similar (±5 puntos) basado en historial de partidos'
    };
    
    return descripciones[tipo] || 'Descripción no disponible';
  }
}