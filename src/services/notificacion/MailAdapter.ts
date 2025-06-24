import type { Notificador } from './NotificadorInterface.js';
import type { PartidoDTO } from '../../DTOs/PartidoDTO.js';
import nodemailer from 'nodemailer';
import dbPromise from '../../models/index.js';


export class MailAdapter implements Notificador {
  private transporter;
  private emailsDisabled: boolean;

  constructor() {
    // Verificar si los emails están deshabilitados
    this.emailsDisabled = process.env.DISABLE_EMAILS === 'true' || process.env.NODE_ENV === 'test';
    
    if (this.emailsDisabled) {
      console.log('[Mail] Emails deshabilitados - modo testing/desarrollo');
      return;
    }

    // Verificar credenciales
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('[Mail] ⚠️  Credenciales de email no configuradas. Los emails no se enviarán.');
      console.warn('[Mail] 💡 Para configurar emails, edita el archivo .env y agrega EMAIL_USER y EMAIL_PASSWORD');
      this.emailsDisabled = true;
      return;
    }

    try {
      this.transporter = this.createTransporter();
      console.log('[Mail] ✅ Configuración de email inicializada correctamente');
    } catch (error) {
      console.error('[Mail] ❌ Error al configurar email:', error);
      this.emailsDisabled = true;
    }
  }
  private createTransporter() {
    const emailService = process.env.EMAIL_SERVICE || 'gmail';
    
    if (emailService === 'gmail') {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        }
      });
    } else if (emailService === 'ethereal') {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        }
      });
    } else {
      // Configuración personalizada
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        }
      });
    }
  }async notificarNuevoPartido(partido: PartidoDTO): Promise<void> {
    if (this.emailsDisabled) {
      console.log(`[Mail] 📧 Email simulado - Nuevo partido creado: ${partido.id}`);
      return;
    }

    // Por ahora, notificar al organizador
    if (partido.organizador?.email) {
      await this.enviarCorreo(
        partido.organizador.email,
        '¡Partido creado exitosamente!',
        `Tu partido ha sido creado para el ${partido.fecha} en ${partido.direccion}. Estado: ${partido.estado}`
      );
    }
    
    console.log(`[Mail] Notificación de nuevo partido ${partido.id} enviada`);
  }

  async notificarCambioEstado(partido: PartidoDTO): Promise<void> {
    if (this.emailsDisabled) {
      console.log(`[Mail] 📧 Email simulado - Cambio de estado del partido ${partido.id} a ${partido.estado}`);
      return;
    }

    const emailsNotificados = new Set<string>();
    
    // Notificar al organizador
    if (partido.organizador?.email) {
      await this.enviarCorreo(
        partido.organizador.email,
        `Cambio de estado en tu partido`,
        `El partido programado para ${partido.fecha} ahora está en estado: ${partido.estado}`
      );
      emailsNotificados.add(partido.organizador.email);
    }
    
    // Notificar a los participantes
    if (partido.participantes && partido.participantes.length > 0) {
      for (const participante of partido.participantes) {
        if (participante.usuario.email && !emailsNotificados.has(participante.usuario.email)) {
          await this.enviarCorreo(
            participante.usuario.email,
            `Cambio de estado en el partido`,
            `El partido en ${partido.direccion} programado para ${partido.fecha} ahora está en estado: ${partido.estado}`
          );
          emailsNotificados.add(participante.usuario.email);
        }
      }
    }
    
    console.log(`[Mail] Notificaciones de cambio de estado enviadas para partido ${partido.id}`);
  }
  private async enviarCorreo(to: string, subject: string, text: string) {
    if (this.emailsDisabled || !this.transporter) {
      console.log(`[Mail] 📧 Email simulado a ${to}: ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
      });
      console.log(`[Mail] ✅ Correo enviado exitosamente a ${to}`);
    } catch (err) {
      console.error(`[Mail] ❌ Error enviando correo a ${to}:`, err);
    }
  }

  /**
   * Envía email cuando se crea una nueva invitación
   */
  async enviarNotificacionInvitacion(invitacionId: string): Promise<void> {
    console.log(`[Mail] 📧 Preparando email de invitación: ${invitacionId}`);
    
    try {
      // Obtener datos completos de la invitación
      const invitacionCompleta = await this.obtenerInvitacionCompleta(invitacionId);
      
      if (!invitacionCompleta) {
        console.log(`[Mail] ❌ No se encontró la invitación ${invitacionId}`);
        return;
      }

      const { usuario, partido, organizador } = invitacionCompleta;
      const fechaFormateada = this.formatearFecha(partido.fecha);
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1>🎯 Nueva Invitación a Partido</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f8f9fa;">
            <h2 style="color: #333;">¡Hola ${usuario.nombre}!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              <strong>${organizador.nombre}</strong> te ha invitado a participar en el siguiente partido:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">⚽ ${partido.nombre}</h3>
              <p><strong>📅 Fecha:</strong> ${fechaFormateada}</p>
              <p><strong>🕐 Hora:</strong> ${partido.hora}</p>
              <p><strong>📍 Dirección:</strong> ${partido.direccion}</p>
              <p><strong>🏃 Deporte:</strong> ${partido.deporte}</p>
              <p><strong>👨‍💼 Organizador:</strong> ${organizador.nombre}</p>
              <p><strong>📧 Contacto:</strong> ${organizador.email}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666; margin-bottom: 20px;">
                Estado de la invitación: <strong style="color: #667eea;">PENDIENTE</strong>
              </p>
              <p style="font-style: italic; color: #888;">
                Puedes responder a esta invitación desde la aplicación ZonaDepor
              </p>
            </div>
          </div>
          
          <div style="background-color: #e9ecef; padding: 20px; text-align: center; color: #666; font-size: 14px;">
            <p>Este email fue enviado automáticamente por ZonaDepor</p>
            <p>Si no solicitaste esta invitación, puedes ignorar este mensaje</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: usuario.email,
        subject: `🎯 Invitación a partido: ${partido.nombre}`,
        html: htmlContent
      };

      console.log(`[Mail] 📤 Enviando email de invitación a ${usuario.email}`);
      
      if (this.emailsDisabled || !this.transporter) {
        console.log(`[Mail] 📧 Email simulado - Nueva invitación`);
        console.log(`[Mail] 📧 Para: ${usuario.email}`);
        console.log(`[Mail] 📧 Asunto: ${mailOptions.subject}`);
        console.log(`[Mail] 📧 Partido: ${partido.nombre}`);
        console.log(`[Mail] 📧 Organizador: ${organizador.nombre}`);
      } else {
        await this.transporter.sendMail(mailOptions);
        console.log(`[Mail] ✅ Email de invitación enviado exitosamente a ${usuario.email}`);
      }
      
    } catch (error) {
      console.error('[Mail] ❌ Error enviando email de invitación:', error);
      throw error;
    }
  }

  /**
   * Obtiene datos completos de la invitación incluyendo usuario, partido y organizador
   */
  private async obtenerInvitacionCompleta(invitacionId: string): Promise<any> {
    try {
      const db = await dbPromise;
      const Invitacion = db.Invitacion as any;
      const Usuario = db.Usuario as any;
      const Partido = db.Partido as any;
      const Deporte = db.Deporte as any;      const invitacion = await Invitacion.findByPk(invitacionId, {
        include: [
          {
            model: Usuario,
            attributes: ['id', 'nombre', 'email']
          },
          {
            model: Partido,
            attributes: ['id', 'fecha', 'hora', 'direccion'],
            include: [
              {
                model: Usuario,
                as: 'organizador',
                attributes: ['id', 'nombre', 'email']
              },
              {
                model: Deporte,
                attributes: ['id', 'nombre']
              }
            ]
          }
        ]
      });

      if (!invitacion) return null;

      return {
        usuario: invitacion.Usuario,
        partido: {
          id: invitacion.Partido.id,
          nombre: `Partido de ${invitacion.Partido.Deporte?.nombre || 'Deporte'}`, // Generamos un nombre
          fecha: invitacion.Partido.fecha,
          hora: invitacion.Partido.hora,
          direccion: invitacion.Partido.direccion,
          deporte: invitacion.Partido.Deporte?.nombre || 'Deporte'
        },
        organizador: invitacion.Partido.organizador
      };
    } catch (error) {      console.error('[Mail] ❌ Error obteniendo invitación completa:', error);
      return null;
    }
  }

  /**
   * Formatea una fecha para mostrar en emails
   */
  private formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
