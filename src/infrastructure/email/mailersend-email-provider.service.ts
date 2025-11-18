import { Injectable, Logger } from '@nestjs/common';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { Config } from '../config/config';
import { IEmailProvider } from './email-provider.interface';
import { IEnviarCorreoRequest } from '../../domain/interfaces/notificaciones.interface';

@Injectable()
export class MailerSendEmailProvider implements IEmailProvider {
  private readonly logger = new Logger(MailerSendEmailProvider.name);
  private readonly mailerSend: MailerSend;

  constructor() {
    this.mailerSend = new MailerSend({
      apiKey: Config.mailersendApiToken,
    });
  }

  async enviarCorreo(datos: IEnviarCorreoRequest): Promise<void> {
    try {
      this.logger.debug(
        `Enviando correo vía MailerSend a: ${datos.destinatario}`,
      );

      const sentFrom = new Sender(
        Config.mailersendFromEmail,
        Config.mailersendFromName,
      );

      const recipients = [new Recipient(datos.destinatario)];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setSubject(datos.asunto);

      if (datos.tipo === 'html') {
        emailParams.setHtml(String(datos.cuerpo));
      } else {
        emailParams.setText(String(datos.cuerpo));
      }

      if (datos.pdfAdjunto) {
        const pdfAdjunto = datos.pdfAdjunto as {
          nombreArchivo: string;
          contenidoBase64: string;
        };
        emailParams.setAttachments([
          {
            filename: pdfAdjunto.nombreArchivo,
            content: pdfAdjunto.contenidoBase64,
            disposition: 'attachment',
            id: 'attachment',
          },
        ]);
      }

      await this.mailerSend.email.send(emailParams);

      this.logger.log(
        `Correo enviado exitosamente vía MailerSend a: ${datos.destinatario}`,
      );
    } catch (error) {
      this.logger.error(
        `Error al enviar correo vía MailerSend a ${datos.destinatario}:`,
      );
      if (error instanceof Error) {
        this.logger.error(`Error: ${error.message}`);
        if (error.stack) {
          this.logger.error(`Stack trace: ${error.stack}`);
        }
      }
      throw error;
    }
  }
}
