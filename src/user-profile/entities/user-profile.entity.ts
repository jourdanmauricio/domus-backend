import { Address } from 'src/geography/entities/address.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class UserProfile {
  @PrimaryColumn()
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  dni: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  birthDate: string;

  @Column({ nullable: true })
  gender: 'male' | 'female' | 'non-binary' | 'other';

  @Column({ nullable: true })
  bio: string; // Descripción corta

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  language: string;

  @Column({ nullable: true })
  themePreference: 'light' | 'dark';

  @OneToOne(() => Address, {
    nullable: true,
  })
  @JoinColumn() // Esto creará una columna 'addressId' en la tabla 'userProfile'
  address: Address;

  @OneToOne(() => User, (user) => user.profile, {
    nullable: true, // Permite que un usuario no tenga perfil
  })
  @JoinColumn({ name: 'id' })
  user: User;
}
