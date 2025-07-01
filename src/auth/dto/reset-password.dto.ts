import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Email del usuario',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: '123456',
    description: 'Nueva contraseña',
  })
  @IsString()
  token: string;
}
