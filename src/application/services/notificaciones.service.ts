import { Injectable, Logger } from '@nestjs/common';
import { CuentaCobroRepository } from '../../infrastructure/persistence/repositories/cuenta-cobro.repository';
import { PlantillaRepository } from '../../infrastructure/persistence/repositories/plantilla.repository';
import { PdfService } from './pdf.service';
import { PagosService } from './pagos.service';
import { CuentaCobroModel } from '../../infrastructure/persistence/models/cuenta-cobro.model';
import { ClienteModel } from '../../infrastructure/persistence/models/cliente.model';
import * as moment from 'moment-timezone';

export interface IEnviarCorreoRequest {
  destinatario: string;
  asunto: string;
  cuerpoHtml: string;
  urlPdf: string;
}

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    private readonly cuentaCobroRepository: CuentaCobroRepository,
    private readonly plantillaRepository: PlantillaRepository,
    private readonly pdfService: PdfService,
    private readonly pagosService: PagosService,
  ) {}

  async enviarCorreo(datos: IEnviarCorreoRequest): Promise<void> {
    try {
      this.logger.log(`Enviando correo a: ${datos.destinatario}`);

      await this.enviarCorreoElectronico(datos);

      this.logger.log(`Correo enviado exitosamente a: ${datos.destinatario}`);
    } catch (error) {
      this.logger.error(`Error al enviar correo a ${datos.destinatario}:`, error);
      throw error;
    }
  }

  async generarPdfPorId(cuentaCobroId: number): Promise<string> {
    try {
      this.logger.log(`Generando PDF de prueba para cuenta de cobro ID: ${cuentaCobroId}`);

      const cuentaCobro = await this.cuentaCobroRepository.buscarPorIdConRelaciones(
        cuentaCobroId,
      );

      if (!cuentaCobro) {
        throw new Error(`No se encontró cuenta de cobro con ID ${cuentaCobroId}`);
      }

      const cliente = await this.cuentaCobroRepository.buscarClientePorId(
        cuentaCobro.clienteId,
      );

      if (!cliente) {
        throw new Error(`No se encontró cliente con ID ${cuentaCobro.clienteId}`);
      }

      const plantilla = await this.plantillaRepository.buscarPorTenantYTipo(
        cuentaCobro.tenantId,
        'cuenta_cobro',
      );

      if (!plantilla) {
        throw new Error(
          `No se encontró plantilla para tenant ${cuentaCobro.tenantId} tipo cuenta_cobro`,
        );
      }

      const diasGracia = await this.cuentaCobroRepository.buscarDiasGraciaPorClientePaqueteId(
        cuentaCobro.clientePaqueteId,
      );

      const fechaLimitePago = this.calcularFechaLimitePago(cuentaCobro.fechaCobro, diasGracia);

      let linkPago = cuentaCobro.linkPago;

      if (!linkPago) {
        this.logger.log(
          `Generando link de pago Woompi para cuenta de cobro ID: ${cuentaCobro.id}`,
        );

        linkPago = await this.woompiService.generarLinkPago({
          cuentaCobroId: cuentaCobro.id,
          valorTotal: Number(cuentaCobro.valorTotal),
          referencia: `CC-${cuentaCobro.id}`,
          descripcion: `Cuenta de cobro #${cuentaCobro.id}`,
          correoCliente: cliente.correo,
          nombreCliente: cliente.nombreCompleto,
          fechaLimitePago,
        });

        await this.cuentaCobroRepository.actualizarLinkPago(cuentaCobro.id, linkPago);
      }

      const urlPdf = await this.pdfService.generarPdf(
        cuentaCobro,
        cliente,
        plantilla,
        linkPago,
        fechaLimitePago,
      );

      await this.cuentaCobroRepository.actualizarUrlPdf(cuentaCobro.id, urlPdf);

      this.logger.log(`PDF de prueba generado exitosamente: ${urlPdf}`);

      return urlPdf;
    } catch (error) {
      this.logger.error(`Error al generar PDF de prueba para cuenta de cobro ${cuentaCobroId}:`, error);
      throw error;
    }
  }

  async generarPdfsPorBatch(
    fechaCobro: Date,
    batchSize: number = 500,
  ): Promise<number> {
    let offset = 0;
    let totalGenerados = 0;
    let tieneMasRegistros = true;

    this.logger.log(
      `Iniciando generación de PDFs por batches de ${batchSize} para fecha: ${fechaCobro}`,
    );

    while (tieneMasRegistros) {
      const resultado = await this.cuentaCobroRepository.buscarPorFechaCobroConRelaciones(
        fechaCobro,
        batchSize,
        offset,
      );

      if (resultado.rows.length === 0) {
        tieneMasRegistros = false;
        break;
      }

      this.logger.log(
        `Procesando batch: ${offset} - ${offset + resultado.rows.length} de ${resultado.count}`,
      );

      for (const cuentaCobro of resultado.rows) {
        try {
          if (cuentaCobro.urlPdf) {
            this.logger.log(
              `La cuenta de cobro ${cuentaCobro.id} ya tiene PDF generado, omitiendo`,
            );
            continue;
          }

          const cliente = await this.cuentaCobroRepository.buscarClientePorId(
            cuentaCobro.clienteId,
          );

          if (!cliente) {
            this.logger.warn(
              `No se encontró cliente con ID ${cuentaCobro.clienteId} para cuenta de cobro ${cuentaCobro.id}`,
            );
            continue;
          }

          const plantilla = await this.plantillaRepository.buscarPorTenantYTipo(
            cuentaCobro.tenantId,
            'cuenta_cobro',
          );

          if (!plantilla) {
            this.logger.warn(
              `No se encontró plantilla para tenant ${cuentaCobro.tenantId} tipo cuenta_cobro`,
            );
            continue;
          }

          const diasGracia = await this.cuentaCobroRepository.buscarDiasGraciaPorClientePaqueteId(
            cuentaCobro.clientePaqueteId,
          );

          const fechaLimitePago = this.calcularFechaLimitePago(cuentaCobro.fechaCobro, diasGracia);

          let linkPago = cuentaCobro.linkPago;

          if (!linkPago) {
            this.logger.log(
              `Generando link de pago Woompi para cuenta de cobro ID: ${cuentaCobro.id}`,
            );

            linkPago = await this.pagosService.generarLinkPago({
              cuentaCobroId: cuentaCobro.id,
              valorTotal: Number(cuentaCobro.valorTotal),
              referencia: `CC-${cuentaCobro.id}`,
              descripcion: `Cuenta de cobro #${cuentaCobro.id}`,
              correoCliente: cliente.correo,
              nombreCliente: cliente.nombreCompleto,
              fechaLimitePago,
            });

            await this.cuentaCobroRepository.actualizarLinkPago(cuentaCobro.id, linkPago);
          }

          const urlPdf = await this.pdfService.generarPdf(
            cuentaCobro,
            cliente,
            plantilla,
            linkPago,
            fechaLimitePago,
          );

          await this.cuentaCobroRepository.actualizarUrlPdf(cuentaCobro.id, urlPdf);

          totalGenerados++;
        } catch (error) {
          this.logger.error(
            `Error al generar PDF para cuenta de cobro ${cuentaCobro.id}:`,
            error,
          );
        }
      }

      offset += batchSize;
      tieneMasRegistros = resultado.rows.length === batchSize;
    }

    this.logger.log(`Generación de PDFs completada. Total generados: ${totalGenerados}`);

    return totalGenerados;
  }

  async enviarCorreosPorBatch(
    fechaCobro: Date,
    batchSize: number = 500,
  ): Promise<number> {
    let offset = 0;
    let totalEnviados = 0;
    let tieneMasRegistros = true;

    this.logger.log(
      `Iniciando envío de correos por batches de ${batchSize} para fecha: ${fechaCobro}`,
    );

    while (tieneMasRegistros) {
      const resultado = await this.cuentaCobroRepository.buscarPorFechaCobroConRelaciones(
        fechaCobro,
        batchSize,
        offset,
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

          const cliente = await this.cuentaCobroRepository.buscarClientePorId(
            cuentaCobro.clienteId,
          );

          if (!cliente) {
            this.logger.warn(
              `No se encontró cliente con ID ${cuentaCobro.clienteId} para cuenta de cobro ${cuentaCobro.id}`,
            );
            continue;
          }

          const plantilla = await this.plantillaRepository.buscarPorTenantYTipo(
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

          const fechaCobroFormateada = new Date(cuentaCobro.fechaCobro).toLocaleDateString(
            'es-CO',
            { year: 'numeric', month: 'long' },
          );

          await this.enviarCorreo({
            destinatario: cliente.correo,
            asunto: `Cuenta de Cobro - ${fechaCobroFormateada}`,
            cuerpoHtml,
            urlPdf: cuentaCobro.urlPdf,
          });

          await this.cuentaCobroRepository.actualizarEnvioCorreo(
            cuentaCobro.id,
            new Date(),
          );

          totalEnviados++;
        } catch (error) {
          this.logger.error(
            `Error al enviar correo para cuenta de cobro ${cuentaCobro.id}:`,
            error,
          );
        }
      }

      offset += batchSize;
      tieneMasRegistros = resultado.rows.length === batchSize;
    }

    this.logger.log(`Envío de correos completado. Total enviados: ${totalEnviados}`);

    return totalEnviados;
  }

  private procesarPlantillaCorreo(
    plantilla: string,
    cuentaCobro: CuentaCobroModel,
    cliente: ClienteModel,
  ): string {
    let resultado = plantilla;

    resultado = resultado.replace(/\{\{cliente\.nombre\}\}/g, cliente.nombreCompleto);
    resultado = resultado.replace(/\{\{cuentaCobro\.valorTotal\}\}/g, cuentaCobro.valorTotal.toString());
    resultado = resultado.replace(
      /\{\{cuentaCobro\.fechaCobro\}\}/g,
      new Date(cuentaCobro.fechaCobro).toLocaleDateString('es-CO'),
    );
    resultado = resultado.replace(/\{\{urlPdf\}\}/g, cuentaCobro.urlPdf || '');

    return resultado;
  }

  private async enviarCorreoElectronico(datos: IEnviarCorreoRequest): Promise<void> {
    this.logger.log(`Simulando envío de correo a ${datos.destinatario}`);
    this.logger.debug(`Asunto: ${datos.asunto}`);
    this.logger.debug(`URL PDF: ${datos.urlPdf}`);

    // TODO: Integrar con servicio de correo (SendGrid, SES, etc.)
    // Por ahora solo logueamos
  }
}

