import { Entity, Column, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { Province } from './province.entity';
import { Address } from './address.entity';

@Entity('cities')
export class City {
  @PrimaryColumn()
  id: string;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => Province, (province) => province.cities)
  province: Province;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @OneToMany(() => Address, (address) => address.city)
  addresses: Address[];
}
