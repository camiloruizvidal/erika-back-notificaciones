import {
  Injectable,
  NotFoundException,
  BadRequestException,
  GatewayTimeoutException,
  InternalServerErrorException,
  UnprocessableEntityException
} from '@nestjs/common';
import { Constantes } from '../constantes';
import { ErrorPersonalizado } from '../error-personalizado/error-personalizado';

@Injectable()
export class ManejadorError {
  public resolverErrorApi(error: any): void {
    console.error({ error });
    const mensajeTiempoExcedido = Constantes.MENSAJE_TIEMPO_EXCEDIDO;
    const esPeticionIncorrecta = this.esPeticionIncorrecta(error);
    const esNoEncontrado = this.esNoEncontrado(error);
    const esTiempoExcedido = this.esTiempoExcedido(
      error,
      mensajeTiempoExcedido
    );
    const esEntidadNoProcesable = this.esEntidadNoProcesable(error);

    if (esTiempoExcedido) {
      throw new GatewayTimeoutException(error.message);
    } else if (esPeticionIncorrecta) {
      throw new BadRequestException(error.message);
    } else if (esNoEncontrado) {
      throw new NotFoundException(error.message);
    } else if (esEntidadNoProcesable) {
      throw new UnprocessableEntityException(error.message);
    } else {
      this.mostrarErrorInterno(error);
    }
  }

  private esPeticionIncorrecta(error: any): boolean {
    return (
      error.status === 400 ||
      error.code === 400 ||
      error.codigo === 400 ||
      error.response?.status === 400
    );
  }

  private esEntidadNoProcesable(error: any): boolean {
    return (
      error.status === 422 ||
      error.code === 422 ||
      error.codigo === 422 ||
      error.response?.status === 422
    );
  }

  private esNoEncontrado(error: any): boolean {
    return (
      error.status === 404 ||
      error.code === 404 ||
      error.codigo === 404 ||
      error.response?.status === 404
    );
  }

  private esTiempoExcedido(error: any, mensajeTiempoExcedido: string): boolean {
    return (
      (error?.code === Constantes.CONEXION_ABORTADA && error?.message) ||
      error.message === mensajeTiempoExcedido
    );
  }

  private mostrarErrorInterno(error: any): void {
    const mensaje =
      error instanceof ErrorPersonalizado && error.message
        ? error.message
        : Constantes.MENSAJE_ERROR_INTERNO;
    throw new InternalServerErrorException(mensaje);
  }
}
