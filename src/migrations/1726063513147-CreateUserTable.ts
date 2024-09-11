import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1726063513147 implements MigrationInterface {
  name = "CreateUserTable1726063513147";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`wallet\` CHANGE \`pin\` \`pin\` int NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`wallet\` CHANGE \`pin\` \`pin\` int NOT NULL`);
  }
}
