import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificacionesService } from '../../application/services/notificaciones.service';
import { EnviarCorreoRequestDto } from '../dto/enviar-correo.request.dto';
import { ManejadorError } from '../../utils/manejador-error/manejador-error';

@ApiTags('Notificaciones')
@Controller('api/v1/notificaciones')
export class NotificacionesController {
  private readonly logger = new Logger(NotificacionesController.name);

  constructor(
    private readonly notificacionesService: NotificacionesService,
    private readonly manejadorError: ManejadorError,
  ) {}

  @Post('enviar-correo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar correo electrónico',
    description:
      'Endpoint interno para enviar correos. Es agnóstico y no conoce el contexto de negocio.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Correo enviado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error interno del servidor',
  })
  async enviarCorreo(@Body() datos: EnviarCorreoRequestDto): Promise<void> {
    try {
      await this.notificacionesService.enviarCorreo(datos);
    } catch (error) {
      this.logger.error({ error: JSON.stringify(error) });
      this.manejadorError.resolverErrorApi(error);
    }
  }

}

