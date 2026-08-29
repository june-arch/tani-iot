import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface Pupuk {
  nama: string;
  takaran: string;
  intervalHari: number;
  cara: string;
}

interface SowingGuideSeed {
  mediaTanam: string;
  durasiHari: number;
  suhuOptimal: string;
  kelembaban: string;
  langkah: string[];
  siapTanamIndikator: string;
}

interface GrowingGuideSeed {
  fase: 'VEGETATIF' | 'GENERATIF';
  pupuk: Pupuk[];
  penyiraman: string;
  hama: string[];
  panenHariRange: string;
}

interface HydroponicGuideSeed {
  sistem: string;
  ppmRange: string;
  phRange: string;
  nutrisi: string[];
  durasiHari: number;
}

interface CropSeed {
  name: string;
  slug: string;
  category: 'SAYUR' | 'BUAH';
  scientificName: string;
  description: string;
  iklimOptimal: string;
  ketinggianOptimal: string;
  imageUrl?: string | null;
  sowingGuide: SowingGuideSeed;
  growingGuides: GrowingGuideSeed[];
  hydroponicGuide: HydroponicGuideSeed;
}

async function main() {
  const seedPath = path.join(__dirname, '..', 'data', 'crops.seed.json');
  const raw = fs.readFileSync(seedPath, 'utf-8');
  const crops: CropSeed[] = JSON.parse(raw);

  console.log(`Menanam ${crops.length} komoditas ke database...`);

  for (const c of crops) {
    const crop = await prisma.crop.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        category: c.category as any,
        scientificName: c.scientificName,
        description: c.description,
        iklimOptimal: c.iklimOptimal,
        ketinggianOptimal: c.ketinggianOptimal,
        imageUrl: c.imageUrl ?? null,
      },
      create: {
        name: c.name,
        slug: c.slug,
        category: c.category as any,
        scientificName: c.scientificName,
        description: c.description,
        iklimOptimal: c.iklimOptimal,
        ketinggianOptimal: c.ketinggianOptimal,
        imageUrl: c.imageUrl ?? null,
      },
    });

    // SowingGuide: hapus lama lalu buat baru (idempotent)
    await prisma.sowingGuide.deleteMany({ where: { cropId: crop.id } });
    await prisma.sowingGuide.create({
      data: {
        cropId: crop.id,
        mediaTanam: c.sowingGuide.mediaTanam,
        durasiHari: c.sowingGuide.durasiHari,
        suhuOptimal: c.sowingGuide.suhuOptimal,
        kelembaban: c.sowingGuide.kelembaban,
        langkah: c.sowingGuide.langkah as any,
        siapTanamIndikator: c.sowingGuide.siapTanamIndikator,
      },
    });

    // GrowingGuides
    await prisma.growingGuide.deleteMany({ where: { cropId: crop.id } });
    for (const g of c.growingGuides) {
      await prisma.growingGuide.create({
        data: {
          cropId: crop.id,
          fase: g.fase as any,
          pupuk: g.pupuk as any,
          penyiraman: g.penyiraman,
          hama: g.hama as any,
          panenHariRange: g.panenHariRange,
        },
      });
    }

    // HydroponicGuide
    await prisma.hydroponicGuide.deleteMany({ where: { cropId: crop.id } });
    await prisma.hydroponicGuide.create({
      data: {
        cropId: crop.id,
        sistem: c.hydroponicGuide.sistem,
        ppmRange: c.hydroponicGuide.ppmRange,
        phRange: c.hydroponicGuide.phRange,
        nutrisi: c.hydroponicGuide.nutrisi as any,
        durasiHari: c.hydroponicGuide.durasiHari,
      },
    });
  }

  const count = await prisma.crop.count();
  console.log(`Selesai. Total crops di DB: ${count}`);
}

main()
  .catch((e) => {
    console.error('Seed gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
