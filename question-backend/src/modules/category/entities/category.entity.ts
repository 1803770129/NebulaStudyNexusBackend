/**
 * 分类实体
 *
 * 支持树形结构，最多三级
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Category | null;

  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

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
