import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// DTO base sin role para usuarios regulares
export class UpdateUserDto extends PartialType(CreateUserDto) {}

// DTO extendido con role para admins
export class UpdateUserAdminDto extends UpdateUserDto {
  @ApiPropertyOptional({
    example: 'agent',
    description: 'Rol del usuario (solo para administradores)',
    enum: ['admin', 'agent', 'client', 'user'],
  })
  @IsOptional()
  @IsIn(['admin', 'agent', 'client', 'user'])
  role?: 'admin' | 'agent' | 'client' | 'user';
}
