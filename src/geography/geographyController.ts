import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GeographyService } from './services/geography.service';
import { Country } from './entities/country.entity';
import { Province } from './entities/province.entity';
import { City } from './entities/city.entity';
import { PostalCode } from './entities/postal-code.entity';
import { CreateCityDto } from './dto/create-city.dto';

@Controller('geography')
export class GeographyController {
  constructor(private readonly geographyService: GeographyService) {}

  @Get('countries')
  async findAllCountries(): Promise<Country[]> {
    return this.geographyService.findAllCountries();
  }

  @Get('provinces')
  async findAllProvinces(): Promise<Province[]> {
    return this.geographyService.findAllProvinces();
  }

  @Get('cities')
  async findCities(): Promise<City[]> {
    return this.geographyService.findAllCities();
  }

  @Get('countries/:countryId/provinces')
  async findProvincesByCountry(
    @Param('countryId') countryId: number,
  ): Promise<Province[]> {
    return this.geographyService.findProvincesByCountry(countryId);
  }

  @Get('provinces/:provinceId/cities')
  async findCitiesByProvince(
    @Param('provinceId') provinceId: string,
  ): Promise<City[]> {
    console.log('provinceId', provinceId);
    return this.geographyService.findCitiesByProvince(provinceId);
  }

  @Get('cities/:cityId/postal-codes')
  async findPostalCodesByCity(
    @Param('cityId') cityId: string,
  ): Promise<PostalCode[]> {
    return this.geographyService.findPostalCodesByCity(cityId);
  }

  @Post('cities')
  async createCity(@Body() createCityDto: CreateCityDto): Promise<City> {
    return this.geographyService.createCityWithPostalCode(createCityDto);
  }
}
