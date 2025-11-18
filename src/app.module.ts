import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificacionesController } from './presentation/controllers/notificaciones.controller';
import { NotificacionesService } from './application/services/notificaciones.service';
import { ManejadorError } from './utils/manejador-error/manejador-error';

@Module({
  imports: [HttpModule],
  controllers: [AppController, NotificacionesController],
  providers: [
    AppService,
    NotificacionesService,
    ManejadorError,
  ],
})
export class AppModule {}
