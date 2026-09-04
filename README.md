# Tani IoT — Monitoring Pertanian Multi-Kebun

Platform IoT pertanian end-to-end: penyemaian → pindah tanam → panen (tanah & hidroponik), sensor tandon/irigasi/pH/NPK/PPM, irigasi otomatis, AI Doctor Tani, dashboard konfigurasi sensor, web backend + APK React Native.

> Bahasa: **Full Indonesia** | VPS: **dragon (101.50.2.190)** | Multi-kebun sejak awal

## Struktur Monorepo

```
tani-iot/
├── apps/
│   ├── backend/   # NestJS 11 + Prisma 6 + Postgres + MQTT + WS
│   ├── web/       # Next.js 16 + Tailwind v4 + Motion (dashboard)
│   └── mobile/    # Expo 54 + Expo Router (APK)
├── packages/shared/ # types/constants/utils shared
├── docs/
│   ├── hardware/  # BOM, WIRING, ESP32-FIRMWARE
│   └── postman/   # collection
├── docker-compose.yml
└── .env.example
```

## Quick Start (dev)

```bash
# 1. env
cp .env.example .env

# 2. infra (postgres, redis, emqx)
docker compose up -d

# 3. backend
cd apps/backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev   # :3101

# 4. web
cd apps/web
npm install
npm run dev         # :3100

# 5. mobile
cd apps/mobile
npm install
npx expo start
```

## Env Penting

Lihat `.env.example` — `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, `MQTT_URL`, `REDIS_URL`.

## Deploy (VPS dragon)

```bash
# backup dulu
npx tsx scripts/backup-db.ts

# prod
docker compose -f docker-compose.prod.yml up -d --build
pm2 start ecosystem.config.js --env production
pm2 save
```

## Hardware

Lihat `docs/hardware/BOM.md` — estimasi per-kebun mini 1.8—2.5 jt.

## Design System

`PRODUCT.md` + `DESIGN.md` (Impeccable) — palette earthy sage/terracotta/cream, 8px grid, WCAG AA, Motion.

## License

Private — Arcson Development.
# test trigger 2026-09-04 23:15:41
