import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { Role } from '../roles/entities/role.entity';
import { User } from '../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { rolesData } from './data';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL o ADMIN_PASSWORD no definidos en .env');
    }

    // 1. Crear roles si no existen
    for (const role of rolesData) {
      const exists = await this.roleRepository.findOne({
        where: { id: role.id },
      });

      if (!exists) {
        await this.roleRepository.save(this.roleRepository.create(role));
        this.logger.log(`Rol creado: ${role.name}`);
      } else {
        this.logger.log(`Rol ya existe: ${role.name}`);
      }
    }

    // 2. Buscar el rol admin
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' },
    });

    if (!adminRole) {
      throw new Error('No se encontró el rol admin después de crearlo');
    }

    // 3. Crear usuario admin si no existe
    let adminUser = await this.userRepository.findOne({
      where: { email: adminEmail },
    });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      adminUser = this.userRepository.create({
        email: adminEmail,
        password: hashedPassword,
        roles: [adminRole],
      });
      await this.userRepository.save(adminUser);
      this.logger.log(`Usuario admin creado con email ${adminEmail}`);
    } else {
      this.logger.log('Usuario admin ya existe');
    }
  }
}
