/**
 * 知识点实体
 * 
 * 支持树形结构，最多三级
 * 支持与分类、标签、题目的关联
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
  Index,
} from 'typeorm';
import { Category } from '@/modules/category/entities/category.entity';
import { Tag } from '@/modules/tag/entities/tag.entity';

/**
 * 富文本内容结构
 */
export interface RichContent {
  /** 原始内容 */
  raw: string;
  /** 渲染后内容 */
  rendered: string;
}

@Entity('knowledge_points')
@Index(['categoryId'])
@Index(['parentId'])
@Index(['name'])
export class KnowledgePoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('jsonb')
  content: RichContent;

  @Column('jsonb', { nullable: true })
  extension: RichContent | null;

  // 分类关联（多对一）
  @ManyToOne(() => Category, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category | null;

  @Column({ type: 'uuid', nullable: true })
  categoryId: string | null;

  // 标签关联（多对多）
  @ManyToMany(() => Tag, { cascade: true })
  @JoinTable({
    name: 'knowledge_point_tags',
    joinColumn: { name: 'knowledgePointId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];

  // 父子关系（树形结构）
  @ManyToOne(() => KnowledgePoint, (kp) => kp.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentId' })
  parent: KnowledgePoint | null;

  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @OneToMany(() => KnowledgePoint, (kp) => kp.parent)
  children: KnowledgePoint[];

  @Column({ default: 1 })
  level: number;

  @Column({ default: '' })
  path: string;

  @Column({ default: 0 })
  questionCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
