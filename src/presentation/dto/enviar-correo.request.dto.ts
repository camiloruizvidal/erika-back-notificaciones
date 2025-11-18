import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PdfAdjuntoDto {
  @ApiProperty({
    description: 'Nombre del archivo PDF',
    example: 'cuenta_cobro_123.pdf',
  })
  @IsString({ message: 'El nombre del archivo debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre del archivo es requerido' })
  nombreArchivo!: string;

  @ApiProperty({
    description: 'Contenido del PDF en base64',
    example:
      'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI...',
  })
  @IsString({ message: 'El contenido base64 debe ser un texto' })
  @IsNotEmpty({ message: 'El contenido base64 es requerido' })
  contenidoBase64!: string;
}

export class EnviarCorreoRequestDto {
  @ApiProperty({
    description: 'Dirección de correo del destinatario',
    example: 'cliente@example.com',
  })
  @IsEmail(
    {},
    { message: 'El destinatario debe ser un correo electrónico válido' },
  )
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
    description: 'Cuerpo del correo (HTML o texto plano)',
    example: '<html><body><h1>Cuenta de Cobro</h1></body></html>',
  })
  @IsString({ message: 'El cuerpo debe ser un texto' })
  @IsNotEmpty({ message: 'El cuerpo es requerido' })
  cuerpo!: string;

  @ApiProperty({
    description: 'Tipo de contenido del cuerpo',
    enum: ['html', 'texto'],
    example: 'html',
  })
  @IsEnum(['html', 'texto'], {
    message: 'El tipo debe ser "html" o "texto"',
  })
  @IsNotEmpty({ message: 'El tipo es requerido' })
  tipo!: 'html' | 'texto';

  @ApiProperty({
    description: 'URL o ruta del PDF adjunto (puede ser URL o ruta local)',
    example: 'https://storage.erika.com/cuentas-cobro/1/2025-11-22/12345.pdf',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La URL/ruta del PDF debe ser un texto' })
  urlPdf?: string;

  @ApiProperty({
    description: 'PDF adjunto en base64',
    type: PdfAdjuntoDto,
    required: false,
  })
  @IsOptional()
  @IsObject({ message: 'El PDF adjunto debe ser un objeto' })
  @ValidateNested()
  @Type(() => PdfAdjuntoDto)
  pdfAdjunto?: PdfAdjuntoDto;
}
