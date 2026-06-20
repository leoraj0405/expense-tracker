import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Group } from './group.entity';
import { User } from './user.entity';

@Entity('group_members')
@Unique(['groupId', 'userId'])
export class GroupMember extends BaseEntity {
  @Column()
  groupId: string;

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
