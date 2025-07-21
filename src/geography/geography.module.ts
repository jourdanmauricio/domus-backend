import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { Province } from './entities/province.entity';
import { City } from './entities/city.entity';
import { Address } from './entities/address.entity';
import { User } from '../user/entities/user.entity';
import { GeographyService } from './services/geography.service';
import { AddressService } from './services/address.service';
import { GeographyController } from './geographyController';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Country, Province, City, Address, User]),
    forwardRef(() => AuthModule),
  ],
  controllers: [GeographyController],
  providers: [GeographyService, AddressService],
  exports: [TypeOrmModule, GeographyService, AddressService],
})
export class GeographyModule {}
