import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Group } from './group.entity';
import { User } from './user.entity';
import { Category } from './category.entity';
import { GroupExpenseSplit } from './group-expense-split.entity';

@Entity('group_expenses')
export class GroupExpense extends BaseEntity {
  @Column()
  groupId: string;

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  categoryId: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => GroupExpenseSplit, (split) => split.groupExpense)
  splits: GroupExpenseSplit[];
}
