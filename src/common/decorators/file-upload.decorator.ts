import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

export function FileUpload(
  fieldName: string = 'file',
  maxFileSize: number = 5 * 1024 * 1024, // 5MB
) {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: undefined, // Usar memoria
        limits: {
          fileSize: maxFileSize,
        },
        fileFilter: (req, file, cb) => {
          const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
          ];

          if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(
              new Error(
                `Tipo de archivo no permitido. Tipos permitidos: ${allowedMimeTypes.join(
                  ', ',
                )}`,
              ),
              false,
            );
          }
          cb(null, true);
        },
      }),
    ),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary',
            description: 'Archivo de imagen (JPEG, PNG, GIF, WebP)',
          },
        },
      },
    }),
  );
}
