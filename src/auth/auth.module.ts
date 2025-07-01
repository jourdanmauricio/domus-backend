import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtAuthModule } from './jwt.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from '../common/email.service';

@Module({
  imports: [
    JwtAuthModule,
    forwardRef(() => UserModule),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('SMTP_HOST'),
          port: Number(config.get('SMTP_PORT')),
          secure: config.get('SMTP_PORT') === '465',
          auth: {
            user: config.get('EMAILS_FROM'),
            pass: config.get('SMTP_PASSWORD'),
          },
        },
      }),
    }),
  ],
  providers: [AuthService, EmailService],
  controllers: [AuthController],
  exports: [JwtAuthModule],
})
export class AuthModule {
  constructor(private configService: ConfigService) {}
}
