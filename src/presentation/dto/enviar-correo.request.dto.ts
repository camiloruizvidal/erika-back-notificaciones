import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class EnviarCorreoRequestDto {
  @ApiProperty({
    description: 'Dirección de correo del destinatario',
    example: 'cliente@example.com',
  })
  @IsEmail({}, { message: 'El destinatario debe ser un correo electrónico válido' })
  @IsNotEmpty({ message: 'El destinatario es requerido' })
  destinatario!: string;

  @ApiProperty({
    description: 'Asunto del correo',
    example: 'Cuenta de Cobro - Noviembre 2025',
  })
  @IsString({ message: 'El asunto debe ser un texto' })
  @IsNotEmpty({ message: 'El asunto es requerido' })
  asunto!: string;

  @ApiProperty({
    description: 'Cuerpo del correo en formato HTML',
    example: '<html><body><h1>Cuenta de Cobro</h1></body></html>',
  })
  @IsString({ message: 'El cuerpo HTML debe ser un texto' })
  @IsNotEmpty({ message: 'El cuerpo HTML es requerido' })
  cuerpoHtml!: string;

  @ApiProperty({
    description: 'URL del PDF adjunto',
    example: 'https://storage.erika.com/cuentas-cobro/1/2025-11-22/12345.pdf',
    required: false,
  })
  @IsUrl({}, { message: 'La URL del PDF debe ser una URL válida' })
  urlPdf?: string;
}

