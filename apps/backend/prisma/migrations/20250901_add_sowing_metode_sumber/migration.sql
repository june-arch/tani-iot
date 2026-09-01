-- CreateEnum SowingMetode
DO $$ BEGIN
  CREATE TYPE "SowingMetode" AS ENUM ('BIJI', 'STEK', 'CANGKOK', 'OKULASI');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AlterTable sowing_guides: add metode and sumber (idempotent)
ALTER TABLE "sowing_guides" ADD COLUMN IF NOT EXISTS "metode" "SowingMetode" NOT NULL DEFAULT 'BIJI';
ALTER TABLE "sowing_guides" ADD COLUMN IF NOT EXISTS "sumber" JSONB;
