import { Injectable, Logger } from '@nestjs/common';
import { IEnviarCorreoRequest } from '../../domain/interfaces/notificaciones.interface';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  async enviarCorreo(datos: IEnviarCorreoRequest): Promise<{ enviado: boolean }> {
    try {
      this.logger.log(`Enviando correo a: ${datos.destinatario}`);

      await this.enviarCorreoElectronico(datos);

      this.logger.log(`Correo enviado exitosamente a: ${datos.destinatario}`);

      return { enviado: true };
    } catch (error) {
      const mensajeError =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        'Error desconocido';
      this.logger.error(
        `Error al enviar correo a ${datos.destinatario}: ${mensajeError}`,
      );
      throw error;
    }
  }

  private async enviarCorreoElectronico(
    datos: IEnviarCorreoRequest,
  ): Promise<void> {
    this.logger.log(`Simulando envío de correo a ${datos.destinatario}`);
    this.logger.debug(`Asunto: ${datos.asunto}`);
    this.logger.debug(`URL PDF: ${datos.urlPdf}`);

    // TODO: Integrar con servicio de correo (SendGrid, SES, etc.)
    // Por ahora solo logueamos
    await Promise.resolve();
  }
}
