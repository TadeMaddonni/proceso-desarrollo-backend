import { Request, Response } from 'express';
import UsuarioService from '../../services/usuario/UsuarioService.js';

export class UsuarioController {
  
  /**
   * Actualizar el token de Firebase de un usuario
   */
  async actualizarFirebaseToken(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.params;
      const { firebaseToken } = req.body;

      if (!firebaseToken) {
        res.status(400).json({
          success: false,
          message: 'El token de Firebase es requerido'
        });
        return;
      }

      const resultado = await UsuarioService.actualizarFirebaseToken(usuarioId, firebaseToken);

      if (resultado) {
        res.status(200).json({
          success: true,
          message: 'Token de Firebase actualizado exitosamente'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
    } catch (error) {
      console.error('Error al actualizar token de Firebase:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar el token de Firebase de un usuario (logout)
   */
  async eliminarFirebaseToken(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.params;

      const resultado = await UsuarioService.actualizarFirebaseToken(usuarioId, null);

      if (resultado) {
        res.status(200).json({
          success: true,
          message: 'Token de Firebase eliminado exitosamente'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
    } catch (error) {
      console.error('Error al eliminar token de Firebase:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener información básica de un usuario
   */
  async obtenerPorId(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.params;

      const usuario = await UsuarioService.obtenerUsuarioPorId(usuarioId);      if (usuario) {
        // No retornar información sensible como contraseña o token
        const { firebaseToken, ...usuarioSeguro } = usuario;
        
        res.status(200).json({
          success: true,
          data: usuarioSeguro
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener todos los usuarios (para admin)
   */
  async obtenerTodos(req: Request, res: Response): Promise<void> {
    try {      const usuarios = await UsuarioService.obtenerTodosLosUsuarios();
      
      // No retornar información sensible
      const usuariosSegures = usuarios.map((usuario: any) => {
        const { firebaseToken, ...usuarioSeguro } = usuario;
        return usuarioSeguro;
      });
      
      res.status(200).json({
        success: true,
        data: usuariosSegures
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
