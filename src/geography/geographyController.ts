import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GeographyService } from './services/geography.service';
import { Country } from './entities/country.entity';
import { Province } from './entities/province.entity';
import { City } from './entities/city.entity';
import { PostalCode } from './entities/postal-code.entity';

@Controller('geography')
export class GeographyController {
  constructor(private readonly geographyService: GeographyService) {}

  @Get('countries')
  async findAllCountries(): Promise<Country[]> {
    return this.geographyService.findAllCountries();
  }

  @Get('countries/:countryId/provinces')
  async findProvincesByCountry(
    @Param('countryId', ParseIntPipe) countryId: number,
  ): Promise<Province[]> {
    return this.geographyService.findProvincesByCountry(countryId);
  }

  @Get('provinces')
  async findAllProvinces(): Promise<Province[]> {
    return this.geographyService.findAllProvinces();
  }

  @Get('provinces/:provinceId/cities')
  async findCitiesByProvince(
    @Param('provinceId', ParseIntPipe) provinceId: string,
  ): Promise<City[]> {
    return this.geographyService.findCitiesByProvince(provinceId);
  }

  @Get('cities/:cityId/postal-codes')
  async findPostalCodesByCity(
    @Param('cityId', ParseIntPipe) cityId: number,
  ): Promise<PostalCode[]> {
    return this.geographyService.findPostalCodesByCity(cityId);
  }
}
