import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex } from 'typeorm';

export class ExtendWrongBookReviewPlan1761200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableName = 'wrong_book';
    if (!(await queryRunner.hasTable(tableName))) {
      return;
    }

    if (!(await queryRunner.hasColumn(tableName, 'reviewLevel'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'reviewLevel',
          type: 'int',
          isNullable: false,
          default: '0',
        }),
      );
    }

    if (!(await queryRunner.hasColumn(tableName, 'nextReviewAt'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'nextReviewAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn(tableName, 'lastReviewResult'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'lastReviewResult',
          type: 'boolean',
          isNullable: true,
        }),
      );
    }

    if (!(await queryRunner.hasColumn(tableName, 'lastReviewedAt'))) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: 'lastReviewedAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    await queryRunner.query(`
      UPDATE "wrong_book"
      SET "nextReviewAt" = "lastWrongAt" + INTERVAL '1 day'
      WHERE "nextReviewAt" IS NULL
        AND "isMastered" = false
        AND "lastWrongAt" IS NOT NULL
    `);

    await this.createIndexIfNotExists(queryRunner, tableName, 'idx_wrong_book_next_review_at', [
      'nextReviewAt',
    ]);
    await this.createIndexIfNotExists(queryRunner, tableName, 'idx_wrong_book_review_level', [
      'reviewLevel',
    ]);
    await this.createIndexIfNotExists(queryRunner, tableName, 'idx_wrong_book_student_master_due', [
      'studentId',
      'isMastered',
      'nextReviewAt',
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableName = 'wrong_book';
    if (!(await queryRunner.hasTable(tableName))) {
      return;
    }

    const table = await queryRunner.getTable(tableName);
    if (table) {
      if (this.hasTableIndex(table, 'idx_wrong_book_student_master_due')) {
        await queryRunner.dropIndex(tableName, 'idx_wrong_book_student_master_due');
      }
      if (this.hasTableIndex(table, 'idx_wrong_book_review_level')) {
        await queryRunner.dropIndex(tableName, 'idx_wrong_book_review_level');
      }
      if (this.hasTableIndex(table, 'idx_wrong_book_next_review_at')) {
        await queryRunner.dropIndex(tableName, 'idx_wrong_book_next_review_at');
      }
    }

    if (await queryRunner.hasColumn(tableName, 'lastReviewedAt')) {
      await queryRunner.dropColumn(tableName, 'lastReviewedAt');
    }
    if (await queryRunner.hasColumn(tableName, 'lastReviewResult')) {
      await queryRunner.dropColumn(tableName, 'lastReviewResult');
    }
    if (await queryRunner.hasColumn(tableName, 'nextReviewAt')) {
      await queryRunner.dropColumn(tableName, 'nextReviewAt');
    }
    if (await queryRunner.hasColumn(tableName, 'reviewLevel')) {
      await queryRunner.dropColumn(tableName, 'reviewLevel');
    }
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
