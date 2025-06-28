import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { City } from './city.entity';
import { Address } from './address.entity';

@Entity('postal_codes')
export class PostalCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 }) // e.g. 'B1601', 'C1002'
  code: string;

  @ManyToOne(() => City, (city) => city.postalCodes)
  city: City;

  @OneToMany(() => Address, (address) => address.postalCode)
  addresses: Address[];
}
