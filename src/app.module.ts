import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/persistence/database/database.module';
import { KafkaModule } from './infrastructure/messaging/kafka/kafka.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { CuentasCobroConsumerService } from './application/services/cuentas-cobro-consumer.service';
import { CorreosConsumerService } from './application/services/correos-consumer.service';
import { NotificacionesController } from './presentation/controllers/notificaciones.controller';
import { NotificacionesService } from './application/services/notificaciones.service';
import { PdfGeneratorService } from './application/services/pdf-generator.service';
import { PagosService } from './application/services/pagos.service';
import { ManejadorError } from './utils/manejador-error/manejador-error';

@Module({
  imports: [DatabaseModule, KafkaModule, HttpModule, StorageModule],
  controllers: [AppController, NotificacionesController],
  providers: [
    AppService,
    CuentasCobroConsumerService,
    CorreosConsumerService,
    NotificacionesService,
    PdfGeneratorService,
    PagosService,
    ManejadorError,
  ],
})
export class AppModule {}
