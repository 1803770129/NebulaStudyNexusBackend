import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Question } from '@/modules/question/entities/question.entity';
import { PracticeSessionItemSourceType, PracticeSessionItemStatus } from '../enums';
import { PracticeSession } from './practice-session.entity';

@Entity('practice_session_items')
@Unique(['sessionId', 'seq'])
export class PracticeSessionItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PracticeSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: PracticeSession;

  @Column({ type: 'uuid' })
  sessionId: string;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column({ type: 'uuid' })
  questionId: string;

  @Column({ type: 'int' })
  seq: number;

  @Column({
    type: 'enum',
    enum: PracticeSessionItemSourceType,
    default: PracticeSessionItemSourceType.NORMAL,
  })
  sourceType: PracticeSessionItemSourceType;

  @Column({ type: 'uuid', nullable: true })
  sourceRefId: string | null;

  @Column({
    type: 'enum',
    enum: PracticeSessionItemStatus,
    default: PracticeSessionItemStatus.PENDING,
  })
  status: PracticeSessionItemStatus;

  @Column({ type: 'timestamp', nullable: true })
  answeredAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
