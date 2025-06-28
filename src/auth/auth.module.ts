import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtAuthModule } from './jwt.module';

@Module({
  imports: [JwtAuthModule, forwardRef(() => UserModule)],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [JwtAuthModule],
})
export class AuthModule {}
