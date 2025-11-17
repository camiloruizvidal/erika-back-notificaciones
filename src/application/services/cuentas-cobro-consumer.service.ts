import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../../infrastructure/messaging/kafka/kafka.service';
import { EachMessagePayload } from 'kafkajs';
import { IGeneracionCuentasCobroCompletada } from '../../domain/interfaces/kafka-messages.interface';
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
    await this.suscribirAGeneracionCompletada();
  }

  private async suscribirAGeneracionCompletada(): Promise<void> {
    await this.kafkaService.crearConsumer(
      Config.kafkaGroupId,
      'generacion_cuentas_cobro_completada',
      this.procesarGeneracionCompletada.bind(this),
    );
  }

  private async procesarGeneracionCompletada(
    payload: EachMessagePayload,
  ): Promise<void> {
    try {
      const mensaje = JSON.parse(
        payload.message.value?.toString() || '{}',
      ) as IGeneracionCuentasCobroCompletada;

      this.logger.log(
        `Procesando generación completada para fecha: ${mensaje.fechaCobro}, cantidad: ${mensaje.cantidadGenerada}`,
      );

      const fechaCobro = new Date(mensaje.fechaCobro);

      const cantidadPdfsGenerados =
        await this.notificacionesService.generarPdfsPorBatch(fechaCobro, 500);

      this.logger.log(
        `Generación de PDFs completada. Total generados: ${cantidadPdfsGenerados}`,
      );

      const producer = await this.kafkaService.crearProducer();

      await this.kafkaService.enviarMensaje(
        producer,
        'pdfs_cuentas_cobro_generados',
        {
          fechaCobro: mensaje.fechaCobro,
          cantidadPdfsGenerados,
          timestamp: new Date().toISOString(),
        } as IPdfsCuentasCobroGenerados,
      );

      await producer.disconnect();

      this.logger.log(
        `Evento pdfs_cuentas_cobro_generados publicado. Total: ${cantidadPdfsGenerados}`,
      );
    } catch (error) {
      this.logger.error(
        'Error al procesar mensaje de generación completada:',
        error,
      );
      throw error;
    }
  }
}
