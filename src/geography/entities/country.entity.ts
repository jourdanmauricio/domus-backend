import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Province } from './province.entity';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 2, unique: true }) // ISO 3166-1 alpha-2
  countryCode: string; // e.g. 'AR', 'US'

  @Column({ length: 5, nullable: true })
  phonePrefix?: string; // e.g. '+54'

  @Column({ length: 3, nullable: true }) // ISO 4217
  currencyCode?: string; // e.g. 'ARS'

  @Column({ length: 5, nullable: true })
  currencySymbol?: string; // e.g. '$'

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number; // Center point for map

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ nullable: true })
  defaultZoom: number; // Suggested zoom level

  @OneToMany(() => Province, (province) => province.country)
  provinces: Province[];
}
