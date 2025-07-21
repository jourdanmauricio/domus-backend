import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../entities/country.entity';
import { Province } from '../entities/province.entity';
import { City } from '../entities/city.entity';
import { CreateCityDto } from '../dto/create-city.dto';

@Injectable()
export class GeographyService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async findAllCountries(): Promise<Country[]> {
    return this.countryRepository.find({
      relations: ['provinces'],
    });
  }

  async findAllProvinces(): Promise<Province[]> {
    return this.provinceRepository.find({
      relations: ['country', 'cities'],
    });
  }

  async findAllCities(): Promise<City[]> {
    return this.cityRepository.find({
      relations: ['province', 'province.country'],
    });
  }

  async findProvincesByCountry(countryId: number): Promise<Province[]> {
    return this.provinceRepository.find({
      where: { country: { id: countryId } },
      relations: ['country', 'cities'],
    });
  }

  async findCitiesByProvince(provinceId: string): Promise<City[]> {
    return this.cityRepository.find({
      where: { province: { id: provinceId } },
      relations: ['province', 'province.country'],
    });
  }

  async createCity(dto: CreateCityDto): Promise<City> {
    return this.cityRepository.manager.transaction(async (manager) => {
      // 1. Buscar la provincia
      const province = await manager.findOne(Province, {
        where: { id: dto.provinceId },
      });

      if (!province) {
        throw new NotFoundException(
          `Provincia con ID ${dto.provinceId} no encontrada`,
        );
      }

      // 2. Crear la ciudad
      const city = manager.create(City, {
        id: dto.id,
        name: dto.name,
        province: province,
        latitude: dto.latitude,
        longitude: dto.longitude,
      });

      const savedCity = await manager.save(city);

      // 3. Retornar la ciudad con sus relaciones
      const cityWithRelations = await manager.findOne(City, {
        where: { id: savedCity.id },
        relations: ['province'],
      });

      if (!cityWithRelations) {
        throw new NotFoundException('Error al crear la ciudad');
      }

      return cityWithRelations;
    });
  }
}
