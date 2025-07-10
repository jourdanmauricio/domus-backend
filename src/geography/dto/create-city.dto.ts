import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCityDto {
  @ApiProperty({
    example: 'CABA',
    description: 'ID único de la ciudad',
    maxLength: 100,
  })
  @IsString({ message: 'El ID debe ser un texto.' })
  @IsNotEmpty({ message: 'El ID de la ciudad no puede estar vacío.' })
  @MaxLength(100)
  id: string;

  @ApiProperty({
    example: 'Ciudad Autónoma de Buenos Aires',
    description: 'Nombre de la ciudad',
    maxLength: 100,
  })
  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre de la ciudad no puede estar vacío.' })
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'AR-B',
    description: 'ID de la provincia a la que pertenece la ciudad',
  })
  @IsString({ message: 'El ID de la provincia debe ser un texto.' })
  @IsNotEmpty({ message: 'El ID de la provincia es obligatorio.' })
  provinceId: string;

  @ApiPropertyOptional({
    example: -34.6037,
    description: 'Latitud de la ciudad',
  })
  @IsLatitude({ message: 'El valor proporcionado no es una latitud válida.' })
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    example: -58.3816,
    description: 'Longitud de la ciudad',
  })
  @IsLongitude({ message: 'El valor proporcionado no es una longitud válida.' })
  @IsOptional()
  longitude?: number;

  @ApiProperty({
    example: 'C1001',
    description: 'Código postal de la ciudad',
    maxLength: 10,
  })
  @IsString({ message: 'El código postal debe ser un texto.' })
  @IsNotEmpty({ message: 'El código postal no puede estar vacío.' })
  @MaxLength(10)
  cp: string;
}
