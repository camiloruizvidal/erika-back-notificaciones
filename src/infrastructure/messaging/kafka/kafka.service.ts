import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import {
  Kafka,
  Consumer,
  KafkaConfig,
  EachMessagePayload,
  Producer,
} from 'kafkajs';
import { Config } from '../../config/config';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private consumers: Map<string, Consumer> = new Map();

  constructor() {
    const kafkaConfig: KafkaConfig = {
      clientId: Config.kafkaClientId!,
      brokers: [Config.kafkaBroker],
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    };

    this.kafka = new Kafka(kafkaConfig);
  }

  onModuleInit(): void {
    this.logger.log('Kafka service inicializado');
  }

  async onModuleDestroy(): Promise<void> {
    for (const [topic, consumer] of this.consumers.entries()) {
      try {
        await consumer.disconnect();
        this.logger.log(`Consumer desconectado del topic: ${topic}`);
      } catch (error) {
        this.logger.error(
          `Error al desconectar consumer del topic ${topic}:`,
          error,
        );
      }
    }
  }

  async crearConsumer(
    groupId: string,
    topic: string,
    handler: (mensaje: EachMessagePayload) => Promise<void>,
  ): Promise<void> {
    try {
      const consumer = this.kafka.consumer({ groupId });
      await consumer.connect();
      await consumer.subscribe({ topic, fromBeginning: false });

      await consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          try {
            this.logger.log(
              `Mensaje recibido del topic: ${topic}, partición: ${payload.partition}`,
            );
            await handler(payload);
          } catch (error) {
            this.logger.error(
              `Error al procesar mensaje del topic ${topic}:`,
              error,
            );
            throw error;
          }
        },
      });

      this.consumers.set(topic, consumer);
      this.logger.log(`Consumer creado y suscrito al topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Error al crear consumer para topic ${topic}:`, error);
      throw error;
    }
  }

  async crearProducer(): Promise<Producer> {
    const producer = this.kafka.producer();
    await producer.connect();
    this.logger.log('Kafka producer creado y conectado');
    return producer;
  }

  async enviarMensaje(
    producer: Producer,
    topic: string,
    mensaje: Record<string, unknown> | object,
  ): Promise<void> {
    try {
      await producer.send({
        topic,
        messages: [
          {
            key: `${topic}-${Date.now()}`,
            value: JSON.stringify(mensaje),
            timestamp: Date.now().toString(),
          },
        ],
      });
      this.logger.log(`Mensaje enviado al topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Error al enviar mensaje al topic ${topic}:`, error);
      throw error;
    }
  }
}
