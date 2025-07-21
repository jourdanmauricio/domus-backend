import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAddressDto } from 'src/geography/dto/create-address.dto';

export class CreatePropertyDto {
  @ApiPropertyOptional({
    example: 'Hermosa casa en el centro',
    description: 'Nombre de la propiedad',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Casa moderna con 3 habitaciones, 2 baños y jardín',
    description: 'Descripción detallada de la propiedad',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'Casa',
    description: 'Tipo de propiedad',
  })
  @IsString()
  @IsOptional()
  propertyType?: string;

  @ApiPropertyOptional({
    example: 'REG-123456',
    description: 'Número de registro de la propiedad',
  })
  @IsString()
  @IsOptional()
  registryNumber?: string;

  @ApiPropertyOptional({
    example: 'A-101',
    description: 'Unidad funcional',
  })
  @IsString()
  @IsOptional()
  functionalUnit?: string;

  @ApiPropertyOptional({
    example: 'Venta',
    description: 'Intención del propietario',
  })
  @IsString()
  @IsOptional()
  ownerIntention?: string;

  @ApiPropertyOptional({
    example: 'Disponible',
    description: 'Estado comercial',
  })
  @IsString()
  @IsOptional()
  commercialStatus?: string;

  @ApiPropertyOptional({
    example: 'Excelente',
    description: 'Condición de la propiedad',
  })
  @IsString()
  @IsOptional()
  propertyCondition?: string;

  @ApiPropertyOptional({
    example: '120',
    description: 'Metros cubiertos',
  })
  @IsString()
  @IsOptional()
  coveredMeters?: string;

  @ApiPropertyOptional({
    example: '50',
    description: 'Metros descubiertos',
  })
  @IsString()
  @IsOptional()
  uncoveredMeters?: string;

  @ApiPropertyOptional({
    example: '3',
    description: 'Cantidad de habitaciones',
  })
  @IsString()
  @IsOptional()
  rooms?: string;

  @ApiPropertyOptional({
    example: '2',
    description: 'Cantidad de baños',
  })
  @IsString()
  @IsOptional()
  bathrooms?: string;

  @ApiPropertyOptional({
    example: '2020',
    description: 'Año de construcción',
  })
  @IsString()
  @IsOptional()
  yearOfConstruction?: string;

  @ApiPropertyOptional({
    example: 'ELEC-123456',
    description: 'Identificador de electricidad',
  })
  @IsString()
  @IsOptional()
  electricityIdentifier?: string;

  @ApiPropertyOptional({
    example: 'GAS-123456',
    description: 'Identificador de gas',
  })
  @IsString()
  @IsOptional()
  gasIdentifier?: string;

  @ApiPropertyOptional({
    example: 'ABL-123456',
    description: 'Identificador ABL',
  })
  @IsString()
  @IsOptional()
  ABLIdentifier?: string;

  @ApiPropertyOptional({
    example:
      'https://res.cloudinary.com/example/image/upload/v123/thumbnail.jpg',
    description: 'URL del thumbnail de la propiedad',
  })
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiPropertyOptional({
    example: [
      'https://res.cloudinary.com/example/image/upload/v123/image1.jpg',
      'https://res.cloudinary.com/example/image/upload/v123/image2.jpg',
    ],
    description: 'Array de URLs de imágenes de la propiedad',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({
    example: [
      'https://res.cloudinary.com/example/document/upload/v123/document1.pdf',
      'https://res.cloudinary.com/example/document/upload/v123/document2.xlsx',
    ],
    description: 'Array de URLs de documentos de la propiedad',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documents?: string[];

  @ApiPropertyOptional({
    example: 'Administración Central',
    description: 'Nombre de la administración',
  })
  @IsString()
  @IsOptional()
  administration?: string;

  @ApiPropertyOptional({
    example: '+54 11 1234-5678',
    description: 'Teléfono de la administración',
  })
  @IsString()
  @IsOptional()
  administrationPhone?: string;

  @ApiPropertyOptional({
    example: 'admin@example.com',
    description: 'Email de la administración',
  })
  @IsEmail()
  @IsOptional()
  administrationEmail?: string;

  @ApiPropertyOptional({
    example: 'Av. Corrientes 1234, CABA',
    description: 'Dirección de la administración',
  })
  @IsString()
  @IsOptional()
  administrationAddress?: string;

  @ApiPropertyOptional({
    example: 'Juan Pérez',
    description: 'Nombre del propietario',
  })
  @IsString()
  @IsOptional()
  ownerName?: string;

  @ApiPropertyOptional({
    example: '+54 11 9876-5432',
    description: 'Teléfono del propietario',
  })
  @IsString()
  @IsOptional()
  ownerPhone?: string;

  @ApiPropertyOptional({
    example: '0000003100000000000001',
    description: 'CBU del propietario',
  })
  @IsString()
  @IsOptional()
  ownerCBU?: string;

  @ApiPropertyOptional({
    example: 'juan.perez',
    description: 'Alias del propietario',
  })
  @IsString()
  @IsOptional()
  ownerAlias?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Si tiene expensas',
  })
  @IsBoolean()
  @IsOptional()
  hasExpenses?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Si tiene expensas extraordinarias',
  })
  @IsBoolean()
  @IsOptional()
  hasExtraordinaryExpenses?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Si tiene cocina',
  })
  @IsBoolean()
  @IsOptional()
  hasKitchen?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Si tiene patio',
  })
  @IsBoolean()
  @IsOptional()
  hasPatio?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Si tiene parrilla',
  })
  @IsBoolean()
  @IsOptional()
  hasBarbecue?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Si tiene terraza',
  })
  @IsBoolean()
  @IsOptional()
  hasTerrace?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Si tiene pileta',
  })
  @IsBoolean()
  @IsOptional()
  hasPool?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Si tiene jardín',
  })
  @IsBoolean()
  @IsOptional()
  hasGarden?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Si tiene balcón',
  })
  @IsBoolean()
  @IsOptional()
  hasBalcony?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Si está amueblada',
  })
  @IsBoolean()
  @IsOptional()
  hasFurnished?: boolean;

  @ApiPropertyOptional({
    example: 'Incluye servicios básicos',
    description: 'Comentarios sobre servicios',
  })
  @IsString()
  @IsOptional()
  servicesComment?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Si tiene zoom',
  })
  @IsBoolean()
  @IsOptional()
  hasZoom?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Si tiene estacionamiento',
  })
  @IsBoolean()
  @IsOptional()
  hasParking?: boolean;

  @ApiPropertyOptional({
    description: 'Dirección de la propiedad',
  })
  @ValidateNested()
  @Type(() => CreateAddressDto)
  @IsOptional()
  address?: CreateAddressDto;

  @ApiPropertyOptional({
    oneOf: [
      {
        type: 'string',
        example:
          '{"name":"Casa","description":"...","address":{"street":"..."}}',
        description:
          'JSON string con los datos de la propiedad (para FormData)',
      },
      {
        type: 'object',
        example: {
          name: 'Casa',
          description: '...',
          address: { street: '...' },
        },
        description: 'Objeto con los datos de la propiedad (para FormData)',
      },
    ],
  })
  @IsOptional()
  data?: string | CreatePropertyDto;
}
