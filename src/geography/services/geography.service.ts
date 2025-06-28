import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../entities/country.entity';
import { Province } from '../entities/province.entity';
import { City } from '../entities/city.entity';
import { PostalCode } from '../entities/postal-code.entity';

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

  async findPostalCodesByCity(cityId: number): Promise<PostalCode[]> {
    return this.postalCodeRepository.find({ where: { city: { id: cityId } } });
  }
}
