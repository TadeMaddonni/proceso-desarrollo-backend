import dbPromise from '../../models/index.js';
import type { UsuarioDTO } from '../../DTOs/UsuarioDTO.js';
import { Op } from 'sequelize';

/**
 * Actualizar el token de Firebase de un usuario
 */
async function actualizarFirebaseToken(usuarioId: string, firebaseToken: string | null): Promise<boolean> {
  const db = await dbPromise;
  const Usuario = db.Usuario as any;

  const [rowsUpdated] = await Usuario.update(
    { 
      firebaseToken: firebaseToken,
      updatedAt: new Date()
    },
    { where: { id: usuarioId } }
  );

  return rowsUpdated > 0;
}

/**
 * Obtener un usuario por su ID
 */
async function obtenerUsuarioPorId(usuarioId: string): Promise<UsuarioDTO | null> {
  const db = await dbPromise;
  const Usuario = db.Usuario as any;

  const usuario = await Usuario.findByPk(usuarioId);
  
  if (!usuario) {
    return null;
  }

  return convertirUsuarioADTO(usuario);
}

/**
 * Obtener todos los usuarios
 */
async function obtenerTodosLosUsuarios(): Promise<UsuarioDTO[]> {
  const db = await dbPromise;
  const Usuario = db.Usuario as any;

  const usuarios = await Usuario.findAll({
    order: [['createdAt', 'DESC']]
  });

  return usuarios.map((usuario: any) => convertirUsuarioADTO(usuario));
}

/**
 * Obtener usuarios con token de Firebase
 */
async function obtenerUsuariosConFirebaseToken(): Promise<UsuarioDTO[]> {
  const db = await dbPromise;
  const Usuario = db.Usuario as any;

  const usuarios = await Usuario.findAll({
    where: {
      firebaseToken: {
        [Op.and]: [
          { [Op.ne]: null },
          { [Op.ne]: '' }
        ]
      }
    }
  });

  return usuarios.map((usuario: any) => convertirUsuarioADTO(usuario));
}

/**
 * Obtener usuario por email
 */
async function obtenerUsuarioPorEmail(email: string): Promise<UsuarioDTO | null> {
  const db = await dbPromise;
  const Usuario = db.Usuario as any;

  const usuario = await Usuario.findOne({
    where: { email: email }
  });
  
  if (!usuario) {
    return null;
  }

  return convertirUsuarioADTO(usuario);
}

/**
 * Buscar usuarios por nombre
 */
async function buscarUsuariosPorNombre(nombre: string): Promise<UsuarioDTO[]> {
  const db = await dbPromise;
  const Usuario = db.Usuario as any;

  const usuarios = await Usuario.findAll({
    where: {
      nombre: {
        [Op.iLike]: `%${nombre}%`
      }
    },
    order: [['nombre', 'ASC']]
  });

  return usuarios.map((usuario: any) => convertirUsuarioADTO(usuario));
}

/**
 * Obtener usuarios por zona y deporte (para notificaciones de nuevos partidos)
 */
async function obtenerUsuariosInteresados(zonaId: string, deporteId: string): Promise<UsuarioDTO[]> {
  const db = await dbPromise;
  const Usuario = db.Usuario as any;

  const usuarios = await Usuario.findAll({
    where: {
      firebaseToken: {
        [Op.and]: [
          { [Op.ne]: null },
          { [Op.ne]: '' }
        ]
      }
    }
  });

  return usuarios.map((usuario: any) => convertirUsuarioADTO(usuario));
}

/**
 * Convertir modelo de usuario a DTO
 */
function convertirUsuarioADTO(usuarioData: any): UsuarioDTO {
  return {
    id: usuarioData.id,
    nombre: usuarioData.nombre,
    email: usuarioData.email,
    nivel: usuarioData.nivel,
    zonaId: usuarioData.zonaId,
    deporteId: usuarioData.deporteId,
    firebaseToken: usuarioData.firebaseToken,
    score: usuarioData.score,
    createdAt: usuarioData.createdAt,
    updatedAt: usuarioData.updatedAt
  };
}

// Exportar como objeto por defecto
export default {
  actualizarFirebaseToken,
  obtenerUsuarioPorId,
  obtenerTodosLosUsuarios,
  obtenerUsuariosConFirebaseToken,
  obtenerUsuarioPorEmail,
  buscarUsuariosPorNombre,
  obtenerUsuariosInteresados
};
