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
        { name: 'images', maxCount: 10 },
      ],
      {
        storage: undefined,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
          if (!file) return cb(null, true);
          const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
          ];
          if (!allowedTypes.includes(file.mimetype)) {
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
    },
  ): Promise<Property> {
    // Extraer archivos del objeto files
    const thumbnailFile = files?.thumbnail?.[0];
    const imageFiles = files?.images || [];

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

    // Usar el método que maneja thumbnail e imágenes
    return this.propertyService.createWithImages(
      processedDto,
      thumbnailFile,
      imageFiles,
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
}
