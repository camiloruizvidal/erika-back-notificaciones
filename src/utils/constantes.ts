export class Constantes {
  static readonly LOCAL = 'local';
  static readonly MENSAJE_TIEMPO_EXCEDIDO = 'El tiempo de 60000ms ha sido excedido';
  static readonly CONEXION_ABORTADA = 'ECONNABORTED';
  static readonly MENSAJE_ERROR_INTERNO = 'Error interno en el servidor';
  static readonly PROPIEDAD_NO_PERMITIDA = (property: string) =>
    `${property} no es una propiedad permitida`;
  static readonly TENANT_YA_EXISTE =
    'Ya existe un tenant registrado con ese NIT';
  static readonly USUARIO_YA_EXISTE =
    'Ya existe un usuario registrado con ese correo';
  static readonly USUARIO_NO_EXISTE =
    'El usuario no se encuentra registrado';
  static readonly CREDENCIALES_INVALIDAS = 'Credenciales inválidas';
  static readonly AUTH_HEADER_REQUERIDO =
    'El encabezado Authorization es obligatorio';
  static readonly TOKEN_INVALIDO = 'El token proporcionado no es válido';
  static readonly TOKEN_SIN_CLAIMS =
    'El token no contiene la información requerida';
}
