/**
 * 知识点服务
 *
 * 负责知识点的 CRUD 操作、树形结构构建、统计更新等功能
 */
import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgePoint } from './entities/knowledge-point.entity';
import { CategoryService } from '@/modules/category/category.service';
import { TagService } from '@/modules/tag/tag.service';
import { CreateKnowledgePointDto } from './dto/create-knowledge-point.dto';
import { QueryKnowledgePointDto } from './dto/query-knowledge-point.dto';
import { PaginationResponseDto } from '@/common/dto/pagination-response.dto';

/**
 * 知识点树节点接口
 */
export interface KnowledgePointTreeNode {
  id: string;
  name: string;
  level: number;
  path: string;
  questionCount: number;
  categoryId: string | null;
  children: KnowledgePointTreeNode[];
}

@Injectable()
export class KnowledgePointService {
  /**
   * 最大知识点层级
   */
  private readonly MAX_LEVEL = 3;

  constructor(
    @InjectRepository(KnowledgePoint)
    private readonly kpRepository: Repository<KnowledgePoint>,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
  ) {}

  /**
   * 创建知识点
   *
   * 1. 验证同级名称是否重复
   * 2. 验证分类是否存在
   * 3. 计算层级和路径
   * 4. 关联标签
   * 5. 保存到数据库
   *
   * @param dto 创建知识点 DTO
   * @returns 创建的知识点实体
   * @throws {ConflictException} 同级名称重复
   * @throws {BadRequestException} 层级超过限制
   * @throws {NotFoundException} 分类或父知识点不存在
   */
  async create(dto: CreateKnowledgePointDto): Promise<KnowledgePoint> {
    const { name, content, extension, categoryId, parentId, tagIds } = dto;

    // 1. 检查同级名称重复
    const existing = await this.kpRepository.findOne({
      where: { name, parentId: parentId || null },
    });
    if (existing) {
      throw new ConflictException('同级知识点名称已存在');
    }

    // 2. 验证分类
    if (categoryId) {
      await this.categoryService.findById(categoryId);
    }

    // 3. 计算层级和路径
    let level = 1;
    let path = '';
    if (parentId) {
      const parent = await this.findById(parentId);
      if (parent.level >= this.MAX_LEVEL) {
        throw new BadRequestException(`知识点层级不能超过${this.MAX_LEVEL}级`);
      }
      level = parent.level + 1;
      path = parent.path ? `${parent.path}/${parent.id}` : parent.id;
    }

    // 4. 获取标签
    const tags = tagIds ? await this.tagService.findByIds(tagIds) : [];

    // 5. 创建知识点
    const kp = this.kpRepository.create({
      name,
      content,
      extension: extension || null,
      categoryId: categoryId || null,
      parentId: parentId || null,
      level,
      path,
      tags,
    });

    return this.kpRepository.save(kp);
  }

  /**
   * 根据 ID 查找知识点
   *
   * @param id 知识点 ID
   * @returns 知识点实体
   * @throws {NotFoundException} 知识点不存在
   */
  async findById(id: string): Promise<KnowledgePoint> {
    const kp = await this.kpRepository.findOne({
      where: { id },
      relations: ['category', 'tags', 'parent'],
    });

    if (!kp) {
      throw new NotFoundException(`知识点 ${id} 不存在`);
    }

    return kp;
  }

  /**
   * 查询知识点列表（分页）
   *
   * 支持以下功能：
   * - 分页查询
   * - 按名称搜索（ILIKE 模糊匹配）
   * - 按分类筛选
   * - 按标签筛选
   * - 按父知识点筛选
   * - 按层级和创建时间排序
   *
   * @param query 查询参数
   * @returns 分页响应数据
   */
  async findAll(query: QueryKnowledgePointDto): Promise<PaginationResponseDto<KnowledgePoint>> {
    const { page = 1, limit = 20, search, categoryId, tagId, parentId } = query;

    // 创建查询构建器
    const qb = this.kpRepository
      .createQueryBuilder('kp')
      .leftJoinAndSelect('kp.category', 'category')
      .leftJoinAndSelect('kp.tags', 'tags');

    // 搜索功能：按知识点名称模糊搜索
    if (search) {
      qb.andWhere('kp.name ILIKE :search', { search: `%${search}%` });
    }

    // 按分类筛选
    if (categoryId) {
      qb.andWhere('kp.categoryId = :categoryId', { categoryId });
    }

    // 按标签筛选
    if (tagId) {
      qb.andWhere('tags.id = :tagId', { tagId });
    }

    // 按父知识点筛选
    if (parentId !== undefined) {
      if (parentId === null || parentId === '') {
        // 查询顶级知识点（没有父节点）
        qb.andWhere('kp.parentId IS NULL');
      } else {
        // 查询指定父节点下的子知识点
        qb.andWhere('kp.parentId = :parentId', { parentId });
      }
    }

    // 排序：先按层级升序，再按创建时间降序
    qb.orderBy('kp.level', 'ASC').addOrderBy('kp.createdAt', 'DESC');

    // 分页
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    // 执行查询
    const [data, total] = await qb.getManyAndCount();

    return new PaginationResponseDto(data, total, page, limit);
  }
  /**
   * 根据 ID 列表查找知识点
   *
   * @param ids 知识点 ID 列表
   * @returns 知识点实体数组
   */
  async findByIds(ids: string[]): Promise<KnowledgePoint[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    return this.kpRepository.findByIds(ids);
  }

