import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Student } from '@/modules/student/entities/student.entity';
import { Question } from '@/modules/question/entities/question.entity';
import { User } from '@/modules/user/entities/user.entity';
import { PracticeRecord } from './practice-record.entity';
import { ManualGradingTaskStatus } from '../enums';

@Entity('manual_grading_tasks')
@Unique(['practiceRecordId'])
export class ManualGradingTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => PracticeRecord, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'practiceRecordId' })
  practiceRecord: PracticeRecord;

  @Column({ type: 'uuid' })
  practiceRecordId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column({ type: 'uuid' })
  questionId: string;

  @Column({
    type: 'enum',
    enum: ManualGradingTaskStatus,
    default: ManualGradingTaskStatus.PENDING,
  })
  status: ManualGradingTaskStatus;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigneeId' })
  assignee: User | null;

  @Column({ type: 'uuid', nullable: true })
  assigneeId: string | null;

  @Column({ type: 'timestamp', nullable: true })
  assignedAt: Date | null;

  @Column({ type: 'double precision', nullable: true })
  score: number | null;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[] | null;

  @Column({ type: 'boolean', nullable: true })
  isPassed: boolean | null;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
