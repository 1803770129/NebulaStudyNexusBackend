# 题目模块 (Question Module)

## 模块概述

题目模块是系统的核心模块，负责题目的 CRUD 操作、富文本内容处理、分页查询等功能。

## 文件结构

```
modules/question/
├── question.module.ts
├── question.controller.ts
├── question.service.ts
├── dto/
│   ├── create-question.dto.ts
│   ├── update-question.dto.ts
│   ├── query-question.dto.ts
│   └── option.dto.ts
├── entities/
│   └── question.entity.ts
└── enums/
    ├── question-type.enum.ts
    └── difficulty-level.enum.ts
```

## 数据模型

### 实体定义

```typescript
// entities/question.entity.ts
@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column('jsonb')
  content: RichContent;  // { raw: string, rendered: string }

  @Column({ type: 'enum', enum: QuestionType })
  type: QuestionType;

  @Column({ type: 'enum', enum: DifficultyLevel })
  difficulty: DifficultyLevel;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToMany(() => Tag)
  @JoinTable({ name: 'question_tags' })
  tags: Tag[];

  @Column('jsonb', { nullable: true })
  options: Option[];  // 选择题选项

  @Column('jsonb')
  answer: string | string[];  // 答案

  @Column('jsonb', { nullable: true })
  explanation: RichContent;  // 解析

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column({ type: 'uuid' })
  creatorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 枚举定义

```typescript
// enums/question-type.enum.ts
export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',     // 单选题
  MULTIPLE_CHOICE = 'multiple_choice', // 多选题
  TRUE_FALSE = 'true_false',           // 判断题
  FILL_BLANK = 'fill_blank',           // 填空题
  SHORT_ANSWER = 'short_answer',       // 简答题
}

// enums/difficulty-level.enum.ts
export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}
```

### 富文本内容结构

```typescript
interface RichContent {
  raw: string;      // 原始 HTML（包含 LaTeX 标记）
  rendered: string; // 渲染后 HTML（公式转图片）
}

interface Option {
  id: string;
  content: RichContent;
  isCorrect: boolean;
}
```

## DTO 定义

### 创建题目

```typescript
// dto/create-question.dto.ts
export class CreateQuestionDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  content: string;  // 原始 HTML

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options?: OptionDto[];

  @IsNotEmpty()
  answer: string | string[];

  @IsOptional()
  @IsString()
  explanation?: string;
}
```

### 查询题目

```typescript
// dto/query-question.dto.ts
export class QueryQuestionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}
```

## 服务实现

```typescript
// question.service.ts
@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    private categoryService: CategoryService,
    private tagService: TagService,
    private contentService: ContentService,
  ) {}

  // 创建题目
  async create(dto: CreateQuestionDto, creatorId: string): Promise<Question> {
    // 验证分类存在
    await this.categoryService.findById(dto.categoryId);

    // 获取标签
    const tags = dto.tagIds 
      ? await this.tagService.findByIds(dto.tagIds) 
      : [];

    // 处理富文本内容（提取图片、渲染公式）
    const processedContent = await this.contentService.processContent(dto.content);
    const processedExplanation = dto.explanation
      ? await this.contentService.processContent(dto.explanation)
      : null;
    const processedOptions = await this.processOptions(dto.options);

    // 创建并保存
    const question = this.questionRepository.create({
      ...dto,
      content: processedContent,
      explanation: processedExplanation,
      options: processedOptions,
      tags,
      creatorId,
    });

    return this.questionRepository.save(question);
  }

  // 分页查询
  async findAll(queryDto: QueryQuestionDto): Promise<PaginationResponseDto<Question>> {
    const { page, pageSize, keyword, categoryId, type, difficulty, tagIds } = queryDto;

    const queryBuilder = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.category', 'category')
      .leftJoinAndSelect('question.tags', 'tag');

    // 关键词搜索
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
    if (tagIds?.length) {
      queryBuilder.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('qt.questionId')
          .from('question_tags', 'qt')
          .where('qt.tagId IN (:...tagIds)')
          .getQuery();
        return `question.id IN ${subQuery}`;
      }).setParameter('tagIds', tagIds);
    }

    // 排序和分页
    queryBuilder
      .orderBy('question.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [data, total] = await queryBuilder.getManyAndCount();

    return new PaginationResponseDto(data, total, page, pageSize);
  }
}
```

## 控制器实现

```typescript
// question.controller.ts
@ApiTags('questions')
@Controller('questions')
export class QuestionController {
  constructor(private questionService: QuestionService) {}

  @Post()
  @ApiOperation({ summary: '创建题目' })
  create(@Body() dto: CreateQuestionDto, @Request() req) {
    return this.questionService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '查询题目列表' })
  findAll(@Query() query: QueryQuestionDto) {
    return this.questionService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取题目详情' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新题目' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.questionService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除题目' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionService.remove(id);
  }
}
```

## 内容处理服务

```typescript
// content/content.service.ts
@Injectable()
export class ContentService {
  // 处理富文本内容
  async processContent(rawHtml: string): Promise<RichContent> {
    // 1. 提取并处理图片
    // 2. 渲染 LaTeX 公式
    // 3. 返回原始和渲染后的内容
    return {
      raw: rawHtml,
      rendered: this.renderContent(rawHtml),
    };
  }

  private renderContent(html: string): string {
    // 将 LaTeX 公式渲染为图片或 MathML
    return html.replace(
      /<span class="latex-formula" data-latex="([^"]+)">[^<]*<\/span>/g,
      (_, latex) => this.renderLatex(decodeURIComponent(latex)),
    );
  }
}
```
