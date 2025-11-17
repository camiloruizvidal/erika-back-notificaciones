import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Config } from '../../infrastructure/config/config';

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
export class WoompiService {
  private readonly logger = new Logger(WoompiService.name);
  private readonly woompiBaseUrl =
    process.env.WOOMPI_BASE_URL || 'https://api.woompi.com/v1';
  private readonly woompiApiKey = process.env.WOOMPI_API_KEY;
  private readonly woompiPublicKey = process.env.WOOMPI_PUBLIC_KEY;

  constructor(private readonly httpService: HttpService) {}

  async generarLinkPago(
    datos: IGenerarLinkPagoRequest,
  ): Promise<string> {
    try {
      this.logger.log(
        `Generando link de pago Woompi para cuenta de cobro ID: ${datos.cuentaCobroId}`,
      );

      if (!this.woompiApiKey || !this.woompiPublicKey) {
        this.logger.warn(
          'Credenciales de Woompi no configuradas. Usando link de fallback.',
        );
        return this.generarLinkFallback(datos.cuentaCobroId);
      }

      const payload = {
        amount_in_cents: Math.round(datos.valorTotal * 100),
        currency: 'COP',
        reference: datos.referencia,
        description: datos.descripcion,
        customer_email: datos.correoCliente,
        customer_full_name: datos.nombreCliente,
        expiration_date: datos.fechaLimitePago.toISOString(),
        redirect_url: process.env.WOOMPI_REDIRECT_URL || 'https://erika.com/pago-exitoso',
        metadata: {
          cuenta_cobro_id: datos.cuentaCobroId.toString(),
        },
      };

      const respuesta = await firstValueFrom(
        this.httpService.post<{ data: { checkout_url: string } }>(
          `${this.woompiBaseUrl}/transactions`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${this.woompiApiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const linkPago = respuesta.data.data.checkout_url;

      this.logger.log(
        `Link de pago Woompi generado exitosamente para cuenta de cobro ID: ${datos.cuentaCobroId}`,
      );

      return linkPago;
    } catch (error) {
      this.logger.error(
        `Error al generar link de pago Woompi para cuenta de cobro ${datos.cuentaCobroId}:`,
        error,
      );
      this.logger.warn('Usando link de fallback debido al error.');
      return this.generarLinkFallback(datos.cuentaCobroId);
    }
  }

  private generarLinkFallback(cuentaCobroId: number): string {
    const baseUrl = process.env.PAGO_BASE_URL || 'https://pagar.erika.com';
    return `${baseUrl}/${cuentaCobroId}`;
  }
}

