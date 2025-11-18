import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as mammoth from 'mammoth';
import puppeteer from 'puppeteer';
import * as moment from 'moment-timezone';
import { Config } from '../../infrastructure/config/config';
import { CuentaCobroModel } from '../../infrastructure/persistence/models/cuenta-cobro.model';
import { ClienteModel } from '../../infrastructure/persistence/models/cliente.model';
import { PlantillaModel } from '../../infrastructure/persistence/models/plantilla.model';
import { TenantModel } from '../../infrastructure/persistence/models/tenant.model';
import { CuentaCobroRepository } from '../../infrastructure/persistence/repositories/cuenta-cobro.repository';
import { FileSystemStorageService } from '../../infrastructure/storage/file-system-storage.service';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private readonly directorioBaseProyecto: string = Config.projectRoot
    ? Config.projectRoot
    : path.resolve(__dirname, '../../../..');

  constructor(
    private readonly storageService: FileSystemStorageService,
  ) {}

  async generarPdf(
    cuentaCobro: CuentaCobroModel,
    cliente: ClienteModel,
    plantilla: PlantillaModel,
    linkPago: string,
    fechaLimitePago: Date,
  ): Promise<string> {
    console.log({ plantilla });

    try {
      this.logger.log(
        `Generando PDF para cuenta de cobro ID: ${cuentaCobro.id}`,
      );

      await this.asegurarDirectorio();

      const nombreArchivo = this.generarNombreArchivo(
        cuentaCobro.id,
        cliente.identificacion || '',
      );

      const rutaCompleta = path.join(this.directorioPdfs, nombreArchivo);

      const tenant = await CuentaCobroRepository.buscarTenantPorId(
        cuentaCobro.tenantId,
      );

      this.logger.log(
        `[PdfService] Llegó a obtener tenant. Plantilla.rutaPdf: ${plantilla.rutaPdf || 'NO'}, plantillaPdf: ${plantilla.plantillaPdf || 'NO'}`,
      );

      // Obtener la ruta del archivo Word
      // plantillaPdf ahora contiene la ruta del archivo Word (TEXT)
      // rutaPdf contiene la ruta donde se guardará el PDF generado
      const rutaArchivo: string | null = plantilla.plantillaPdf || null;

      if (!rutaArchivo) {
        this.logger.error(
          `[PdfService] No se encontró ruta de plantilla PDF válida`,
        );
        console.trace(
          '[PdfService] ERROR: No se encontró ruta de plantilla PDF',
        );
        throw new Error(
          'No se encontró ruta de plantilla PDF válida. La plantilla debe tener la ruta en plantillaPdf',
        );
      }

      this.logger.log(`[PdfService] Ruta del archivo Word: ${rutaArchivo}`);

      // Leer el archivo desde el sistema de archivos
      const rutaCompletaPlantilla = this.resolverRutaPlantilla(rutaArchivo);
      this.logger.log(
        `[PdfService] Ruta completa plantilla resuelta: ${rutaCompletaPlantilla}`,
      );
      console.log('=========================================================');
      console.log({ rutaCompletaPlantilla });
      console.log('=========================================================');
      const bufferArchivo = await fs.readFile(rutaCompletaPlantilla);
      this.logger.log(
        `[PdfService] Archivo leído. Tamaño: ${bufferArchivo.length} bytes`,
      );

      const htmlContent: string = await this.procesarPlantillaDesdeBuffer(
        bufferArchivo,
        cuentaCobro,
        cliente,
        tenant,
        fechaLimitePago,
        linkPago,
      );

      this.logger.log(
        `[PdfService] Después de procesarPlantillaDesdeBuffer. HTML length: ${htmlContent?.length || 'N/A'}`,
      );

      await this.convertirHtmlAPdf(htmlContent, rutaCompleta);

      const urlPdf = this.generarUrlPdf(nombreArchivo);

      this.logger.log(`PDF generado exitosamente: ${urlPdf}`);

      return urlPdf;
    } catch (error) {
      console.trace('[PdfService.generarPdf] ERROR:', error);
      const mensajeError =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        'Error desconocido';
      this.logger.error(
        `Error al generar PDF para cuenta de cobro ${cuentaCobro.id}: ${mensajeError}`,
      );
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
    cuentaCobroId: number,
    identificacionCliente: string,
  ): string {
    return `${cuentaCobroId}_${identificacionCliente}.pdf`;
  }

  private generarUrlPdf(nombreArchivo: string): string {
    const baseUrl = Config.pdfBaseUrl;
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

    // Verificar que la ruta existe y es un archivo, no un directorio
    const stats = await fs.stat(rutaAbsoluta);
    if (!stats.isFile()) {
      throw new Error(
        `La ruta de la plantilla apunta a un directorio, no a un archivo: ${rutaAbsoluta}`,
      );
    }

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
    buffer: Buffer | Uint8Array | string | { data: Buffer | Uint8Array } | null,
    cuentaCobro: CuentaCobroModel,
    cliente: ClienteModel,
    tenant: TenantModel | null,
    fechaLimitePago: Date,
    linkPago: string,
  ): Promise<string> {
    this.logger.log(
      `[PdfService.procesarPlantillaDesdeBuffer] INICIO. Buffer recibido: ${buffer ? 'SÍ' : 'NO'}, tipo: ${typeof buffer}, es Buffer: ${Buffer.isBuffer(buffer)}, constructor: ${(buffer as any)?.constructor?.name}`,
    );

    if (!buffer) {
      this.logger.error(
        `[PdfService.procesarPlantillaDesdeBuffer] Buffer es null o undefined`,
      );
      console.trace(
        '[PdfService.procesarPlantillaDesdeBuffer] ERROR: Buffer es null o undefined',
      );
      throw new Error('El buffer de la plantilla es null o undefined');
    }

    // Asegurar que el buffer sea un Buffer de Node.js
    let bufferConvertido: Buffer;

    // Log temporal para debugging - ver estructura del objeto
    const keys =
      typeof buffer === 'object' && buffer ? Object.keys(buffer) : [];
    this.logger.debug(
      `Tipo de buffer recibido: ${typeof buffer}, constructor: ${(buffer as any)?.constructor?.name}, es Buffer: ${Buffer.isBuffer(buffer)}, keys: ${keys.join(', ')}`,
    );

    if (Buffer.isBuffer(buffer)) {
      this.logger.debug(
        `Buffer recibido como Buffer de Node.js. Tamaño: ${buffer.length} bytes`,
      );
      bufferConvertido = buffer;
    } else if (buffer instanceof Uint8Array) {
      bufferConvertido = Buffer.from(buffer);
    } else if (typeof buffer === 'string') {
      bufferConvertido = Buffer.from(buffer, 'base64');
    } else if (typeof buffer === 'object' && buffer) {
      // Sequelize puede devolver el BLOB como un objeto con el buffer en diferentes lugares
      const bufferObj = buffer as any;

      // Verificar primero si es un objeto array-like con keys numéricas (0, 1, 2, ...)
      // Esto es común cuando Sequelize devuelve un BLOB como objeto con índices numéricos
      const numericKeys = keys.filter((k) => /^\d+$/.test(k));
      if (numericKeys.length > 0 && numericKeys.length === keys.length) {
        // Es un array-like object: convertir a array y luego a Buffer
        // Verificar si tiene propiedad length para saber el tamaño real
        const objectLength = (bufferObj as any).length;
        this.logger.debug(
          `Buffer detectado como array-like object. Keys: ${numericKeys.length}, length: ${objectLength || 'undefined'}`,
        );

        // Usar Object.values() para obtener todos los valores numéricos
        // Esto captura todos los bytes, no solo los que están en las keys enumeradas
        const values = Object.values(bufferObj);
        const byteArray: number[] = values.filter(
          (v) => typeof v === 'number',
        ) as number[];

        this.logger.debug(
          `Bytes extraídos: ${byteArray.length}. Primeros 10: ${byteArray.slice(0, 10).join(', ')}`,
        );

        if (byteArray.length === 0) {
          console.trace(
            '[PdfService.procesarPlantillaDesdeBuffer] ERROR: No se encontraron valores numéricos en el buffer array-like',
          );
          throw new Error(
            `No se encontraron valores numéricos en el buffer array-like`,
          );
        }

        bufferConvertido = Buffer.from(byteArray);
      } else if (Array.isArray(buffer)) {
        // Si el buffer es un array directamente
        bufferConvertido = Buffer.from(buffer);
      } else if (bufferObj.type === 'Buffer' && Array.isArray(bufferObj.data)) {
        // Formato: { type: 'Buffer', data: [bytes] }
        bufferConvertido = Buffer.from(bufferObj.data);
      } else if (Array.isArray(bufferObj.bytes)) {
        bufferConvertido = Buffer.from(bufferObj.bytes);
      } else if ('data' in buffer) {
        const data = (buffer as { data: unknown }).data;
        this.logger.debug(
          `Data encontrada. Tipo: ${typeof data}, es Buffer: ${Buffer.isBuffer(data)}, es Array: ${Array.isArray(data)}`,
        );

        if (Buffer.isBuffer(data)) {
          bufferConvertido = data;
        } else if (data instanceof Uint8Array) {
          bufferConvertido = Buffer.from(data);
        } else if (typeof data === 'string') {
          bufferConvertido = Buffer.from(data, 'base64');
        } else if (Array.isArray(data)) {
          // Array de bytes
          bufferConvertido = Buffer.from(data);
        } else {
          this.logger.error(
            `Tipo de data no reconocido: ${typeof data}, constructor: ${(data as any)?.constructor?.name}`,
          );
          console.trace(
            '[PdfService.procesarPlantillaDesdeBuffer] ERROR: Tipo de data no reconocido:',
            {
              tipo: typeof data,
              constructor: (data as any)?.constructor?.name,
            },
          );
          throw new Error(
            `El buffer de la plantilla en la propiedad data no está en un formato válido. Tipo recibido: ${typeof data}`,
          );
        }
      } else {
        // Intentar convertir el objeto completo a Buffer desde Object.values
        try {
          const values = Object.values(buffer);
          // Filtrar solo números si hay valores mixtos
          const bytes = values.filter((v) => typeof v === 'number') as number[];
          if (bytes.length > 0) {
            bufferConvertido = Buffer.from(bytes);
          } else {
            bufferConvertido = Buffer.from(values as any);
          }
        } catch (err) {
          this.logger.error(
            `Tipo de buffer no reconocido: ${typeof buffer}, constructor: ${(buffer as any)?.constructor?.name}, keys: ${keys.join(', ')}`,
          );
          console.trace(
            '[PdfService.procesarPlantillaDesdeBuffer] ERROR al convertir buffer:',
            err,
            {
              tipo: typeof buffer,
              constructor: (buffer as any)?.constructor?.name,
              keys: keys.join(', '),
            },
          );
          throw new Error(
            `El buffer de la plantilla no está en un formato válido. Tipo: ${typeof buffer}, Keys: ${keys.join(', ')}`,
          );
        }
      }
    } else {
      this.logger.error(
        `[PdfService.procesarPlantillaDesdeBuffer] Buffer no es de un tipo válido. Tipo: ${typeof buffer}`,
      );
      console.trace(
        '[PdfService.procesarPlantillaDesdeBuffer] ERROR: Buffer no es de un tipo válido:',
        { tipo: typeof buffer },
      );
      throw new Error(
        `El buffer de la plantilla no está en un formato válido. Tipo: ${typeof buffer}`,
      );
    }

    this.logger.log(
      `[PdfService.procesarPlantillaDesdeBuffer] Buffer convertido. Es Buffer: ${Buffer.isBuffer(bufferConvertido)}, length: ${bufferConvertido.length}`,
    );

    this.logger.log(
      `[PdfService.procesarPlantillaDesdeBuffer] Antes de mammoth.convertToHtml`,
    );

    try {
      const resultado = await mammoth.convertToHtml({
        buffer: bufferConvertido,
      });

      this.logger.log(
        `[PdfService.procesarPlantillaDesdeBuffer] Después de mammoth.convertToHtml. HTML recibido: ${resultado.value ? 'SÍ' : 'NO'}, length: ${resultado.value?.length || 'N/A'}`,
      );

      const html = resultado.value;
      return this.reemplazarVariables(
        html,
        cuentaCobro,
        cliente,
        tenant,
        fechaLimitePago,
        linkPago,
      );
    } catch (error) {
      console.trace(
        '[PdfService.procesarPlantillaDesdeBuffer] ERROR en mammoth.convertToHtml:',
        error,
        { bufferLength: bufferConvertido.length },
      );
      throw error;
    }
  }

  private resolverRutaPlantilla(rutaRelativa: string): string {
    if (path.isAbsolute(rutaRelativa)) {
      return rutaRelativa;
    }
    return path.join(this.directorioBaseProyecto, rutaRelativa);
  }

  private async convertirHtmlAPdf(
    htmlContent: string,
    rutaDestino: string,
  ): Promise<void> {
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

    resultado = resultado.replace(
      /\{cliente\.primer_nombre\}/g,
      cliente.primerNombre || '',
    );
    resultado = resultado.replace(
      /\{cliente\.primer_apellido\}/g,
      cliente.primerApellido || '',
    );
    resultado = resultado.replace(/\{empresa\.nombre\}/g, tenant?.nombre || '');

    const valorTotalFormateado = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(Number(cuentaCobro.valorTotal));

    resultado = resultado.replace(
      /\$\{cuenta\.valor_total\}/g,
      valorTotalFormateado,
    );
    resultado = resultado.replace(
      /\{cuenta\.valor_total\}/g,
      valorTotalFormateado,
    );

    const fechaLimiteFormateada = moment
      .tz(fechaLimitePago, 'America/Bogota')
      .format('DD [de] MMMM [de] YYYY');

    resultado = resultado.replace(
      /\{cuenta\.fecha_limite_pago\}/g,
      fechaLimiteFormateada,
    );
    resultado = resultado.replace(/\{cuenta\.link_pago\}/g, linkPago);

    return resultado;
  }
}
