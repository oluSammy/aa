import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1726071128085 implements MigrationInterface {
    name = 'CreateUserTable1726071128085'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`wallet\` DROP FOREIGN KEY \`FK_a2cb5718693f24a06c8d419f243\``);
        await queryRunner.query(`DROP INDEX \`IDX_a2cb5718693f24a06c8d419f24\` ON \`wallet\``);
        await queryRunner.query(`DROP INDEX \`REL_a2cb5718693f24a06c8d419f24\` ON \`wallet\``);
        await queryRunner.query(`ALTER TABLE \`wallet\` CHANGE \`user_id_id\` \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`wallet\` ADD UNIQUE INDEX \`IDX_72548a47ac4a996cd254b08252\` (\`user_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_72548a47ac4a996cd254b08252\` ON \`wallet\` (\`user_id\`)`);
        await queryRunner.query(`ALTER TABLE \`wallet\` ADD CONSTRAINT \`FK_72548a47ac4a996cd254b082522\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`wallet\` DROP FOREIGN KEY \`FK_72548a47ac4a996cd254b082522\``);
        await queryRunner.query(`DROP INDEX \`REL_72548a47ac4a996cd254b08252\` ON \`wallet\``);
        await queryRunner.query(`ALTER TABLE \`wallet\` DROP INDEX \`IDX_72548a47ac4a996cd254b08252\``);
        await queryRunner.query(`ALTER TABLE \`wallet\` CHANGE \`user_id\` \`user_id_id\` int NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_a2cb5718693f24a06c8d419f24\` ON \`wallet\` (\`user_id_id\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_a2cb5718693f24a06c8d419f24\` ON \`wallet\` (\`user_id_id\`)`);
        await queryRunner.query(`ALTER TABLE \`wallet\` ADD CONSTRAINT \`FK_a2cb5718693f24a06c8d419f243\` FOREIGN KEY (\`user_id_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
