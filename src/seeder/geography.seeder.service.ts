import { Injectable } from '@nestjs/common';
import { countriesData, provincesData } from './data';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from 'src/geography/entities/country.entity';
import { Repository } from 'typeorm';
import { Province } from 'src/geography/entities/province.entity';

@Injectable()
export class GeographySeederService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,
  ) {}
  async seed() {
    await this.seedCountries();
    await this.seedProvinces();
    return { message: 'Database seeded successfully' };
  }

  private async seedCountries() {
    for (const countryData of countriesData) {
      const countryExists = await this.countryRepository.findOne({
        where: { countryCode: countryData.countryCode },
      });

      if (!countryExists) {
        await this.countryRepository.save(
          this.countryRepository.create(countryData),
        );
      }
    }
  }

  private async seedProvinces() {
    const argentina = await this.countryRepository.findOne({
      where: { countryCode: 'AR' },
    });

    if (!argentina) {
      throw new Error('Country Argentina not found for seeding provinces');
    }

    for (const provinceData of provincesData) {
      const provinceExists = await this.provinceRepository.findOne({
        where: { id: provinceData.id },
      });

      if (!provinceExists) {
        await this.provinceRepository.save(
          this.provinceRepository.create({
            id: provinceData.id,
            name: provinceData.nombre,
            latitude: provinceData.lat,
            longitude: provinceData.lon,
            defaultZoom: 10,
            country: argentina,
          }),
        );
      }
    }
  }
}
