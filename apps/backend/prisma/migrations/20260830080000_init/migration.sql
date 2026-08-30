-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "GlobalRole" AS ENUM ('SUPERADMIN', 'ADMIN', 'PETANI', 'VIEWER');

-- CreateEnum
CREATE TYPE "KebunRole" AS ENUM ('OWNER', 'ADMIN', 'PETANI', 'VIEWER');

-- CreateEnum
CREATE TYPE "LahanType" AS ENUM ('TANAH', 'HIDROPONIK');

-- CreateEnum
CREATE TYPE "PlantingFase" AS ENUM ('SEMAI', 'PINDAH_TANAM', 'VEGETATIF', 'GENERATIF', 'PANEN', 'SELESAI');

-- CreateEnum
CREATE TYPE "PlantingStatus" AS ENUM ('AKTIF', 'PANEN', 'GAGAL', 'SELESAI');

-- CreateEnum
CREATE TYPE "CropCategory" AS ENUM ('SAYUR', 'BUAH');

-- CreateEnum
CREATE TYPE "GrowingPhase" AS ENUM ('VEGETATIF', 'GENERATIF');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('TANDON', 'IRRIGATION', 'SOIL', 'HYDROPONIC', 'GATEWAY');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('ONLINE', 'OFFLINE', 'ERROR');

-- CreateEnum
CREATE TYPE "SensorType" AS ENUM ('WATER_LEVEL', 'SOLENOID', 'PH', 'NPK_N', 'NPK_P', 'NPK_K', 'EC', 'TDS_PPM', 'TEMP', 'HUMIDITY', 'SOIL_MOISTURE');

-- CreateEnum
CREATE TYPE "IrrigationSource" AS ENUM ('MANUAL', 'SCHEDULE', 'AUTO');

