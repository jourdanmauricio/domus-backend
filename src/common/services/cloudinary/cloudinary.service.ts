import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, ConfigOptions } from 'cloudinary';

// Declaración de tipo para cloudinary
// declare const cloudinary: {
//   config: (config: any) => void;
//   uploader: {
//     upload_stream: (options: any, callback: (error: any, result: any) => void) => any;
//     destroy: (publicId: string) => Promise<any>;
//   };
//   url: (publicId: string, options: any) => string;
// };

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  transformation?: Record<string, unknown>;
  public_id?: string;
  overwrite?: boolean;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {
    this.initializeCloudinary();
  }

  private initializeCloudinary(): void {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary configuration is missing');
    }

    const configOptions: ConfigOptions = {
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true, // Recomendado para producción
    };

    cloudinary.config(configOptions);
  }

  async uploadImage(
    file: { originalname: string; buffer: Buffer },
    options: CloudinaryUploadOptions = {},
  ): Promise<CloudinaryUploadResult> {
    try {
      this.logger.log(`Subiendo imagen: ${file.originalname}`);

      const uploadOptions = {
        folder: options.folder || 'general',
        transformation: options.transformation,
        public_id: options.public_id,
        overwrite: options.overwrite || false,
      };

      const result = await new Promise<CloudinaryUploadResult>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error: unknown, result: unknown) => {
              if (error) {
                const errorMessage =
                  error instanceof Error
                    ? error.message
                    : 'Error uploading to Cloudinary';
                reject(new Error(errorMessage));
              } else {
                resolve(result as CloudinaryUploadResult);
              }
            },
          );

          uploadStream.end(file.buffer);
        },
      );

      this.logger.log(`Imagen subida exitosamente: ${result.public_id}`);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error al subir imagen: ${errorMessage}`);
      throw error;
    }
  }

  async uploadDocument(
    file: { originalname: string; buffer: Buffer },
    options: CloudinaryUploadOptions = {},
  ): Promise<CloudinaryUploadResult> {
    try {
      this.logger.log(`Subiendo documento: ${file.originalname}`);

      const uploadOptions = {
        folder: options.folder || 'general',
        transformation: options.transformation,
        public_id: options.public_id,
        overwrite: options.overwrite || false,
        resource_type: 'raw' as const, // Para documentos
      };

      const result = await new Promise<CloudinaryUploadResult>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error: unknown, result: unknown) => {
              if (error) {
                const errorMessage =
                  error instanceof Error
                    ? error.message
                    : 'Error uploading to Cloudinary';
                reject(new Error(errorMessage));
              } else {
                resolve(result as CloudinaryUploadResult);
              }
            },
          );

          uploadStream.end(file.buffer);
        },
      );

      this.logger.log(`Documento subido exitosamente: ${result.public_id}`);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error al subir documento: ${errorMessage}`);
      throw error;
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      this.logger.log(`Eliminando imagen: ${publicId}`);

      await cloudinary.uploader.destroy(publicId);

      this.logger.log(`Imagen eliminada exitosamente: ${publicId}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error al eliminar imagen: ${errorMessage}`);
      throw error;
    }
  }

  generateSecureUrl(
    publicId: string,
    options: Record<string, unknown> = {},
  ): string {
    const defaultOptions = {
      secure: true,
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hora por defecto
    };

    return cloudinary.url(publicId, { ...defaultOptions, ...options });
  }

  // Métodos específicos para diferentes tipos de imágenes
  async uploadProfileImage(
    file: { originalname: string; buffer: Buffer },
    userId: string,
  ): Promise<CloudinaryUploadResult> {
    return this.uploadImage(file, {
      folder: `users/${userId}/profile`,
      public_id: `profile_${userId}`,
      overwrite: true,
    });
  }

  async uploadPropertyImage(
    file: { originalname: string; buffer: Buffer },
    propertyId: string,
    _userId: string,
  ): Promise<CloudinaryUploadResult> {
    return this.uploadImage(file, {
      folder: `properties/${propertyId}/images`,
      public_id: `property_${propertyId}_${Date.now()}`,
    });
  }

  async uploadContractImage(
    file: { originalname: string; buffer: Buffer },
    contractId: string,
    _userId: string,
  ): Promise<CloudinaryUploadResult> {
    return this.uploadImage(file, {
      folder: `contracts/${contractId}/images`,
      public_id: `contract_${contractId}_${Date.now()}`,
    });
  }

  async uploadPropertyDocument(
    file: { originalname: string; buffer: Buffer },
    propertyId: string,
    _userId: string,
  ): Promise<CloudinaryUploadResult> {
    return this.uploadDocument(file, {
      folder: `properties/${propertyId}/documents`,
      public_id: `property_${propertyId}_doc_${Date.now()}`,
    });
  }
}
