import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserRole } from './interfaces/jwt-payload.interface';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailService } from '../common/email.service';

interface RecoveryTokenPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);

    if (!user || !user.password) {
      return null;
    }

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(
    email: string,
    password: string,
  ): Promise<{
    access_token: string;
    user: { id: string; email: string; name: string; roles: UserRole[] };
  }> {
    const user = await this.userService.findOneByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.email,
      roles: user.roles.map((r) => r.name as UserRole),
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.email,
        roles: user.roles.map((r) => r.name as UserRole),
      },
    };
  }

  async register(createUserDto: CreateUserDto): Promise<any> {
    const { email, password } = createUserDto;

    const existingUser = await this.userService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    return this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const token = this.jwtService.sign({ email, sub: user.id });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const url = `${frontendUrl}/recovery-password?token=${token}`;

    await this.emailService.sendRecoveryPassword(email, url);

    return { message: 'Email enviado' };
  }

  async resetPassword(
    token: string,
    password: string,
  ): Promise<{ message: string }> {
    const payload = this.jwtService.verify<RecoveryTokenPayload>(token);
    const user = await this.userService.findOne(payload.sub);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.userService.update(user.id, { password });

    return { message: 'Contraseña restablecida' };
  }
}
