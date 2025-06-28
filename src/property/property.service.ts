import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './entities/property.entity';
import { User } from '../user/entities/user.entity';

import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  // ---- Crear propiedad ----
  async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
    // Crear la propiedad sin el agente primero
    const { agent, ...propertyData } = createPropertyDto;
    const property = this.propertyRepository.create(propertyData);

    // Si se proporciona un ID de agente, establecer la relación
    if (agent) {
      property.agent = { id: agent } as User;
    }

    return this.propertyRepository.save(property);
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

    const queryBuilder = this.propertyRepository.createQueryBuilder('property');

    if (minPrice !== undefined) {
      queryBuilder.andWhere('property.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('property.price <= :maxPrice', { maxPrice });
    }

    if (bedrooms !== undefined) {
      queryBuilder.andWhere('property.bedrooms = :bedrooms', { bedrooms });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  // ---- Buscar propiedad por ID ----
  async findOne(id: number): Promise<Property> {
    const property = await this.propertyRepository.findOne({ where: { id } });
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    return property;
  }

  // ---- Actualizar propiedad ----
  async update(
    id: number,
    updatePropertyDto: UpdatePropertyDto,
  ): Promise<Property> {
    const property = await this.findOne(id); // Reutiliza la búsqueda con validación
    Object.assign(property, updatePropertyDto);
    return this.propertyRepository.save(property);
  }

  // ---- Eliminar propiedad ----
  async remove(id: number): Promise<void> {
    const property = await this.findOne(id);
    await this.propertyRepository.remove(property);
  }
}