-- CreateEnum
CREATE TYPE "IrrigationStatus" AS ENUM ('SUKSES', 'GAGAL', 'BATAL_TANDON_KOSONG');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('WATER_LOW', 'PH_OUT_OF_RANGE', 'NPK_LOW', 'PPM_LOW', 'PPM_HIGH', 'DEVICE_OFFLINE', 'DISEASE_DETECTED', 'IRRIGATION_DONE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" "GlobalRole" NOT NULL DEFAULT 'PETANI',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kebuns" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "luas" DOUBLE PRECISION,
    "deskripsi" TEXT,
    "pemilikId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kebuns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kebun_members" (
    "id" TEXT NOT NULL,
    "kebunId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "KebunRole" NOT NULL DEFAULT 'PETANI',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kebun_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lahans" (
    "id" TEXT NOT NULL,
    "kebunId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" "LahanType" NOT NULL,
    "luas" DOUBLE PRECISION NOT NULL,
    "lokasi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lahans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantings" (
    "id" TEXT NOT NULL,
    "lahanId" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "metode" "LahanType" NOT NULL,
    "fase" "PlantingFase" NOT NULL DEFAULT 'SEMAI',
    "jumlah" INTEGER,
    "tanggalSemai" TIMESTAMP(3),
    "tanggalTanam" TIMESTAMP(3),
    "status" "PlantingStatus" NOT NULL DEFAULT 'AKTIF',
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plantings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "CropCategory" NOT NULL,
    "scientificName" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "iklimOptimal" TEXT,
    "ketinggianOptimal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sowing_guides" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "mediaTanam" TEXT NOT NULL,
    "durasiHari" INTEGER NOT NULL,
    "suhuOptimal" TEXT NOT NULL,
    "kelembaban" TEXT NOT NULL,
    "langkah" JSONB NOT NULL,
    "siapTanamIndikator" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sowing_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "growing_guides" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "fase" "GrowingPhase" NOT NULL,
    "pupuk" JSONB NOT NULL,
    "penyiraman" TEXT NOT NULL,
    "hama" JSONB,
    "panenHariRange" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "growing_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hydroponic_guides" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "sistem" TEXT NOT NULL,
    "ppmRange" TEXT NOT NULL,
    "phRange" TEXT NOT NULL,
    "nutrisi" JSONB NOT NULL,
    "durasiHari" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hydroponic_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "kebunId" TEXT NOT NULL,
    "lahanId" TEXT,
    "nama" TEXT NOT NULL,
    "type" "DeviceType" NOT NULL,
    "lokasi" TEXT,
    "status" "DeviceStatus" NOT NULL DEFAULT 'OFFLINE',
    "mqttTopic" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensors" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "type" "SensorType" NOT NULL,
    "unit" TEXT NOT NULL,
    "minThreshold" DOUBLE PRECISION,
    "maxThreshold" DOUBLE PRECISION,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sensors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telemetries" (
    "id" TEXT NOT NULL,
    "sensorId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "raw" JSONB,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telemetries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "irrigation_logs" (
    "id" TEXT NOT NULL,
    "kebunId" TEXT NOT NULL,
    "lahanId" TEXT,
    "deviceId" TEXT,
    "durationSec" INTEGER NOT NULL,
    "source" "IrrigationSource" NOT NULL,
    "status" "IrrigationStatus" NOT NULL DEFAULT 'SUKSES',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "irrigation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "kebunId" TEXT,
    "sensorId" TEXT,
    "lahanId" TEXT,
    "type" "AlertType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "plantingId" TEXT,
    "imageUrl" TEXT NOT NULL,
    "cropSlug" TEXT,
    "diagnosis" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "penyebab" TEXT,
    "solusi" JSONB,
    "pencegahan" TEXT,
    "feedback" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "kebuns_pemilikId_idx" ON "kebuns"("pemilikId");

-- CreateIndex
CREATE UNIQUE INDEX "kebun_members_kebunId_userId_key" ON "kebun_members"("kebunId", "userId");

-- CreateIndex
CREATE INDEX "lahans_kebunId_idx" ON "lahans"("kebunId");

-- CreateIndex
CREATE INDEX "plantings_lahanId_idx" ON "plantings"("lahanId");

-- CreateIndex
CREATE INDEX "plantings_cropId_idx" ON "plantings"("cropId");

-- CreateIndex
CREATE UNIQUE INDEX "crops_slug_key" ON "crops"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "growing_guides_cropId_fase_key" ON "growing_guides"("cropId", "fase");

-- CreateIndex
CREATE UNIQUE INDEX "devices_mqttTopic_key" ON "devices"("mqttTopic");

-- CreateIndex
CREATE INDEX "devices_kebunId_idx" ON "devices"("kebunId");

-- CreateIndex
CREATE INDEX "devices_lahanId_idx" ON "devices"("lahanId");

-- CreateIndex
CREATE INDEX "sensors_deviceId_idx" ON "sensors"("deviceId");

-- CreateIndex
CREATE INDEX "telemetries_sensorId_recordedAt_idx" ON "telemetries"("sensorId", "recordedAt");

-- CreateIndex
CREATE INDEX "irrigation_logs_kebunId_idx" ON "irrigation_logs"("kebunId");

-- CreateIndex
CREATE INDEX "irrigation_logs_lahanId_idx" ON "irrigation_logs"("lahanId");

-- CreateIndex
CREATE INDEX "irrigation_logs_deviceId_idx" ON "irrigation_logs"("deviceId");

-- CreateIndex
CREATE INDEX "irrigation_logs_createdAt_idx" ON "irrigation_logs"("createdAt");

-- CreateIndex
CREATE INDEX "alerts_kebunId_idx" ON "alerts"("kebunId");

-- AddForeignKey
ALTER TABLE "kebuns" ADD CONSTRAINT "kebuns_pemilikId_fkey" FOREIGN KEY ("pemilikId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kebun_members" ADD CONSTRAINT "kebun_members_kebunId_fkey" FOREIGN KEY ("kebunId") REFERENCES "kebuns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kebun_members" ADD CONSTRAINT "kebun_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lahans" ADD CONSTRAINT "lahans_kebunId_fkey" FOREIGN KEY ("kebunId") REFERENCES "kebuns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantings" ADD CONSTRAINT "plantings_lahanId_fkey" FOREIGN KEY ("lahanId") REFERENCES "lahans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantings" ADD CONSTRAINT "plantings_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "crops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sowing_guides" ADD CONSTRAINT "sowing_guides_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "crops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "growing_guides" ADD CONSTRAINT "growing_guides_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "crops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hydroponic_guides" ADD CONSTRAINT "hydroponic_guides_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "crops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_kebunId_fkey" FOREIGN KEY ("kebunId") REFERENCES "kebuns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_lahanId_fkey" FOREIGN KEY ("lahanId") REFERENCES "lahans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensors" ADD CONSTRAINT "sensors_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemetries" ADD CONSTRAINT "telemetries_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "sensors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "irrigation_logs" ADD CONSTRAINT "irrigation_logs_kebunId_fkey" FOREIGN KEY ("kebunId") REFERENCES "kebuns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "irrigation_logs" ADD CONSTRAINT "irrigation_logs_lahanId_fkey" FOREIGN KEY ("lahanId") REFERENCES "lahans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "irrigation_logs" ADD CONSTRAINT "irrigation_logs_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_plantingId_fkey" FOREIGN KEY ("plantingId") REFERENCES "plantings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

