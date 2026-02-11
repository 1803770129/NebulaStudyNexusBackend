#!/usr/bin/env node
/**
 * 迁移脚本 - jsDelivr 到 Statically
 * 
 * 使用方法：
 * - 试运行: npm run migration:cdn -- --dry-run
 * - 执行迁移: npm run migration:cdn
 * - 回滚: npm run migration:cdn -- --rollback
 * - 回滚试运行: npm run migration:cdn -- --rollback --dry-run
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { MigrationService } from './migration.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const migrationService = app.get(MigrationService);

  // 解析命令行参数
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const rollback = args.includes('--rollback');
  const batchSize = parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || '100');

  console.log('\n' + '='.repeat(60));
  console.log('CDN URL 迁移脚本');
  console.log('='.repeat(60));
  console.log(`模式: ${rollback ? '回滚' : '迁移'}`);
  console.log(`试运行: ${dryRun ? '是' : '否'}`);
  console.log(`批处理大小: ${batchSize}`);
  console.log('='.repeat(60) + '\n');

  try {
    let result;

    if (rollback) {
      console.log('开始回滚 Statically URL 到 jsDelivr URL...\n');
      result = await migrationService.rollback({ dryRun, batchSize });
    } else {
      console.log('开始迁移 jsDelivr URL 到 Statically URL...\n');
      result = await migrationService.migrate({ dryRun, batchSize });
    }

    // 生成并打印报告
    const report = migrationService.generateReport(result);
    console.log('\n' + report);

    if (dryRun) {
      console.log('\n注意: 这是试运行模式，没有实际修改数据库。');
      console.log('要执行实际迁移，请移除 --dry-run 参数。\n');
    } else {
      console.log('\n迁移已完成！\n');
    }

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('\n迁移失败:', error.message);
    console.error(error.stack);
    await app.close();
    process.exit(1);
  }
}

bootstrap();
