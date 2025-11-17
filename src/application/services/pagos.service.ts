import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface IGenerarLinkPagoRequest {
  cuentaCobroId: number;
  valorTotal: number;
  referencia: string;
  descripcion: string;
  correoCliente: string;
  nombreCliente: string;
  fechaLimitePago: Date;
}

@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);
  private readonly pagosBaseUrl =
    process.env.PAGOS_BASE_URL || 'http://localhost:3003';

  constructor(private readonly httpService: HttpService) {}

  async generarLinkPago(
    datos: IGenerarLinkPagoRequest,
  ): Promise<string> {
    try {
      this.logger.log(
        `Solicitando generación de link de pago para cuenta de cobro ID: ${datos.cuentaCobroId}`,
      );

      const url = `${this.pagosBaseUrl}/api/v1/pagos/generar-link-pago`;

      const respuesta = await firstValueFrom(
        this.httpService.post<{ linkPago: string }>(url, datos),
      );

      this.logger.log(
        `Link de pago generado exitosamente para cuenta de cobro ID: ${datos.cuentaCobroId}`,
      );

      return respuesta.data.linkPago;
    } catch (error) {
      this.logger.error(
        `Error al solicitar generación de link de pago para cuenta de cobro ${datos.cuentaCobroId}:`,
        error,
      );
      throw error;
    }
  }
}

