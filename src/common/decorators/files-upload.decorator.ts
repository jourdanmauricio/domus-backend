import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

export function FilesUpload(
  fieldName: string = 'files',
  maxCount: number = 10,
  maxFileSize: number = 5 * 1024 * 1024, // 5MB
) {
  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(fieldName, maxCount, {
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
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
            description: 'Archivos de imagen (JPEG, PNG, GIF, WebP)',
          },
        },
      },
    }),
  );
}
