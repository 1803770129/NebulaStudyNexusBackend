import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

const EXAM_PAPER_STATUS_ENUM = 'exam_paper_status_enum';
const EXAM_ATTEMPT_STATUS_ENUM = 'exam_attempt_status_enum';

export class CreateExamCoreTables1761400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.createEnumIfNotExists(queryRunner, EXAM_PAPER_STATUS_ENUM, ['draft', 'published']);
    await this.createEnumIfNotExists(queryRunner, EXAM_ATTEMPT_STATUS_ENUM, [
      'active',
      'completed',
      'timeout',
    ]);

    await this.createExamPapersTable(queryRunner);
    await this.createExamPaperItemsTable(queryRunner);
    await this.createExamAttemptsTable(queryRunner);
    await this.createExamAttemptItemsTable(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('exam_attempt_items')) {
      await queryRunner.dropTable('exam_attempt_items', true, true, true);
    }
    if (await queryRunner.hasTable('exam_attempts')) {
      await queryRunner.dropTable('exam_attempts', true, true, true);
    }
    if (await queryRunner.hasTable('exam_paper_items')) {
      await queryRunner.dropTable('exam_paper_items', true, true, true);
    }
    if (await queryRunner.hasTable('exam_papers')) {
      await queryRunner.dropTable('exam_papers', true, true, true);
    }

    await this.dropEnumIfExists(queryRunner, EXAM_ATTEMPT_STATUS_ENUM);
    await this.dropEnumIfExists(queryRunner, EXAM_PAPER_STATUS_ENUM);
  }

  private async createExamPapersTable(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('exam_papers'))) {
      await queryRunner.createTable(
        new Table({
          name: 'exam_papers',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            {
              name: 'title',
              type: 'varchar',
              length: '200',
              isNullable: false,
            },
            {
              name: 'description',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'durationMinutes',
              type: 'int',
              default: '60',
            },
            {
              name: 'totalScore',
              type: 'int',
              default: '0',
            },
            {
              name: 'status',
              type: 'enum',
              enumName: EXAM_PAPER_STATUS_ENUM,
              enum: ['draft', 'published'],
              default: "'draft'",
            },
            {
              name: 'publishedAt',
              type: 'timestamp',
              isNullable: true,
            },
            {
              name: 'createdById',
              type: 'uuid',
              isNullable: true,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'now()',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'now()',
            },
          ],
        }),
        true,
      );
    }

    const table = await queryRunner.getTable('exam_papers');
    if (!table) {
      return;
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_exam_papers_created_by')) {
      await queryRunner.createForeignKey(
        'exam_papers',
        new TableForeignKey({
          name: 'fk_exam_papers_created_by',
          columnNames: ['createdById'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        }),
      );
    }

    await this.createIndexIfNotExists(queryRunner, 'exam_papers', 'idx_exam_papers_status', [
      'status',
    ]);
    await this.createIndexIfNotExists(queryRunner, 'exam_papers', 'idx_exam_papers_created_at', [
      'createdAt',
    ]);
  }

  private async createExamPaperItemsTable(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('exam_paper_items'))) {
      await queryRunner.createTable(
        new Table({
          name: 'exam_paper_items',
          uniques: [
            {
              name: 'uq_exam_paper_items_paper_seq',
              columnNames: ['paperId', 'seq'],
            },
            {
              name: 'uq_exam_paper_items_paper_question',
              columnNames: ['paperId', 'questionId'],
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
              name: 'paperId',
              type: 'uuid',
            },
            {
              name: 'questionId',
              type: 'uuid',
            },
            {
              name: 'seq',
              type: 'int',
            },
            {
              name: 'score',
              type: 'int',
              default: '1',
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'now()',
            },
          ],
        }),
        true,
      );
    }

    const table = await queryRunner.getTable('exam_paper_items');
    if (!table) {
      return;
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_exam_paper_items_paper')) {
      await queryRunner.createForeignKey(
        'exam_paper_items',
        new TableForeignKey({
          name: 'fk_exam_paper_items_paper',
          columnNames: ['paperId'],
          referencedTableName: 'exam_papers',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_exam_paper_items_question')) {
      await queryRunner.createForeignKey(
        'exam_paper_items',
        new TableForeignKey({
          name: 'fk_exam_paper_items_question',
          columnNames: ['questionId'],
          referencedTableName: 'questions',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    await this.createIndexIfNotExists(
      queryRunner,
      'exam_paper_items',
      'idx_exam_paper_items_paper_id',
      ['paperId'],
    );
    await this.createIndexIfNotExists(
      queryRunner,
      'exam_paper_items',
      'idx_exam_paper_items_question_id',
      ['questionId'],
    );
  }

  private async createExamAttemptsTable(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('exam_attempts'))) {
      await queryRunner.createTable(
        new Table({
          name: 'exam_attempts',
          columns: [
            {
              name: 'id',
              type: 'uuid',
              isPrimary: true,
              generationStrategy: 'uuid',
              default: 'uuid_generate_v4()',
            },
            {
              name: 'paperId',
              type: 'uuid',
            },
            {
              name: 'studentId',
              type: 'uuid',
            },
            {
              name: 'status',
              type: 'enum',
              enumName: EXAM_ATTEMPT_STATUS_ENUM,
              enum: ['active', 'completed', 'timeout'],
              default: "'active'",
            },
            {
              name: 'startedAt',
              type: 'timestamp',
            },
            {
              name: 'finishedAt',
              type: 'timestamp',
              isNullable: true,
            },
            {
              name: 'durationSeconds',
              type: 'int',
              default: '0',
            },
            {
              name: 'totalScore',
              type: 'int',
              isNullable: true,
            },
            {
              name: 'objectiveScore',
              type: 'int',
              isNullable: true,
            },
            {
              name: 'subjectiveScore',
              type: 'int',
              isNullable: true,
            },
            {
              name: 'needsManualGrading',
              type: 'boolean',
              default: 'false',
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'now()',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'now()',
            },
          ],
        }),
        true,
      );
    }

    const table = await queryRunner.getTable('exam_attempts');
    if (!table) {
      return;
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_exam_attempts_paper')) {
      await queryRunner.createForeignKey(
        'exam_attempts',
        new TableForeignKey({
          name: 'fk_exam_attempts_paper',
          columnNames: ['paperId'],
          referencedTableName: 'exam_papers',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_exam_attempts_student')) {
      await queryRunner.createForeignKey(
        'exam_attempts',
        new TableForeignKey({
          name: 'fk_exam_attempts_student',
          columnNames: ['studentId'],
          referencedTableName: 'students',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    await this.createIndexIfNotExists(
      queryRunner,
      'exam_attempts',
      'idx_exam_attempts_student_status',
      ['studentId', 'status'],
    );
    await this.createIndexIfNotExists(
      queryRunner,
      'exam_attempts',
      'idx_exam_attempts_paper_status',
      ['paperId', 'status'],
    );
    await this.createIndexIfNotExists(
      queryRunner,
      'exam_attempts',
      'idx_exam_attempts_created_at',
      ['createdAt'],
    );
  }

  private async createExamAttemptItemsTable(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('exam_attempt_items'))) {
      await queryRunner.createTable(
        new Table({
          name: 'exam_attempt_items',
          uniques: [
            {
              name: 'uq_exam_attempt_items_attempt_paper_item',
              columnNames: ['attemptId', 'paperItemId'],
            },
            {
              name: 'uq_exam_attempt_items_attempt_seq',
              columnNames: ['attemptId', 'seq'],
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
              name: 'attemptId',
              type: 'uuid',
            },
            {
              name: 'paperItemId',
              type: 'uuid',
            },
            {
              name: 'questionId',
              type: 'uuid',
            },
            {
              name: 'seq',
              type: 'int',
            },
            {
              name: 'fullScore',
              type: 'int',
            },
            {
              name: 'submittedAnswer',
              type: 'jsonb',
              isNullable: true,
            },
            {
              name: 'isCorrect',
              type: 'boolean',
              isNullable: true,
            },
            {
              name: 'score',
              type: 'int',
              isNullable: true,
            },
            {
              name: 'needsManualGrading',
              type: 'boolean',
              default: 'false',
            },
            {
              name: 'submittedAt',
              type: 'timestamp',
              isNullable: true,
            },
            {
              name: 'gradedAt',
              type: 'timestamp',
              isNullable: true,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'now()',
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'now()',
            },
          ],
        }),
        true,
      );
    }

    const table = await queryRunner.getTable('exam_attempt_items');
    if (!table) {
      return;
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_exam_attempt_items_attempt')) {
      await queryRunner.createForeignKey(
        'exam_attempt_items',
        new TableForeignKey({
          name: 'fk_exam_attempt_items_attempt',
          columnNames: ['attemptId'],
          referencedTableName: 'exam_attempts',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_exam_attempt_items_paper_item')) {
      await queryRunner.createForeignKey(
        'exam_attempt_items',
        new TableForeignKey({
          name: 'fk_exam_attempt_items_paper_item',
          columnNames: ['paperItemId'],
          referencedTableName: 'exam_paper_items',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    if (!table.foreignKeys.find((fk) => fk.name === 'fk_exam_attempt_items_question')) {
      await queryRunner.createForeignKey(
        'exam_attempt_items',
        new TableForeignKey({
          name: 'fk_exam_attempt_items_question',
          columnNames: ['questionId'],
          referencedTableName: 'questions',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    await this.createIndexIfNotExists(
      queryRunner,
      'exam_attempt_items',
      'idx_exam_attempt_items_attempt_id',
      ['attemptId'],
    );
    await this.createIndexIfNotExists(
      queryRunner,
      'exam_attempt_items',
      'idx_exam_attempt_items_question_id',
      ['questionId'],
    );
    await this.createIndexIfNotExists(
      queryRunner,
      'exam_attempt_items',
      'idx_exam_attempt_items_needs_manual',
      ['needsManualGrading'],
    );
    await this.createIndexIfNotExists(
      queryRunner,
      'exam_attempt_items',
      'idx_exam_attempt_items_submitted_at',
      ['submittedAt'],
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
    if (!table || table.indices.find((index) => index.name === indexName)) {
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
}
