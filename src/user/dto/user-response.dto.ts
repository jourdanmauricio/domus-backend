import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty({ required: false })
  deletedAt?: Date;

  @ApiProperty({ required: false })
  profile?: {
    id: number;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: {
      id: number;
      street: string;
      number: string;
      apartment?: string;
      neighborhood?: string;
      latitude?: number;
      longitude?: number;
      nomenclator?: string;
      cp: string; // Código postal aplanado
      city: {
        id: string;
        name: string;
        province: {
          id: string;
          name: string;
          country: {
            id: number;
            name: string;
            countryCode: string;
          };
        };
      };
    };
  };

  @ApiProperty({ type: [Object] })
  roles: Array<{
    id: number;
    name: string;
  }>;

  static fromUser(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.isDeleted = user.isDeleted;
    dto.deletedAt = user.deletedAt;
    dto.roles =
      user.roles?.map((role) => ({ id: Number(role.id), name: role.name })) ||
      [];

    if (user.profile) {
      dto.profile = {
        id: Number(user.profile.id),
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        phone: user.profile.phone,
      };

      if (user.profile.address && dto.profile) {
        dto.profile.address = {
          id: user.profile.address.id,
          street: user.profile.address.street,
          number: user.profile.address.number,
          apartment: user.profile.address.apartment,
          neighborhood: user.profile.address.neighborhood,
          latitude: user.profile.address.latitude,
          longitude: user.profile.address.longitude,
          nomenclator: user.profile.address.nomenclator,
          cp: user.profile.address.postalCode?.code || '', // Código postal aplanado
          city: {
            id: user.profile.address.city.id,
            name: user.profile.address.city.name,
            province: {
              id: user.profile.address.city.province.id,
              name: user.profile.address.city.province.name,
              country: {
                id: user.profile.address.city.province.country.id,
                name: user.profile.address.city.province.country.name,
                countryCode:
                  user.profile.address.city.province.country.countryCode,
              },
            },
          },
        };
      }
    }

    return dto;
  }
}
