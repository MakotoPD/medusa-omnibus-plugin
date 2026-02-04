import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260202132454 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "omnibus_price_history" ("id" text not null, "variant_id" text not null, "price" numeric not null, "currency_code" text not null, "recorded_at" timestamptz not null, "raw_price" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "omnibus_price_history_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_omnibus_price_history_deleted_at" ON "omnibus_price_history" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "omnibus_price_history" cascade;`);
  }

}
