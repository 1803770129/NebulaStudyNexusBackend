import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Question } from '@/modules/question/entities/question.entity';
import { ExamPaper } from './exam-paper.entity';
import { ExamAttemptItem } from './exam-attempt-item.entity';

@Entity('exam_paper_items')
@Unique('uq_exam_paper_items_paper_seq', ['paperId', 'seq'])
@Unique('uq_exam_paper_items_paper_question', ['paperId', 'questionId'])
export class ExamPaperItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ExamPaper, (paper) => paper.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paperId' })
  paper: ExamPaper;

  @Column({ type: 'uuid' })
  paperId: string;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column({ type: 'uuid' })
  questionId: string;

  @Column({ type: 'int' })
  seq: number;

  @Column({ type: 'int', default: 1 })
  score: number;

  @OneToMany(() => ExamAttemptItem, (item) => item.paperItem)
  attemptItems: ExamAttemptItem[];

  @CreateDateColumn()
  createdAt: Date;
}
