import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAddressDto } from 'src/geography/dto/create-address.dto';

export class CreateUserProfileDto {
  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
  })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({
    example: '12345678',
    description: 'Número de identificación personal',
  })
  @IsString()
  dni: string;

  @ApiPropertyOptional({
    example: '+34612345678',
    description: 'Número de teléfono',
  })
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    example: 'https://ejemplo.com/avatar.jpg',
    description: 'URL del avatar del usuario',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({
    example: '1990-01-01',
    description: 'Fecha de nacimiento',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: Date;

  @ApiPropertyOptional({
    example: 'male',
    description: 'Género del usuario',
    enum: ['male', 'female', 'non-binary', 'other'],
  })
  @IsIn(['male', 'female', 'non-binary', 'other'])
  gender: 'male' | 'female' | 'non-binary' | 'other';

  @ApiPropertyOptional({
    example: 'Desarrollador de software con 5 años de experiencia',
    description: 'Biografía del usuario',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    example: 'Española',
    description: 'Nacionalidad del usuario',
  })
  @IsString()
  nationality: string;

  @ApiPropertyOptional({
    example: 'es',
    description: 'Idioma preferido del usuario',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    example: 'light',
    description: 'Preferencia de tema',
    enum: ['light', 'dark'],
  })
  @IsOptional()
  @IsIn(['light', 'dark'])
  themePreference?: 'light' | 'dark';

  @ApiPropertyOptional({
    example: 1,
    description: 'ID de la dirección existente',
  })
  @IsOptional()
  @IsUUID()
  addressId?: number;

  @ApiPropertyOptional({
    description: 'Datos de la dirección (si no se proporciona addressId)',
    type: () => CreateAddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address?: CreateAddressDto;

  @ApiProperty({
    example: 'user-uuid-123',
    description: 'ID del usuario al que pertenece este perfil',
  })
  @IsUUID()
  userId: string;
}
