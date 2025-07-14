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
  UploadedFile,
  BadRequestException,
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
import { UpdateUserProfileDto } from 'src/user-profile/dto/update-user-profile.dto';
import { UserProfileService } from 'src/user-profile/user-profile.service';
import { FileUpload } from 'src/common/decorators/file-upload.decorator';
import { CloudinaryService } from 'src/common/services/cloudinary/cloudinary.service';
import { AvatarResponseDto } from './dto/avatar-response.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
    private readonly cloudinaryService: CloudinaryService,
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
    const user = request.user;
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
    const user = req.user;
    return this.userProfileService.updateByUserId(user.sub, dto);
  }

  @Post('me/avatar')
  @FileUpload('avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({
    status: 201,
    description: 'Avatar uploaded successfully',
    type: AvatarResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadAvatar(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AvatarResponseDto> {
    const user = req.user;

    console.log('me avatar', file);

    // Subir imagen a Cloudinary
    if (!file) {
      throw new BadRequestException('Archivo requerido');
    }

    const uploadFile = file as { originalname: string; buffer: Buffer };
    const { originalname, buffer } = uploadFile;
    const uploadResult = await this.cloudinaryService.uploadProfileImage(
      { originalname, buffer },
      user.sub,
    );

    // Actualizar el perfil del usuario con la nueva URL del avatar
    await this.userProfileService.updateByUserId(user.sub, {
      avatarUrl: uploadResult.secure_url,
    });

    return {
      message: 'Avatar subido exitosamente',
      avatarUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  }

  @Put('me/password')
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password changed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  changePassword(
    @Req() req: Request,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const user = req.user;
    return this.userService.update(user.sub, changePasswordDto, user.roles);
  }

  @Put('me/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate current user account' })
  @ApiResponse({ status: 204, description: 'Account deactivated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  deactivateAccount(@Req() req: Request) {
    const user = req.user;
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
    const user = request.user;

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
