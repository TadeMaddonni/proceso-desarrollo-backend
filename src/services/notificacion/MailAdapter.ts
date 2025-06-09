import type { Notificador } from './NotificadorInterface.js';
import type { PartidoDTO } from '../../DTOs/PartidoDTO.js';
import nodemailer from 'nodemailer';


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
}
