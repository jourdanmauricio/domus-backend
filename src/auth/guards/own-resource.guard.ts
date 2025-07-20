import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { OWN_RESOURCE_KEY } from '../decorators/own-resource.decorator';
import { UserProfileService } from '../../user-profile/user-profile.service';

@Injectable()
export class OwnResourceGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userProfileService: UserProfileService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const resourceType = this.reflector.get<string>(
      OWN_RESOURCE_KEY,
      context.getHandler(),
    );

    if (!resourceType) {
      return true; // Si no hay decorador, permitir acceso
    }

    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Admin puede acceder a cualquier recurso
    if (user.roles.includes('admin')) {
      return true;
    }

    // Obtener el ID del recurso desde los parámetros
    const resourceId = request.params.id;
    if (!resourceId) {
      throw new ForbiddenException('ID de recurso no encontrado');
    }

    // Validar según el tipo de recurso
    switch (resourceType) {
      case 'userProfile':
        return await this.validateUserProfileOwnership(resourceId, user.sub);
      case 'user':
        return resourceId === user.sub;
      default:
        throw new ForbiddenException(
          `Tipo de recurso no soportado: ${resourceType}`,
        );
    }
  }

  private async validateUserProfileOwnership(
    profileId: string,
    userId: string,
  ): Promise<boolean> {
    const profile =
      await this.userProfileService.findOneForOwnership(profileId);
    if (!profile) {
      // Si el perfil no existe, permitir acceso para que el controlador maneje el 404
      return true;
    }
    return profile.user.id === userId;
  }
}
