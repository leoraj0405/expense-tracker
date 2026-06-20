import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { GroupExpense } from './group-expense.entity';
import { User } from './user.entity';

export type SplitType = 'equal' | 'unequal';

@Entity('group_expense_splits')
export class GroupExpenseSplit extends BaseEntity {
  @Column()
  groupExpenseId: string;

  @ManyToOne(() => GroupExpense, (expense) => expense.splits)
  @JoinColumn({ name: 'groupExpenseId' })
  groupExpense: GroupExpense;

  @Column()
  memberId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'memberId' })
  member: User;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  share: number;

  @Column({ type: 'enum', enum: ['equal', 'unequal'] })
  splitType: SplitType;

  @Column({ default: false })
  isSettle: boolean;
}
