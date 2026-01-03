/**
 * 标签服务
 */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto, UpdateTagDto } from './dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  /**
   * 创建标签
   */
  async create(createTagDto: CreateTagDto): Promise<Tag> {
    // 检查名称是否重复
    const existingTag = await this.tagRepository.findOne({
      where: { name: createTagDto.name },
    });
    if (existingTag) {
      throw new ConflictException('标签名称已存在');
    }

    const tag = this.tagRepository.create(createTagDto);
    return this.tagRepository.save(tag);
  }

  /**
   * 获取所有标签
   */
  async findAll(): Promise<Tag[]> {
    return this.tagRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 根据 ID 查找标签
   */
  async findById(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException('标签不存在');
    }
    return tag;
  }

  /**
   * 根据 ID 列表查找标签
   */
  async findByIds(ids: string[]): Promise<Tag[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    return this.tagRepository.find({
      where: { id: In(ids) },
    });
  }

  /**
   * 更新标签
   */
  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findById(id);

    // 检查名称是否与其他标签重复
    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      const existingTag = await this.tagRepository.findOne({
        where: { name: updateTagDto.name },
      });
      if (existingTag) {
        throw new ConflictException('标签名称已存在');
      }
    }

    Object.assign(tag, updateTagDto);
    return this.tagRepository.save(tag);
  }

  /**
   * 删除标签
   * 注意：删除标签时，题目与标签的关联会自动清理（通过数据库外键约束）
   */
  async remove(id: string): Promise<void> {
    const tag = await this.findById(id);
    await this.tagRepository.remove(tag);
  }

  /**
   * 更新标签题目数量
   */
  async updateQuestionCount(id: string, delta: number): Promise<void> {
    await this.tagRepository.increment({ id }, 'questionCount', delta);
  }

  /**
   * 批量更新标签题目数量
   */
  async updateQuestionCounts(ids: string[], delta: number): Promise<void> {
    if (ids.length === 0) return;
    await this.tagRepository
      .createQueryBuilder()
      .update(Tag)
      .set({ questionCount: () => `"questionCount" + ${delta}` })
      .whereInIds(ids)
      .execute();
  }
}
