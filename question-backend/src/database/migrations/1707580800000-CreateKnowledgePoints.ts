import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * 创建知识点表迁移
 *
 * 创建 knowledge_points 表，支持：
 * - 基本信息（名称、内容、拓展内容）
 * - 分类关联（多对一）
 * - 树形结构（父子关系，最多3级）
 * - 统计信息（关联题目数量）
 */
export class CreateKnowledgePoints1707580800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建 knowledge_points 表
    await queryRunner.createTable(
      new Table({
        name: 'knowledge_points',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'jsonb',
            isNullable: false,
            comment: '知识点内容（富文本），包含 raw 和 rendered 字段',
          },
          {
            name: 'extension',
            type: 'jsonb',
            isNullable: true,
            comment: '拓展内容（富文本），包含 raw 和 rendered 字段',
          },
          {
            name: 'categoryId',
            type: 'uuid',
            isNullable: true,
            comment: '所属分类 ID',
          },
          {
            name: 'parentId',
            type: 'uuid',
            isNullable: true,
            comment: '父知识点 ID（支持树形结构）',
          },
          {
            name: 'level',
            type: 'integer',
            default: 1,
            isNullable: false,
            comment: '层级（1-3）',
          },
          {
            name: 'path',
            type: 'varchar',
            length: '255',
            default: "''",
            isNullable: false,
            comment: '路径（parent1Id/parent2Id）',
          },
          {
            name: 'questionCount',
            type: 'integer',
            default: 0,
            isNullable: false,
            comment: '关联题目数量',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // 添加外键约束：categoryId → categories
    await queryRunner.createForeignKey(
      'knowledge_points',
      new TableForeignKey({
        name: 'fk_knowledge_points_category',
        columnNames: ['categoryId'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // 添加外键约束：parentId → knowledge_points（自引用）
    await queryRunner.createForeignKey(
      'knowledge_points',
      new TableForeignKey({
        name: 'fk_knowledge_points_parent',
        columnNames: ['parentId'],
        referencedTableName: 'knowledge_points',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // 添加索引：idx_kp_category（优化按分类查询）
    await queryRunner.createIndex(
      'knowledge_points',
      new TableIndex({
        name: 'idx_kp_category',
        columnNames: ['categoryId'],
      }),
    );

    // 添加索引：idx_kp_parent（优化树形查询）
    await queryRunner.createIndex(
      'knowledge_points',
      new TableIndex({
        name: 'idx_kp_parent',
        columnNames: ['parentId'],
      }),
    );

    // 添加索引：idx_kp_name（优化按名称搜索）
    await queryRunner.createIndex(
      'knowledge_points',
      new TableIndex({
        name: 'idx_kp_name',
        columnNames: ['name'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除索引
    await queryRunner.dropIndex('knowledge_points', 'idx_kp_name');
    await queryRunner.dropIndex('knowledge_points', 'idx_kp_parent');
    await queryRunner.dropIndex('knowledge_points', 'idx_kp_category');

    // 删除外键约束
    await queryRunner.dropForeignKey('knowledge_points', 'fk_knowledge_points_parent');
    await queryRunner.dropForeignKey('knowledge_points', 'fk_knowledge_points_category');

    // 删除表
    await queryRunner.dropTable('knowledge_points');
  }
}
