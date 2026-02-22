import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

const MANUAL_GRADING_TASK_STATUS_ENUM = 'manual_grading_task_status_enum';

export class CreateManualGradingTasks1761100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.createEnumIfNotExists(queryRunner, MANUAL_GRADING_TASK_STATUS_ENUM, [
      'pending',
      'assigned',
      'done',
      'reopen',
    ]);

    await this.createManualGradingTasksTable(queryRunner);
    await this.extendPracticeRecordsTable(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.revertPracticeRecordsTable(queryRunner);

    if (await queryRunner.hasTable('manual_grading_tasks')) {
      await queryRunner.dropTable('manual_grading_tasks', true, true, true);
    }

    await this.dropEnumIfExists(queryRunner, MANUAL_GRADING_TASK_STATUS_ENUM);
  }

  private async createManualGradingTasksTable(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('manual_grading_tasks'))) {
      await queryRunner.createTable(
        new Table({
          name: 'manual_grading_tasks',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            {
              name: 'practiceRecordId',
              type: 'uuid',
              isNullable: false,
              isUnique: true,
            },
            {
              name: 'studentId',
              type: 'uuid',
              isNullable: false,
            },
            {
              name: 'questionId',
              type: 'uuid',
              isNullable: false,
            },
            {
              name: 'status',
              type: 'enum',
              enumName: MANUAL_GRADING_TASK_STATUS_ENUM,
              enum: ['pending', 'assigned', 'done', 'reopen'],
              default: "'pending'",
            },
            {
              name: 'assigneeId',
              type: 'uuid',
              isNullable: true,
            },
            {
              name: 'assignedAt',
              type: 'timestamp',
              isNullable: true,
            },
            {
              name: 'score',
              type: 'double precision',
              isNullable: true,
            },
            {
              name: 'feedback',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'tags',
              type: 'jsonb',
              isNullable: true,
            },
            {
              name: 'isPassed',
              type: 'boolean',
              isNullable: true,
            },
            {
              name: 'submittedAt',
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

    const table = await queryRunner.getTable('manual_grading_tasks');
    if (!table) {
      return;
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_manual_grading_tasks_practice_record')) {
      await queryRunner.createForeignKey(
        'manual_grading_tasks',
        new TableForeignKey({
          name: 'fk_manual_grading_tasks_practice_record',
          columnNames: ['practiceRecordId'],
          referencedTableName: 'practice_records',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_manual_grading_tasks_student')) {
      await queryRunner.createForeignKey(
        'manual_grading_tasks',
        new TableForeignKey({
          name: 'fk_manual_grading_tasks_student',
          columnNames: ['studentId'],
          referencedTableName: 'students',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_manual_grading_tasks_question')) {
      await queryRunner.createForeignKey(
        'manual_grading_tasks',
        new TableForeignKey({
          name: 'fk_manual_grading_tasks_question',
          columnNames: ['questionId'],
          referencedTableName: 'questions',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_manual_grading_tasks_assignee')) {
      await queryRunner.createForeignKey(
        'manual_grading_tasks',
        new TableForeignKey({
          name: 'fk_manual_grading_tasks_assignee',
          columnNames: ['assigneeId'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        }),
      );
    }

    await this.createIndexIfNotExists(
      queryRunner,
      'manual_grading_tasks',
      'idx_manual_grading_tasks_status',
      ['status'],
    );
    await this.createIndexIfNotExists(
      queryRunner,
      'manual_grading_tasks',
      'idx_manual_grading_tasks_assignee_id',
      ['assigneeId'],
    );
    await this.createIndexIfNotExists(
      queryRunner,
      'manual_grading_tasks',
      'idx_manual_grading_tasks_created_at',
      ['createdAt'],
    );
    await this.createIndexIfNotExists(
      queryRunner,
      'manual_grading_tasks',
      'idx_manual_grading_tasks_student_id',
      ['studentId'],
    );
  }

  private async extendPracticeRecordsTable(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('practice_records'))) {
      return;
    }

    const tableName = 'practice_records';

    if (!(await queryRunner.hasColumn(tableName, 'score'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'score',
          type: 'double precision',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn(tableName, 'gradingFeedback'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'gradingFeedback',
          type: 'text',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn(tableName, 'gradingTags'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'gradingTags',
          type: 'jsonb',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn(tableName, 'isPassed'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'isPassed',
          type: 'boolean',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn(tableName, 'gradedBy'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'gradedBy',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn(tableName, 'gradedAt'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'gradedAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    const table = await queryRunner.getTable(tableName);
    if (!table) {
      return;
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_practice_records_graded_by')) {
      await queryRunner.createForeignKey(
        tableName,
        new TableForeignKey({
          name: 'fk_practice_records_graded_by',
          columnNames: ['gradedBy'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        }),
      );
    }

    await this.createIndexIfNotExists(queryRunner, tableName, 'idx_practice_records_graded_by', [
      'gradedBy',
    ]);
    await this.createIndexIfNotExists(queryRunner, tableName, 'idx_practice_records_graded_at', [
      'gradedAt',
    ]);
  }

  private async revertPracticeRecordsTable(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('practice_records'))) {
      return;
    }

    const tableName = 'practice_records';
    const table = await queryRunner.getTable(tableName);
    if (!table) {
      return;
    }

    if (this.hasTableIndex(table, 'idx_practice_records_graded_at')) {
      await queryRunner.dropIndex(tableName, 'idx_practice_records_graded_at');
    }
    if (this.hasTableIndex(table, 'idx_practice_records_graded_by')) {
      await queryRunner.dropIndex(tableName, 'idx_practice_records_graded_by');
    }

    if (table.foreignKeys.find((fk) => fk.name === 'fk_practice_records_graded_by')) {
      await queryRunner.dropForeignKey(tableName, 'fk_practice_records_graded_by');
    }

    if (await queryRunner.hasColumn(tableName, 'gradedAt')) {
      await queryRunner.dropColumn(tableName, 'gradedAt');
    }
    if (await queryRunner.hasColumn(tableName, 'gradedBy')) {
      await queryRunner.dropColumn(tableName, 'gradedBy');
    }
    if (await queryRunner.hasColumn(tableName, 'isPassed')) {
      await queryRunner.dropColumn(tableName, 'isPassed');
    }
    if (await queryRunner.hasColumn(tableName, 'gradingTags')) {
      await queryRunner.dropColumn(tableName, 'gradingTags');
    }
    if (await queryRunner.hasColumn(tableName, 'gradingFeedback')) {
      await queryRunner.dropColumn(tableName, 'gradingFeedback');
    }
    if (await queryRunner.hasColumn(tableName, 'score')) {
      await queryRunner.dropColumn(tableName, 'score');
    }
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
