import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { PropertyService } from './property.service';
import { PropertiesController } from './properties.controller';
import { JwtAuthModule } from '../auth/jwt.module';

@Module({
  imports: [TypeOrmModule.forFeature([Property]), JwtAuthModule],
  providers: [PropertyService],
  exports: [PropertyService],
  controllers: [PropertiesController],
})
export class PropertyModule {}
