import dbPromise from '../../../models/index.js';
import type { UsuarioDTO } from '../../../DTOs/UsuarioDTO.js';
import type { PartidoDTO } from '../../../DTOs/PartidoDTO.js';
import { EstrategiaEmparejamiento } from './EmparejamientoStrategy.js';
import { Op } from 'sequelize';

// Emparejamiento por nivel: selecciona usuarios cuyo nivel esté dentro del rango del partido y coincida el deporte favorito
export class EmparejamientoPorNivel extends EstrategiaEmparejamiento {
  async emparejar(partido: PartidoDTO): Promise<UsuarioDTO[]> {
    const db = await dbPromise;
    const Usuario = (db.Usuario && typeof db.Usuario === 'function' && 'findAll' in db.Usuario)
      ? db.Usuario
      : null;
    if (!Usuario) return [];

    // Si no se especifica rango, no emparejar
    if (partido.nivelMinimo == null || partido.nivelMaximo == null) return [];

    // Buscar usuarios con nivel dentro del rango y mismo deporte favorito
    const usuarios = await Usuario.findAll({
      where: {
        nivel: {
          [Op.gte]: partido.nivelMinimo,
          [Op.lte]: partido.nivelMaximo
        },
        deporteId: partido.deporteId
      }
    });

    // Mapear a DTOs
    return usuarios.map((u: any) => {
      const { contraseña, ...dto } = u.get();
      return dto as UsuarioDTO;
    });
  }
}