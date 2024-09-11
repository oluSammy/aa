import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1726077862740 implements MigrationInterface {
    name = 'CreateUserTable1726077862740'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`REL_cd6bef547b8a341643add4b27d\` ON \`donation\``);
        await queryRunner.query(`DROP INDEX \`REL_d62708311374f122daa7643652\` ON \`donation\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_d62708311374f122daa7643652\` ON \`donation\` (\`to_wallet_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_cd6bef547b8a341643add4b27d\` ON \`donation\` (\`from_wallet_id\`)`);
    }

}
