/**
 * 做题记录实体
 *
 * 记录学生每次答题的详细信息，包括提交的答案、是否正确、用时等
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from '@/modules/student/entities/student.entity';
import { Question } from '@/modules/question/entities/question.entity';

@Entity('practice_records')
export class PracticeRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 学生 */
  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: string;

  /** 题目 */
  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column()
  questionId: string;

  /** 学生提交的答案（格式因题型而异） */
  @Column({ type: 'jsonb' })
  submittedAnswer: any;

  /** 是否正确（简答题为 null，需人工评阅） */
  @Column({ type: 'boolean', nullable: true })
  isCorrect: boolean | null;

  /** 做题用时（秒） */
  @Column({ default: 0 })
  duration: number;

  @CreateDateColumn()
  createdAt: Date;
}
