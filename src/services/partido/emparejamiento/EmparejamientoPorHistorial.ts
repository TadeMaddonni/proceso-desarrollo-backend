import dbPromise from '../../../models/index.js';
import type { UsuarioDTO } from '../../../DTOs/UsuarioDTO.js';
import type { PartidoDTO } from '../../../DTOs/PartidoDTO.js';
import { EstrategiaEmparejamiento } from './EmparejamientoStrategy.js';
import { Op } from 'sequelize';

// Emparejamiento por historial (score): usuarios con score similar y mismo deporte favorito
export class EmparejamientoPorHistorial extends EstrategiaEmparejamiento {
  async emparejar(partido: PartidoDTO): Promise<UsuarioDTO[]> {
    const db = await dbPromise;
    const Usuario = (db.Usuario && typeof db.Usuario === 'function' && 'findAll' in db.Usuario)
      ? db.Usuario
      : null;
    if (!Usuario) return [];

    // Obtener el organizador del partido para conocer su score
    const organizador = await Usuario.findByPk(partido.organizadorId);
    if (!organizador) return [];
    const organizadorScore = Number(organizador.get('score')) || 0;

    // Buscar usuarios con score dentro del rango y mismo deporte favorito
    const usuarios = await Usuario.findAll({
      where: {
        deporteId: partido.deporteId,
        score: {
          [Op.gte]: organizadorScore - 5,
          [Op.lte]: organizadorScore + 5
        }
      }
    });

    // Mapear a DTOs
    return usuarios.map((u: any) => {
      const { contraseña, ...dto } = u.get();
      return dto as UsuarioDTO;
    });
  }
}