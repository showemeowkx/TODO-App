import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  isDone: boolean;

  @Column({ default: 1 })
  priority: number;

  @CreateDateColumn()
  createdAt: Date;
}
