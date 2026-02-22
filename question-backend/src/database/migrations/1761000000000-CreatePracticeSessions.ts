import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

const PRACTICE_SESSION_MODE_ENUM = 'practice_session_mode_enum';
const PRACTICE_SESSION_STATUS_ENUM = 'practice_session_status_enum';
const PRACTICE_SESSION_ITEM_SOURCE_ENUM = 'practice_session_item_source_type_enum';
const PRACTICE_SESSION_ITEM_STATUS_ENUM = 'practice_session_item_status_enum';
const PRACTICE_ATTEMPT_TYPE_ENUM = 'practice_attempt_type_enum';

export class CreatePracticeSessions1761000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.createEnumIfNotExists(queryRunner, PRACTICE_SESSION_MODE_ENUM, [
      'random',
      'category',
      'knowledge',
      'review',
    ]);
    await this.createEnumIfNotExists(queryRunner, PRACTICE_SESSION_STATUS_ENUM, [
      'active',
      'completed',
      'abandoned',
    ]);
    await this.createEnumIfNotExists(queryRunner, PRACTICE_SESSION_ITEM_SOURCE_ENUM, [
      'normal',
      'review',
      'recommend',
    ]);
    await this.createEnumIfNotExists(queryRunner, PRACTICE_SESSION_ITEM_STATUS_ENUM, [
      'pending',
      'answered',
      'skipped',
    ]);
    await this.createEnumIfNotExists(queryRunner, PRACTICE_ATTEMPT_TYPE_ENUM, [
      'practice',
      'review',
      'exam',
    ]);

    await this.createPracticeSessionsTable(queryRunner);
    await this.createPracticeSessionItemsTable(queryRunner);
    await this.extendPracticeRecordsTable(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.revertPracticeRecordsTable(queryRunner);

    if (await queryRunner.hasTable('practice_session_items')) {
      await queryRunner.dropTable('practice_session_items', true, true, true);
    }

    if (await queryRunner.hasTable('practice_sessions')) {
      await queryRunner.dropTable('practice_sessions', true, true, true);
    }

    await this.dropEnumIfExists(queryRunner, PRACTICE_SESSION_ITEM_STATUS_ENUM);
    await this.dropEnumIfExists(queryRunner, PRACTICE_SESSION_ITEM_SOURCE_ENUM);
    await this.dropEnumIfExists(queryRunner, PRACTICE_SESSION_STATUS_ENUM);
    await this.dropEnumIfExists(queryRunner, PRACTICE_SESSION_MODE_ENUM);
    await this.dropEnumIfExists(queryRunner, PRACTICE_ATTEMPT_TYPE_ENUM);
  }

  private async createPracticeSessionsTable(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('practice_sessions'))) {
      await queryRunner.createTable(
        new Table({
          name: 'practice_sessions',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            {
              name: 'studentId',
              type: 'uuid',
              isNullable: false,
            },
            {
              name: 'mode',
              type: 'enum',
              enumName: PRACTICE_SESSION_MODE_ENUM,
              enum: ['random', 'category', 'knowledge', 'review'],
            },
            {
              name: 'config',
              type: 'jsonb',
              isNullable: false,
              default: "'{}'",
            },
            {
              name: 'status',
              type: 'enum',
              enumName: PRACTICE_SESSION_STATUS_ENUM,
              enum: ['active', 'completed', 'abandoned'],
              default: "'active'",
            },
            {
              name: 'totalCount',
              type: 'int',
              isNullable: false,
              default: '0',
            },
            {
              name: 'answeredCount',
              type: 'int',
              isNullable: false,
              default: '0',
            },
            {
              name: 'correctCount',
              type: 'int',
              isNullable: false,
              default: '0',
            },
            {
              name: 'startedAt',
              type: 'timestamp',
              isNullable: false,
            },
            {
              name: 'endedAt',
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

    const practiceSessionsTable = await queryRunner.getTable('practice_sessions');
    if (!practiceSessionsTable) {
      return;
    }

    if (
      !practiceSessionsTable.foreignKeys.find((fk) => fk.name === 'fk_practice_sessions_student')
    ) {
      await queryRunner.createForeignKey(
        'practice_sessions',
        new TableForeignKey({
          name: 'fk_practice_sessions_student',
          columnNames: ['studentId'],
          referencedTableName: 'students',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    await this.createIndexIfNotExists(
      queryRunner,
      'practice_sessions',
      'idx_practice_sessions_student_id',
      ['studentId'],
    );
    await this.createIndexIfNotExists(
      queryRunner,
      'practice_sessions',
      'idx_practice_sessions_status',
      ['status'],
    );
    await this.createIndexIfNotExists(
      queryRunner,
      'practice_sessions',
      'idx_practice_sessions_mode',
      ['mode'],
    );
    await this.createIndexIfNotExists(
      queryRunner,
      'practice_sessions',
      'idx_practice_sessions_created_at',
      ['createdAt'],
    );
  }

  private async createPracticeSessionItemsTable(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('practice_session_items'))) {
      await queryRunner.createTable(
        new Table({
          name: 'practice_session_items',
          uniques: [
            {
              name: 'uq_practice_session_items_session_seq',
              columnNames: ['sessionId', 'seq'],
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
              name: 'sessionId',
              type: 'uuid',
              isNullable: false,
            },
            {
              name: 'questionId',
              type: 'uuid',
              isNullable: false,
            },
            {
              name: 'seq',
              type: 'int',
              isNullable: false,
            },
            {
              name: 'sourceType',
              type: 'enum',
              enumName: PRACTICE_SESSION_ITEM_SOURCE_ENUM,
              enum: ['normal', 'review', 'recommend'],
              default: "'normal'",
            },
            {
              name: 'sourceRefId',
              type: 'uuid',
              isNullable: true,
            },
            {
              name: 'status',
              type: 'enum',
              enumName: PRACTICE_SESSION_ITEM_STATUS_ENUM,
              enum: ['pending', 'answered', 'skipped'],
              default: "'pending'",
            },
            {
              name: 'answeredAt',
              type: 'timestamp',
              isNullable: true,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              isNullable: false,
              default: 'now()',
            },
          ],
        }),
        true,
      );
    }

    const table = await queryRunner.getTable('practice_session_items');
    if (!table) {
      return;
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_practice_session_items_session')) {
      await queryRunner.createForeignKey(
        'practice_session_items',
        new TableForeignKey({
          name: 'fk_practice_session_items_session',
          columnNames: ['sessionId'],
          referencedTableName: 'practice_sessions',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_practice_session_items_question')) {
      await queryRunner.createForeignKey(
        'practice_session_items',
        new TableForeignKey({
          name: 'fk_practice_session_items_question',
          columnNames: ['questionId'],
          referencedTableName: 'questions',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    await this.createIndexIfNotExists(
      queryRunner,
      'practice_session_items',
      'idx_practice_session_items_session_id',
      ['sessionId'],
    );
    await this.createIndexIfNotExists(
      queryRunner,
      'practice_session_items',
      'idx_practice_session_items_question_id',
      ['questionId'],
    );
    await this.createIndexIfNotExists(
      queryRunner,
      'practice_session_items',
      'idx_practice_session_items_status',
      ['status'],
    );
  }

  private async extendPracticeRecordsTable(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('practice_records'))) {
      return;
    }

    const tableName = 'practice_records';

    if (!(await queryRunner.hasColumn(tableName, 'sessionId'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'sessionId',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn(tableName, 'sessionItemId'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'sessionItemId',
          type: 'uuid',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn(tableName, 'attemptType'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'attemptType',
          type: 'enum',
          enumName: PRACTICE_ATTEMPT_TYPE_ENUM,
          enum: ['practice', 'review', 'exam'],
          default: "'practice'",
          isNullable: false,
        }),
      );
    }

    const table = await queryRunner.getTable(tableName);
    if (!table) {
      return;
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_practice_records_session')) {
      await queryRunner.createForeignKey(
        tableName,
        new TableForeignKey({
          name: 'fk_practice_records_session',
          columnNames: ['sessionId'],
          referencedTableName: 'practice_sessions',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        }),
      );
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_practice_records_session_item')) {
      await queryRunner.createForeignKey(
        tableName,
        new TableForeignKey({
          name: 'fk_practice_records_session_item',
          columnNames: ['sessionItemId'],
          referencedTableName: 'practice_session_items',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        }),
      );
    }

    await this.createIndexIfNotExists(queryRunner, tableName, 'idx_practice_records_session_id', [
      'sessionId',
    ]);
    await this.createIndexIfNotExists(
      queryRunner,
      tableName,
      'idx_practice_records_session_item_id',
      ['sessionItemId'],
    );
    await this.createIndexIfNotExists(queryRunner, tableName, 'idx_practice_records_attempt_type', [
      'attemptType',
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

    if (this.hasTableIndex(table, 'idx_practice_records_attempt_type')) {
      await queryRunner.dropIndex(tableName, 'idx_practice_records_attempt_type');
    }
    if (this.hasTableIndex(table, 'idx_practice_records_session_item_id')) {
      await queryRunner.dropIndex(tableName, 'idx_practice_records_session_item_id');
    }
    if (this.hasTableIndex(table, 'idx_practice_records_session_id')) {
      await queryRunner.dropIndex(tableName, 'idx_practice_records_session_id');
    }

    if (table.foreignKeys.find((fk) => fk.name === 'fk_practice_records_session_item')) {
      await queryRunner.dropForeignKey(tableName, 'fk_practice_records_session_item');
    }
    if (table.foreignKeys.find((fk) => fk.name === 'fk_practice_records_session')) {
      await queryRunner.dropForeignKey(tableName, 'fk_practice_records_session');
    }

    if (await queryRunner.hasColumn(tableName, 'attemptType')) {
      await queryRunner.dropColumn(tableName, 'attemptType');
    }
    if (await queryRunner.hasColumn(tableName, 'sessionItemId')) {
      await queryRunner.dropColumn(tableName, 'sessionItemId');
    }
    if (await queryRunner.hasColumn(tableName, 'sessionId')) {
      await queryRunner.dropColumn(tableName, 'sessionId');
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
