import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

/**
 * 创建知识点关联表迁移
 *
 * 创建两个中间表：
 * 1. question_knowledge_points - 题目与知识点的多对多关联
 * 2. knowledge_point_tags - 知识点与标签的多对多关联
 */
export class CreateKnowledgePointRelations1707580900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建 question_knowledge_points 中间表
    await queryRunner.createTable(
      new Table({
        name: 'question_knowledge_points',
        columns: [
          {
            name: 'questionId',
            type: 'uuid',
            isNullable: false,
            comment: '题目 ID',
          },
          {
            name: 'knowledgePointId',
            type: 'uuid',
            isNullable: false,
            comment: '知识点 ID',
          },
        ],
      }),
      true,
    );

    // 添加复合主键
    await queryRunner.createPrimaryKey('question_knowledge_points', [
      'questionId',
      'knowledgePointId',
    ]);

    // 添加外键约束：questionId → questions
    await queryRunner.createForeignKey(
      'question_knowledge_points',
      new TableForeignKey({
        name: 'fk_qkp_question',
        columnNames: ['questionId'],
        referencedTableName: 'questions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // 添加外键约束：knowledgePointId → knowledge_points
    await queryRunner.createForeignKey(
      'question_knowledge_points',
      new TableForeignKey({
        name: 'fk_qkp_knowledge_point',
        columnNames: ['knowledgePointId'],
        referencedTableName: 'knowledge_points',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // 添加索引：idx_qkp_question（优化按题目查询知识点）
    await queryRunner.createIndex(
      'question_knowledge_points',
      new TableIndex({
        name: 'idx_qkp_question',
        columnNames: ['questionId'],
      }),
    );

    // 添加索引：idx_qkp_kp（优化按知识点查询题目）
    await queryRunner.createIndex(
      'question_knowledge_points',
      new TableIndex({
        name: 'idx_qkp_kp',
        columnNames: ['knowledgePointId'],
      }),
    );

    // 创建 knowledge_point_tags 中间表
    await queryRunner.createTable(
      new Table({
        name: 'knowledge_point_tags',
        columns: [
          {
            name: 'knowledgePointId',
            type: 'uuid',
            isNullable: false,
            comment: '知识点 ID',
          },
          {
            name: 'tagId',
            type: 'uuid',
            isNullable: false,
            comment: '标签 ID',
          },
        ],
      }),
      true,
    );

    // 添加复合主键
    await queryRunner.createPrimaryKey('knowledge_point_tags', ['knowledgePointId', 'tagId']);

    // 添加外键约束：knowledgePointId → knowledge_points
    await queryRunner.createForeignKey(
      'knowledge_point_tags',
      new TableForeignKey({
        name: 'fk_kpt_knowledge_point',
        columnNames: ['knowledgePointId'],
        referencedTableName: 'knowledge_points',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // 添加外键约束：tagId → tags
    await queryRunner.createForeignKey(
      'knowledge_point_tags',
      new TableForeignKey({
        name: 'fk_kpt_tag',
        columnNames: ['tagId'],
        referencedTableName: 'tags',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // 添加索引：idx_kpt_kp（优化按知识点查询标签）
    await queryRunner.createIndex(
      'knowledge_point_tags',
      new TableIndex({
        name: 'idx_kpt_kp',
        columnNames: ['knowledgePointId'],
      }),
    );

    // 添加索引：idx_kpt_tag（优化按标签查询知识点）
    await queryRunner.createIndex(
      'knowledge_point_tags',
      new TableIndex({
        name: 'idx_kpt_tag',
        columnNames: ['tagId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除 knowledge_point_tags 表的索引
    await queryRunner.dropIndex('knowledge_point_tags', 'idx_kpt_tag');
    await queryRunner.dropIndex('knowledge_point_tags', 'idx_kpt_kp');

    // 删除 knowledge_point_tags 表的外键约束
    await queryRunner.dropForeignKey('knowledge_point_tags', 'fk_kpt_tag');
    await queryRunner.dropForeignKey('knowledge_point_tags', 'fk_kpt_knowledge_point');

    // 删除 knowledge_point_tags 表
    await queryRunner.dropTable('knowledge_point_tags');

    // 删除 question_knowledge_points 表的索引
    await queryRunner.dropIndex('question_knowledge_points', 'idx_qkp_kp');
    await queryRunner.dropIndex('question_knowledge_points', 'idx_qkp_question');

    // 删除 question_knowledge_points 表的外键约束
    await queryRunner.dropForeignKey('question_knowledge_points', 'fk_qkp_knowledge_point');
    await queryRunner.dropForeignKey('question_knowledge_points', 'fk_qkp_question');

    // 删除 question_knowledge_points 表
    await queryRunner.dropTable('question_knowledge_points');
  }
}
