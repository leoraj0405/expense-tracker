import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('groups')
export class Group extends BaseEntity {
  @Column()
  name: string;

  @Column()
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;
}
