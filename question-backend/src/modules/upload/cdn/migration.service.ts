import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Question } from '@/modules/question/entities/question.entity';
import { MigrationConfig, MigrationResult } from './interfaces';

/**
 * 迁移服务
 *
 * 负责将 jsDelivr URL 批量迁移到 Statically URL
 */
@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 执行迁移
   *
   * 批量更新数据库中的 jsDelivr URL 为 Statically URL
   *
   * @param config 迁移配置
   * @returns 迁移结果
   */
  async migrate(config: Partial<MigrationConfig> = {}): Promise<MigrationResult> {
    const batchSize = config.batchSize || 100;
    const dryRun = config.dryRun || false;

    this.logger.log(`Starting migration (dryRun: ${dryRun}, batchSize: ${batchSize})`);

    const result: MigrationResult = {
      totalRecords: 0,
      updatedRecords: 0,
      failedRecords: 0,
      skippedRecords: 0,
      errors: [],
    };

    try {
      // 获取所有问题
      const questions = await this.questionRepository.find();
      result.totalRecords = questions.length;

      this.logger.log(`Found ${result.totalRecords} questions to process`);

      // 分批处理
      for (let i = 0; i < questions.length; i += batchSize) {
        const batch = questions.slice(i, i + batchSize);
        await this.processBatch(batch, result, dryRun);
      }

      this.logger.log('Migration completed', {
        totalRecords: result.totalRecords,
        updatedRecords: result.updatedRecords,
        skippedRecords: result.skippedRecords,
        failedRecords: result.failedRecords,
      });

      return result;
    } catch (error) {
      this.logger.error('Migration failed', error);
      throw error;
    }
  }

  /**
   * 处理一批记录
   */
  private async processBatch(
    questions: Question[],
    result: MigrationResult,
    dryRun: boolean,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const question of questions) {
        try {
          const updated = this.migrateQuestion(question);

          if (!updated) {
            result.skippedRecords++;
            continue;
          }

          if (!dryRun) {
            await queryRunner.manager.save(Question, question);
          }

          result.updatedRecords++;
        } catch (error) {
          result.failedRecords++;
          result.errors.push({
            recordId: question.id,
            error: error.message,
          });
          this.logger.error(`Failed to migrate question ${question.id}`, error);
        }
      }

      if (!dryRun) {
        await queryRunner.commitTransaction();
      } else {
        await queryRunner.rollbackTransaction();
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 迁移单个问题的 URL
   *
   * @param question 问题实体
   * @returns 是否有更新
   */
  private migrateQuestion(question: Question): boolean {
    let hasChanges = false;

    // 迁移 content
    if (question.content?.rendered) {
      const newRendered = this.convertURLsInText(question.content.rendered);
      if (newRendered !== question.content.rendered) {
        question.content.rendered = newRendered;
        hasChanges = true;
      }
    }

    // 迁移 explanation
    if (question.explanation?.rendered) {
      const newRendered = this.convertURLsInText(question.explanation.rendered);
      if (newRendered !== question.explanation.rendered) {
        question.explanation.rendered = newRendered;
        hasChanges = true;
      }
    }

    // 迁移 options
    if (question.options && Array.isArray(question.options)) {
      for (const option of question.options) {
        if (option.content?.rendered) {
          const newRendered = this.convertURLsInText(option.content.rendered);
          if (newRendered !== option.content.rendered) {
            option.content.rendered = newRendered;
            hasChanges = true;
          }
        }
      }
    }

    return hasChanges;
  }

  /**
   * 转换文本中的所有 jsDelivr URL 为 Statically URL
   *
   * @param text 包含 URL 的文本
   * @returns 转换后的文本
   */
  private convertURLsInText(text: string): string {
    // 匹配所有 jsDelivr URL
    const jsDelivrRegex =
      /https:\/\/cdn\.jsdelivr\.net\/gh\/([^\/]+)\/([^@]+)@([^\/]+)\/(.+?)(?=["'\s<>]|$)/g;

    return text.replace(jsDelivrRegex, (match, owner, repo, branch, path) => {
      return this.convertURL(match);
    });
  }

  /**
   * 转换单个 URL
   *
   * 将 jsDelivr URL 转换为 Statically URL
   * 格式：
   * - jsDelivr: https://cdn.jsdelivr.net/gh/{owner}/{repo}@{branch}/{path}
   * - Statically: https://cdn.statically.io/gh/{owner}/{repo}@{branch}/{path}
   *
   * @param jsDelivrURL jsDelivr URL
   * @returns Statically URL
   */
  convertURL(jsDelivrURL: string): string {
    if (!this.isJsDelivrURL(jsDelivrURL)) {
      return jsDelivrURL;
    }

    // 提取 jsDelivr URL 的各个部分
    const jsDelivrPattern = /https:\/\/cdn\.jsdelivr\.net\/gh\/([^\/]+)\/([^@]+)@([^\/]+)\/(.+)/;
    const match = jsDelivrURL.match(jsDelivrPattern);

    if (!match) {
      return jsDelivrURL;
    }

    const [, owner, repo, branch, path] = match;
    return `https://cdn.statically.io/gh/${owner}/${repo}@${branch}/${path}`;
  }

  /**
   * 检查是否为 jsDelivr URL
   *
   * @param url URL 字符串
   * @returns 是否为 jsDelivr URL
   */
  isJsDelivrURL(url: string): boolean {
    return url.startsWith('https://cdn.jsdelivr.net/gh/');
  }

  /**
   * 检查是否为 Statically URL
   *
   * @param url URL 字符串
   * @returns 是否为 Statically URL
   */
  isStaticallyURL(url: string): boolean {
    return url.startsWith('https://cdn.statically.io/gh/');
  }

  /**
   * 回滚迁移
   *
   * 将 Statically URL 转换回 jsDelivr URL
   *
   * @param config 迁移配置
   * @returns 迁移结果
   */
  async rollback(config: Partial<MigrationConfig> = {}): Promise<MigrationResult> {
    const batchSize = config.batchSize || 100;
    const dryRun = config.dryRun || false;

    this.logger.log(`Starting rollback (dryRun: ${dryRun}, batchSize: ${batchSize})`);

    const result: MigrationResult = {
      totalRecords: 0,
      updatedRecords: 0,
      failedRecords: 0,
      skippedRecords: 0,
      errors: [],
    };

    try {
      // 获取所有问题
      const questions = await this.questionRepository.find();
      result.totalRecords = questions.length;

      this.logger.log(`Found ${result.totalRecords} questions to process`);

      // 分批处理
      for (let i = 0; i < questions.length; i += batchSize) {
        const batch = questions.slice(i, i + batchSize);
        await this.processRollbackBatch(batch, result, dryRun);
      }

      this.logger.log('Rollback completed', {
        totalRecords: result.totalRecords,
        updatedRecords: result.updatedRecords,
        skippedRecords: result.skippedRecords,
        failedRecords: result.failedRecords,
      });

      return result;
    } catch (error) {
      this.logger.error('Rollback failed', error);
      throw error;
    }
  }

  /**
   * 处理回滚批次
   */
  private async processRollbackBatch(
    questions: Question[],
    result: MigrationResult,
    dryRun: boolean,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const question of questions) {
        try {
          const updated = this.rollbackQuestion(question);

          if (!updated) {
            result.skippedRecords++;
            continue;
          }

          if (!dryRun) {
            await queryRunner.manager.save(Question, question);
          }

          result.updatedRecords++;
        } catch (error) {
          result.failedRecords++;
          result.errors.push({
            recordId: question.id,
            error: error.message,
          });
          this.logger.error(`Failed to rollback question ${question.id}`, error);
        }
      }

      if (!dryRun) {
        await queryRunner.commitTransaction();
      } else {
        await queryRunner.rollbackTransaction();
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 回滚单个问题的 URL
   */
  private rollbackQuestion(question: Question): boolean {
    let hasChanges = false;

    // 回滚 content
    if (question.content?.rendered) {
      const newRendered = this.convertStaticallyToJsDelivr(question.content.rendered);
      if (newRendered !== question.content.rendered) {
        question.content.rendered = newRendered;
        hasChanges = true;
      }
    }

    // 回滚 explanation
    if (question.explanation?.rendered) {
      const newRendered = this.convertStaticallyToJsDelivr(question.explanation.rendered);
      if (newRendered !== question.explanation.rendered) {
        question.explanation.rendered = newRendered;
        hasChanges = true;
      }
    }

    // 回滚 options
    if (question.options && Array.isArray(question.options)) {
      for (const option of question.options) {
        if (option.content?.rendered) {
          const newRendered = this.convertStaticallyToJsDelivr(option.content.rendered);
          if (newRendered !== option.content.rendered) {
            option.content.rendered = newRendered;
            hasChanges = true;
          }
        }
      }
    }

    return hasChanges;
  }

  /**
   * 转换文本中的所有 Statically URL 为 jsDelivr URL
   */
  private convertStaticallyToJsDelivr(text: string): string {
    // 匹配所有 Statically URL
    const staticallyRegex =
      /https:\/\/cdn\.statically\.io\/gh\/([^\/]+)\/([^@]+)@([^\/]+)\/(.+?)(?=["'\s<>]|$)/g;

    return text.replace(staticallyRegex, (match, owner, repo, branch, path) => {
      return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${path}`;
    });
  }

  /**
   * 生成迁移报告
   *
   * @param result 迁移结果
   * @returns 格式化的报告字符串
   */
  generateReport(result: MigrationResult): string {
    const lines: string[] = [];

    lines.push('='.repeat(60));
    lines.push('迁移报告');
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`总记录数: ${result.totalRecords}`);
    lines.push(`更新记录数: ${result.updatedRecords}`);
    lines.push(`跳过记录数: ${result.skippedRecords}`);
    lines.push(`失败记录数: ${result.failedRecords}`);
    lines.push('');

    if (result.totalRecords > 0) {
      const successRate = ((result.updatedRecords / result.totalRecords) * 100).toFixed(2);
      lines.push(`成功率: ${successRate}%`);
    }

    lines.push('');

    if (result.errors.length > 0) {
      lines.push('错误详情:');
      lines.push('-'.repeat(60));
      for (const error of result.errors) {
        lines.push(`记录 ID: ${error.recordId}`);
        lines.push(`错误: ${error.error}`);
        lines.push('');
      }
    } else {
      lines.push('没有错误发生');
    }

    lines.push('='.repeat(60));

    return lines.join('\n');
  }
}
