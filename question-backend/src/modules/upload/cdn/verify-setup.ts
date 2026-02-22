/**
 * 设置验证脚本
 *
 * 验证项目结构和配置是否正确设置
 */

import * as fs from 'fs';
import * as path from 'path';

interface VerificationResult {
  success: boolean;
  message: string;
}

class SetupVerifier {
  private results: VerificationResult[] = [];

  /**
   * 验证文件是否存在
   */
  private verifyFileExists(filePath: string, description: string): void {
    const fullPath = path.resolve(__dirname, filePath);
    const exists = fs.existsSync(fullPath);
    this.results.push({
      success: exists,
      message: `${description}: ${exists ? '✓' : '✗'} ${filePath}`,
    });
  }

  /**
   * 验证目录是否存在
   */
  private verifyDirectoryExists(dirPath: string, description: string): void {
    const fullPath = path.resolve(__dirname, dirPath);
    const exists = fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
    this.results.push({
      success: exists,
      message: `${description}: ${exists ? '✓' : '✗'} ${dirPath}`,
    });
  }

  /**
   * 验证 package.json 中的依赖
   */
  private verifyDependency(packageJsonPath: string, dependency: string): void {
    const fullPath = path.resolve(__dirname, packageJsonPath);
    if (!fs.existsSync(fullPath)) {
      this.results.push({
        success: false,
        message: `依赖检查失败: package.json 不存在 ${packageJsonPath}`,
      });
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    const hasDevDep = packageJson.devDependencies?.[dependency];
    const hasDep = packageJson.dependencies?.[dependency];
    const exists = !!(hasDevDep || hasDep);

    this.results.push({
      success: exists,
      message: `依赖 ${dependency}: ${exists ? '✓' : '✗'}`,
    });
  }

  /**
   * 运行所有验证
   */
  public verify(): void {
    console.log('开始验证项目设置...\n');

    // 验证后端文件
    console.log('=== 后端文件验证 ===');
    this.verifyFileExists('./interfaces.ts', '共享类型定义');
    this.verifyFileExists('./jest.config.js', 'Jest 配置');
    this.verifyFileExists('./README.md', '模块文档');
    this.verifyFileExists('./PROJECT_STRUCTURE.md', '项目结构文档');
    this.verifyFileExists('../../../config/configuration.ts', '应用配置');
    this.verifyFileExists('../../../../.env.example', '环境变量示例');

    // 验证前端文件
    console.log('\n=== 前端文件验证 ===');
    this.verifyFileExists(
      '../../../../../question-managing/src/services/cdn/types.ts',
      '前端类型定义',
    );
    this.verifyFileExists(
      '../../../../../question-managing/src/services/cdn/README.md',
      '前端服务文档',
    );
    this.verifyFileExists('../../../../../question-managing/.env.example', '前端环境变量示例');
    this.verifyFileExists('../../../../../question-managing/vitest.config.ts', 'Vitest 配置');

    // 验证目录结构
    console.log('\n=== 目录结构验证 ===');
    this.verifyDirectoryExists('./', 'CDN 模块目录');
    this.verifyDirectoryExists(
      '../../../../../question-managing/src/services/cdn',
      '前端 CDN 服务目录',
    );

    // 验证依赖
    console.log('\n=== 依赖验证 ===');
    this.verifyDependency('../../../../package.json', 'jest');
    this.verifyDependency('../../../../package.json', 'fast-check');
    this.verifyDependency('../../../../package.json', 'ts-jest');
    this.verifyDependency('../../../../../question-managing/package.json', 'vitest');
    this.verifyDependency('../../../../../question-managing/package.json', 'fast-check');

    // 输出结果
    console.log('\n=== 验证结果 ===');
    const successCount = this.results.filter((r) => r.success).length;
    const totalCount = this.results.length;

    this.results.forEach((result) => {
      console.log(result.message);
    });

    console.log(`\n总计: ${successCount}/${totalCount} 项通过`);

    if (successCount === totalCount) {
      console.log('\n✓ 所有验证通过！项目设置完成。');
      process.exit(0);
    } else {
      console.log('\n✗ 部分验证失败，请检查上述错误。');
      process.exit(1);
    }
  }
}

// 运行验证
const verifier = new SetupVerifier();
verifier.verify();
