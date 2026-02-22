/**
 * 知识点服务单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { KnowledgePointService } from './knowledge-point.service';
import { KnowledgePoint } from './entities/knowledge-point.entity';
import { CategoryService } from '@/modules/category/category.service';
import { TagService } from '@/modules/tag/tag.service';
import { QueryKnowledgePointDto } from './dto/query-knowledge-point.dto';

describe('KnowledgePointService', () => {
  let service: KnowledgePointService;
  let repository: Repository<KnowledgePoint>;

  // Mock QueryBuilder
  const mockQueryBuilder = {
    createQueryBuilder: jest.fn(),
    leftJoinAndSelect: jest.fn(),
    andWhere: jest.fn(),
    orderBy: jest.fn(),
    addOrderBy: jest.fn(),
    skip: jest.fn(),
    take: jest.fn(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    // 设置链式调用
    mockQueryBuilder.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.leftJoinAndSelect.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.andWhere.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.orderBy.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.addOrderBy.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.skip.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.take.mockReturnValue(mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgePointService,
        {
          provide: getRepositoryToken(KnowledgePoint),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: mockQueryBuilder.createQueryBuilder,
          },
        },
        {
          provide: CategoryService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: TagService,
          useValue: {
            findByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<KnowledgePointService>(KnowledgePointService);
    repository = module.get<Repository<KnowledgePoint>>(getRepositoryToken(KnowledgePoint));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('应该返回分页的知识点列表', async () => {
      const mockKnowledgePoints = [
        {
          id: '1',
          name: '二叉树遍历',
          level: 1,
          questionCount: 10,
          category: { id: 'cat1', name: '数据结构' },
          tags: [],
        },
        {
          id: '2',
          name: '动态规划',
          level: 1,
          questionCount: 15,
          category: { id: 'cat2', name: '算法' },
          tags: [],
        },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockKnowledgePoints, 2]);

      const query: QueryKnowledgePointDto = {
        page: 1,
        limit: 20,
      };

      const result = await service.findAll(query);

      expect(result.data).toEqual(mockKnowledgePoints);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
      expect(mockQueryBuilder.createQueryBuilder).toHaveBeenCalledWith('kp');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('kp.category', 'category');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('kp.tags', 'tags');
    });

    it('应该支持按名称搜索', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const query: QueryKnowledgePointDto = {
        page: 1,
        limit: 20,
        search: '二叉树',
      };

      await service.findAll(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('kp.name ILIKE :search', {
        search: '%二叉树%',
      });
    });

    it('应该支持按分类筛选', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const query: QueryKnowledgePointDto = {
        page: 1,
        limit: 20,
        categoryId: 'cat-123',
      };

      await service.findAll(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('kp.categoryId = :categoryId', {
        categoryId: 'cat-123',
      });
    });

    it('应该支持按标签筛选', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const query: QueryKnowledgePointDto = {
        page: 1,
        limit: 20,
        tagId: 'tag-123',
      };

      await service.findAll(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('tags.id = :tagId', {
        tagId: 'tag-123',
      });
    });

    it('应该支持查询顶级知识点（parentId为空字符串）', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const query: QueryKnowledgePointDto = {
        page: 1,
        limit: 20,
        parentId: '',
      };

      await service.findAll(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('kp.parentId IS NULL');
    });

    it('应该支持按父知识点筛选', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const query: QueryKnowledgePointDto = {
        page: 1,
        limit: 20,
        parentId: 'parent-123',
      };

      await service.findAll(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('kp.parentId = :parentId', {
        parentId: 'parent-123',
      });
    });

    it('应该按层级和创建时间排序', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const query: QueryKnowledgePointDto = {
        page: 1,
        limit: 20,
      };

      await service.findAll(query);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('kp.level', 'ASC');
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith('kp.createdAt', 'DESC');
    });

    it('应该正确计算分页参数', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const query: QueryKnowledgePointDto = {
        page: 3,
        limit: 10,
      };

      await service.findAll(query);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20); // (3-1) * 10
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });
  });
});
