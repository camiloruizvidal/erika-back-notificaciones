import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IStorage } from './storage.interface';

@Injectable()
export class FileSystemStorageService implements IStorage {
  async guardar(
    buffer: Buffer,
    rutaBase: string,
    nombreArchivo: string,
  ): Promise<string> {
    await this.asegurarDirectorio(rutaBase);
    const rutaCompleta = path.join(rutaBase, nombreArchivo);
    await fs.writeFile(rutaCompleta, buffer);
    return rutaCompleta;
  }

  async asegurarDirectorio(rutaBase: string): Promise<void> {
    try {
      await fs.access(rutaBase);
    } catch {
      await fs.mkdir(rutaBase, { recursive: true });
    }
  }
}

