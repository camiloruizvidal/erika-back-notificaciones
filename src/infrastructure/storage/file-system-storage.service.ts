import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IStorage } from './storage.interface';
import { Config } from '../config/config';

/**
 * Implementación de almacenamiento usando el sistema de archivos local.
 * Usa rutas absolutas para guardar archivos.
 */
@Injectable()
export class FileSystemStorageService implements IStorage {
  private readonly logger = new Logger(FileSystemStorageService.name);

  /**
   * Guarda un archivo en el sistema de archivos usando una ruta absoluta.
   * @param buffer Contenido del archivo a guardar
   * @param rutaBase Ruta absoluta base donde guardar (ej: "D:\htdocs\CRV\erika-pagos\pdfs")
   * @param nombreArchivo Nombre del archivo a guardar
   * @returns URL completa del archivo guardado
   */
  async guardar(
    buffer: Buffer,
    rutaBase: string,
    nombreArchivo: string,
  ): Promise<string> {
    // Asegurar que el directorio existe
    await this.asegurarDirectorio(rutaBase);

    // Construir la ruta completa del archivo
    const rutaCompleta = path.join(rutaBase, nombreArchivo);

    this.logger.log(
      `Guardando archivo en: ${rutaCompleta} (tamaño: ${buffer.length} bytes)`,
    );

    // Guardar el archivo
    await fs.writeFile(rutaCompleta, buffer);

    // Generar la URL del archivo guardado
    const urlPdf = this.generarUrlPdf(nombreArchivo);

    this.logger.log(`Archivo guardado exitosamente. URL: ${urlPdf}`);

    return urlPdf;
  }

  /**
   * Asegura que el directorio existe, creándolo si es necesario.
   * @param rutaBase Ruta absoluta a verificar/crear
   */
  async asegurarDirectorio(rutaBase: string): Promise<void> {
    try {
      // Verificar si el directorio existe
      await fs.access(rutaBase);
      this.logger.debug(`Directorio existe: ${rutaBase}`);
    } catch {
      // Si no existe, crearlo recursivamente
      this.logger.log(`Creando directorio: ${rutaBase}`);
      await fs.mkdir(rutaBase, { recursive: true });
      this.logger.log(`Directorio creado exitosamente: ${rutaBase}`);
    }
  }

  /**
   * Genera la URL del archivo guardado.
   * Actualmente usa la configuración PDF_BASE_URL, pero en el futuro
   * podría construirse desde la ruta base si es necesario.
   * @param nombreArchivo Nombre del archivo
   * @returns URL completa del archivo
   */
  private generarUrlPdf(nombreArchivo: string): string {
    const baseUrl = Config.pdfBaseUrl;
    return `${baseUrl}/${nombreArchivo}`;
  }
}

