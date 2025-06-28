import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UsersController } from './users.controller';
import { JwtAuthModule } from 'src/auth/jwt.module';
import { Role } from 'src/roles/entities/role.entity';
import { SeederService } from 'src/seeder/seeder.service';
import { UserProfileModule } from 'src/user-profile/user-profile.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    JwtAuthModule,
    UserProfileModule,
  ],
  controllers: [UsersController],
  providers: [SeederService, UserService],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
