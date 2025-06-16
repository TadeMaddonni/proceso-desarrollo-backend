import type { Notificador } from './NotificadorInterface.js';
import type { PartidoDTO } from '../../DTOs/PartidoDTO.js';
import UsuarioService from '../usuario/UsuarioService.js';
import admin from 'firebase-admin';

// Cargar variables de entorno desde el proceso principal

export class FireBaseAdapter implements Notificador {
  private firebaseInitialized: boolean = false;
  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase(): void {
    try {
      console.log('[Firebase] 🔍 Verificando variables de entorno...');
      
      // Debug: mostrar qué variables están disponibles
      console.log('[Firebase] 📋 FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ Configurado' : '❌ Faltante');
      console.log('[Firebase] 📋 FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Configurado' : '❌ Faltante');
      console.log('[Firebase] 📋 FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ Configurado' : '❌ Faltante');
      
      // Verificar que las variables de entorno están configuradas
      const requiredEnvVars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY',
        'FIREBASE_CLIENT_EMAIL'
      ];

      const missingVars = requiredEnvVars.filter(envVar => {
        const value = process.env[envVar];
        return !value || (typeof value === 'string' && value.trim().length === 0);
      });
      
      if (missingVars.length > 0) {
        console.log(`[Firebase] ⚠️  Variables de entorno faltantes: ${missingVars.join(', ')}`);
        console.log('[Firebase] 📱 Ejecutando en modo simulación');
        this.firebaseInitialized = false;
        return;
      }

      console.log('[Firebase] 📋 Verificando estado de Firebase Admin SDK...');
      
      // Verificar si Firebase ya está inicializado con protección adicional
      if (!admin || !admin.apps || admin.apps.length === 0) {
        // Preparar las credenciales
        const serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Convertir \\n a saltos de línea reales
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token"
        };

        // Inicializar Firebase Admin SDK
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID
        });

        console.log('[Firebase] ✅ Firebase Admin SDK inicializado correctamente');
        this.firebaseInitialized = true;
      } else {
        console.log('[Firebase] ℹ️  Firebase ya estaba inicializado');
        this.firebaseInitialized = true;
      }
    } catch (error) {
      console.error('[Firebase] ❌ Error inicializando Firebase:', error);
      console.log('[Firebase] 📱 Ejecutando en modo simulación');
      this.firebaseInitialized = false;
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
    
    console.log(`[Firebase] 🔍 Debug - Obteniendo tokens para partido ${partido.id}`);
    console.log(`[Firebase] 🔍 Debug - Organizador:`, partido.organizador ? 'Presente' : 'Ausente');
    console.log(`[Firebase] 🔍 Debug - Participantes:`, partido.participantes ? partido.participantes.length : 'Ausente');
    
    // Token del organizador
    if (partido.organizador && (partido.organizador as any).firebaseToken) {
      console.log(`[Firebase] ✅ Token organizador encontrado: ${(partido.organizador as any).firebaseToken.substring(0, 20)}...`);
      tokens.push((partido.organizador as any).firebaseToken);
    } else if (partido.organizador) {
      console.log(`[Firebase] ❌ Organizador sin token Firebase:`, partido.organizador.email || partido.organizador.id);
    }
    
    // Tokens de participantes
    if (partido.participantes) {
      for (const participante of partido.participantes) {
        console.log(`[Firebase] 🔍 Debug - Participante:`, participante.usuario ? 'Usuario presente' : 'Usuario ausente');
        if (participante.usuario && (participante.usuario as any).firebaseToken) {
          console.log(`[Firebase] ✅ Token participante encontrado: ${(participante.usuario as any).firebaseToken.substring(0, 20)}...`);
          tokens.push((participante.usuario as any).firebaseToken);
        } else if (participante.usuario) {
          console.log(`[Firebase] ❌ Participante sin token Firebase:`, participante.usuario.email || participante.usuario.id);
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
      if (!this.firebaseInitialized) {
        console.log(`[Firebase] � Simulando envío a ${tokens.length} dispositivos`);
        console.log(`[Firebase] 📋 Título: ${mensaje.title}`);
        console.log(`[Firebase] 📄 Mensaje: ${mensaje.body}`);
        console.log(`[Firebase] 📊 Datos: ${JSON.stringify(mensaje.data || {})}`);
        return;
      }

      console.log(`[Firebase] �📤 Enviando notificación push a ${tokens.length} dispositivos`);
      
      // Filtrar tokens válidos (no vacíos, no null, no undefined)
      const tokensValidos = tokens.filter(token => token && token.trim().length > 0);
      
      if (tokensValidos.length === 0) {
        console.log('[Firebase] ⚠️  No hay tokens válidos para enviar');
        return;
      }

      const message = {
        notification: {
          title: mensaje.title,
          body: mensaje.body
        },
        data: mensaje.data || {},
        tokens: tokensValidos
      };

      // Enviar notificación usando Firebase Admin SDK
      const response = await admin.messaging().sendEachForMulticast(message);
      
      console.log(`[Firebase] ✅ Notificaciones enviadas exitosamente: ${response.successCount}/${tokensValidos.length}`);
      
      if (response.failureCount > 0) {
        console.log(`[Firebase] ❌ Fallos en notificaciones: ${response.failureCount}`);
        
        // Loggear detalles de los fallos para debugging
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.log(`[Firebase] � Error en token ${idx}: ${resp.error?.message}`);
            // Aquí podrías implementar lógica para marcar tokens inválidos
            if (resp.error?.code === 'messaging/registration-token-not-registered') {
              console.log(`[Firebase] �️  Token inválido detectado: ${tokensValidos[idx].substring(0, 20)}...`);
              // TODO: Implementar eliminación de tokens inválidos de la base de datos
            }
          }
        });
      }
      
    } catch (error) {
      console.error('[Firebase] ❌ Error enviando notificaciones push:', error);
      
      // Si hay error de Firebase, hacer fallback a simulación
      if (error instanceof Error) {
        console.log('[Firebase] 🔄 Fallback a modo simulación debido a error');
        console.log(`[Firebase] 📋 Título: ${mensaje.title}`);
        console.log(`[Firebase] 📄 Mensaje: ${mensaje.body}`);
        console.log(`[Firebase] 📊 Datos: ${JSON.stringify(mensaje.data || {})}`);
      }
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

  // Método público para reinicializar Firebase (útil para testing)
  public reinitialize(): void {
    this.initializeFirebase();
  }

  // Método público para verificar estado de Firebase
  public isInitialized(): boolean {
    return this.firebaseInitialized;
  }
}
