import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../entities/country.entity';
import { Province } from '../entities/province.entity';
import { City } from '../entities/city.entity';
import { PostalCode } from '../entities/postal-code.entity';
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
    @InjectRepository(PostalCode)
    private readonly postalCodeRepository: Repository<PostalCode>,
  ) {}

  async findAllCountries(): Promise<Country[]> {
    return this.countryRepository.find();
  }

  async findAllProvinces(): Promise<Province[]> {
    return this.provinceRepository.find();
  }

  async findAllCities(): Promise<City[]> {
    return this.cityRepository.find();
  }

  async findProvincesByCountry(countryId: number): Promise<Province[]> {
    return this.provinceRepository.find({
      where: { country: { id: countryId } },
    });
  }

  async findCitiesByProvince(provinceId: string): Promise<City[]> {
    return this.cityRepository.find({
      where: { province: { id: provinceId } },
    });
  }

  async findPostalCodesByCity(cityId: string): Promise<PostalCode[]> {
    return this.postalCodeRepository.find({ where: { city: { id: cityId } } });
  }

  async createCity(createCityDto: CreateCityDto): Promise<City> {
    const city = this.cityRepository.create(createCityDto);
    return this.cityRepository.save(city);
  }

  async createCityWithPostalCode(dto: CreateCityDto): Promise<City> {
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

      // 3. Crear el código postal
      const postalCode = manager.create(PostalCode, {
        code: dto.cp,
        city: savedCity,
      });

      await manager.save(postalCode);

      // 4. Retornar la ciudad con sus relaciones
      const cityWithRelations = await manager.findOne(City, {
        where: { id: savedCity.id },
        relations: ['province', 'postalCodes'],
      });

      if (!cityWithRelations) {
        throw new NotFoundException('Error al crear la ciudad');
      }

      return cityWithRelations;
    });
  }
}
