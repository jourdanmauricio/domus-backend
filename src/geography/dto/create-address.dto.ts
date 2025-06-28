import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  MaxLength,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({
    example: 'Calle Mayor',
    description: 'Nombre de la calle',
    maxLength: 255,
  })
  @IsString({ message: 'La calle debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre de la calle no puede estar vacío.' })
  @MaxLength(255)
  street: string;

  @ApiProperty({
    example: '123',
    description: 'Número de la calle',
    maxLength: 50,
  })
  @IsString({ message: 'El número de la calle debe ser un texto.' })
  @IsNotEmpty({ message: 'El número de la calle no puede estar vacío.' })
  @MaxLength(50)
  number: string;

  @ApiPropertyOptional({
    example: '2º A',
    description: 'Número de apartamento o piso',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  apartment?: string;

  @ApiPropertyOptional({
    example: 'Centro',
    description: 'Barrio o zona',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  neighborhood?: string;

  @ApiPropertyOptional({
    example: 40.4168,
    description: 'Latitud de la ubicación',
  })
  @IsLatitude({ message: 'El valor proporcionado no es una latitud válida.' })
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    example: -3.7038,
    description: 'Longitud de la ubicación',
  })
  @IsLongitude({ message: 'El valor proporcionado no es una longitud válida.' })
  @IsOptional()
  longitude?: number;

  // En lugar de pasar el objeto City completo, pasamos su ID.
  // El servicio se encargará de buscar y asociar la entidad completa.
  @ApiProperty({
    example: 1,
    description: 'ID de la ciudad (obligatorio)',
  })
  @IsNumber({}, { message: 'El ID de la ciudad debe ser un número.' })
  cityId: number;

  // Igual que con City, pasamos el ID del código postal.
  @ApiProperty({
    example: 1,
    description: 'ID del código postal (obligatorio)',
  })
  @IsNumber({}, { message: 'El ID del código postal debe ser un número.' })
  postalCodeId: number;
}
