import { Module } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { User } from 'src/user/entities/user.entity';
import { GeographyModule } from 'src/geography/geography.module';
import { JwtAuthModule } from 'src/auth/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProfile, User]),
    GeographyModule,
    JwtAuthModule,
  ],
  controllers: [UserProfileController],
  providers: [UserProfileService],
  exports: [UserProfileService, TypeOrmModule],
})
export class UserProfileModule {}
