import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@/modules/user/entities/user.entity';
import { ExamPaperStatus } from '../enums';
import { ExamPaperItem } from './exam-paper-item.entity';
import { ExamAttempt } from './exam-attempt.entity';

@Entity('exam_papers')
export class ExamPaper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', default: 60 })
  durationMinutes: number;

  @Column({ type: 'int', default: 0 })
  totalScore: number;

  @Column({
    type: 'enum',
    enum: ExamPaperStatus,
    default: ExamPaperStatus.DRAFT,
  })
  status: ExamPaperStatus;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User | null;

  @Column({ type: 'uuid', nullable: true })
  createdById: string | null;

  @OneToMany(() => ExamPaperItem, (item) => item.paper)
  items: ExamPaperItem[];

  @OneToMany(() => ExamAttempt, (attempt) => attempt.paper)
  attempts: ExamAttempt[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
