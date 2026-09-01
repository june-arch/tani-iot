-- AlterTable sowing_guides: add tipsCepat
ALTER TABLE "sowing_guides" ADD COLUMN IF NOT EXISTS "tipsCepat" JSONB;
