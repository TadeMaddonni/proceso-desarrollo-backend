import type { Notificador } from './NotificadorInterface.js';
import type { PartidoDTO } from '../../DTOs/PartidoDTO.js';
import UsuarioService from '../usuario/UsuarioService.js';
// import * as admin from 'firebase-admin'; // Descomenta cuando configures Firebase

export class FireBaseAdapter implements Notificador {
  private firebaseInitialized: boolean = false;

  constructor() {
    // Por ahora, simulamos Firebase sin inicializar
    // TODO: Configurar Firebase Admin SDK
    this.firebaseInitialized = false;
    
    if (!this.firebaseInitialized) {
      console.log('[Firebase] 📱 Modo simulación - Firebase no configurado');
    }
  }

  async notificarNuevoPartido(partido: PartidoDTO): Promise<void> {
    if (!this.firebaseInitialized) {
      console.log(`[Firebase] 📱 Push simulado - Nuevo partido creado: ${partido.id}`);
      this.simularNotificacion(partido, 'Nuevo partido disponible', `¡Se creó un nuevo partido de ${partido.deporte?.nombre || 'deporte'} en tu zona!`);
      return;
    }

    // Obtener tokens de usuarios interesados (organizador y posibles participantes)
    const tokens = await this.obtenerTokensInteresados(partido);
    
    if (tokens.length === 0) {
      console.log(`[Firebase] ℹ️  No hay tokens disponibles para notificar nuevo partido ${partido.id}`);
      return;
    }

    await this.enviarNotificacionMasiva({
      title: 'Nuevo partido disponible',
      body: `¡Se creó un nuevo partido de ${partido.deporte?.nombre || 'deporte'} en tu zona!`,
      data: {
        partidoId: partido.id,
        tipo: 'nuevo_partido',
        fecha: partido.fecha.toString(),
        direccion: partido.direccion
      }
    }, tokens);
  }

  async notificarCambioEstado(partido: PartidoDTO): Promise<void> {
    if (!this.firebaseInitialized) {
      console.log(`[Firebase] 📱 Push simulado - Cambio de estado del partido ${partido.id} a ${partido.estado}`);
      this.simularNotificacion(partido, 'Cambio de estado', `El partido ahora está ${partido.estado}`);
      return;
    }

    // Obtener tokens de participantes y organizador
    const tokens = await this.obtenerTokensParticipantes(partido);
    
    if (tokens.length === 0) {
      console.log(`[Firebase] ℹ️  No hay tokens disponibles para notificar cambio de estado del partido ${partido.id}`);
      return;
    }

    const estadoTexto = this.obtenerTextoEstado(partido.estado);
    
    await this.enviarNotificacionMasiva({
      title: 'Cambio de estado del partido',
      body: `Tu partido ${estadoTexto}`,
      data: {
        partidoId: partido.id,
        tipo: 'cambio_estado',
        estadoAnterior: 'anterior', // TODO: Agregar estado anterior
        estadoNuevo: partido.estado,
        fecha: partido.fecha.toString()
      }
    }, tokens);
  }

  private simularNotificacion(partido: PartidoDTO, title: string, body: string): void {
    console.log(`[Firebase] 🔔 ${title}`);
    console.log(`[Firebase] 📝 ${body}`);
    console.log(`[Firebase] 📊 Partido: ${partido.id} | Estado: ${partido.estado}`);
    
    // Simular notificación a usuarios específicos
    if (partido.organizador) {
      console.log(`[Firebase] 👤 Notificar a organizador: ${partido.organizador.email}`);
    }
    
    if (partido.participantes && partido.participantes.length > 0) {
      console.log(`[Firebase] 👥 Notificar a ${partido.participantes.length} participantes`);
    }
  }
  private async obtenerTokensInteresados(partido: PartidoDTO): Promise<string[]> {
    const tokens: string[] = [];
    
    try {
      // Obtener usuarios de la misma zona y deporte que tengan tokens
      if (partido.zonaId && partido.deporteId) {
        const usuariosInteresados = await UsuarioService.obtenerUsuariosInteresados(
          partido.zonaId, 
          partido.deporteId
        );
        
        for (const usuario of usuariosInteresados) {
          if (usuario.firebaseToken) {
            tokens.push(usuario.firebaseToken);
          }
        }
      }
      
      console.log(`[Firebase] 🔍 Encontrados ${tokens.length} usuarios interesados en partido ${partido.id}`);
    } catch (error) {
      console.error('[Firebase] ❌ Error obteniendo tokens de usuarios interesados:', error);
    }
    
    return tokens.filter(token => token && token.length > 0);
  }

  private async obtenerTokensParticipantes(partido: PartidoDTO): Promise<string[]> {
    const tokens: string[] = [];
    
    // Token del organizador
    if (partido.organizador && (partido.organizador as any).firebaseToken) {
      tokens.push((partido.organizador as any).firebaseToken);
    }
    
    // Tokens de participantes
    if (partido.participantes) {
      for (const participante of partido.participantes) {
        if (participante.usuario && (participante.usuario as any).firebaseToken) {
          tokens.push((participante.usuario as any).firebaseToken);
        }
      }
    }
    
    console.log(`[Firebase] 📱 Encontrados ${tokens.length} tokens para notificar`);
    return tokens.filter(token => token && token.length > 0);
  }

  private async enviarNotificacionMasiva(mensaje: {
    title: string;
    body: string;
    data?: { [key: string]: string };
  }, tokens: string[]): Promise<void> {
    try {
      console.log(`[Firebase] 📤 Enviando notificación a ${tokens.length} dispositivos`);
      
      // TODO: Implementar envío real con Firebase Admin SDK
      /*
      const message = {
        notification: {
          title: mensaje.title,
          body: mensaje.body
        },
        data: mensaje.data || {},
        tokens: tokens
      };
      
      const response = await admin.messaging().sendMulticast(message);
      console.log(`[Firebase] ✅ Notificaciones enviadas: ${response.successCount}/${tokens.length}`);
      
      if (response.failureCount > 0) {
        console.log(`[Firebase] ❌ Fallos en notificaciones: ${response.failureCount}`);
      }
      */
      
      // Simulación por ahora
      console.log(`[Firebase] 📋 Título: ${mensaje.title}`);
      console.log(`[Firebase] 📄 Mensaje: ${mensaje.body}`);
      console.log(`[Firebase] 📊 Datos: ${JSON.stringify(mensaje.data || {})}`);
      
    } catch (error) {
      console.error('[Firebase] ❌ Error enviando notificaciones push:', error);
    }
  }

  private obtenerTextoEstado(estado: string): string {
    const estados: { [key: string]: string } = {
      'NECESITAMOS_JUGADORES': 'necesita más jugadores',
      'ARMADO': 'está armado y listo',
      'CONFIRMADO': 'está confirmado',
      'EN_JUEGO': 'está en juego',
      'FINALIZADO': 'ha finalizado',
      'CANCELADO': 'fue cancelado'
    };
    
    return estados[estado] || `está en estado ${estado}`;
  }
}
