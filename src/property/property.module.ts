import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { PropertyService } from './property.service';
import { PropertiesController } from './properties.controller';
import { JwtAuthModule } from '../auth/jwt.module';
import { CloudinaryModule } from '../common/services/cloudinary/cloudinary.module';
import { GeographyModule } from '../geography/geography.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Property]),
    JwtAuthModule,
    CloudinaryModule,
    GeographyModule,
  ],
  providers: [PropertyService],
  exports: [PropertyService],
  controllers: [PropertiesController],
})
export class PropertyModule {}
