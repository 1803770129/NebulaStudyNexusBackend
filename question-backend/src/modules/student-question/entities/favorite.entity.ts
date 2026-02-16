/**
 * 收藏实体
 *
 * 学生收藏题目，studentId + questionId 联合唯一
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Student } from '@/modules/student/entities/student.entity';
import { Question } from '@/modules/question/entities/question.entity';

@Entity('favorites')
@Unique(['studentId', 'questionId'])
export class Favorite {
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

  @CreateDateColumn()
  createdAt: Date;
}
