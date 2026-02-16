/**
 * 学生实体
 *
 * 定义学生用户数据模型和数据库映射
 * 支持微信登录和手机号+密码登录两种方式
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** 手机号（唯一，用于手机号登录） */
  @Column({ length: 20, unique: true, nullable: true })
  phone: string | null;

  /** 密码（手机号注册时设置） */
  @Column({ nullable: true })
  @Exclude()
  password: string | null;

  /** 微信 openid（唯一，用于微信登录） */
  @Column({ length: 100, unique: true, nullable: true })
  wxOpenid: string | null;

  /** 微信 unionid（跨应用关联） */
  @Column({ length: 100, nullable: true })
  wxUnionid: string | null;

  /** 昵称 */
  @Column({ length: 100, default: '' })
  nickname: string;

  /** 头像 URL */
  @Column({ length: 500, default: '' })
  avatar: string;

  /** 账号是否启用 */
  @Column({ default: true })
  isActive: boolean;

  /** 最后登录时间 */
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * 密码加密钩子
   * 在插入和更新前自动加密密码
   */
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  /**
   * 验证密码
   */
  async validatePassword(plainPassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(plainPassword, this.password);
  }
}
