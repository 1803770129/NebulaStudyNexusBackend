/**
 * 题目实体
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { QuestionType } from '../enums/question-type.enum';
import { DifficultyLevel } from '../enums/difficulty-level.enum';
import { Category } from '@/modules/category/entities/category.entity';
import { Tag } from '@/modules/tag/entities/tag.entity';
import { User } from '@/modules/user/entities/user.entity';

/**
 * 富文本内容结构
 */
export interface RichContent {
  /** 原始内容，包含 LaTeX 标记 */
  raw: string;
  /** 渲染后内容，公式已转为图片 */
  rendered: string;
}

/**
 * 选项接口（支持富文本）
 */
export interface Option {
  id: string;
  content: RichContent;
  isCorrect: boolean;
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column('jsonb')
  content: RichContent;

  @Column({
    type: 'enum',
    enum: QuestionType,
  })
  type: QuestionType;

  @Column({
    type: 'enum',
    enum: DifficultyLevel,
  })
  difficulty: DifficultyLevel;

  @ManyToOne(() => Category, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToMany(() => Tag, { cascade: true })
  @JoinTable({
    name: 'question_tags',
    joinColumn: { name: 'questionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @Column('jsonb', { nullable: true })
  options: Option[];

  @Column('jsonb')
  answer: string | string[];

  @Column('jsonb', { nullable: true })
  explanation: RichContent | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column({ type: 'uuid' })
  creatorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
