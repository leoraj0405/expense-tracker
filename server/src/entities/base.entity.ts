import { AfterLoad, Column, PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'datetime', nullable: true })
  createdAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  updatedAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  deletedAt: Date | null;

  @AfterLoad()
  addMongoCompatId() {
    Object.defineProperty(this, '_id', {
      value: this.id,
      enumerable: true,
      writable: false,
    });
  }
}
