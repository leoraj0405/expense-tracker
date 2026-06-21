import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', nullable: true })
  parentOtp: string | null;

  @Column({ type: 'varchar', nullable: true })
  parentEmail: string | null;

  @Column({ type: 'varchar', nullable: true })
  otp: string | null;

  @Column({ type: 'int', nullable: true })
  otpAttempt: number | null;

  @Column({ type: 'datetime', nullable: true })
  blockTime: Date | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  profileImage: string | null;
}
