import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { City } from './city.entity';
import { PostalCode } from './postal-code.entity';
import { UserProfile } from 'src/user-profile/entities/user-profile.entity';

@Entity('addresses') // Tabla 'addresses'
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  street: string; // Calle principal (ej: "Av. Corrientes")

  @Column({ length: 50 })
  number: string; // Número (string para casos como "1234B")

  @Column({ length: 255, nullable: true })
  apartment?: string; // Departamento/Piso (opcional)

  @Column({ length: 100, nullable: true })
  neighborhood?: string; // Barrio (opcional)

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude?: number; // Latitud para geolocalización

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude?: number; // Longitud para geolocalización

  // Relación con Ciudad (obligatoria)
  @ManyToOne(() => City, (city) => city.addresses)
  city: City;

  // Relación con UserProfile (ej: un usuario puede tener múltiples domicilios)
  @OneToOne(() => UserProfile, (userProfile) => userProfile.address)
  userProfile: UserProfile;

  @ManyToOne(() => PostalCode, (postalCode) => postalCode.addresses)
  postalCode: PostalCode;
}
