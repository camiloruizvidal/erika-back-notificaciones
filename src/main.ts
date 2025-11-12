import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { formatearErroresValidacion } from './utils/functions/formatear-errores-validacion';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: errors => {
        const mensajesValidaciones = formatearErroresValidacion(errors);
        return new BadRequestException(mensajesValidaciones);
      }
    })
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
