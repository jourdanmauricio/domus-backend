import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { User } from 'src/user/entities/user.entity';
import { Address } from 'src/geography/entities/address.entity';
import { CreateAddressDto } from 'src/geography/dto/create-address.dto';
import { UpdateAddressDto } from 'src/geography/dto/update-address.dto';
import { AddressService } from 'src/geography/services/address.service';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,

    private readonly addressService: AddressService,
  ) {}

  async create(dto: CreateUserProfileDto): Promise<UserProfile> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    let address: Address | null = null;

    if (dto.addressId) {
      address = await this.addressRepository.findOne({
        where: { id: dto.addressId },
      });
      if (!address) throw new NotFoundException('Address not found');
    } else if (dto.address) {
      address = await this.addressService.create(dto.address);
    }

    const profile = this.userProfileRepository.create({
      ...dto,
      user,
      address: address ?? undefined,
    });

    return this.userProfileRepository.save(profile);
  }

  async findAll(): Promise<UserProfile[]> {
    return this.userProfileRepository.find();
  }

  async findOne(id: string): Promise<UserProfile> {
    const profile = await this.userProfileRepository.findOne({
      where: { id },
    });

    if (!profile) throw new NotFoundException('User profile not found');
    return profile;
  }

  async findOneForOwnership(id: string): Promise<UserProfile | null> {
    return this.userProfileRepository.findOne({
      where: { id },
    });
  }

  async update(id: string, dto: UpdateUserProfileDto): Promise<UserProfile> {
    const profile = await this.findOne(id);

    if (dto.userId && dto.userId !== profile.user.id) {
      const user = await this.userRepository.findOne({
        where: { id: dto.userId },
      });
      if (!user) throw new NotFoundException('User not found');
      profile.user = user;
    }

    if (
      dto.addressId &&
      (!profile.address || dto.addressId !== profile.address.id)
    ) {
      const address = await this.addressRepository.findOne({
        where: { id: dto.addressId },
      });
      if (!address) throw new NotFoundException('Address not found');
      profile.address = address;
    }

    // Excluir userId, addressId y address para no sobreescribir
    const {
      userId: _userId,
      addressId: _addressId,
      address: _address,
      ...rest
    } = dto;

    Object.assign(profile, rest);

    return this.userProfileRepository.save(profile);
  }

  async updateByUserId(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserProfile> {
    const profile = await this.userProfileRepository.findOne({
      where: { user: { id: userId } },
    });

    if (dto.address) {
      await this.addOrUpdateAddressToUserProfile(userId, dto.address);
    }

    if (!profile) {
      const requiredFields = [
        'firstName',
        'lastName',
        'dni',
        'phone',
        'gender',
        'nationality',
      ];
      const missing = requiredFields.filter((field) => !dto[field]);
      if (missing.length > 0) {
        throw new BadRequestException(
          `Faltan los siguientes campos obligatorios: ${missing.join(', ')}`,
        );
      }

      const createDto: CreateUserProfileDto = {
        ...dto,
        userId,
        firstName: dto.firstName!,
        lastName: dto.lastName!,
        dni: dto.dni!,
        phone: dto.phone!,
        gender: dto.gender!,
        nationality: dto.nationality!,
      };
      return this.create(createDto);
    }

    return this.update(profile.id, dto);
  }

  async remove(id: string): Promise<void> {
    const profile = await this.findOne(id);
    await this.userProfileRepository.remove(profile);
  }

  async addOrUpdateAddressToUserProfile(userId: string, dto: UpdateAddressDto) {
    const profile = await this.userProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['address'],
    });
    if (!profile) throw new NotFoundException('Profile not found');

    if (profile.address) {
      profile.address = await this.addressService.update(
        profile.address.id,
        dto,
      );
    } else {
      if (!dto.street || !dto.number || !dto.cityId || !dto.postalCodeId) {
        throw new BadRequestException(
          'Para crear una nueva dirección, los campos street, number, cityId y postalCodeId son obligatorios',
        );
      }

      const createDto: CreateAddressDto = {
        street: dto.street,
        number: dto.number,
        apartment: dto.apartment,
        neighborhood: dto.neighborhood,
        latitude: dto.latitude,
        longitude: dto.longitude,
        cityId: dto.cityId,
        postalCodeId: dto.postalCodeId,
      };

      profile.address = await this.addressService.create(createDto);
    }

    await this.userProfileRepository.save(profile);
    return profile.address;
  }
}
