import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UploadedFiles,
  BadRequestException,
  UseInterceptors,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreatePropertyDto } from './dto/create-property.dto';
import { CreatePropertyResponseDto } from './dto/create-property-response.dto';
import { PropertyService } from './property.service';
import { Property } from './entities/property.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UpdatePropertyDto } from './dto/update-property.dto';

@ApiTags('properties')
@ApiBearerAuth()
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 },
        { name: 'images', maxCount: 50 },
        { name: 'documents', maxCount: 50 },
      ],
      {
        storage: undefined,
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB para documentos
        fileFilter: (req, file, cb) => {
          if (!file) return cb(null, true);

          // Tipos permitidos para imágenes
          const allowedImageTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
          ];

          // Tipos permitidos para documentos
          const allowedDocumentTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv',
            'application/rtf',
          ];

          const allAllowedTypes = [
            ...allowedImageTypes,
            ...allowedDocumentTypes,
          ];

          if (!allAllowedTypes.includes(file.mimetype)) {
            return cb(new Error('Tipo de archivo no permitido'), false);
          }
          cb(null, true);
        },
      },
    ),
  )
  @ApiOperation({
    summary: 'Crear nueva propiedad (con thumbnail y/o imágenes)',
  })
  @ApiResponse({
    status: 201,
    description: 'Propiedad creada exitosamente',
    type: CreatePropertyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o archivo no válido',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          oneOf: [
            {
              type: 'string',
              description:
                'JSON string con los datos de la propiedad (para FormData)',
              example:
                '{"name":"Casa","description":"...","address":{"street":"..."}}',
            },
            {
              type: 'object',
              description:
                'Objeto con los datos de la propiedad (para JSON directo)',
              example: {
                name: 'Casa',
                description: '...',
                address: { street: '...' },
              },
            },
          ],
        },
        thumbnail: {
          type: 'string',
          format: 'binary',
          description:
            'Imagen thumbnail de la propiedad (JPEG, PNG, GIF, WebP)',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description:
            'Array de imágenes de la propiedad (JPEG, PNG, GIF, WebP) - máximo 10',
        },
        documents: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description:
            'Array de documentos de la propiedad (PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, RTF) - máximo 10',
        },
      },
      required: ['data'],
    },
  })
  async create(
    @Body() createPropertyDto: CreatePropertyDto,
    @UploadedFiles()
    files?: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
  ): Promise<Property> {
    // Extraer archivos del objeto files
    const thumbnailFile = files?.thumbnail?.[0];
    const imageFiles = files?.images || [];
    const documentFiles = files?.documents || [];

    // Validar archivo thumbnail si está presente
    if (thumbnailFile && !thumbnailFile.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'El archivo thumbnail debe ser una imagen válida',
      );
    }

    // Validar archivos de imágenes si están presentes
    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        if (!file.mimetype.startsWith('image/')) {
          throw new BadRequestException(
            'Todos los archivos de imágenes deben ser imágenes válidas',
          );
        }
      }
    }

    // Validar archivos de documentos si están presentes
    if (documentFiles && documentFiles.length > 0) {
      const allowedDocumentTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        'application/rtf',
      ];

      for (const file of documentFiles) {
        if (!allowedDocumentTypes.includes(file.mimetype)) {
          throw new BadRequestException(
            'Todos los archivos de documentos deben ser documentos válidos (PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, RTF)',
          );
        }
      }
    }

    // Procesar el DTO para manejar FormData con JSON string
    let processedDto = createPropertyDto;

    if (typeof createPropertyDto === 'object' && 'data' in createPropertyDto) {
      if (typeof createPropertyDto.data === 'string') {
        try {
          const jsonData = JSON.parse(
            createPropertyDto.data,
          ) as CreatePropertyDto;
          processedDto = jsonData;
        } catch (_error) {
          throw new BadRequestException(
            'El campo data debe contener un JSON válido',
          );
        }
      } else {
        processedDto = createPropertyDto.data;
      }
    }

    // Usar el método que maneja thumbnail, imágenes y documentos
    return this.propertyService.createWithImagesAndDocuments(
      processedDto,
      thumbnailFile,
      imageFiles,
      documentFiles,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las propiedades' })
  @ApiResponse({ status: 200, description: 'Lista de propiedades' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
    example: 10,
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Precio mínimo',
    example: 100000,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Precio máximo',
    example: 500000,
  })
  @ApiQuery({
    name: 'bedrooms',
    required: false,
    description: 'Número de habitaciones',
    example: 3,
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('bedrooms') bedrooms?: number,
  ): Promise<{ data: Property[]; total: number }> {
    return this.propertyService.findAll({
      page,
      limit,
      minPrice,
      maxPrice,
      bedrooms,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una propiedad por su ID' })
  @ApiResponse({ status: 200, description: 'Propiedad encontrada' })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  async findOne(@Param('id') id: string): Promise<Property> {
    return this.propertyService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 },
        { name: 'images', maxCount: 10 },
        { name: 'documents', maxCount: 10 },
      ],
      {
        storage: undefined,
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
        fileFilter: (req, file, cb) => {
          if (!file) return cb(null, true);

          // Tipos permitidos para imágenes
          const allowedImageTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
          ];

          // Tipos permitidos para documentos
          const allowedDocumentTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
            'application/vnd.ms-excel', // xls
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
            'application/msword', // doc
            'text/plain', // txt
            'text/csv', // csv
            'application/json', // json
            'application/xml', // xml
          ];

          // Verificar si es imagen o documento
          if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, true);
          } else if (allowedDocumentTypes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            return cb(new Error('Tipo de archivo no permitido'), false);
          }
        },
      },
    ),
  )
  @ApiOperation({
    summary: 'Actualizar una propiedad por su ID (con thumbnail opcional)',
  })
  @ApiResponse({ status: 200, description: 'Propiedad actualizada' })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o archivo no válido',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: {
          oneOf: [
            {
              type: 'string',
              description:
                'JSON string con los datos de la propiedad (para FormData)',
              example:
                '{"name":"Casa","description":"...","address":{"street":"..."}}',
            },
            {
              type: 'object',
              description:
                'Objeto con los datos de la propiedad (para JSON directo)',
              example: {
                name: 'Casa',
                description: '...',
                address: { street: '...' },
              },
            },
          ],
        },
        thumbnail: {
          type: 'string',
          format: 'binary',
          description:
            'Imagen thumbnail de la propiedad (JPEG, PNG, GIF, WebP)',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description:
            'Array de imágenes de la propiedad (JPEG, PNG, GIF, WebP) - máximo 10 archivos',
        },
        documents: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description:
            'Array de documentos de la propiedad (PDF, XLSX, DOCX, TXT, CSV, JSON, XML) - máximo 10 archivos',
        },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @UploadedFiles()
    files?: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
  ): Promise<Property> {
    // Extraer archivos del objeto files
    const thumbnailFile = files?.thumbnail?.[0];
    const imageFiles = files?.images;
    const documentFiles = files?.documents;

    // Validar archivo thumbnail si está presente
    if (thumbnailFile && !thumbnailFile.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'El archivo thumbnail debe ser una imagen válida',
      );
    }

    // Validar archivos de imágenes si están presentes
    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        if (!file.mimetype.startsWith('image/')) {
          throw new BadRequestException(
            'Todos los archivos de imágenes deben ser imágenes válidas',
          );
        }
      }
    }

    // Validar archivos de documentos si están presentes
    if (documentFiles && documentFiles.length > 0) {
      const allowedDocumentTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'text/csv',
        'application/json',
        'application/xml',
      ];

      for (const file of documentFiles) {
        if (!allowedDocumentTypes.includes(file.mimetype)) {
          throw new BadRequestException(
            'Todos los archivos de documentos deben ser documentos válidos (PDF, XLSX, DOCX, TXT, CSV, JSON, XML)',
          );
        }
      }
    }

    // Procesar el DTO para manejar FormData con JSON string
    let processedDto = updatePropertyDto;

    if (typeof updatePropertyDto === 'object' && 'data' in updatePropertyDto) {
      if (typeof updatePropertyDto.data === 'string') {
        try {
          const jsonData = JSON.parse(
            updatePropertyDto.data,
          ) as UpdatePropertyDto;
          processedDto = jsonData;
        } catch (_error) {
          throw new BadRequestException(
            'El campo data debe contener un JSON válido',
          );
        }
      } else {
        processedDto = updatePropertyDto.data;
      }
    }

    // Limpiar campos de archivos del DTO para evitar errores de validación
    if (processedDto.images && Array.isArray(processedDto.images)) {
      processedDto.images = processedDto.images.filter(
        (img) => typeof img === 'string',
      );
    }

    if (processedDto.documents && Array.isArray(processedDto.documents)) {
      processedDto.documents = processedDto.documents.filter(
        (doc) => typeof doc === 'string',
      );
    }

    // Usar el método que maneja la actualización con thumbnail, imágenes y documentos
    return this.propertyService.updateWithThumbnail(
      id,
      processedDto,
      thumbnailFile,
      imageFiles,
      documentFiles,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar una propiedad por su ID' })
  @ApiResponse({ status: 200, description: 'Propiedad eliminada' })
  @ApiResponse({ status: 404, description: 'Propiedad no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.propertyService.remove(id);
  }
}
