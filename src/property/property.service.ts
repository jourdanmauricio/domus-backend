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

  // ---- Crear propiedad con thumbnail e imágenes ----
  async createWithImages(
    createPropertyDto: CreatePropertyDto,
    thumbnailFile?: Express.Multer.File,
    imageFiles?: Express.Multer.File[],
  ): Promise<Property> {
    // 1. Crear la propiedad primero (sin imágenes)
    const property = await this.create(createPropertyDto);

    const imageUrls: string[] = [];

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

    // 3. Si hay archivos de imágenes, subirlos a Cloudinary
    if (imageFiles && imageFiles.length > 0) {
      console.log(`Subiendo ${imageFiles.length} imágenes a Cloudinary...`);

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
          `image_${i + 1}`, // userId placeholder (no se usa en uploadPropertyImage)
        );

        console.log(`Imagen ${i + 1} subida:`, uploadResult.secure_url);
        imageUrls.push(uploadResult.secure_url);
      }
    }

    // 4. Actualizar la propiedad con las URLs de las imágenes
    if (imageUrls.length > 0) {
      property.images = imageUrls;
    }

    // 5. Guardar la propiedad actualizada
    const updatedProperty = await this.propertyRepository.save(property);
    console.log('Propiedad guardada con imágenes:', updatedProperty);

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
      relations: ['address'],
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

  // ---- Eliminar propiedad ----
  async remove(id: string): Promise<void> {
    const property = await this.findOne(id);
    await this.propertyRepository.remove(property);
  }
}
