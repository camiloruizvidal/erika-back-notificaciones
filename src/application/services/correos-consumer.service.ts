import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../../infrastructure/messaging/kafka/kafka.service';
import { EachMessagePayload } from 'kafkajs';
import { IPdfsCuentasCobroGenerados } from '../../domain/interfaces/kafka-messages.interface';
import { Config } from '../../infrastructure/config/config';
import { NotificacionesService } from './notificaciones.service';

@Injectable()
export class CorreosConsumerService implements OnModuleInit {
  private readonly logger = new Logger(CorreosConsumerService.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.suscribirAPdfsGenerados();
  }

  private async suscribirAPdfsGenerados(): Promise<void> {
    await this.kafkaService.crearConsumer(
      `${Config.kafkaGroupId}-correos`,
      'pdfs_cuentas_cobro_generados',
      this.procesarPdfsGenerados.bind(this),
    );
  }

  private async procesarPdfsGenerados(
    payload: EachMessagePayload,
  ): Promise<void> {
    try {
      const mensaje = JSON.parse(
        payload.message.value?.toString() || '{}',
      ) as IPdfsCuentasCobroGenerados;

      this.logger.log(
        `Procesando envío de correos para fecha: ${mensaje.fechaCobro}, cantidad PDFs: ${mensaje.cantidadPdfsGenerados}`,
      );

      const fechaCobro = new Date(mensaje.fechaCobro);

      const cantidadCorreosEnviados =
        await this.notificacionesService.enviarCorreosPorBatch(fechaCobro, 500);

      this.logger.log(
        `Envío de correos completado. Total enviados: ${cantidadCorreosEnviados}`,
      );
    } catch (error) {
      this.logger.error('Error al procesar mensaje de PDFs generados:', error);
      throw error;
    }
  }
}

