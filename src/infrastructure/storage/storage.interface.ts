export interface IStorage {
  guardar(
    buffer: Buffer,
    rutaBase: string,
    nombreArchivo: string,
  ): Promise<string>;

  asegurarDirectorio(rutaBase: string): Promise<void>;
}

