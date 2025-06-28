import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  OneToOne,
} from 'typeorm';
import { Property } from '../../property/entities/property.entity';
import { Role } from 'src/roles/entities/role.entity';
import { UserProfile } from 'src/user-profile/entities/user-profile.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  twoFactorEnabled: boolean;

  @Column({ nullable: true })
  recoveryToken: string;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: true })
  deletedAt: Date;

  @OneToMany(() => Property, (property) => property.agent)
  properties: Property[];

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles', // Tabla intermedia automática
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToOne(() => UserProfile, (profile) => profile.user, {
    eager: true,
    nullable: true,
  })
  profile: UserProfile;
}
