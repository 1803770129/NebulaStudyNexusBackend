/**
 * 种子数据入口
 * 
 * 运行: npm run seed
 */
import { AppDataSource } from '../data-source';
import { User } from '@/modules/user/entities/user.entity';
import { Category } from '@/modules/category/entities/category.entity';
import { Tag } from '@/modules/tag/entities/tag.entity';
import { Question } from '@/modules/question/entities/question.entity';
import { UserRole } from '@/modules/user/enums/user-role.enum';
import { QuestionType } from '@/modules/question/enums/question-type.enum';
import { DifficultyLevel } from '@/modules/question/enums/difficulty-level.enum';
import * as bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Starting seed...');

  // 初始化数据源
  await AppDataSource.initialize();
  console.log('📦 Database connected');

  // 获取仓库
  const userRepo = AppDataSource.getRepository(User);
  const categoryRepo = AppDataSource.getRepository(Category);
  const tagRepo = AppDataSource.getRepository(Tag);
  const questionRepo = AppDataSource.getRepository(Question);

  // 清空数据（按依赖顺序）
  await questionRepo.delete({});
  await tagRepo.delete({});
  await categoryRepo.delete({});
  await userRepo.delete({});
  console.log('🗑️ Cleared existing data');

  // 创建管理员用户
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = userRepo.create({
    username: 'admin',
    email: 'admin@example.com',
    password: adminPassword,
    role: UserRole.ADMIN,
  });
  await userRepo.save(admin);
  console.log('👤 Created admin user');

  // 创建分类
  const mathCategory = categoryRepo.create({
    name: '数学',
    level: 1,
    path: '',
  });
  await categoryRepo.save(mathCategory);

  const algebraCategory = categoryRepo.create({
    name: '代数',
    parentId: mathCategory.id,
    level: 2,
    path: mathCategory.id,
  });
  await categoryRepo.save(algebraCategory);

  const geometryCategory = categoryRepo.create({
    name: '几何',
    parentId: mathCategory.id,
    level: 2,
    path: mathCategory.id,
  });
  await categoryRepo.save(geometryCategory);

  const englishCategory = categoryRepo.create({
    name: '英语',
    level: 1,
    path: '',
  });
  await categoryRepo.save(englishCategory);
  console.log('📁 Created categories');

  // 创建标签
  const importantTag = tagRepo.create({
    name: '重点',
    color: '#f5222d',
  });
  await tagRepo.save(importantTag);

  const examTag = tagRepo.create({
    name: '考试常考',
    color: '#fa8c16',
  });
  await tagRepo.save(examTag);

  const basicTag = tagRepo.create({
    name: '基础',
    color: '#52c41a',
  });
  await tagRepo.save(basicTag);
  console.log('🏷️ Created tags');

  // 创建示例题目
  const question1 = questionRepo.create({
    title: '一元二次方程求解',
    content: {
      raw: '求方程 x² - 5x + 6 = 0 的解',
      rendered: '求方程 x² - 5x + 6 = 0 的解',
    },
    type: QuestionType.SHORT_ANSWER,
    difficulty: DifficultyLevel.EASY,
    categoryId: algebraCategory.id,
    tags: [basicTag, examTag],
    answer: 'x = 2 或 x = 3',
    explanation: {
      raw: '使用因式分解：(x-2)(x-3) = 0',
      rendered: '使用因式分解：(x-2)(x-3) = 0',
    },
    creatorId: admin.id,
  });
  await questionRepo.save(question1);

  const question2 = questionRepo.create({
    title: '三角形面积公式',
    content: {
      raw: '已知三角形底边长为 10，高为 6，求面积',
      rendered: '已知三角形底边长为 10，高为 6，求面积',
    },
    type: QuestionType.SINGLE_CHOICE,
    difficulty: DifficultyLevel.EASY,
    categoryId: geometryCategory.id,
    tags: [basicTag],
    options: [
      { id: 'A', content: { raw: '30', rendered: '30' }, isCorrect: true },
      { id: 'B', content: { raw: '60', rendered: '60' }, isCorrect: false },
      { id: 'C', content: { raw: '16', rendered: '16' }, isCorrect: false },
      { id: 'D', content: { raw: '20', rendered: '20' }, isCorrect: false },
    ],
    answer: 'A',
    explanation: {
      raw: '三角形面积 = 底 × 高 ÷ 2 = 10 × 6 ÷ 2 = 30',
      rendered: '三角形面积 = 底 × 高 ÷ 2 = 10 × 6 ÷ 2 = 30',
    },
    creatorId: admin.id,
  });
  await questionRepo.save(question2);
  console.log('📝 Created sample questions');

  // 更新分类和标签的题目数量
  await categoryRepo.update(algebraCategory.id, { questionCount: 1 });
  await categoryRepo.update(geometryCategory.id, { questionCount: 1 });
  await tagRepo.update(basicTag.id, { questionCount: 2 });
  await tagRepo.update(examTag.id, { questionCount: 1 });

  console.log('✅ Seed completed successfully!');
  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
