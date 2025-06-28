import { User } from 'src/user/entities/user.entity';
import { Entity, Column, ManyToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Role {
  @PrimaryColumn()
  id: number; // 1, 2, 3...

  @Column({ unique: true, length: 50 })
  name: string; // 'admin', 'tenant', 'agent', 'owner'

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
