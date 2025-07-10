import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { Property } from './property/entities/property.entity';
import { Address } from './geography/entities/address.entity';
import { City } from './geography/entities/city.entity';
import { Province } from './geography/entities/province.entity';
import { Country } from './geography/entities/country.entity';
import { PostalCode } from './geography/entities/postal-code.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PropertyModule } from './property/property.module';
import { GeographyModule } from './geography/geography.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { Role } from './roles/entities/role.entity';
import { validationSchema } from './config/validation';
import { SeederModule } from './seeder/seeder.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { UserProfile } from './user-profile/entities/user-profile.entity';
import { CloudinaryModule } from './common/services/cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [
          User,
          UserProfile,
          Property,
          Address,
          City,
          Province,
          Country,
          PostalCode,
          Role,
        ],
        synchronize: true,
      }),
    }),
    AuthModule,
    UserModule,
    PropertyModule,
    GeographyModule,
    RolesModule,
    SeederModule,
    UserProfileModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
