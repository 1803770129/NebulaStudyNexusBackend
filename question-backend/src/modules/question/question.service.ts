/**
 * 题目服务
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question, Option, RichContent } from './entities/question.entity';
import { CreateQuestionDto, UpdateQuestionDto, QueryQuestionDto } from './dto';
import { OptionDto } from './dto/option.dto';
import { CategoryService } from '@/modules/category/category.service';
import { TagService } from '@/modules/tag/tag.service';
import { ContentService } from '@/modules/content/content.service';
import { KnowledgePointService } from '@/modules/knowledge-point/knowledge-point.service';
import { PaginationResponseDto } from '@/common/dto/pagination-response.dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    private readonly contentService: ContentService,
    private readonly knowledgePointService: KnowledgePointService,
  ) {}

  /**
   * 处理选项内容，将原始 HTML 转换为 RichContent
   */
  private async processOptions(options?: OptionDto[]): Promise<Option[] | undefined> {
    if (!options || options.length === 0) {
      return undefined;
    }

    const processedOptions: Option[] = [];
    for (const option of options) {
      const richContent = await this.contentService.processContent(option.content);
      processedOptions.push({
        id: option.id,
        content: richContent,
        isCorrect: option.isCorrect,
      });
    }
    return processedOptions;
  }

  /**
   * 创建题目
   */
  async create(createQuestionDto: CreateQuestionDto, creatorId: string): Promise<Question> {
    const {
      tagIds,
      categoryId,
      knowledgePointIds,
      content,
      explanation,
      options,
      ...questionData
    } = createQuestionDto;

    // 验证分类存在
    await this.categoryService.findById(categoryId);

    // 获取标签
    const tags = tagIds ? await this.tagService.findByIds(tagIds) : [];

    // 获取知识点
    const knowledgePoints = knowledgePointIds
      ? await this.knowledgePointService.findByIds(knowledgePointIds)
      : [];

    // 处理富文本内容
    const processedContent = await this.contentService.processContent(content);
    const processedExplanation = explanation
      ? await this.contentService.processContent(explanation)
      : null;
    const processedOptions = await this.processOptions(options);

    // 创建题目
    const question = this.questionRepository.create({
      ...questionData,
      content: processedContent,
      explanation: processedExplanation,
      options: processedOptions,
      categoryId,
      tags,
      knowledgePoints,
      creatorId,
    });

    const savedQuestion = await this.questionRepository.save(question);

    // 更新分类和标签的题目数量
    await this.categoryService.updateQuestionCount(categoryId, 1);
    if (tagIds && tagIds.length > 0) {
      await this.tagService.updateQuestionCounts(tagIds, 1);
    }
    if (knowledgePointIds && knowledgePointIds.length > 0) {
      await this.knowledgePointService.updateQuestionCounts(knowledgePointIds, 1);
    }

    return savedQuestion;
  }

  /**
   * 分页查询题目（返回 rendered 内容用于展示）
   */
  async findAll(queryDto: QueryQuestionDto): Promise<PaginationResponseDto<Question>> {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      categoryId,
      type,
      difficulty,
      tagIds,
      knowledgePointIds,
    } = queryDto;

    const queryBuilder = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.category', 'category')
      .leftJoinAndSelect('question.tags', 'tag')
      .leftJoinAndSelect('question.knowledgePoints', 'knowledgePoints')
      .leftJoinAndSelect('question.creator', 'creator');

    // 关键词搜索（搜索 raw 内容）
    if (keyword) {
      queryBuilder.andWhere(
        "(question.title ILIKE :keyword OR question.content->>'raw' ILIKE :keyword)",
        { keyword: `%${keyword}%` },
      );
    }

    // 分类筛选
    if (categoryId) {
      queryBuilder.andWhere('question.categoryId = :categoryId', { categoryId });
    }

    // 类型筛选
    if (type) {
      queryBuilder.andWhere('question.type = :type', { type });
    }

    // 难度筛选
    if (difficulty) {
      queryBuilder.andWhere('question.difficulty = :difficulty', { difficulty });
    }

    // 标签筛选
    if (tagIds && tagIds.length > 0) {
      queryBuilder
        .andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select('qt.questionId')
            .from('question_tags', 'qt')
            .where('qt.tagId IN (:...tagIds)')
            .getQuery();
          return `question.id IN ${subQuery}`;
        })
        .setParameter('tagIds', tagIds);
    }

    // 知识点筛选
    if (knowledgePointIds && knowledgePointIds.length > 0) {
      queryBuilder
        .innerJoin('question.knowledgePoints', 'kp')
        .andWhere('kp.id IN (:...knowledgePointIds)', { knowledgePointIds });
    }

    // 排序
    queryBuilder.orderBy('question.createdAt', 'DESC');

    // 分页
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    // 执行查询
    const [data, total] = await queryBuilder.getManyAndCount();

    return new PaginationResponseDto(data, total, page, pageSize);
  }

  /**
   * 根据 ID 查找题目（返回完整内容，包含 raw 和 rendered）
   */
  async findById(id: string): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['category', 'tags', 'knowledgePoints', 'creator'],
    });

    if (!question) {
      throw new NotFoundException('题目不存在');
    }

    return question;
  }

  /**
   * 根据 ID 查找题目用于编辑（返回 raw 内容）
   */
  async findByIdForEdit(id: string): Promise<Question> {
    return this.findById(id);
  }

  /**
   * 更新题目
   */
  async update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    const question = await this.findById(id);
    const { tagIds, categoryId, knowledgePointIds, content, explanation, options, ...updateData } =
      updateQuestionDto;

    // 如果更改分类
    if (categoryId && categoryId !== question.categoryId) {
      await this.categoryService.findById(categoryId);
      await this.categoryService.updateQuestionCount(question.categoryId, -1);
      await this.categoryService.updateQuestionCount(categoryId, 1);
      question.categoryId = categoryId;
    }

    // 如果更改标签
    if (tagIds !== undefined) {
      const oldTagIds = question.tags.map((t) => t.id);
      const newTags = await this.tagService.findByIds(tagIds);

      // 更新标签计数
      const removedTagIds = oldTagIds.filter((id) => !tagIds.includes(id));
      const addedTagIds = tagIds.filter((id) => !oldTagIds.includes(id));

      if (removedTagIds.length > 0) {
        await this.tagService.updateQuestionCounts(removedTagIds, -1);
      }
      if (addedTagIds.length > 0) {
        await this.tagService.updateQuestionCounts(addedTagIds, 1);
      }

      question.tags = newTags;
    }

    // 如果更改知识点
    if (knowledgePointIds !== undefined) {
      const oldKpIds = question.knowledgePoints.map((kp) => kp.id);
      const newKnowledgePoints = await this.knowledgePointService.findByIds(knowledgePointIds);

      // 更新知识点计数
      const removedKpIds = oldKpIds.filter((id) => !knowledgePointIds.includes(id));
      const addedKpIds = knowledgePointIds.filter((id) => !oldKpIds.includes(id));

      if (removedKpIds.length > 0) {
        await this.knowledgePointService.updateQuestionCounts(removedKpIds, -1);
      }
      if (addedKpIds.length > 0) {
        await this.knowledgePointService.updateQuestionCounts(addedKpIds, 1);
      }

      question.knowledgePoints = newKnowledgePoints;
    }

    // 处理富文本内容
    if (content !== undefined) {
      question.content = await this.contentService.processContent(content);
    }

    if (explanation !== undefined) {
      question.explanation = explanation
        ? await this.contentService.processContent(explanation)
        : null;
    }

    if (options !== undefined) {
      question.options = (await this.processOptions(options)) ?? null;
    }

    // 更新其他字段
    Object.assign(question, updateData);

    return this.questionRepository.save(question);
  }

  /**
   * 删除题目
   */
  async remove(id: string): Promise<void> {
    const question = await this.findById(id);

    // 更新分类和标签的题目数量
    await this.categoryService.updateQuestionCount(question.categoryId, -1);
    const tagIds = question.tags.map((t) => t.id);
    if (tagIds.length > 0) {
      await this.tagService.updateQuestionCounts(tagIds, -1);
    }

    // 更新知识点的题目数量
    const kpIds = question.knowledgePoints.map((kp) => kp.id);
    if (kpIds.length > 0) {
      await this.knowledgePointService.updateQuestionCounts(kpIds, -1);
    }

    await this.questionRepository.remove(question);
  }
}
