import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CropsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: { category?: string; search?: string }) {
    const where: any = {};
    if (query?.category) {
      where.category = query.category;
    }
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
        { scientificName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const crops = await this.prisma.crop.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        sowingGuides: true,
        growingGuides: true,
        hydroponicGuides: true,
      },
    });
    return crops;
  }

  async findBySlug(slug: string) {
    const crop = await this.prisma.crop.findUnique({
      where: { slug },
      include: {
        sowingGuides: true,
        growingGuides: { orderBy: { fase: 'asc' } },
        hydroponicGuides: true,
      },
    });
    if (!crop) {
      throw new NotFoundException(`Komoditas dengan slug '${slug}' tidak ditemukan`);
    }
    return crop;
  }

  async getTimeline(slug: string) {
    const crop = await this.findBySlug(slug);

    const sowing = crop.sowingGuides[0];
    const vegetatif = crop.growingGuides.find((g) => g.fase === 'VEGETATIF');
    const generatif = crop.growingGuides.find((g) => g.fase === 'GENERATIF');
    const hydro = crop.hydroponicGuides[0];

    // Estimasi hari kumulatif
    const sowingDays = sowing?.durasiHari ?? 7;
    const vegRange = vegetatif?.panenHariRange ?? '30-45 hari';
    const genRange = generatif?.panenHariRange ?? '60-90 hari';

    const timeline = [
      {
        fase: 'SEMAI',
        urutan: 1,
        durasiHari: sowingDays,
        hariMulai: 0,
        hariSelesai: sowingDays,
        judul: 'Persemaian',
        deskripsi: `Semai ${crop.name} di ${sowing?.mediaTanam ?? 'media semai'}`,
        detail: sowing
          ? {
              mediaTanam: sowing.mediaTanam,
              suhuOptimal: sowing.suhuOptimal,
              kelembaban: sowing.kelembaban,
              langkah: sowing.langkah,
              siapTanamIndikator: sowing.siapTanamIndikator,
            }
          : null,
      },
      {
        fase: 'VEGETATIF',
        urutan: 2,
        durasiHari: vegRange,
        hariMulai: sowingDays,
        hariSelesai: null as number | null,
        judul: 'Fase Vegetatif',
        deskripsi: `Pertumbuhan daun dan akar ${crop.name}`,
        detail: vegetatif
          ? {
              pupuk: vegetatif.pupuk,
              penyiraman: vegetatif.penyiraman,
              hama: vegetatif.hama,
              panenHariRange: vegetatif.panenHariRange,
            }
          : null,
      },
      {
        fase: 'GENERATIF',
        urutan: 3,
        durasiHari: genRange,
        hariMulai: null as number | null,
        hariSelesai: null as number | null,
        judul: 'Fase Generatif & Panen',
        deskripsi: `Pembungaan, pembuahan, dan panen ${crop.name}`,
        detail: generatif
          ? {
              pupuk: generatif.pupuk,
              penyiraman: generatif.penyiraman,
              hama: generatif.hama,
              panenHariRange: generatif.panenHariRange,
            }
          : null,
      },
      {
        fase: 'HIDROPONIK',
        urutan: 4,
        durasiHari: hydro?.durasiHari ?? null,
        hariMulai: 0,
        hariSelesai: hydro?.durasiHari ?? null,
        judul: 'Panduan Hidroponik',
        deskripsi: `Budidaya ${crop.name} sistem ${hydro?.sistem ?? 'NFT/DFT'}`,
        detail: hydro
          ? {
              sistem: hydro.sistem,
              ppmRange: hydro.ppmRange,
              phRange: hydro.phRange,
              nutrisi: hydro.nutrisi,
              durasiHari: hydro.durasiHari,
            }
          : null,
      },
    ];

    return {
      crop: {
        id: crop.id,
        name: crop.name,
        slug: crop.slug,
        category: crop.category,
        scientificName: crop.scientificName,
        description: crop.description,
        iklimOptimal: crop.iklimOptimal,
        ketinggianOptimal: crop.ketinggianOptimal,
        imageUrl: crop.imageUrl,
      },
      sowingGuide: sowing ?? null,
      growingGuides: crop.growingGuides,
      hydroponicGuide: hydro ?? null,
      timeline,
    };
  }
}
