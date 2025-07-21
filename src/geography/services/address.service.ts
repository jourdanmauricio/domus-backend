import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from '../entities/address.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { City } from '../entities/city.entity';
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
  ) {}

  async create(dto: CreateAddressDto): Promise<Address> {
    // Buscar y validar la ciudad (obligatoria)
    const city = await this.cityRepository.findOneBy({
      id: dto.cityId,
    });
    if (!city) {
      throw new NotFoundException(`Ciudad con ID ${dto.cityId} no encontrada`);
    }

    // Crear la dirección con el código postal como string
    const address = this.addressRepository.create({
      street: dto.street,
      number: dto.number,
      apartment: dto.apartment,
      neighborhood: dto.neighborhood,
      postalCode: dto.postalCode,
      latitude: dto.latitude ? Number(dto.latitude) : undefined,
      longitude: dto.longitude ? Number(dto.longitude) : undefined,
      nomenclator: dto.nomenclator,
      city: city,
    });

    return this.addressRepository.save(address);
  }

  async update(addressId: number, dto: UpdateAddressDto): Promise<Address> {
    const address = await this.addressRepository.findOneBy({ id: addressId });
    if (!address) throw new NotFoundException('Address not found');

    // Validar y buscar la ciudad si se proporciona
    let city: City | null = null;
    if (dto.cityId) {
      city = await this.cityRepository.findOneBy({ id: dto.cityId.toString() });
      if (!city) {
        throw new NotFoundException(
          `Ciudad con ID ${dto.cityId} no encontrada`,
        );
      }
    }

    // Actualizar solo los campos proporcionados
    Object.assign(address, {
      street: dto.street,
      number: dto.number,
      apartment: dto.apartment,
      neighborhood: dto.neighborhood,
      postalCode: dto.postalCode,
      latitude: dto.latitude ? Number(dto.latitude) : dto.latitude,
      longitude: dto.longitude ? Number(dto.longitude) : dto.longitude,
      nomenclator: dto.nomenclator,
      city: city || address.city,
    });

    return this.addressRepository.save(address);
  }
}
