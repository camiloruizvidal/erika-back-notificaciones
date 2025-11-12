export class Constantes {
  static readonly LOCAL = 'local';
  static readonly MENSAJE_TIEMPO_EXCEDIDO = 'El tiempo de 60000ms ha sido excedido';
  static readonly CONEXION_ABORTADA = 'ECONNABORTED';
  static readonly MENSAJE_ERROR_INTERNO = 'Error interno en el servidor';
  static readonly PROPIEDAD_NO_PERMITIDA = (property: string) =>
    `${property} no es una propiedad permitida`;
}
