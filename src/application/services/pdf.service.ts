import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CuentaCobroModel } from '../../infrastructure/persistence/models/cuenta-cobro.model';
import { ClienteModel } from '../../infrastructure/persistence/models/cliente.model';
import { PlantillaModel } from '../../infrastructure/persistence/models/plantilla.model';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly directorioPdfs = process.env.PDF_STORAGE_PATH || './storage/pdfs';

  async generarPdf(
    cuentaCobro: CuentaCobroModel,
    cliente: ClienteModel,
    plantilla: PlantillaModel,
  ): Promise<string> {
    try {
      this.logger.log(`Generando PDF para cuenta de cobro ID: ${cuentaCobro.id}`);

      await this.asegurarDirectorio();

      const nombreArchivo = this.generarNombreArchivo(
        cuentaCobro.tenantId,
        cuentaCobro.fechaCobro,
        cuentaCobro.id,
      );

      const rutaCompleta = path.join(this.directorioPdfs, nombreArchivo);

      if (plantilla.rutaPdf) {
        await this.copiarDesdeRuta(plantilla.rutaPdf, rutaCompleta, cuentaCobro, cliente);
      } else if (plantilla.plantillaPdf) {
        await this.generarDesdeBuffer(
          plantilla.plantillaPdf,
          rutaCompleta,
          cuentaCobro,
          cliente,
        );
      } else {
        throw new Error('No se encontró plantilla PDF válida');
      }

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

  private generarNombreArchivo(
    tenantId: number,
    fechaCobro: Date,
    cuentaCobroId: number,
  ): string {
    const fecha = new Date(fechaCobro);
    const fechaStr = fecha.toISOString().split('T')[0];
    return `cuenta-cobro-${tenantId}-${fechaStr}-${cuentaCobroId}.pdf`;
  }

  private generarUrlPdf(nombreArchivo: string): string {
    const baseUrl = process.env.PDF_BASE_URL || 'https://storage.erika.com/cuentas-cobro';
    return `${baseUrl}/${nombreArchivo}`;
  }

  private async copiarDesdeRuta(
    rutaPlantilla: string,
    rutaDestino: string,
    cuentaCobro: CuentaCobroModel,
    cliente: ClienteModel,
  ): Promise<void> {
    const contenido = await this.procesarPlantilla(rutaPlantilla, cuentaCobro, cliente);
    await fs.writeFile(rutaDestino, contenido);
  }

  private async generarDesdeBuffer(
    buffer: Buffer,
    rutaDestino: string,
    cuentaCobro: CuentaCobroModel,
    cliente: ClienteModel,
  ): Promise<void> {
    const contenido = await this.procesarPlantilla(buffer, cuentaCobro, cliente);
    await fs.writeFile(rutaDestino, contenido);
  }

  private async procesarPlantilla(
    plantilla: string | Buffer,
    cuentaCobro: CuentaCobroModel,
    cliente: ClienteModel,
  ): Promise<Buffer> {
    let contenido: string;

    if (Buffer.isBuffer(plantilla)) {
      contenido = plantilla.toString('utf-8');
    } else {
      const archivo = await fs.readFile(plantilla, 'utf-8');
      contenido = archivo;
    }

    const contenidoProcesado = this.reemplazarVariables(contenido, cuentaCobro, cliente);

    return Buffer.from(contenidoProcesado, 'utf-8');
  }

  private reemplazarVariables(
    contenido: string,
    cuentaCobro: CuentaCobroModel,
    cliente: ClienteModel,
  ): string {
    let resultado = contenido;

    resultado = resultado.replace(/\{\{cliente\.nombre\}\}/g, cliente.nombreCompleto);
    resultado = resultado.replace(/\{\{cliente\.correo\}\}/g, cliente.correo);
    resultado = resultado.replace(/\{\{cliente\.identificacion\}\}/g, cliente.identificacion || '');
    resultado = resultado.replace(/\{\{cliente\.direccion\}\}/g, cliente.direccion || '');

    resultado = resultado.replace(/\{\{cuentaCobro\.id\}\}/g, cuentaCobro.id.toString());
    resultado = resultado.replace(
      /\{\{cuentaCobro\.fechaCobro\}\}/g,
      new Date(cuentaCobro.fechaCobro).toLocaleDateString('es-CO'),
    );
    resultado = resultado.replace(
      /\{\{cuentaCobro\.valorTotal\}\}/g,
      cuentaCobro.valorTotal.toString(),
    );
    resultado = resultado.replace(
      /\{\{cuentaCobro\.valorPaquete\}\}/g,
      cuentaCobro.valorPaquete.toString(),
    );
    resultado = resultado.replace(
      /\{\{cuentaCobro\.valorConceptosAdicionales\}\}/g,
      cuentaCobro.valorConceptosAdicionales.toString(),
    );

    if (cuentaCobro.servicios) {
      let serviciosHtml = '';
      cuentaCobro.servicios.forEach((servicio) => {
        serviciosHtml += `<tr>
          <td>${servicio.nombreServicio}</td>
          <td>${servicio.valorOriginal}</td>
          <td>${servicio.valorAcordado}</td>
        </tr>`;
      });
      resultado = resultado.replace(/\{\{servicios\}\}/g, serviciosHtml);
    }

    if (cuentaCobro.conceptosAdicionales && cuentaCobro.conceptosAdicionales.length > 0) {
      let conceptosHtml = '';
      cuentaCobro.conceptosAdicionales.forEach((concepto) => {
        conceptosHtml += `<tr>
          <td>${concepto.concepto}</td>
          <td>${concepto.valor}</td>
        </tr>`;
      });
      resultado = resultado.replace(/\{\{conceptosAdicionales\}\}/g, conceptosHtml);
    }

    return resultado;
  }
}

