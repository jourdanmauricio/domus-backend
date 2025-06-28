// src/user/user.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto, UpdateUserAdminDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/roles/entities/role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, isDeleted: false },
      // select: ['id', 'email', 'roles'],
      relations: ['profile', 'profile.address', 'roles'],
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, isDeleted: false },
      relations: ['roles'],
    });
  }

  async getUserWithProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isDeleted: false },
      relations: ['profile'], // asumí que User tiene "profile" OneToOne
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      where: { isDeleted: false },
      relations: ['profile', 'profile.address'],
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email, isDeleted: true },
    });

    const defaultRole = await this.roleRepository.findOne({
      where: { name: 'user' },
    });

    if (!defaultRole) {
      throw new Error('Rol por defecto "user" no encontrado');
    }

    if (existingUser) {
      // Reactiva la cuenta
      Object.assign(existingUser, {
        ...createUserDto,
        roles: [defaultRole],
        isDeleted: false,
        deletedAt: undefined,
      });
      return this.userRepository.save(existingUser);
    }

    // Crea nuevo usuario si no existe
    const userToSave = {
      ...createUserDto,
      roles: [defaultRole],
      isDeleted: false,
      deletedAt: undefined,
    };

    return this.userRepository.save(userToSave);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto | UpdateUserAdminDto,
    userRoles?: string[],
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Encriptar contraseña si se proporciona
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Validar permisos para cambiar role
    if ('role' in updateUserDto && updateUserDto.role) {
      if (!userRoles || !userRoles.includes('admin')) {
        throw new ForbiddenException('No tienes permisos para cambiar roles');
      }

      const role = await this.roleRepository.findOne({
        where: { name: updateUserDto.role },
      });

      if (!role) {
        throw new NotFoundException(`Role "${updateUserDto.role}" not found`);
      }

      user.roles = [role];
      const { role: _, ...updateData } = updateUserDto;
      Object.assign(user, updateData);
      return this.userRepository.save(user);
    }

    // Actualiza solo los campos proporcionados
    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  async deactivateAccount(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    await this.userRepository.update(userId, {
      isDeleted: true,
      deletedAt: new Date(),
    });
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
  }
}
