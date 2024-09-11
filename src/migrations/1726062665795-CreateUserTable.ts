import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1726062665795 implements MigrationInterface {
  name = "CreateUserTable1726062665795";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`wallet\` (\`id\` int NOT NULL AUTO_INCREMENT, \`balance\` int NOT NULL, \`pin\` int NOT NULL, \`user_id\` int NULL, UNIQUE INDEX \`REL_72548a47ac4a996cd254b08252\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`wallet\` ADD CONSTRAINT \`FK_72548a47ac4a996cd254b082522\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`wallet\` DROP FOREIGN KEY \`FK_72548a47ac4a996cd254b082522\``
    );
    await queryRunner.query(`DROP INDEX \`REL_72548a47ac4a996cd254b08252\` ON \`wallet\``);
    await queryRunner.query(`DROP TABLE \`wallet\``);
  }
}
