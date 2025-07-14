import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  // ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
// import { User } from '../../user/entities/user.entity';
import { Address } from '../../geography/entities/address.entity';

@Entity()
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  propertyType: string;

  @Column()
  registryNumber: string;

  @Column({ nullable: true })
  functionalUnit: string;

  @Column()
  ownerIntention: string;

  @Column({ nullable: true })
  commercialStatus: string;

  @Column()
  propertyCondition: string;

  @Column({ nullable: true })
  thumbnail: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  coveredMeters: string;

  @Column({ nullable: true })
  uncoveredMeters: string;

  @Column({ nullable: true })
  rooms: string;

  @Column()
  bathrooms: string;

  @Column({ nullable: true })
  yearOfConstruction: string;

  @Column({ nullable: true })
  electricityIdentifier: string;

  @Column({ nullable: true })
  gasIdentifier: string;

  @Column({ nullable: true })
  ABLIdentifier: string;

  @Column({ nullable: true })
  administration: string;

  @Column({ nullable: true })
  administrationPhone: string;

  @Column({ nullable: true })
  administrationEmail: string;

  @Column({ nullable: true })
  administrationAddress: string;

  @Column({ nullable: true })
  ownerName: string;

  @Column({ nullable: true })
  ownerPhone: string;

  @Column({ nullable: true })
  ownerCBU: string;

  @Column({ nullable: true })
  ownerAlias: string;

  @Column({ default: false })
  hasExpenses: boolean;

  @Column({ default: false })
  hasExtraordinaryExpenses: boolean;

  @Column({ default: false })
  hasKitchen: boolean;

  @Column({ default: false })
  hasPatio: boolean;

  @Column({ default: false })
  hasBarbecue: boolean;

  @Column({ default: false })
  hasTerrace: boolean;

  @Column({ default: false })
  hasPool: boolean;

  @Column({ default: false })
  hasGarden: boolean;

  @Column({ default: false })
  hasBalcony: boolean;

  @Column({ default: false })
  hasFurnished: boolean;

  @Column({ nullable: true })
  servicesComment: string;

  @Column({ default: false })
  hasZoom: boolean;

  @Column({ default: false })
  hasParking: boolean;

  @Column({ nullable: true })
  addressId: number;

  // Relación con Address
  @OneToOne(() => Address)
  @JoinColumn({ name: 'addressId' })
  address: Address;

  // Relación con User (agente)
  // @ManyToOne(() => User, (user) => user.properties)
  // agent: User;
}
