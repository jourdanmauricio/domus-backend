import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { CreateAddressDto } from 'src/geography/dto/create-address.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { OwnResourceGuard } from 'src/auth/guards/own-resource.guard';
import { OwnResource } from 'src/auth/decorators/own-resource.decorator';

@ApiTags('user-profile')
@UseGuards(JwtAuthGuard)
@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener todos los perfiles de usuario' })
  @ApiResponse({ status: 200, description: 'Lista de perfiles de usuario' })
  findAll() {
    return this.userProfileService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener perfil de usuario por ID' })
  @ApiResponse({ status: 200, description: 'Perfil de usuario encontrado' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del perfil de usuario' })
  findOne(@Param('id') id: string) {
    return this.userProfileService.findOne(id);
  }

  @Post()
  @UseGuards(OwnResourceGuard)
  @OwnResource('userProfile')
  @ApiOperation({ summary: 'Crear nuevo perfil de usuario' })
  @ApiResponse({
    status: 201,
    description: 'Perfil de usuario creado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createUserProfileDto: CreateUserProfileDto) {
    return this.userProfileService.create(createUserProfileDto);
  }

  @Post(':userId/address')
  @ApiOperation({ summary: 'Agregar dirección a un perfil de usuario' })
  @ApiResponse({ status: 201, description: 'Dirección agregada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  addAddressToUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.userProfileService.addOrUpdateAddressToUserProfile(
      userId,
      createAddressDto,
    );
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar perfil de usuario' })
  @ApiResponse({
    status: 200,
    description: 'Perfil de usuario actualizado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del perfil de usuario' })
  update(
    @Param('id') id: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.userProfileService.update(id, updateUserProfileDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar perfil de usuario' })
  @ApiResponse({
    status: 200,
    description: 'Perfil de usuario eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  @ApiParam({ name: 'id', description: 'ID del perfil de usuario' })
  remove(@Param('id') id: string) {
    return this.userProfileService.remove(id);
  }
}
