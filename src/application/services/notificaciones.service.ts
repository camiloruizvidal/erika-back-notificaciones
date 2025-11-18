import { Injectable, Logger } from '@nestjs/common';
import { IEnviarCorreoRequest } from '../../domain/interfaces/notificaciones.interface';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  async enviarCorreo(
    datos: IEnviarCorreoRequest,
  ): Promise<{ enviado: boolean }> {
    try {
      this.logger.log('=== INICIO ENVÍO DE CORREO (FAKE) ===');
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

      await this.enviarCorreoElectronico(datos);

      this.logger.log(
        `Correo enviado exitosamente (FAKE) a: ${datos.destinatario}`,
      );
      this.logger.log('=== FIN ENVÍO DE CORREO (FAKE) ===');

      return { enviado: true };
    } catch (error) {
      this.logger.verbose({ error: JSON.stringify(error, null, 2) });
      this.logger.error(`Error al enviar correo a ${datos.destinatario}`);
      throw error;
    }
  }

  private async enviarCorreoElectronico(
    datos: IEnviarCorreoRequest,
  ): Promise<void> {
    this.logger.verbose({ datos: JSON.stringify(datos, null, 2) });
    this.logger.log(`[FAKE] Simulando envío de correo electrónico`);

    // TODO: Integrar con servicio de correo (SendGrid, SES, etc.)
    // Por ahora solo logueamos y retornamos éxito como fake
    // Cuando se integre, usar datos.pdfAdjunto.contenidoBase64 para adjuntar el PDF
    // Ejemplo con nodemailer:
    // const buffer = Buffer.from(datos.pdfAdjunto.contenidoBase64, 'base64');
    // attachments: [{ filename: datos.pdfAdjunto.nombreArchivo, content: buffer }]
    await Promise.resolve();
  }
}
