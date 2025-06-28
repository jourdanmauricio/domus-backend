import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from '../entities/address.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { City } from '../entities/city.entity';
import { PostalCode } from '../entities/postal-code.entity';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(User) // Necesita acceso a los usuarios para vincularlos
    private readonly userRepository: Repository<User>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(PostalCode)
    private readonly postalCodeRepository: Repository<PostalCode>,
  ) {}

  async create(dto: CreateAddressDto): Promise<Address> {
    // Buscar y validar la ciudad (obligatoria)
    const city = await this.cityRepository.findOneBy({ id: dto.cityId });
    if (!city) {
      throw new NotFoundException(`Ciudad con ID ${dto.cityId} no encontrada`);
    }

    // Buscar y validar el código postal (obligatorio)
    const postalCode = await this.postalCodeRepository.findOneBy({
      id: dto.postalCodeId,
    });

    if (!postalCode) {
      throw new NotFoundException(
        `Código postal con ID ${dto.postalCodeId} no encontrado`,
      );
    }

    // Validar coherencia entre ciudad y código postal
    // if (postalCode.city.id !== city.id) {
    //   throw new BadRequestException(
    //     `El código postal ${postalCode.code} no pertenece a la ciudad ${city.name}`,
    //   );
    // }

    // Crear la dirección con las entidades validadas
    const address = this.addressRepository.create({
      street: dto.street,
      number: dto.number,
      apartment: dto.apartment,
      neighborhood: dto.neighborhood,
      latitude: dto.latitude,
      longitude: dto.longitude,
      city: city,
      postalCode: postalCode,
    });

    return this.addressRepository.save(address);
  }

  async update(addressId: number, dto: UpdateAddressDto): Promise<Address> {
    const address = await this.addressRepository.findOneBy({ id: addressId });
    if (!address) throw new NotFoundException('Address not found');

    // Validar y buscar la ciudad si se proporciona
    let city: City | null = null;
    if (dto.cityId) {
      city = await this.cityRepository.findOneBy({ id: dto.cityId });
      if (!city) {
        throw new NotFoundException(
          `Ciudad con ID ${dto.cityId} no encontrada`,
        );
      }
    }

    // Validar y buscar el código postal si se proporciona
    let postalCode: PostalCode | null = null;
    if (dto.postalCodeId) {
      postalCode = await this.postalCodeRepository.findOneBy({
        id: dto.postalCodeId,
      });
      if (!postalCode) {
        throw new NotFoundException(
          `Código postal con ID ${dto.postalCodeId} no encontrado`,
        );
      }
    }

    // Validar coherencia entre ciudad y código postal
    // if (city && postalCode && postalCode.city.id !== city.id) {
    //   throw new BadRequestException(
    //     `El código postal ${postalCode.code} no pertenece a la ciudad ${city.name}`,
    //   );
    // }

    // Actualizar solo los campos proporcionados
    Object.assign(address, {
      street: dto.street,
      number: dto.number,
      apartment: dto.apartment,
      neighborhood: dto.neighborhood,
      latitude: dto.latitude,
      longitude: dto.longitude,
      city: city || address.city,
      postalCode: postalCode || address.postalCode,
    });

    return this.addressRepository.save(address);
  }
}
