import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Student } from '@/modules/student/entities/student.entity';
import { PracticeSessionMode, PracticeSessionStatus } from '../enums';
import { PracticeSessionItem } from './practice-session-item.entity';

@Entity('practice_sessions')
export class PracticeSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column({ type: 'uuid' })
  studentId: string;

  @Column({ type: 'enum', enum: PracticeSessionMode })
  mode: PracticeSessionMode;

  @Column({ type: 'jsonb', default: {} })
  config: Record<string, any>;

  @Column({
    type: 'enum',
    enum: PracticeSessionStatus,
    default: PracticeSessionStatus.ACTIVE,
  })
  status: PracticeSessionStatus;

  @Column({ default: 0 })
  totalCount: number;

  @Column({ default: 0 })
  answeredCount: number;

  @Column({ default: 0 })
  correctCount: number;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date | null;

  @OneToMany(() => PracticeSessionItem, (item) => item.session)
  items: PracticeSessionItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
