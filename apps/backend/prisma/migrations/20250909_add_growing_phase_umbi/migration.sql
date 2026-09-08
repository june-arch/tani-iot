-- Tambah fase panen khusus umbi & rimpang (wortel, kentang, jahe, kunyit).
-- Catatan: ALTER TYPE ... ADD VALUE tidak bisa jalan di dalam transaction block,
-- jadi untuk database yang sudah ada jalankan manual via psql:
--   ALTER TYPE "GrowingPhase" ADD VALUE IF NOT EXISTS 'VEGETATIF_AWAL';
--   ... dst. (lihat bawah). `prisma migrate deploy` pada DB baru memakai
--   fallback `prisma db push` di Dockerfile CMD bila file ini gagal dalam transaksi.
ALTER TYPE "GrowingPhase" ADD VALUE IF NOT EXISTS 'VEGETATIF_AWAL';
ALTER TYPE "GrowingPhase" ADD VALUE IF NOT EXISTS 'PEMBESARAN_UMBI';
ALTER TYPE "GrowingPhase" ADD VALUE IF NOT EXISTS 'PENGUMBIAN_GENERATIF';
ALTER TYPE "GrowingPhase" ADD VALUE IF NOT EXISTS 'PENGISIAN_RIMPANG';
