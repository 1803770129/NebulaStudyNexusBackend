import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

const REVIEW_DAILY_TASK_STATUS_ENUM = 'review_daily_task_status_enum';

export class CreateReviewDailyTasks1761300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.createEnumIfNotExists(queryRunner, REVIEW_DAILY_TASK_STATUS_ENUM, [
      'pending',
      'done',
    ]);
    await this.createReviewDailyTasksTable(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('review_daily_tasks')) {
      await queryRunner.dropTable('review_daily_tasks', true, true, true);
    }
    await this.dropEnumIfExists(queryRunner, REVIEW_DAILY_TASK_STATUS_ENUM);
  }

  private async createReviewDailyTasksTable(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('review_daily_tasks'))) {
      await queryRunner.createTable(
        new Table({
          name: 'review_daily_tasks',
          uniques: [
            {
              name: 'uq_review_daily_tasks_run_student_wrong_book',
              columnNames: ['runDate', 'studentId', 'wrongBookId'],
            },
          ],
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            {
              name: 'runDate',
              type: 'date',
              isNullable: false,
            },
            {
              name: 'studentId',
              type: 'uuid',
              isNullable: false,
            },
            {
              name: 'wrongBookId',
              type: 'uuid',
              isNullable: false,
            },
            {
              name: 'questionId',
              type: 'uuid',
              isNullable: false,
            },
            {
              name: 'dueAt',
              type: 'timestamp',
              isNullable: true,
            },
            {
              name: 'status',
              type: 'enum',
              enumName: REVIEW_DAILY_TASK_STATUS_ENUM,
              enum: ['pending', 'done'],
              default: "'pending'",
            },
            {
              name: 'completedAt',
              type: 'timestamp',
              isNullable: true,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              isNullable: false,
              default: 'now()',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              isNullable: false,
              default: 'now()',
            },
          ],
        }),
        true,
      );
    }

    const table = await queryRunner.getTable('review_daily_tasks');
    if (!table) {
      return;
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_review_daily_tasks_student')) {
      await queryRunner.createForeignKey(
        'review_daily_tasks',
        new TableForeignKey({
          name: 'fk_review_daily_tasks_student',
          columnNames: ['studentId'],
          referencedTableName: 'students',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_review_daily_tasks_wrong_book')) {
      await queryRunner.createForeignKey(
        'review_daily_tasks',
        new TableForeignKey({
          name: 'fk_review_daily_tasks_wrong_book',
          columnNames: ['wrongBookId'],
          referencedTableName: 'wrong_book',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_review_daily_tasks_question')) {
      await queryRunner.createForeignKey(
        'review_daily_tasks',
        new TableForeignKey({
          name: 'fk_review_daily_tasks_question',
          columnNames: ['questionId'],
          referencedTableName: 'questions',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    await this.createIndexIfNotExists(
      queryRunner,
      'review_daily_tasks',
      'idx_review_daily_tasks_run_date',
      ['runDate'],
    );
    await this.createIndexIfNotExists(
      queryRunner,
      'review_daily_tasks',
      'idx_review_daily_tasks_student_id',
      ['studentId'],
    );
    await this.createIndexIfNotExists(
      queryRunner,
      'review_daily_tasks',
      'idx_review_daily_tasks_status',
      ['status'],
    );
    await this.createIndexIfNotExists(
      queryRunner,
      'review_daily_tasks',
      'idx_review_daily_tasks_run_student_status',
      ['runDate', 'studentId', 'status'],
    );
    await this.createIndexIfNotExists(
      queryRunner,
      'review_daily_tasks',
      'idx_review_daily_tasks_due_at',
      ['dueAt'],
    );
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

  private async createIndexIfNotExists(
    queryRunner: QueryRunner,
    tableName: string,
    indexName: string,
    columnNames: string[],
  ): Promise<void> {
    const table = await queryRunner.getTable(tableName);
    if (!table || this.hasTableIndex(table, indexName)) {
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

  private hasTableIndex(table: Table, indexName: string): boolean {
    return Boolean(table.indices.find((index) => index.name === indexName));
  }
}
