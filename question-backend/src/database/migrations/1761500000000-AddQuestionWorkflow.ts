import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

const QUESTION_STATUS_ENUM = 'question_status_enum';

export class AddQuestionWorkflow1761500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.createEnumIfNotExists(queryRunner, QUESTION_STATUS_ENUM, [
      'draft',
      'reviewed',
      'published',
      'archived',
    ]);

    if (!(await queryRunner.hasTable('questions'))) {
      return;
    }

    await this.addColumnIfNotExists(
      queryRunner,
      'questions',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enumName: QUESTION_STATUS_ENUM,
        enum: ['draft', 'reviewed', 'published', 'archived'],
        default: "'draft'",
        isNullable: false,
      }),
    );

    await this.addColumnIfNotExists(
      queryRunner,
      'questions',
      new TableColumn({
        name: 'reviewedAt',
        type: 'timestamp',
        isNullable: true,
      }),
    );
    await this.addColumnIfNotExists(
      queryRunner,
      'questions',
      new TableColumn({
        name: 'reviewedById',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await this.addColumnIfNotExists(
      queryRunner,
      'questions',
      new TableColumn({
        name: 'publishedAt',
        type: 'timestamp',
        isNullable: true,
      }),
    );
    await this.addColumnIfNotExists(
      queryRunner,
      'questions',
      new TableColumn({
        name: 'publishedById',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await this.addColumnIfNotExists(
      queryRunner,
      'questions',
      new TableColumn({
        name: 'archivedAt',
        type: 'timestamp',
        isNullable: true,
      }),
    );
    await this.addColumnIfNotExists(
      queryRunner,
      'questions',
      new TableColumn({
        name: 'archivedById',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.query(`
      UPDATE "questions"
      SET "status" = 'draft'
      WHERE "status" IS NULL
    `);

    await this.createIndexIfNotExists(queryRunner, 'questions', 'idx_questions_status', ['status']);
    await this.createIndexIfNotExists(queryRunner, 'questions', 'idx_questions_status_created_at', [
      'status',
      'createdAt',
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('questions')) {
      await this.dropIndexIfExists(queryRunner, 'questions', 'idx_questions_status_created_at');
      await this.dropIndexIfExists(queryRunner, 'questions', 'idx_questions_status');

      await this.dropColumnIfExists(queryRunner, 'questions', 'archivedById');
      await this.dropColumnIfExists(queryRunner, 'questions', 'archivedAt');
      await this.dropColumnIfExists(queryRunner, 'questions', 'publishedById');
      await this.dropColumnIfExists(queryRunner, 'questions', 'publishedAt');
      await this.dropColumnIfExists(queryRunner, 'questions', 'reviewedById');
      await this.dropColumnIfExists(queryRunner, 'questions', 'reviewedAt');
      await this.dropColumnIfExists(queryRunner, 'questions', 'status');
    }

    await this.dropEnumIfExists(queryRunner, QUESTION_STATUS_ENUM);
  }

  private async addColumnIfNotExists(
    queryRunner: QueryRunner,
    tableName: string,
    column: TableColumn,
  ): Promise<void> {
    if (!(await queryRunner.hasColumn(tableName, column.name))) {
      await queryRunner.addColumn(tableName, column);
    }
  }

  private async dropColumnIfExists(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
  ): Promise<void> {
    if (await queryRunner.hasColumn(tableName, columnName)) {
      await queryRunner.dropColumn(tableName, columnName);
    }
  }

  private async createIndexIfNotExists(
    queryRunner: QueryRunner,
    tableName: string,
    indexName: string,
    columnNames: string[],
  ): Promise<void> {
    const table = await queryRunner.getTable(tableName);
    if (!table || table.indices.some((index) => index.name === indexName)) {
      return;
    }

    await queryRunner.createIndex(
      tableName,
      new TableIndex({
        name: indexName,
        columnNames,
      }),
    );
  }

  private async dropIndexIfExists(
    queryRunner: QueryRunner,
    tableName: string,
    indexName: string,
  ): Promise<void> {
    const table = await queryRunner.getTable(tableName);
    if (!table || !table.indices.some((index) => index.name === indexName)) {
      return;
    }

    await queryRunner.dropIndex(tableName, indexName);
  }

  private async createEnumIfNotExists(
    queryRunner: QueryRunner,
    enumName: string,
    enumValues: string[],
  ): Promise<void> {
    const valueSql = enumValues.map((value) => `'${value}'`).join(', ');
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE t.typname = '${enumName}'
            AND n.nspname = 'public'
        ) THEN
          CREATE TYPE "${enumName}" AS ENUM (${valueSql});
        END IF;
      END
      $$;
    `);
  }

  private async dropEnumIfExists(queryRunner: QueryRunner, enumName: string): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE t.typname = '${enumName}'
            AND n.nspname = 'public'
        ) THEN
          DROP TYPE "${enumName}";
        END IF;
      END
      $$;
    `);
  }
}
