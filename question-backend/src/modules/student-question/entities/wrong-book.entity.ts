/**
 * 错题本实体
 *
 * 自动记录学生答错的题目，支持错误次数统计和掌握状态标记
 * studentId + questionId 联合唯一
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Student } from '@/modules/student/entities/student.entity';
import { Question } from '@/modules/question/entities/question.entity';

@Entity('wrong_book')
@Unique(['studentId', 'questionId'])
export class WrongBook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  studentId: string;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column()
  questionId: string;

  /** 错误次数 */
  @Column({ default: 1 })
  wrongCount: number;

  /** 最近一次错误时间 */
  @Column({ type: 'timestamp' })
  lastWrongAt: Date;

  /** 最近一次提交的错误答案 */
  @Column({ type: 'jsonb' })
  lastWrongAnswer: any;

  /** 是否已掌握（学生手动标记） */
  @Column({ default: false })
  isMastered: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
