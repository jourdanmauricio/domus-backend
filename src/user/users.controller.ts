import {
  Controller,
  Get,
  UseGuards,
  Req,
  Param,
  ParseUUIDPipe,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnResourceGuard } from '../auth/guards/own-resource.guard';
import { OwnResource } from '../auth/decorators/own-resource.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto, UpdateUserAdminDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Request } from 'express';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { UpdateUserProfileDto } from 'src/user-profile/dto/update-user-profile.dto';
import { UserProfileService } from 'src/user-profile/user-profile.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
  ) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Req() request: Request) {
    const user = request.user as JwtPayload;
    return this.userService.findOne(user.sub);
  }

  @Get(':id')
  @UseGuards(OwnResourceGuard)
  @OwnResource('user')
  @ApiOperation({ summary: 'Get user by ID (admin or own profile)' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new user (admin only)' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateProfile(@Req() req: Request, @Body() dto: UpdateUserProfileDto) {
    const user = req.user as JwtPayload;
    return this.userProfileService.updateByUserId(user.sub, dto);
  }

  @Put('me/password')
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password changed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  changePassword(
    @Req() req: Request,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const user = req.user as JwtPayload;
    return this.userService.update(user.sub, changePasswordDto, user.roles);
  }

  @Put('me/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate current user account' })
  @ApiResponse({ status: 204, description: 'Account deactivated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  deactivateAccount(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.userService.deactivateAccount(user.sub);
  }

  @Put(':id')
  @UseGuards(OwnResourceGuard)
  @OwnResource('user')
  @ApiOperation({ summary: 'Update user (admin or own profile)' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto | UpdateUserAdminDto,
    @Req() request: Request,
  ) {
    const user = request.user as JwtPayload;

    // Si es admin, puede usar UpdateUserAdminDto con role
    // Si es usuario regular, solo puede usar UpdateUserDto sin role
    const isAdmin = user.roles.includes('admin');
    const dto = isAdmin
      ? (updateUserDto as UpdateUserAdminDto)
      : (updateUserDto as UpdateUserDto);

    return this.userService.update(id, dto, user.roles);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (admin only)' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.remove(id);
  }
}
