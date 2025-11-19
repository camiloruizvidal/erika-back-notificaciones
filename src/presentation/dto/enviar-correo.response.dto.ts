import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class EnviarCorreoResponseDto {
  @ApiProperty({
    description: 'Indica si el correo fue enviado exitosamente',
    type: Boolean,
    example: true,
  })
  @Expose()
  enviado!: boolean;
}
