import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePropertyResponseDto {
  @ApiProperty({
    description: 'ID único de la propiedad',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de la propiedad',
    example: 'Hermosa casa en el centro',
  })
  name: string;

  @ApiProperty({
    description: 'Descripción de la propiedad',
    example: 'Casa moderna con 3 habitaciones, 2 baños y jardín',
  })
  description: string;

  @ApiProperty({
    description: 'Tipo de propiedad',
    example: 'Casa',
  })
  propertyType: string;

  @ApiProperty({
    description: 'Número de registro',
    example: 'REG-123456',
  })
  registryNumber: string;

  @ApiProperty({
    description: 'Intención del propietario',
    example: 'Venta',
  })
  ownerIntention: string;

  @ApiProperty({
    description: 'Condición de la propiedad',
    example: 'Excelente',
  })
  propertyCondition: string;

  @ApiProperty({
    description: 'Cantidad de baños',
    example: '2',
  })
  bathrooms: string;

  @ApiPropertyOptional({
    description: 'URL del thumbnail en Cloudinary',
    example:
      'https://res.cloudinary.com/example/image/upload/v1234567890/properties/550e8400-e29b-41d4-a716-446655440000/images/thumbnail.jpg',
  })
  thumbnail?: string;

  @ApiPropertyOptional({
    description: 'Array de URLs de imágenes en Cloudinary',
    example: [
      'https://res.cloudinary.com/example/image/upload/v1234567890/properties/550e8400-e29b-41d4-a716-446655440000/images/image1.jpg',
      'https://res.cloudinary.com/example/image/upload/v1234567890/properties/550e8400-e29b-41d4-a716-446655440000/images/image2.jpg',
    ],
    type: [String],
  })
  images?: string[];

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de actualización',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}
