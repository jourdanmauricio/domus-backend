import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    example: 'admin',
    description: 'Nombre del rol',
  })
  name: string;

  @ApiProperty({
    example: 'Administrador del sistema',
    description: 'Descripción del rol',
  })
  description: string;
}
