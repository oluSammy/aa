import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1726066981839 implements MigrationInterface {
    name = 'CreateUserTable1726066981839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`wallet\` DROP COLUMN \`pin\``);
        await queryRunner.query(`ALTER TABLE \`wallet\` ADD \`pin\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`wallet\` DROP COLUMN \`pin\``);
        await queryRunner.query(`ALTER TABLE \`wallet\` ADD \`pin\` int NULL`);
    }

}
