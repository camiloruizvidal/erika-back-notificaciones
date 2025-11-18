import { Inject, Injectable, Logger } from '@nestjs/common';
import { IEnviarCorreoRequest } from '../../domain/interfaces/notificaciones.interface';
import type { IEmailProvider } from '../../infrastructure/email/email-provider.interface';
import { EMAIL_PROVIDER_TOKEN } from '../../infrastructure/email/email-provider.interface';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    @Inject(EMAIL_PROVIDER_TOKEN)
    private readonly emailProvider: IEmailProvider,
  ) {}

  async enviarCorreo(
    datos: IEnviarCorreoRequest,
  ): Promise<{ enviado: boolean }> {
    try {
      this.logger.log('=== INICIO ENVÍO DE CORREO ===');
      this.logger.log(`De: erika-back-programador`);
      this.logger.log(`Para: ${datos.destinatario}`);
      this.logger.log(`Asunto: ${datos.asunto}`);
      this.logger.log(`Tipo: ${datos.tipo}`);
      this.logger.log(`URL PDF: ${datos.urlPdf || 'N/A'}`);

      if (datos.pdfAdjunto) {
        const pdfAdjunto = datos.pdfAdjunto as {
          nombreArchivo: string;
          contenidoBase64: string;
        };
        const tamannoKB = Math.round(pdfAdjunto.contenidoBase64.length / 1024);
        this.logger.log(
          `PDF adjunto: ${pdfAdjunto.nombreArchivo} (${tamannoKB} KB)`,
        );
        this.logger.debug(`Contenido base64: ${pdfAdjunto.contenidoBase64}`);
      } else {
        this.logger.log('PDF adjunto: No se incluyó archivo adjunto');
      }

      this.logger.debug(`Cuerpo (${datos.tipo}): ${datos.cuerpo}`);

      await this.emailProvider.enviarCorreo(datos);

      this.logger.log(`Correo enviado exitosamente a: ${datos.destinatario}`);
      this.logger.log('=== FIN ENVÍO DE CORREO ===');

      return { enviado: true };
    } catch (error) {
      this.logger.verbose({ error: JSON.stringify(error, null, 2) });
      this.logger.error(`Error al enviar correo a ${datos.destinatario}`);
      throw error;
    }
  }
}
