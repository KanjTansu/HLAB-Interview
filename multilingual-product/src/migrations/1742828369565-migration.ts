import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1742828369565 implements MigrationInterface {
    name = 'Migration1742828369565';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "product_translations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "language_code" character varying(5) NOT NULL, "name" character varying(255) NOT NULL, "description" text, "product_id" uuid, CONSTRAINT "PK_38feaa5884a6a0171d067cc9d15" PRIMARY KEY ("id"))`,
        );

        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2d02e351bab3c6d6178930e322" ON "product_translations" ("product_id", "language_code") `);
        //   Create Product Table
        await queryRunner.query(
            `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sku" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "product_translations" ADD CONSTRAINT "FK_1b7b07c6049367c6446c5ac5605" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_translations" DROP CONSTRAINT "FK_1b7b07c6049367c6446c5ac5605"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2d02e351bab3c6d6178930e322"`);

        await queryRunner.query(`DROP TRIGGER IF EXISTS tsvector_product_translation_update ON product_translations;`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_product_translation_search_vector;`);
        await queryRunner.query(`DROP INDEX IF EXISTS product_translations_search_vector_idx;`);
        await queryRunner.query(`ALTER TABLE product_translations DROP COLUMN IF EXISTS search_vector;`);
        await queryRunner.query(`DROP TABLE "product_translations"`);
    }
}
