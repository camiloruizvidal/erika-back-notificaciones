import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as tmp from 'tmp';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { FileSystemStorageService } from '../../infrastructure/storage/file-system-storage.service';

export interface IPdfGeneratorRequest {
  plantilla: Buffer | string;
  datos: Record<string, any>;
  rutaSalida: string;
  nombreArchivo: string;
  tieneContrasena?: boolean;
  contrasena?: string;
}

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);
  private readonly directorioBaseProyecto: string = path.resolve(
    __dirname,
    '../../../..',
  );

  constructor(private readonly storageService: FileSystemStorageService) {}

  async generarPdf(datos: IPdfGeneratorRequest): Promise<string> {
    try {
      const bufferPlantilla = await this.obtenerBufferPlantilla(
        datos.plantilla,
      );
      const docxBuffer = await this.procesarPlantilla(
        bufferPlantilla,
        datos.datos,
      );
      const pdfBuffer = await this.convertirDocxAPdf(
        docxBuffer,
        datos.tieneContrasena,
        datos.contrasena,
      );
      const urlPdf = await this.storageService.guardar(
        pdfBuffer,
        datos.rutaSalida,
        datos.nombreArchivo,
      );
      return urlPdf;
    } catch (error) {
      const mensajeError =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        'Error desconocido';
      this.logger.error(`Error al generar PDF: ${mensajeError}`);
      throw error;
    }
  }

  private async obtenerBufferPlantilla(
    plantilla: Buffer | string,
  ): Promise<Buffer> {
    if (Buffer.isBuffer(plantilla)) {
      return plantilla;
    }

    const rutaCompleta = this.resolverRuta(plantilla);
    const stats = await fs.stat(rutaCompleta);
    if (!stats.isFile()) {
      throw new Error(
        `La ruta de la plantilla apunta a un directorio, no a un archivo: ${rutaCompleta}`,
      );
    }

    return await fs.readFile(rutaCompleta);
  }

  private async procesarPlantilla(
    buffer: Buffer,
    datos: Record<string, any>,
  ): Promise<Buffer> {
    const zip = new PizZip(buffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    const datosFormateados = this.formatearDatos(datos);
    doc.setData(datosFormateados);

    try {
      doc.render();
    } catch (error) {
      const e = error as any;
      if (e.properties && e.properties.errors instanceof Array) {
        const errorMessages = e.properties.errors
          .map((error: any) => {
            return error.properties
              ? `${error.properties.explanation}`
              : error.message;
          })
          .join('\n');
        throw new Error(`Error al procesar plantilla: ${errorMessages}`);
      }
      throw error;
    }

    return Buffer.from(doc.getZip().generate({ type: 'nodebuffer' }));
  }

  private formatearDatos(datos: Record<string, any>): Record<string, any> {
    const datosFormateados: Record<string, any> = {};

    for (const [key, value] of Object.entries(datos)) {
      if (value === null || value === undefined) {
        datosFormateados[key] = '';
      } else if (value instanceof Date) {
        datosFormateados[key] = value.toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } else if (typeof value === 'number') {
        datosFormateados[key] = new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
        }).format(value);
      } else {
        datosFormateados[key] = String(value);
      }
    }

    return datosFormateados;
  }

  private async convertirDocxAPdf(
    docxBuffer: Buffer,
    tieneContrasena?: boolean,
    contrasena?: string,
  ): Promise<Buffer> {
    const execAsync = promisify(exec);
    const tmpFileAsync = promisify<tmp.FileOptions, string>(tmp.file);

    const docxPath = await tmpFileAsync({ postfix: '.docx' });
    const pdfPath = await tmpFileAsync({ postfix: '.pdf' });

    try {
      await fs.writeFile(docxPath, docxBuffer);

      try {
        await execAsync(
          `libreoffice --headless --convert-to pdf --outdir "${path.dirname(pdfPath)}" "${docxPath}"`,
        );
      } catch {
        throw new Error(
          'LibreOffice no está instalado. Por favor, instálelo para convertir Word a PDF.',
        );
      }

      const pdfBuffer = await fs.readFile(pdfPath);

      if (tieneContrasena && contrasena) {
        return await this.agregarContrasenaAPdf(
          Buffer.from(pdfBuffer),
          contrasena,
        );
      }

      return Buffer.from(pdfBuffer);
    } finally {
      tmp.setGracefulCleanup();
    }
  }

  private resolverRuta(rutaRelativa: string): string {
    if (path.isAbsolute(rutaRelativa)) {
      return rutaRelativa;
    }
    return path.join(this.directorioBaseProyecto, rutaRelativa);
  }

  private agregarContrasenaAPdf(
    _pdfBuffer: Buffer,
    _contrasena: string,
  ): Promise<Buffer> {
    throw new Error(
      'Funcionalidad de contraseña para PDFs aún no implementada. TODO: Implementar usando pdf-lib o similar',
    );
  }
}
