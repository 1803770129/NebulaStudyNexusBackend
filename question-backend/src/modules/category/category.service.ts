/**
 * 分类服务
 * 
 * 处理分类相关的业务逻辑
 */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

/**
 * 分类树节点接口
 */
export interface CategoryTreeNode {
  id: string;
  name: string;
  level: number;
  path: string;
  questionCount: number;
  children: CategoryTreeNode[];
}

@Injectable()
export class CategoryService {
  // 最大分类层级
  private readonly MAX_LEVEL = 3;

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * 创建分类
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, parentId } = createCategoryDto;

    // 检查同级分类名称是否重复
    const existingCategory = await this.categoryRepository.findOne({
      where: { name, parentId: parentId || null },
    });
    if (existingCategory) {
      throw new ConflictException('同级分类名称已存在');
    }

    let level = 1;
    let path = '';

    // 如果有父分类，验证层级
    if (parentId) {
      const parent = await this.findById(parentId);
      if (parent.level >= this.MAX_LEVEL) {
        throw new BadRequestException(`分类层级不能超过${this.MAX_LEVEL}级`);
      }
      level = parent.level + 1;
      path = parent.path ? `${parent.path}/${parent.id}` : parent.id;
    }

    const category = this.categoryRepository.create({
      name,
      parentId: parentId || null,
      level,
      path,
    });

    return this.categoryRepository.save(category);
  }

  /**
   * 获取所有分类（扁平列表）
   */
  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { level: 'ASC', createdAt: 'ASC' },
    });
  }

  /**
   * 获取分类树
   */
  async findTree(): Promise<CategoryTreeNode[]> {
    const categories = await this.categoryRepository.find({
      order: { level: 'ASC', createdAt: 'ASC' },
    });

    return this.buildTree(categories);
  }

  /**
   * 根据 ID 查找分类
   */
  async findById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('分类不存在');
    }
    return category;
  }

  /**
   * 更新分类
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);
    const { name, parentId } = updateCategoryDto;

    // 检查名称是否与同级其他分类重复
    if (name && name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name, parentId: parentId ?? category.parentId },
      });
      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException('同级分类名称已存在');
      }
    }

    // 如果更改父分类，验证层级
    if (parentId !== undefined && parentId !== category.parentId) {
      if (parentId === id) {
        throw new BadRequestException('不能将分类设为自己的子分类');
      }

      if (parentId) {
        const parent = await this.findById(parentId);
        if (parent.level >= this.MAX_LEVEL) {
          throw new BadRequestException(`分类层级不能超过${this.MAX_LEVEL}级`);
        }
        category.level = parent.level + 1;
        category.path = parent.path ? `${parent.path}/${parent.id}` : parent.id;
      } else {
        category.level = 1;
        category.path = '';
      }
      category.parentId = parentId;
    }

    if (name) {
      category.name = name;
    }

    return this.categoryRepository.save(category);
  }

  /**
   * 删除分类
   */
  async remove(id: string): Promise<void> {
    const category = await this.findById(id);

    // 检查是否有子分类
    const childCount = await this.categoryRepository.count({
      where: { parentId: id },
    });
    if (childCount > 0) {
      throw new BadRequestException('请先删除子分类');
    }

    // 检查是否有关联题目
    if (category.questionCount > 0) {
      throw new BadRequestException('该分类下有题目，请先处理相关题目');
    }

    await this.categoryRepository.remove(category);
  }

  /**
   * 更新分类题目数量
   */
  async updateQuestionCount(id: string, delta: number): Promise<void> {
    await this.categoryRepository.increment({ id }, 'questionCount', delta);
  }

  /**
   * 构建分类树
   */
  private buildTree(categories: Category[]): CategoryTreeNode[] {
    const map = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    // 创建节点映射
    categories.forEach((category) => {
      map.set(category.id, {
        id: category.id,
        name: category.name,
        level: category.level,
        path: category.path,
        questionCount: category.questionCount,
        children: [],
      });
    });

    // 构建树结构
    categories.forEach((category) => {
      const node = map.get(category.id)!;
      if (category.parentId) {
        const parent = map.get(category.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}
