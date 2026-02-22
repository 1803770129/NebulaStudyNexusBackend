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
import { Student } from '@/modules/student/entities/student.entity';
import { ExamAttemptStatus } from '../enums';
import { ExamPaper } from './exam-paper.entity';
import { ExamAttemptItem } from './exam-attempt-item.entity';

@Entity('exam_attempts')
export class ExamAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ExamPaper, (paper) => paper.attempts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paperId' })
  paper: ExamPaper;

  @Column({ type: 'uuid' })
  paperId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ type: 'uuid' })
  studentId: string;

  @Column({
    type: 'enum',
    enum: ExamAttemptStatus,
    default: ExamAttemptStatus.ACTIVE,
  })
  status: ExamAttemptStatus;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt: Date | null;

  @Column({ type: 'int', default: 0 })
  durationSeconds: number;

  @Column({ type: 'int', nullable: true })
  totalScore: number | null;

  @Column({ type: 'int', nullable: true })
  objectiveScore: number | null;

  @Column({ type: 'int', nullable: true })
  subjectiveScore: number | null;

  @Column({ type: 'boolean', default: false })
  needsManualGrading: boolean;

  @OneToMany(() => ExamAttemptItem, (item) => item.attempt)
  items: ExamAttemptItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
