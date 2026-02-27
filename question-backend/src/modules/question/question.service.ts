/**
 * 题目服务
 */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationResponseDto } from '@/common/dto/pagination-response.dto';
import { CategoryService } from '@/modules/category/category.service';
import { ContentService } from '@/modules/content/content.service';
import { KnowledgePointService } from '@/modules/knowledge-point/knowledge-point.service';
import { TagService } from '@/modules/tag/tag.service';
import { CreateQuestionDto, QueryQuestionDto, UpdateQuestionDto } from './dto';
import { OptionDto } from './dto/option.dto';
import { Option, Question } from './entities/question.entity';
import { QuestionStatus, QuestionType } from './enums';
import { QuestionRuleEngineService } from './question-rule-engine.service';

const QUESTION_STATUS_TRANSITIONS: Record<QuestionStatus, QuestionStatus[]> = {
  [QuestionStatus.DRAFT]: [QuestionStatus.REVIEWED, QuestionStatus.ARCHIVED],
  [QuestionStatus.REVIEWED]: [QuestionStatus.DRAFT, QuestionStatus.PUBLISHED, QuestionStatus.ARCHIVED],
  [QuestionStatus.PUBLISHED]: [QuestionStatus.ARCHIVED],
  [QuestionStatus.ARCHIVED]: [QuestionStatus.DRAFT],
};

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    private readonly contentService: ContentService,
    private readonly knowledgePointService: KnowledgePointService,
    private readonly questionRuleEngine: QuestionRuleEngineService,
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

  private extractOptionRulesFromEntity(question: Question): Array<{ id: string; isCorrect: boolean }> {
    return (question.options ?? []).map((option) => ({
      id: option.id,
      isCorrect: option.isCorrect,
    }));
  }

  private extractOptionRulesFromDto(options?: OptionDto[]): Array<{ id: string; isCorrect: boolean }> {
    return (options ?? []).map((option) => ({
      id: option.id,
      isCorrect: option.isCorrect,
    }));
  }

  private typeSupportsOptions(type: QuestionType): boolean {
    return (
      type === QuestionType.SINGLE_CHOICE ||
      type === QuestionType.MULTIPLE_CHOICE ||
      type === QuestionType.TRUE_FALSE
    );
  }

  private clearWorkflowMetadata(question: Question): void {
    question.reviewedAt = null;
    question.reviewedById = null;
    question.publishedAt = null;
    question.publishedById = null;
    question.archivedAt = null;
    question.archivedById = null;
  }

  private ensureQuestionRules(type: QuestionType, answer: string | string[], optionRules: OptionDto[]): void {
    this.questionRuleEngine.validateOrThrow({
      type,
      answer,
      options: this.extractOptionRulesFromDto(optionRules),
    });
  }

  private ensureQuestionRulesFromEntity(question: Question): void {
    this.questionRuleEngine.validateOrThrow({
      type: question.type,
      answer: question.answer as string | string[],
      options: this.extractOptionRulesFromEntity(question),
    });
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
      type,
      answer,
      ...questionData
    } = createQuestionDto;

    this.ensureQuestionRules(type, answer, options ?? []);

    await this.categoryService.findById(categoryId);

    const tags = tagIds ? await this.tagService.findByIds(tagIds) : [];
    const knowledgePoints = knowledgePointIds
      ? await this.knowledgePointService.findByIds(knowledgePointIds)
      : [];

    const processedContent = await this.contentService.processContent(content);
    const processedExplanation = explanation
      ? await this.contentService.processContent(explanation)
      : null;
    const processedOptions = await this.processOptions(options);

    const question = this.questionRepository.create({
      ...questionData,
      type,
      answer,
      content: processedContent,
      explanation: processedExplanation,
      options: processedOptions ?? null,
      categoryId,
      tags,
      knowledgePoints,
      creatorId,
      status: QuestionStatus.DRAFT,
      reviewedAt: null,
      reviewedById: null,
      publishedAt: null,
      publishedById: null,
      archivedAt: null,
      archivedById: null,
    });

    const savedQuestion = await this.questionRepository.save(question);

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
   * 分页查询题目
   */
  async findAll(queryDto: QueryQuestionDto): Promise<PaginationResponseDto<Question>> {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      categoryId,
      type,
      difficulty,
      status,
      tagIds,
      knowledgePointIds,
    } = queryDto;

    const queryBuilder = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.category', 'category')
      .leftJoinAndSelect('question.tags', 'tag')
      .leftJoinAndSelect('question.knowledgePoints', 'knowledgePoints')
      .leftJoinAndSelect('question.creator', 'creator');

    if (keyword) {
      queryBuilder.andWhere(
        "(question.title ILIKE :keyword OR question.content->>'raw' ILIKE :keyword)",
        { keyword: `%${keyword}%` },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('question.categoryId = :categoryId', { categoryId });
    }

    if (type) {
      queryBuilder.andWhere('question.type = :type', { type });
    }

    if (difficulty) {
      queryBuilder.andWhere('question.difficulty = :difficulty', { difficulty });
    }

    if (status) {
      queryBuilder.andWhere('question.status = :status', { status });
    }

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

    if (knowledgePointIds && knowledgePointIds.length > 0) {
      queryBuilder
        .innerJoin('question.knowledgePoints', 'kp')
        .andWhere('kp.id IN (:...knowledgePointIds)', { knowledgePointIds });
    }

    queryBuilder.orderBy('question.createdAt', 'DESC');
    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await queryBuilder.getManyAndCount();
    return new PaginationResponseDto(data, total, page, pageSize);
  }

  /**
   * 根据 ID 查询题目
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
   * 根据 ID 查询题目用于编辑
   */
  async findByIdForEdit(id: string): Promise<Question> {
    return this.findById(id);
  }

  /**
   * 更新题目
   */
  async update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    const question = await this.findById(id);

    if (question.status === QuestionStatus.PUBLISHED) {
      throw new ConflictException('已发布题目不允许直接修改，请先归档后再处理');
    }
    if (question.status === QuestionStatus.ARCHIVED) {
      throw new ConflictException('已归档题目不允许修改');
    }

    const {
      tagIds,
      categoryId,
      knowledgePointIds,
      content,
      explanation,
      options,
      type,
      answer,
      ...updateData
    } = updateQuestionDto;

    const nextType = type ?? question.type;
    const nextAnswer = (answer ?? question.answer) as string | string[];
    let nextOptionRules: Array<{ id: string; isCorrect: boolean }>;
    if (options !== undefined) {
      nextOptionRules = this.extractOptionRulesFromDto(options);
    } else if (this.typeSupportsOptions(nextType)) {
      nextOptionRules = this.extractOptionRulesFromEntity(question);
    } else {
      nextOptionRules = [];
    }

    this.questionRuleEngine.validateOrThrow({
      type: nextType,
      answer: nextAnswer,
      options: nextOptionRules,
    });

    if (categoryId && categoryId !== question.categoryId) {
      await this.categoryService.findById(categoryId);
      await this.categoryService.updateQuestionCount(question.categoryId, -1);
      await this.categoryService.updateQuestionCount(categoryId, 1);
      question.categoryId = categoryId;
    }

    if (tagIds !== undefined) {
      const oldTagIds = question.tags.map((tag) => tag.id);
      const newTags = await this.tagService.findByIds(tagIds);

      const removedTagIds = oldTagIds.filter((tagId) => !tagIds.includes(tagId));
      const addedTagIds = tagIds.filter((tagId) => !oldTagIds.includes(tagId));

      if (removedTagIds.length > 0) {
        await this.tagService.updateQuestionCounts(removedTagIds, -1);
      }
      if (addedTagIds.length > 0) {
        await this.tagService.updateQuestionCounts(addedTagIds, 1);
      }

      question.tags = newTags;
    }

    if (knowledgePointIds !== undefined) {
      const oldKnowledgePointIds = question.knowledgePoints.map((kp) => kp.id);
      const newKnowledgePoints = await this.knowledgePointService.findByIds(knowledgePointIds);

      const removedKpIds = oldKnowledgePointIds.filter((kpId) => !knowledgePointIds.includes(kpId));
      const addedKpIds = knowledgePointIds.filter((kpId) => !oldKnowledgePointIds.includes(kpId));

      if (removedKpIds.length > 0) {
        await this.knowledgePointService.updateQuestionCounts(removedKpIds, -1);
      }
      if (addedKpIds.length > 0) {
        await this.knowledgePointService.updateQuestionCounts(addedKpIds, 1);
      }

      question.knowledgePoints = newKnowledgePoints;
    }

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
    } else if (!this.typeSupportsOptions(nextType)) {
      question.options = null;
    }

    Object.assign(question, updateData, {
      type: nextType,
      answer: nextAnswer,
    });

    if (question.status === QuestionStatus.REVIEWED) {
      question.status = QuestionStatus.DRAFT;
      this.clearWorkflowMetadata(question);
    }

    return this.questionRepository.save(question);
  }

  /**
   * 变更题目状态（审核/发布/归档）
   */
  async changeStatus(id: string, targetStatus: QuestionStatus, operatorId: string): Promise<Question> {
    const question = await this.findById(id);

    if (question.status === targetStatus) {
      return question;
    }

    const allowedTransitions = QUESTION_STATUS_TRANSITIONS[question.status] ?? [];
    if (!allowedTransitions.includes(targetStatus)) {
      throw new ConflictException(`不允许从 ${question.status} 变更到 ${targetStatus}`);
    }

    if (targetStatus === QuestionStatus.REVIEWED || targetStatus === QuestionStatus.PUBLISHED) {
      this.ensureQuestionRulesFromEntity(question);
    }

    const now = new Date();
    switch (targetStatus) {
      case QuestionStatus.DRAFT:
        this.clearWorkflowMetadata(question);
        break;
      case QuestionStatus.REVIEWED:
        question.reviewedAt = now;
        question.reviewedById = operatorId;
        question.publishedAt = null;
        question.publishedById = null;
        question.archivedAt = null;
        question.archivedById = null;
        break;
      case QuestionStatus.PUBLISHED:
        if (!question.reviewedAt) {
          throw new ConflictException('题目未审核，不能发布');
        }
        question.publishedAt = now;
        question.publishedById = operatorId;
        question.archivedAt = null;
        question.archivedById = null;
        break;
      case QuestionStatus.ARCHIVED:
        question.archivedAt = now;
        question.archivedById = operatorId;
        break;
      default:
        throw new ConflictException('不支持的状态变更');
    }

    question.status = targetStatus;
    return this.questionRepository.save(question);
  }

  /**
   * 删除题目
   */
  async remove(id: string): Promise<void> {
    const question = await this.findById(id);

    if (question.status === QuestionStatus.PUBLISHED) {
      throw new ConflictException('已发布题目不能直接删除，请先归档');
    }

    await this.categoryService.updateQuestionCount(question.categoryId, -1);

    const tagIds = question.tags.map((tag) => tag.id);
    if (tagIds.length > 0) {
      await this.tagService.updateQuestionCounts(tagIds, -1);
    }

    const knowledgePointIds = question.knowledgePoints.map((kp) => kp.id);
    if (knowledgePointIds.length > 0) {
      await this.knowledgePointService.updateQuestionCounts(knowledgePointIds, -1);
    }

    await this.questionRepository.remove(question);
  }
}
