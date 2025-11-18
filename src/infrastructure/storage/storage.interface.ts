/**
 * Interfaz para abstraer el almacenamiento de archivos.
 * Permite cambiar entre sistema de archivos local, S3, u otros proveedores.
 */
export interface IStorage {
  /**
   * Guarda un archivo en el almacenamiento.
   * @param buffer Contenido del archivo a guardar
   * @param rutaBase Ruta base donde guardar (puede ser una ruta local o un bucket)
   * @param nombreArchivo Nombre del archivo a guardar
   * @returns URL completa del archivo guardado
   */
  guardar(
    buffer: Buffer,
    rutaBase: string,
    nombreArchivo: string,
  ): Promise<string>;

  /**
   * Asegura que el directorio/bucket existe y está listo para guardar archivos.
   * @param rutaBase Ruta base a verificar/crear
   */
  asegurarDirectorio(rutaBase: string): Promise<void>;
}

