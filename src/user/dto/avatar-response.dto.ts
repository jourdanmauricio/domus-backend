import { ApiProperty } from '@nestjs/swagger';

export class AvatarResponseDto {
  @ApiProperty({
    description: 'Mensaje de confirmación',
    example: 'Avatar subido exitosamente',
  })
  message!: string;

  @ApiProperty({
    description: 'URL segura del avatar en Cloudinary',
    example:
      'https://res.cloudinary.com/example/image/upload/v1234567890/users/123/profile/profile_123.jpg',
  })
  avatarUrl!: string;

  @ApiProperty({
    description: 'ID público de la imagen en Cloudinary',
    example: 'users/123/profile/profile_123',
  })
  publicId!: string;
}
