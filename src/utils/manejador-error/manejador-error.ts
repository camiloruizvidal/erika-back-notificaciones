import {
  BadRequestException,
  ConflictException,
  GatewayTimeoutException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Constantes } from '../constantes';
import { ErrorPersonalizado } from '../error-personalizado/error-personalizado';

type ErrorConStatus = {
  status?: number;
  code?: number | string;
  codigo?: number;
  message?: string;
  response?: { status?: number };
};

@Injectable()
export class ManejadorError {
  public resolverErrorApi(error: unknown): never {
    const errorTipado = ManejadorError.castError(error);

    if (ManejadorError.esTiempoExcedido(errorTipado)) {
      throw new GatewayTimeoutException(errorTipado.message);
    }

    if (ManejadorError.esPeticionIncorrecta(errorTipado)) {
      throw new BadRequestException(errorTipado.message);
    }

    if (ManejadorError.esNoEncontrado(errorTipado)) {
      throw new NotFoundException(errorTipado.message);
    }

    if (ManejadorError.esConflicto(errorTipado)) {
      throw new ConflictException(errorTipado.message);
    }

    if (ManejadorError.esEntidadNoProcesable(errorTipado)) {
      throw new UnprocessableEntityException(errorTipado.message);
    }

    this.mostrarErrorInterno(errorTipado);
  }

  private mostrarErrorInterno(error: ErrorConStatus): never {
    const mensaje =
      error instanceof ErrorPersonalizado && error.message
        ? error.message
        : Constantes.MENSAJE_ERROR_INTERNO;
    throw new InternalServerErrorException(mensaje);
  }

  private static castError(error: unknown): ErrorConStatus {
    if (typeof error === 'object' && error !== null) {
      const castedError = error as ErrorConStatus;
      if (!castedError.message && error instanceof Error) {
        castedError.message = error.message;
      }
      return castedError;
    }
    return { message: Constantes.MENSAJE_ERROR_INTERNO };
  }

  private static esPeticionIncorrecta(error: ErrorConStatus): boolean {
    return this.compararStatus(error, 400);
  }

  private static esEntidadNoProcesable(error: ErrorConStatus): boolean {
    return this.compararStatus(error, 422);
  }

  private static esConflicto(error: ErrorConStatus): boolean {
    return this.compararStatus(error, 409);
  }

  private static esNoEncontrado(error: ErrorConStatus): boolean {
    return this.compararStatus(error, 404);
  }

  private static esTiempoExcedido(error: ErrorConStatus): boolean {
    const codigo = typeof error.code === 'string' ? error.code : undefined;
    return (
      (codigo === Constantes.CONEXION_ABORTADA && !!error.message) ||
      error.message === Constantes.MENSAJE_TIEMPO_EXCEDIDO
    );
  }

  private static compararStatus(
    error: ErrorConStatus,
    valor: number,
  ): boolean {
    const statusPosibles = [
      error.status,
      typeof error.code === 'string' ? Number(error.code) : error.code,
      error.codigo,
      error.response?.status,
    ];
    return statusPosibles.some(status => status === valor);
  }
}
