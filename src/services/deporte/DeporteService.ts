import dbPromise from '../../models/index.js';
import type { DeporteDTO } from '../../DTOs/DeporteDTO.js';

export class DeporteService {
  /**
   * Obtener todos los deportes
   */
  static async obtenerTodosLosDeportes(): Promise<DeporteDTO[]> {
    const db = await dbPromise;
    const Deporte = db.Deporte as any;

    const deportes = await Deporte.findAll({
      order: [['nombre', 'ASC']]
    });

    return deportes.map((deporte: any) => this.mapearDeporteADTO(deporte));
  }

  /**
   * Obtener un deporte por ID
   */
  static async obtenerDeportePorId(id: string): Promise<DeporteDTO | null> {
    const db = await dbPromise;
    const Deporte = db.Deporte as any;

    const deporte = await Deporte.findByPk(id);

    if (!deporte) {
      return null;
    }

    return this.mapearDeporteADTO(deporte);
  }

  /**
   * Crear un nuevo deporte
   */
  static async crearDeporte(nombre: string): Promise<DeporteDTO> {
    const db = await dbPromise;
    const Deporte = db.Deporte as any;

    const nuevoDeporte = await Deporte.create({ nombre });
    return this.mapearDeporteADTO(nuevoDeporte);
  }

  /**
   * Actualizar un deporte
   */
  static async actualizarDeporte(id: string, nombre: string): Promise<boolean> {
    const db = await dbPromise;
    const Deporte = db.Deporte as any;

    const [rowsUpdated] = await Deporte.update(
      { nombre },
      { where: { id } }
    );

    return rowsUpdated > 0;
  }

  /**
   * Eliminar un deporte
   */
  static async eliminarDeporte(id: string): Promise<boolean> {
    const db = await dbPromise;
    const Deporte = db.Deporte as any;

    const rowsDeleted = await Deporte.destroy({
      where: { id }
    });

    return rowsDeleted > 0;
  }

  /**
   * Mapear entidad Deporte a DTO
   */
  private static mapearDeporteADTO(deporte: any): DeporteDTO {
    const deporteData = deporte.get();
    
    return {
      id: deporteData.id,
      nombre: deporteData.nombre,
      createdAt: deporteData.createdAt,
      updatedAt: deporteData.updatedAt
    };
  }
}
