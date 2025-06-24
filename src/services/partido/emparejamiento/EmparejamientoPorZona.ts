import dbPromise from '../../../models/index.js';
import type { UsuarioDTO } from '../../../DTOs/UsuarioDTO.js';
import type { PartidoDTO } from '../../../DTOs/PartidoDTO.js';
import { EstrategiaEmparejamiento } from './EmparejamientoStrategy.js';

// Emparejamiento por zona: selecciona usuarios de la misma zona del partido
export class EmparejamientoPorZona extends EstrategiaEmparejamiento {
  async emparejar(partido: PartidoDTO): Promise<UsuarioDTO[]> {
    const db = await dbPromise;
    // Asegurarse de obtener el modelo Usuario correctamente
    const Usuario = (db.Usuario && typeof db.Usuario === 'function' && 'findAll' in db.Usuario)
      ? db.Usuario
      : null;
    if (!Usuario) return [];
    // Buscar usuarios con la misma zona que el partido y mismo deporte favorito
    const usuarios = await Usuario.findAll({ 
      where: { 
        zonaId: partido.zonaId,
        deporteId: partido.deporteId // deporte favorito del usuario debe coincidir
      } 
    });
    // Mapear a DTOs
    return usuarios.map((u: any) => {
      const { contraseña, ...dto } = u.get();
      return dto as UsuarioDTO;
    });
  }
}