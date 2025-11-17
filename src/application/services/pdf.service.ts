import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as mammoth from 'mammoth';
import puppeteer from 'puppeteer';
import * as moment from 'moment-timezone';
import { CuentaCobroModel } from '../../infrastructure/persistence/models/cuenta-cobro.model';
import { ClienteModel } from '../../infrastructure/persistence/models/cliente.model';
import { PlantillaModel } from '../../infrastructure/persistence/models/plantilla.model';
import { TenantModel } from '../../infrastructure/persistence/models/tenant.model';
import { CuentaCobroRepository } from '../../infrastructure/persistence/repositories/cuenta-cobro.repository';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly directorioPdfs = process.env.PDF_STORAGE_PATH || './storage/pdfs';
  private readonly directorioBaseProyecto = process.env.PROJECT_ROOT || path.resolve(__dirname, '../../../..');

  constructor(private readonly cuentaCobroRepository: CuentaCobroRepository) {}

  async generarPdf(
    cuentaCobro: CuentaCobroModel,
    cliente: ClienteModel,
    plantilla: PlantillaModel,
    linkPago: string,
    fechaLimitePago: Date,
  ): Promise<string> {
    try {
      this.logger.log(`Generando PDF para cuenta de cobro ID: ${cuentaCobro.id}`);

      await this.asegurarDirectorio();

      const nombreArchivo = this.generarNombreArchivo(
        cuentaCobro.id,
        cliente.identificacion || '',
      );

      const rutaCompleta = path.join(this.directorioPdfs, nombreArchivo);

      const tenant = await this.cuentaCobroRepository.buscarTenantPorId(cuentaCobro.tenantId);

      let htmlContent: string;

      if (plantilla.rutaPdf) {
        htmlContent = await this.procesarPlantillaDesdeRuta(
          plantilla.rutaPdf,
          cuentaCobro,
          cliente,
          tenant,
          fechaLimitePago,
          linkPago,
        );
      } else if (plantilla.plantillaPdf) {
        htmlContent = await this.procesarPlantillaDesdeBuffer(
          plantilla.plantillaPdf,
          cuentaCobro,
          cliente,
          tenant,
          fechaLimitePago,
          linkPago,
        );
      } else {
        throw new Error('No se encontró plantilla PDF válida');
      }

      await this.convertirHtmlAPdf(htmlContent, rutaCompleta);

      const urlPdf = this.generarUrlPdf(nombreArchivo);

      this.logger.log(`PDF generado exitosamente: ${urlPdf}`);

      return urlPdf;
    } catch (error) {
      this.logger.error(`Error al generar PDF para cuenta de cobro ${cuentaCobro.id}:`, error);
      throw error;
    }
  }

  private async asegurarDirectorio(): Promise<void> {
    try {
      await fs.access(this.directorioPdfs);
    } catch {
      await fs.mkdir(this.directorioPdfs, { recursive: true });
    }
  }

  private generarNombreArchivo(cuentaCobroId: number, identificacionCliente: string): string {
    return `${cuentaCobroId}_${identificacionCliente}.pdf`;
  }

  private generarUrlPdf(nombreArchivo: string): string {
    const baseUrl = process.env.PDF_BASE_URL || 'https://storage.erika.com/cuentas-cobro';
    return `${baseUrl}/${nombreArchivo}`;
  }


  private async procesarPlantillaDesdeRuta(
    rutaPlantilla: string,
    cuentaCobro: CuentaCobroModel,
    cliente: ClienteModel,
    tenant: TenantModel | null,
    fechaLimitePago: Date,
    linkPago: string,
  ): Promise<string> {
    const rutaAbsoluta = this.resolverRutaPlantilla(rutaPlantilla);
    const buffer = await fs.readFile(rutaAbsoluta);
    return await this.procesarPlantillaDesdeBuffer(
      buffer,
      cuentaCobro,
      cliente,
      tenant,
      fechaLimitePago,
      linkPago,
    );
  }

  private async procesarPlantillaDesdeBuffer(
    buffer: Buffer,
    cuentaCobro: CuentaCobroModel,
    cliente: ClienteModel,
    tenant: TenantModel | null,
    fechaLimitePago: Date,
    linkPago: string,
  ): Promise<string> {
    const resultado = await mammoth.convertToHtml({ buffer });
    const html = resultado.value;
    return this.reemplazarVariables(
      html,
      cuentaCobro,
      cliente,
      tenant,
      fechaLimitePago,
      linkPago,
    );
  }

  private resolverRutaPlantilla(rutaRelativa: string): string {
    if (path.isAbsolute(rutaRelativa)) {
      return rutaRelativa;
    }
    return path.join(this.directorioBaseProyecto, rutaRelativa);
  }

  private async convertirHtmlAPdf(htmlContent: string, rutaDestino: string): Promise<void> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      await page.pdf({
        path: rutaDestino,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });
    } finally {
      await browser.close();
    }
  }

  private reemplazarVariables(
    contenido: string,
    cuentaCobro: CuentaCobroModel,
    cliente: ClienteModel,
    tenant: TenantModel | null,
    fechaLimitePago: Date,
    linkPago: string,
  ): string {
    let resultado = contenido;

    resultado = resultado.replace(/\{cliente\.primer_nombre\}/g, cliente.primerNombre || '');
    resultado = resultado.replace(/\{cliente\.primer_apellido\}/g, cliente.primerApellido || '');
    resultado = resultado.replace(/\{empresa\.nombre\}/g, tenant?.nombre || '');

    const valorTotalFormateado = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(Number(cuentaCobro.valorTotal));

    resultado = resultado.replace(/\$\{cuenta\.valor_total\}/g, valorTotalFormateado);
    resultado = resultado.replace(/\{cuenta\.valor_total\}/g, valorTotalFormateado);

    const fechaLimiteFormateada = moment
      .tz(fechaLimitePago, 'America/Bogota')
      .format('DD [de] MMMM [de] YYYY');

    resultado = resultado.replace(/\{cuenta\.fecha_limite_pago\}/g, fechaLimiteFormateada);
    resultado = resultado.replace(/\{cuenta\.link_pago\}/g, linkPago);

    return resultado;
  }
}

