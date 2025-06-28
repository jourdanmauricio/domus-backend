import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePropertyDto {
  @ApiProperty({
    example: 'Hermosa casa en el centro',
    description: 'Título de la propiedad',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 250000,
    description: 'Precio de la propiedad',
  })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({
    example: 'Casa moderna con 3 habitaciones, 2 baños y jardín',
    description: 'Descripción detallada de la propiedad',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'agent-uuid-123',
    description: 'ID del agente responsable de la propiedad',
  })
  @IsString()
  agent: string;
}
