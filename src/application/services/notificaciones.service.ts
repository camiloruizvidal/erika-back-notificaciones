import { Injectable, Logger } from '@nestjs/common';
import * as moment from 'moment-timezone';
import { CuentaCobroRepository } from '../../infrastructure/persistence/repositories/cuenta-cobro.repository';
import { PlantillaRepository } from '../../infrastructure/persistence/repositories/plantilla.repository';
import { CuentaCobroModel } from '../../infrastructure/persistence/models/cuenta-cobro.model';
import { ClienteModel } from '../../infrastructure/persistence/models/cliente.model';
import { IEnviarCorreoRequest } from '../../domain/interfaces/notificaciones.interface';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  async enviarCorreo(datos: IEnviarCorreoRequest): Promise<void> {
    try {
      this.logger.log(`Enviando correo a: ${datos.destinatario}`);

      await this.enviarCorreoElectronico(datos);

      this.logger.log(`Correo enviado exitosamente a: ${datos.destinatario}`);
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

  async enviarCorreosPorBatch(
    fechaCobro: Date,
    batchSize: number = 500,
  ): Promise<number> {
    let offset = 0;
    let totalEnviados = 0;
    let tieneMasRegistros = true;

    this.logger.log(
      `Iniciando envío de correos por batches de ${batchSize} para fecha: ${fechaCobro.toISOString()}`,
    );

    const inicioDia = moment.utc(fechaCobro).startOf('day').toDate();
    const finDia = moment.utc(fechaCobro).endOf('day').toDate();

    while (tieneMasRegistros) {
      const resultado =
        await CuentaCobroRepository.buscarPorFechaCobroConRelaciones(
          inicioDia,
          finDia,
          batchSize,
          offset,
          false, // soloSinPdf = false: trae todas, luego filtra por siEnvioCorreo
        );

      if (resultado.rows.length === 0) {
        tieneMasRegistros = false;
        break;
      }

      this.logger.log(
        `Procesando batch de correos: ${offset} - ${offset + resultado.rows.length} de ${resultado.count}`,
      );

      for (const cuentaCobro of resultado.rows) {
        try {
          if (cuentaCobro.siEnvioCorreo || !cuentaCobro.urlPdf) {
            if (!cuentaCobro.urlPdf) {
              this.logger.warn(
                `La cuenta de cobro ${cuentaCobro.id} no tiene PDF generado, omitiendo`,
              );
            }
            continue;
          }

          const cliente = await CuentaCobroRepository.buscarClientePorId(
            cuentaCobro.clienteId,
          );

          if (!cliente) {
            this.logger.warn(
              `No se encontró cliente con ID ${cuentaCobro.clienteId} para cuenta de cobro ${cuentaCobro.id}`,
            );
            continue;
          }

          const plantilla = await PlantillaRepository.buscarPorTenantYTipo(
            cuentaCobro.tenantId,
            'cuenta_cobro',
          );

          if (!plantilla) {
            this.logger.warn(
              `No se encontró plantilla para tenant ${cuentaCobro.tenantId} tipo cuenta_cobro`,
            );
            continue;
          }

          const cuerpoHtml = this.procesarPlantillaCorreo(
            plantilla.plantillaCorreo,
            cuentaCobro,
            cliente,
          );

          const fechaCobroFormateada = new Date(
            cuentaCobro.fechaCobro,
          ).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' });

          await this.enviarCorreo({
            destinatario: cliente.correo,
            asunto: `Cuenta de Cobro - ${fechaCobroFormateada}`,
            cuerpoHtml,
            urlPdf: cuentaCobro.urlPdf,
          });

          await CuentaCobroRepository.actualizarEnvioCorreo(
            cuentaCobro.id,
            new Date(),
          );

          totalEnviados++;
        } catch (error) {
          const mensajeError =
            (error as any)?.response?.data?.message ||
            (error as any)?.message ||
            'Error desconocido';
          this.logger.error(
            `Error al enviar correo para cuenta de cobro ${cuentaCobro.id}: ${mensajeError}`,
          );
        }
      }

      offset += batchSize;
      tieneMasRegistros = resultado.rows.length === batchSize;
    }

    this.logger.log(
      `Envío de correos completado. Total enviados: ${totalEnviados}`,
    );

    return totalEnviados;
  }

  private procesarPlantillaCorreo(
    plantilla: string,
    cuentaCobro: CuentaCobroModel,
    cliente: ClienteModel,
  ): string {
    let resultado = plantilla;

    resultado = resultado.replace(
      /\{\{cliente\.nombre\}\}/g,
      cliente.nombreCompleto,
    );
    resultado = resultado.replace(
      /\{\{cuentaCobro\.valorTotal\}\}/g,
      cuentaCobro.valorTotal.toString(),
    );
    resultado = resultado.replace(
      /\{\{cuentaCobro\.fechaCobro\}\}/g,
      new Date(cuentaCobro.fechaCobro).toLocaleDateString('es-CO'),
    );
    resultado = resultado.replace(/\{\{urlPdf\}\}/g, cuentaCobro.urlPdf || '');

    return resultado;
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
