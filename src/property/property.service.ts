import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { CloudinaryService } from '../common/services/cloudinary/cloudinary.service';
import { AddressService } from '../geography/services/address.service';

import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly addressService: AddressService,
  ) {}

  // ---- Crear propiedad ----
  async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
    console.log('Creando propiedad con DTO:', createPropertyDto);

    // Crear la dirección primero
    const address = await this.addressService.create(createPropertyDto.address);
    console.log('Dirección creada:', address);

    // Crear la propiedad sin thumbnail
    const { address: _addressData, ...propertyData } = createPropertyDto;
    console.log('Datos de propiedad (sin address):', propertyData);

    const property = this.propertyRepository.create({
      ...propertyData,
      address,
      addressId: address.id,
    });
    console.log('Entidad propiedad creada:', property);

    const savedProperty = await this.propertyRepository.save(property);
    console.log('Propiedad guardada:', savedProperty);

    return savedProperty;
  }

  // ---- Crear propiedad con thumbnail, imágenes y documentos ----
  async createWithImagesAndDocuments(
    createPropertyDto: CreatePropertyDto,
    thumbnailFile?: Express.Multer.File,
    imageFiles?: Express.Multer.File[],
    documentFiles?: Express.Multer.File[],
  ): Promise<Property> {
    // 1. Crear la propiedad primero (sin archivos)
    const property = await this.create(createPropertyDto);

    const imageUrls: string[] = [];
    const documentUrls: string[] = [];

    // 2. Si hay archivo de thumbnail, subirlo a Cloudinary
    if (thumbnailFile) {
      console.log('Subiendo thumbnail a Cloudinary...');
      const uploadResult = await this.cloudinaryService.uploadPropertyImage(
        {
          originalname: thumbnailFile.originalname,
          buffer: thumbnailFile.buffer,
        },
        property.id,
        'thumbnail', // userId placeholder (no se usa en uploadPropertyImage)
      );

      console.log('Resultado de upload thumbnail:', uploadResult);
      property.thumbnail = uploadResult.secure_url;
    }

    // 3. Si hay archivos de imágenes, subirlos a Cloudinary en paralelo
    if (imageFiles && imageFiles.length > 0) {
      console.log(
        `Subiendo ${imageFiles.length} imágenes a Cloudinary en paralelo...`,
      );

      const uploadPromises = imageFiles.map((file, index) => {
        console.log(
          `Preparando imagen ${index + 1}/${imageFiles.length}: ${file.originalname}`,
        );

        return this.cloudinaryService.uploadPropertyImage(
          {
            originalname: file.originalname,
            buffer: file.buffer,
          },
          property.id,
          `image_${Date.now()}_${index + 1}`,
        );
      });

      const uploadResults = await Promise.all(uploadPromises);

      uploadResults.forEach((result, index) => {
        console.log(`Imagen ${index + 1} subida:`, result.secure_url);
        imageUrls.push(result.secure_url);
      });
    }

    // 4. Si hay archivos de documentos, subirlos a Cloudinary en paralelo
    if (documentFiles && documentFiles.length > 0) {
      console.log(
        `Subiendo ${documentFiles.length} documentos a Cloudinary en paralelo...`,
      );

      const uploadPromises = documentFiles.map((file, index) => {
        console.log(
          `Preparando documento ${index + 1}/${documentFiles.length}: ${file.originalname}`,
        );

        return this.cloudinaryService.uploadPropertyDocument(
          {
            originalname: file.originalname,
            buffer: file.buffer,
          },
          property.id,
          `document_${Date.now()}_${index + 1}`,
        );
      });

      const uploadResults = await Promise.all(uploadPromises);

      uploadResults.forEach((result, index) => {
        console.log(`Documento ${index + 1} subido:`, result.secure_url);
        documentUrls.push(result.secure_url);
      });
    }

    // 5. Actualizar la propiedad con las URLs de las imágenes y documentos
    if (imageUrls.length > 0) {
      property.images = imageUrls;
    }
    if (documentUrls.length > 0) {
      property.documents = documentUrls;
    }

    // 6. Guardar la propiedad actualizada
    const updatedProperty = await this.propertyRepository.save(property);
    console.log(
      'Propiedad guardada con imágenes y documentos:',
      updatedProperty,
    );

    return updatedProperty;
  }

  // ---- Buscar todas las propiedades ----
  async findAll(params?: {
    page?: number;
    limit?: number;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
  }): Promise<{ data: Property[]; total: number }> {
    const { page = 1, limit = 10, minPrice, maxPrice, bedrooms } = params || {};

    const queryBuilder = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.address', 'address');

    if (minPrice !== undefined) {
      queryBuilder.andWhere('property.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('property.price <= :maxPrice', { maxPrice });
    }

    if (bedrooms !== undefined) {
      queryBuilder.andWhere('property.rooms = :bedrooms', { bedrooms });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  // ---- Buscar propiedad por ID ----
  async findOne(id: string): Promise<Property> {
    const property = await this.propertyRepository.findOne({
      where: { id },
      relations: ['address', 'address.city', 'address.city.province'],
    });
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    return property;
  }

  // ---- Actualizar propiedad ----
  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
  ): Promise<Property> {
    const property = await this.findOne(id); // Reutiliza la búsqueda con validación
    Object.assign(property, updatePropertyDto);
    return this.propertyRepository.save(property);
  }

  // ---- Actualizar propiedad con thumbnail, imágenes y documentos ----
  async updateWithThumbnail(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    thumbnailFile?: Express.Multer.File,
    imageFiles?: Express.Multer.File[],
    documentFiles?: Express.Multer.File[],
  ): Promise<Property> {
    const property = await this.findOne(id);

    // Crear un objeto con los datos a actualizar
    const updateData = { ...updatePropertyDto };

    // Si hay archivo de thumbnail, subirlo a Cloudinary
    if (thumbnailFile) {
      console.log('Subiendo nuevo thumbnail a Cloudinary...');
      const uploadResult = await this.cloudinaryService.uploadPropertyImage(
        {
          originalname: thumbnailFile.originalname,
          buffer: thumbnailFile.buffer,
        },
        property.id,
        'thumbnail',
      );

      console.log('Resultado de upload thumbnail:', uploadResult);
      updateData.thumbnail = uploadResult.secure_url;
    }

    // Procesar imágenes: combinar URLs existentes con nuevas imágenes subidas
    const imageUrls: string[] = [];

    // Si hay URLs existentes en el DTO, agregarlas
    if (updatePropertyDto.images && Array.isArray(updatePropertyDto.images)) {
      imageUrls.push(
        ...updatePropertyDto.images.filter((img) => typeof img === 'string'),
      );
    }

    // Si hay archivos de imágenes, subirlos a Cloudinary
    if (imageFiles && imageFiles.length > 0) {
      console.log(
        `Subiendo ${imageFiles.length} nuevas imágenes a Cloudinary...`,
      );

      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        console.log(
          `Subiendo imagen ${i + 1}/${imageFiles.length}: ${file.originalname}`,
        );

        const uploadResult = await this.cloudinaryService.uploadPropertyImage(
          {
            originalname: file.originalname,
            buffer: file.buffer,
          },
          property.id,
          `image_${Date.now()}_${i + 1}`, // Usar timestamp para evitar conflictos
        );

        console.log(`Imagen ${i + 1} subida:`, uploadResult.secure_url);
        imageUrls.push(uploadResult.secure_url);
      }
    }

    // Actualizar el campo images con todas las URLs
    if (imageUrls.length > 0) {
      updateData.images = imageUrls;
    }

    // Procesar documentos: combinar URLs existentes con nuevos documentos subidos
    const documentUrls: string[] = [];

    // Si hay URLs existentes en el DTO, agregarlas
    if (
      updatePropertyDto.documents &&
      Array.isArray(updatePropertyDto.documents)
    ) {
      documentUrls.push(
        ...updatePropertyDto.documents.filter((doc) => typeof doc === 'string'),
      );
    }

    // Si hay archivos de documentos, subirlos a Cloudinary
    if (documentFiles && documentFiles.length > 0) {
      console.log(
        `Subiendo ${documentFiles.length} nuevos documentos a Cloudinary...`,
      );

      for (let i = 0; i < documentFiles.length; i++) {
        const file = documentFiles[i];
        console.log(
          `Subiendo documento ${i + 1}/${documentFiles.length}: ${file.originalname}`,
        );

        const uploadResult =
          await this.cloudinaryService.uploadPropertyDocument(
            {
              originalname: file.originalname,
              buffer: file.buffer,
            },
            property.id,
            `document_${Date.now()}_${i + 1}`, // Usar timestamp para evitar conflictos
          );

        console.log(`Documento ${i + 1} subido:`, uploadResult.secure_url);
        documentUrls.push(uploadResult.secure_url);
      }
    }

    // Actualizar el campo documents con todas las URLs
    if (documentUrls.length > 0) {
      updateData.documents = documentUrls;
    }

    // Actualizar la propiedad con los datos del DTO
    Object.assign(property, updateData);
    return this.propertyRepository.save(property);
  }

  // ---- Eliminar propiedad ----
  async remove(id: string): Promise<{ message: string }> {
    const property = await this.findOne(id);

    const resurces = await this.cloudinaryService.getPropertyImages(id);

    for (const resurce of resurces) {
      await this.cloudinaryService.deletePropertyImage(
        resurce.public_id,
        resurce.resource_type,
      );
    }

    await this.cloudinaryService.deleteFolderAndSubfolders(`properties/${id}`);

    await this.propertyRepository.remove(property);

    return { message: 'Propiedad eliminada correctamente' };
  }
}
