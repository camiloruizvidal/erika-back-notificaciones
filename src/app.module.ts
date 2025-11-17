import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/persistence/database/database.module';
import { KafkaModule } from './infrastructure/messaging/kafka/kafka.module';
import { CuentasCobroConsumerService } from './application/services/cuentas-cobro-consumer.service';
import { CorreosConsumerService } from './application/services/correos-consumer.service';
import { NotificacionesController } from './presentation/controllers/notificaciones.controller';
import { NotificacionesService } from './application/services/notificaciones.service';
import { PdfService } from './application/services/pdf.service';
import { PagosService } from './application/services/pagos.service';
import { ManejadorError } from './utils/manejador-error/manejador-error';

@Module({
  imports: [DatabaseModule, KafkaModule, HttpModule],
  controllers: [AppController, NotificacionesController],
  providers: [
    AppService,
    CuentasCobroConsumerService,
    CorreosConsumerService,
    NotificacionesService,
    PdfService,
    PagosService,
    ManejadorError,
  ],
})
export class AppModule {}
