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
import { Question } from '@/modules/question/entities/question.entity';
import { ExamAttempt } from './exam-attempt.entity';
import { ExamPaperItem } from './exam-paper-item.entity';

@Entity('exam_attempt_items')
@Unique('uq_exam_attempt_items_attempt_paper_item', ['attemptId', 'paperItemId'])
@Unique('uq_exam_attempt_items_attempt_seq', ['attemptId', 'seq'])
export class ExamAttemptItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ExamAttempt, (attempt) => attempt.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attemptId' })
  attempt: ExamAttempt;

  @Column({ type: 'uuid' })
  attemptId: string;

  @ManyToOne(() => ExamPaperItem, (paperItem) => paperItem.attemptItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paperItemId' })
  paperItem: ExamPaperItem;

  @Column({ type: 'uuid' })
  paperItemId: string;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column({ type: 'uuid' })
  questionId: string;

  @Column({ type: 'int' })
  seq: number;

  @Column({ type: 'int' })
  fullScore: number;

  @Column({ type: 'jsonb', nullable: true })
  submittedAnswer: unknown;

  @Column({ type: 'boolean', nullable: true })
  isCorrect: boolean | null;

  @Column({ type: 'int', nullable: true })
  score: number | null;

  @Column({ type: 'boolean', default: false })
  needsManualGrading: boolean;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  gradedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
