import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { SeederController } from './seeder.controller';
import { User } from '../user/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { GeographySeederService } from './geography.seeder.service';
import { Country } from 'src/geography/entities/country.entity';
import { Province } from 'src/geography/entities/province.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Country, Province]),
    ConfigModule,
    AuthModule,
  ],
  providers: [SeederService, GeographySeederService],
  controllers: [SeederController],
})
export class SeederModule {}
