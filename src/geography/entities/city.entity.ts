import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Province } from './province.entity';
import { PostalCode } from './postal-code.entity';
import { Address } from './address.entity';

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => Province, (province) => province.cities)
  province: Province;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @OneToMany(() => PostalCode, (postalCode) => postalCode.city)
  postalCodes: PostalCode[];

  @OneToMany(() => Address, (address) => address.postalCode)
  addresses: Address[];
}