  /**
   * 更新单个知识点的题目数量
   *
   * 使用原子操作更新，保证并发安全
   *
   * @param id 知识点 ID
   * @param delta 变化量（正数表示增加，负数表示减少）
   */
  async updateQuestionCount(id: string, delta: number): Promise<void> {
    await this.kpRepository.increment({ id }, 'questionCount', delta);
  }

  /**
   * 批量更新知识点的题目数量
   *
   * @param ids 知识点 ID 列表
   * @param delta 变化量（正数表示增加，负数表示减少）
   */
  async updateQuestionCounts(ids: string[], delta: number): Promise<void> {
    if (!ids || ids.length === 0) {
      return;
    }

    await Promise.all(ids.map((id) => this.updateQuestionCount(id, delta)));
  }

  /**
   * 获取知识点树
   *
   * 构建树形结构的知识点列表，时间复杂度 O(n)
   *
   * @param categoryId 可选的分类 ID，用于筛选
   * @returns 树形结构的知识点节点数组
   */
  async findTree(categoryId?: string): Promise<KnowledgePointTreeNode[]> {
    // 查询所有知识点（可选按分类筛选）
    const qb = this.kpRepository.createQueryBuilder('kp');

    if (categoryId) {
      qb.where('kp.categoryId = :categoryId', { categoryId });
    }

    qb.orderBy('kp.level', 'ASC').addOrderBy('kp.name', 'ASC');

    const kps = await qb.getMany();

    // 构建树结构
    return this.buildTree(kps);
  }

  /**
   * 更新知识点
   *
   * @param id 知识点 ID
   * @param dto 更新数据
   * @returns 更新后的知识点实体
   */
  async update(id: string, dto: Partial<CreateKnowledgePointDto>): Promise<KnowledgePoint> {
    const kp = await this.findById(id);
    const { name, content, extension, categoryId, parentId, tagIds } = dto;

    // 如果更新名称，检查同级名称重复
    if (name && name !== kp.name) {
      const existing = await this.kpRepository.findOne({
        where: { name, parentId: parentId !== undefined ? parentId || null : kp.parentId },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('同级知识点名称已存在');
      }
    }

    // 如果更新分类，验证分类是否存在
    if (categoryId !== undefined && categoryId !== null) {
      await this.categoryService.findById(categoryId);
    }

    // 如果更新父知识点，重新计算层级和路径
    if (parentId !== undefined) {
      if (parentId) {
        const parent = await this.findById(parentId);
        if (parent.level >= this.MAX_LEVEL) {
          throw new BadRequestException(`知识点层级不能超过${this.MAX_LEVEL}级`);
        }
        kp.level = parent.level + 1;
        kp.path = parent.path ? `${parent.path}/${parent.id}` : parent.id;
        kp.parentId = parentId;
      } else {
        kp.level = 1;
        kp.path = '';
        kp.parentId = null;
      }
    }

    // 更新标签
    if (tagIds !== undefined) {
      kp.tags = tagIds.length > 0 ? await this.tagService.findByIds(tagIds) : [];
    }

    // 更新其他字段
    if (name !== undefined) kp.name = name;
    if (content !== undefined) kp.content = content;
    if (extension !== undefined) kp.extension = extension || null;
    if (categoryId !== undefined) kp.categoryId = categoryId || null;

    return this.kpRepository.save(kp);
  }

  /**
   * 删除知识点
   *
   * 删除前会检查：
   * 1. 是否有子知识点
   * 2. 是否有关联题目
   *
   * @param id 知识点 ID
   * @throws {BadRequestException} 有子知识点或关联题目时不能删除
   */
  async remove(id: string): Promise<void> {
    const kp = await this.findById(id);

    // 1. 检查是否有子知识点
    const childCount = await this.kpRepository.count({
      where: { parentId: id },
    });
    if (childCount > 0) {
      throw new BadRequestException('请先删除子知识点');
    }

    // 2. 检查是否有关联题目
    if (kp.questionCount > 0) {
      throw new BadRequestException(`该知识点下有 ${kp.questionCount} 道题目，请先处理相关题目`);
    }

    // 3. 删除知识点（标签关联会自动清理）
    await this.kpRepository.remove(kp);
  }

  /**
   * 构建知识点树
   *
   * 使用 Map 数据结构优化树的构建过程，时间复杂度 O(n)
   *
   * @param kps 知识点列表
   * @returns 树形结构的知识点节点数组
   * @private
   */
  private buildTree(kps: KnowledgePoint[]): KnowledgePointTreeNode[] {
    const map = new Map<string, KnowledgePointTreeNode>();
    const roots: KnowledgePointTreeNode[] = [];

    // 创建节点映射
    kps.forEach((kp) => {
      map.set(kp.id, {
        id: kp.id,
        name: kp.name,
        level: kp.level,
        path: kp.path,
        questionCount: kp.questionCount,
        categoryId: kp.categoryId,
        children: [],
      });
    });

    // 构建树结构
    kps.forEach((kp) => {
      const node = map.get(kp.id)!;
      if (kp.parentId) {
        const parent = map.get(kp.parentId);
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
