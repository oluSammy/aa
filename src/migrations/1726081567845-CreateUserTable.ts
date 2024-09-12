import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1726081567845 implements MigrationInterface {
  name = "CreateUserTable1726081567845";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`donation\` (\`id\` int NOT NULL AUTO_INCREMENT, \`amount\` int NOT NULL, \`note\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`from_wallet_id\` int NULL, \`to_wallet_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`donation\` ADD CONSTRAINT \`FK_cd6bef547b8a341643add4b27d1\` FOREIGN KEY (\`from_wallet_id\`) REFERENCES \`wallet\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`donation\` ADD CONSTRAINT \`FK_d62708311374f122daa76436525\` FOREIGN KEY (\`to_wallet_id\`) REFERENCES \`wallet\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`donation\` DROP FOREIGN KEY \`FK_d62708311374f122daa76436525\``
    );
    await queryRunner.query(
      `ALTER TABLE \`donation\` DROP FOREIGN KEY \`FK_cd6bef547b8a341643add4b27d1\``
    );
    await queryRunner.query(`DROP TABLE \`donation\``);
  }
}
