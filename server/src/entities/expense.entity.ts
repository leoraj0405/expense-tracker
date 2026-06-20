import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Category } from './category.entity';

@Entity('expenses')
export class Expense extends BaseEntity {
  @Column()
  description: string;

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

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'datetime' })
  date: Date;
}
