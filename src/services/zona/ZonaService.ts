import dbPromise from '../../models/index.js';
import type { ZonaDTO } from '../../DTOs/ZonaDTO.js';

export class ZonaService {
  /**
   * Obtener todas las zonas
   */
  static async obtenerTodasLasZonas(): Promise<ZonaDTO[]> {
    const db = await dbPromise;
    const Zona = db.Zona as any;

    const zonas = await Zona.findAll({
      order: [['nombre', 'ASC']]
    });

    return zonas.map((zona: any) => this.mapearZonaADTO(zona));
  }

  /**
   * Obtener una zona por ID
   */
  static async obtenerZonaPorId(id: string): Promise<ZonaDTO | null> {
    const db = await dbPromise;
    const Zona = db.Zona as any;

    const zona = await Zona.findByPk(id);

    if (!zona) {
      return null;
    }

    return this.mapearZonaADTO(zona);
  }

  /**
   * Crear una nueva zona
   */
  static async crearZona(nombre: string): Promise<ZonaDTO> {
    const db = await dbPromise;
    const Zona = db.Zona as any;

    const nuevaZona = await Zona.create({ nombre });
    return this.mapearZonaADTO(nuevaZona);
  }

  /**
   * Actualizar una zona
   */
  static async actualizarZona(id: string, nombre: string): Promise<boolean> {
    const db = await dbPromise;
    const Zona = db.Zona as any;

    const [rowsUpdated] = await Zona.update(
      { nombre },
      { where: { id } }
    );

    return rowsUpdated > 0;
  }

  /**
   * Eliminar una zona
   */
  static async eliminarZona(id: string): Promise<boolean> {
    const db = await dbPromise;
    const Zona = db.Zona as any;

    const rowsDeleted = await Zona.destroy({
      where: { id }
    });

    return rowsDeleted > 0;
  }

  /**
   * Mapear entidad Zona a DTO
   */
  private static mapearZonaADTO(zona: any): ZonaDTO {
    const zonaData = zona.get();
    
    return {
      id: zonaData.id,
      nombre: zonaData.nombre,
      createdAt: zonaData.createdAt,
      updatedAt: zonaData.updatedAt
    };
  }
}
