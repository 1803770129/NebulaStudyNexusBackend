import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from '@/modules/student/entities/student.entity';
import { Question } from '@/modules/question/entities/question.entity';
import { WrongBook } from './wrong-book.entity';
import { ReviewDailyTaskStatus } from '../enums';

@Entity('review_daily_tasks')
@Unique(['runDate', 'studentId', 'wrongBookId'])
export class ReviewDailyTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  runDate: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ type: 'uuid' })
  studentId: string;

  @ManyToOne(() => WrongBook, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wrongBookId' })
  wrongBook: WrongBook;

  @Column({ type: 'uuid' })
  wrongBookId: string;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column({ type: 'uuid' })
  questionId: string;

  @Column({ type: 'timestamp', nullable: true })
  dueAt: Date | null;

  @Column({
    type: 'enum',
    enum: ReviewDailyTaskStatus,
    default: ReviewDailyTaskStatus.PENDING,
  })
  status: ReviewDailyTaskStatus;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
