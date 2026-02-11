import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MigrationService } from './migration.service';
import { Question, RichContent, Option } from '@/modules/question/entities/question.entity';

describe('MigrationService', () => {
  let service: MigrationService;
  let questionRepository: Repository<Question>;
  let dataSource: DataSource;

  // Mock QueryRunner
  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      save: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MigrationService,
        {
          provide: getRepositoryToken(Question),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(() => mockQueryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<MigrationService>(MigrationService);
    questionRepository = module.get<Repository<Question>>(getRepositoryToken(Question));
    dataSource = module.get<DataSource>(DataSource);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('convertURL', () => {
    it('should convert jsDelivr URL to Statically URL', () => {
      const jsDelivrURL = 'https://cdn.jsdelivr.net/gh/owner/repo@main/images/test.jpg';
      const expected = 'https://cdn.statically.io/gh/owner/repo@main/images/test.jpg';
      
      expect(service.convertURL(jsDelivrURL)).toBe(expected);
    });

    it('should return original URL if not jsDelivr', () => {
      const url = 'https://example.com/image.jpg';
      expect(service.convertURL(url)).toBe(url);
    });

    it('should handle complex paths', () => {
      const jsDelivrURL = 'https://cdn.jsdelivr.net/gh/user/project@develop/path/to/image.png';
      const expected = 'https://cdn.statically.io/gh/user/project@develop/path/to/image.png';
      
      expect(service.convertURL(jsDelivrURL)).toBe(expected);
    });
  });

  describe('isJsDelivrURL', () => {
    it('should return true for jsDelivr URLs', () => {
      expect(service.isJsDelivrURL('https://cdn.jsdelivr.net/gh/owner/repo@main/image.jpg')).toBe(true);
    });

    it('should return false for non-jsDelivr URLs', () => {
      expect(service.isJsDelivrURL('https://cdn.statically.io/gh/owner/repo@main/image.jpg')).toBe(false);
      expect(service.isJsDelivrURL('https://example.com/image.jpg')).toBe(false);
    });
  });

  describe('isStaticallyURL', () => {
    it('should return true for Statically URLs', () => {
      expect(service.isStaticallyURL('https://cdn.statically.io/gh/owner/repo@main/image.jpg')).toBe(true);
    });

    it('should return false for non-Statically URLs', () => {
      expect(service.isStaticallyURL('https://cdn.jsdelivr.net/gh/owner/repo@main/image.jpg')).toBe(false);
      expect(service.isStaticallyURL('https://example.com/image.jpg')).toBe(false);
    });
  });

  describe('migrate', () => {
    it('should migrate questions with jsDelivr URLs', async () => {
      const mockQuestions: Partial<Question>[] = [
        {
          id: '1',
          content: {
            raw: 'test',
            rendered: '<img src="https://cdn.jsdelivr.net/gh/owner/repo@main/images/test.jpg">',
          },
          explanation: null,
          options: [],
        },
      ];

      jest.spyOn(questionRepository, 'find').mockResolvedValue(mockQuestions as Question[]);

      const result = await service.migrate({ dryRun: true, batchSize: 10 });

      expect(result.totalRecords).toBe(1);
      expect(result.updatedRecords).toBe(1);
      expect(result.skippedRecords).toBe(0);
      expect(result.failedRecords).toBe(0);
    });

    it('should skip questions without jsDelivr URLs', async () => {
      const mockQuestions: Partial<Question>[] = [
        {
          id: '1',
          content: {
            raw: 'test',
            rendered: '<img src="https://cdn.statically.io/gh/owner/repo@main/images/test.jpg">',
          },
          explanation: null,
          options: [],
        },
      ];

      jest.spyOn(questionRepository, 'find').mockResolvedValue(mockQuestions as Question[]);

      const result = await service.migrate({ dryRun: true, batchSize: 10 });

      expect(result.totalRecords).toBe(1);
      expect(result.updatedRecords).toBe(0);
      expect(result.skippedRecords).toBe(1);
    });

    it('should handle questions with multiple URLs in different fields', async () => {
      const mockQuestions: Partial<Question>[] = [
        {
          id: '1',
          content: {
            raw: 'test',
            rendered: '<img src="https://cdn.jsdelivr.net/gh/owner/repo@main/images/test1.jpg">',
          },
          explanation: {
            raw: 'explanation',
            rendered: '<img src="https://cdn.jsdelivr.net/gh/owner/repo@main/images/test2.jpg">',
          },
          options: [
            {
              id: 'opt1',
              content: {
                raw: 'option',
                rendered: '<img src="https://cdn.jsdelivr.net/gh/owner/repo@main/images/test3.jpg">',
              },
              isCorrect: true,
            },
          ],
        },
      ];

      jest.spyOn(questionRepository, 'find').mockResolvedValue(mockQuestions as Question[]);

      const result = await service.migrate({ dryRun: true, batchSize: 10 });

      expect(result.totalRecords).toBe(1);
      expect(result.updatedRecords).toBe(1);
    });

    it('should not modify database in dry run mode', async () => {
      const mockQuestions: Partial<Question>[] = [
        {
          id: '1',
          content: {
            raw: 'test',
            rendered: '<img src="https://cdn.jsdelivr.net/gh/owner/repo@main/images/test.jpg">',
          },
          explanation: null,
          options: [],
        },
      ];

      jest.spyOn(questionRepository, 'find').mockResolvedValue(mockQuestions as Question[]);

      await service.migrate({ dryRun: true, batchSize: 10 });

      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should commit transaction when not in dry run mode', async () => {
      const mockQuestions: Partial<Question>[] = [
        {
          id: '1',
          content: {
            raw: 'test',
            rendered: '<img src="https://cdn.jsdelivr.net/gh/owner/repo@main/images/test.jpg">',
          },
          explanation: null,
          options: [],
        },
      ];

      jest.spyOn(questionRepository, 'find').mockResolvedValue(mockQuestions as Question[]);

      await service.migrate({ dryRun: false, batchSize: 10 });

      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
    });
  });

  describe('rollback', () => {
    it('should rollback Statically URLs to jsDelivr', async () => {
      const mockQuestions: Partial<Question>[] = [
        {
          id: '1',
          content: {
            raw: 'test',
            rendered: '<img src="https://cdn.statically.io/gh/owner/repo@main/images/test.jpg">',
          },
          explanation: null,
          options: [],
        },
      ];

      jest.spyOn(questionRepository, 'find').mockResolvedValue(mockQuestions as Question[]);

      const result = await service.rollback({ dryRun: true, batchSize: 10 });

      expect(result.totalRecords).toBe(1);
      expect(result.updatedRecords).toBe(1);
    });

    it('should skip questions without Statically URLs', async () => {
      const mockQuestions: Partial<Question>[] = [
        {
          id: '1',
          content: {
            raw: 'test',
            rendered: '<img src="https://cdn.jsdelivr.net/gh/owner/repo@main/images/test.jpg">',
          },
          explanation: null,
          options: [],
        },
      ];

      jest.spyOn(questionRepository, 'find').mockResolvedValue(mockQuestions as Question[]);

      const result = await service.rollback({ dryRun: true, batchSize: 10 });

      expect(result.totalRecords).toBe(1);
      expect(result.updatedRecords).toBe(0);
      expect(result.skippedRecords).toBe(1);
    });
  });

  describe('generateReport', () => {
    it('should generate a formatted report', () => {
      const result = {
        totalRecords: 100,
        updatedRecords: 95,
        failedRecords: 2,
        skippedRecords: 3,
        errors: [
          { recordId: '1', error: 'Error 1' },
          { recordId: '2', error: 'Error 2' },
        ],
      };

      const report = service.generateReport(result);

      expect(report).toContain('总记录数: 100');
      expect(report).toContain('更新记录数: 95');
      expect(report).toContain('失败记录数: 2');
      expect(report).toContain('跳过记录数: 3');
      expect(report).toContain('成功率: 95.00%');
      expect(report).toContain('记录 ID: 1');
      expect(report).toContain('错误: Error 1');
    });

    it('should handle zero records', () => {
      const result = {
        totalRecords: 0,
        updatedRecords: 0,
        failedRecords: 0,
        skippedRecords: 0,
        errors: [],
      };

      const report = service.generateReport(result);

      expect(report).toContain('总记录数: 0');
      expect(report).toContain('没有错误发生');
    });
  });

  describe('URL conversion in text', () => {
    it('should convert multiple URLs in the same text', () => {
      const question: Partial<Question> = {
        id: '1',
        content: {
          raw: 'test',
          rendered: `
            <img src="https://cdn.jsdelivr.net/gh/owner/repo@main/images/test1.jpg">
            <img src="https://cdn.jsdelivr.net/gh/owner/repo@main/images/test2.jpg">
          `,
        },
        explanation: null,
        options: [],
      };

      jest.spyOn(questionRepository, 'find').mockResolvedValue([question as Question]);

      return service.migrate({ dryRun: true, batchSize: 10 }).then(result => {
        expect(result.updatedRecords).toBe(1);
      });
    });

    it('should preserve non-CDN URLs', () => {
      const question: Partial<Question> = {
        id: '1',
        content: {
          raw: 'test',
          rendered: `
            <img src="https://cdn.jsdelivr.net/gh/owner/repo@main/images/test.jpg">
            <img src="https://example.com/other.jpg">
          `,
        },
        explanation: null,
        options: [],
      };

      jest.spyOn(questionRepository, 'find').mockResolvedValue([question as Question]);

      return service.migrate({ dryRun: true, batchSize: 10 }).then(result => {
        expect(result.updatedRecords).toBe(1);
      });
    });
  });
});
