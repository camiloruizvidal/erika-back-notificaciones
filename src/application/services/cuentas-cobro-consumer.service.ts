import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../../infrastructure/messaging/kafka/kafka.service';
import { EachMessagePayload } from 'kafkajs';
import { IPdfsCuentasCobroGenerados } from '../../domain/interfaces/kafka-messages.interface';
import { Config } from '../../infrastructure/config/config';
import { NotificacionesService } from './notificaciones.service';

@Injectable()
export class CuentasCobroConsumerService implements OnModuleInit {
  private readonly logger = new Logger(CuentasCobroConsumerService.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.suscribirAPdfsGenerados();
  }

  private async suscribirAPdfsGenerados(): Promise<void> {
    if (!Config.kafkaGroupId || !Config.kafkaBroker) {
      this.logger.warn(
        'Kafka Group ID o Broker no configurados. El consumidor de correos no se iniciará.',
      );
      return;
    }
    await this.kafkaService.crearConsumer(
      Config.kafkaGroupId,
      'pdfs_cuentas_cobro_generados',
      this.procesarPdfsGenerados.bind(this),
    );
  }

  private async procesarPdfsGenerados(
    payload: EachMessagePayload,
  ): Promise<void> {
    this.logger.log('=== MENSAJE KAFKA RECIBIDO EN NOTIFICACIONES ===');
    this.logger.log(`Topic: pdfs_cuentas_cobro_generados`);
    this.logger.log(`Partition: ${payload.partition}`);
    this.logger.log(`Offset: ${payload.message.offset}`);
    this.logger.log(`Value: ${payload.message.value?.toString()}`);

    try {
      const mensaje = JSON.parse(
        payload.message.value?.toString() || '{}',
      ) as IPdfsCuentasCobroGenerados;

      this.logger.log(
        `Procesando PDFs generados para fecha: ${mensaje.fechaCobro}, cantidad: ${mensaje.cantidadPdfsGenerados}`,
      );

      const fechaCobro = new Date(mensaje.fechaCobro);

      const cantidadCorreosEnviados =
        await this.notificacionesService.enviarCorreosPorBatch(fechaCobro, 500);

      this.logger.log(
        `Envío de correos completado. Total enviados: ${cantidadCorreosEnviados}`,
      );
    } catch (error) {
      const mensajeError =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        'Error desconocido';
      this.logger.error(
        `Error al procesar mensaje de PDFs generados: ${mensajeError}`,
      );
      throw error;
    }
  }
}
