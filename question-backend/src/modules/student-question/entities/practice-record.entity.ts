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
import { User } from '@/modules/user/entities/user.entity';
import { PracticeAttemptType } from '../enums';
import { PracticeSession } from './practice-session.entity';
import { PracticeSessionItem } from './practice-session-item.entity';

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

  /** 练习会话（非会话场景为空） */
  @ManyToOne(() => PracticeSession, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sessionId' })
  session: PracticeSession | null;

  @Column({ type: 'uuid', nullable: true })
  sessionId: string | null;

  /** 会话中的题目项（非会话场景为空） */
  @ManyToOne(() => PracticeSessionItem, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sessionItemId' })
  sessionItem: PracticeSessionItem | null;

  @Column({ type: 'uuid', nullable: true })
  sessionItemId: string | null;

  /** 做题来源类型：练习/复习/考试 */
  @Column({
    type: 'enum',
    enum: PracticeAttemptType,
    default: PracticeAttemptType.PRACTICE,
  })
  attemptType: PracticeAttemptType;

  /** 学生提交的答案（格式因题型而异） */
  @Column({ type: 'jsonb' })
  submittedAnswer: any;

  /** 是否正确（简答题为 null，需人工评阅） */
  @Column({ type: 'boolean', nullable: true })
  isCorrect: boolean | null;

  /** 做题用时（秒） */
  @Column({ default: 0 })
  duration: number;

  @Column({ type: 'double precision', nullable: true })
  score: number | null;

  @Column({ type: 'text', nullable: true })
  gradingFeedback: string | null;

  @Column({ type: 'jsonb', nullable: true })
  gradingTags: string[] | null;

  @Column({ type: 'boolean', nullable: true })
  isPassed: boolean | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'gradedBy' })
  gradedByUser: User | null;

  @Column({ type: 'uuid', nullable: true })
  gradedBy: string | null;

  @Column({ type: 'timestamp', nullable: true })
  gradedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
