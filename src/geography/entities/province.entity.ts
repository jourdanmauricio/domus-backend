import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  JoinColumn,
} from 'typeorm';
import { Country } from './country.entity';
import { City } from './city.entity';

@Entity('provinces')
export class Province {
  @PrimaryColumn()
  id: string;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => Country, (country) => country.provinces)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ nullable: true })
  defaultZoom: number;

  @OneToMany(() => City, (city) => city.province)
  cities: City[];
}
