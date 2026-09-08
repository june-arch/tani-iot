import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlantingDto, UpdatePlantingDto } from './dto/create-planting.dto';

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function parsePanenRange(label: string): { min: number; max: number; avg: number } {
  const nums = (label.match(/\d+/g) ?? []).map(Number);
  if (nums.length >= 2) return { min: nums[0], max: nums[1], avg: Math.round((nums[0] + nums[1]) / 2) };
  if (nums.length === 1) return { min: nums[0], max: nums[0], avg: nums[0] };
  return { min: 60, max: 90, avg: 75 };
}

@Injectable()
export class PlantingsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveCrop(cropIdOrSlug: string) {
    let crop = await this.prisma.crop.findUnique({
      where: { id: cropIdOrSlug },
      include: { sowingGuides: true, growingGuides: true },
    });
    if (!crop) {
      crop = await this.prisma.crop.findUnique({
        where: { slug: cropIdOrSlug },
        include: { sowingGuides: true, growingGuides: true },
      });
    }
    if (!crop) throw new NotFoundException('Komoditas tidak ditemukan');
    return crop;
  }

  private computePrediksi(crop: any, tanggalSemai: string, tanggalTanamActual?: string) {
    const sowing = crop.sowingGuides?.[0];
    const guides: any[] = crop.growingGuides ?? [];
    // Fase panen: GENERATIF dulu, kalau tidak ada (umbi/rimpang) pakai guide terakhir
    const generatif = guides.find((g: any) => g.fase === 'GENERATIF') ?? guides[guides.length - 1];
    const durasi = sowing?.durasiHari ?? 7;
    const rangeLabel: string = generatif?.panenHariRange ?? '60-90 hari';
    const { min, max, avg } = parsePanenRange(rangeLabel);
    const baseTanam = tanggalTanamActual ?? addDays(tanggalSemai, durasi);
    const tanamPred = addDays(tanggalSemai, durasi);
    return {
      tanam: tanamPred,
      siapTanamLabel: sowing?.siapTanamIndikator ?? `Siap pindah tanam setelah ${durasi} hari`,
      panenMin: addDays(baseTanam, min),
      panenMax: addDays(baseTanam, max),
      panenAvg: addDays(baseTanam, avg),
      durasiSemai: durasi,
      panenRangeLabel: rangeLabel,
      min, max, avg,
    };
  }

  async create(dto: CreatePlantingDto, userId: string) {
    const lahan = await this.prisma.lahan.findUnique({
      where: { id: dto.lahanId },
      include: { kebun: true },
    });
    if (!lahan) throw new NotFoundException('Lahan tidak ditemukan');
    // cek akses kebun
    const kebunId = lahan.kebunId;
    const kebun = lahan.kebun;
    const isPemilik = kebun.pemilikId === userId;
    if (!isPemilik) {
      const member = await this.prisma.kebunMember.findUnique({ where: { kebunId_userId: { kebunId, userId } } });
      if (!member) throw new ForbiddenException('Anda bukan anggota kebun ini');
    }
    const crop = await this.resolveCrop(dto.cropId);
    const prediksi = this.computePrediksi(crop, dto.tanggalSemai, dto.tanggalTanam);

    // simpan prediksi di catatan JSON (tetap string catatan juga)
    const catatanPayload = dto.catatan ? { text: dto.catatan, prediksi } : { prediksi };

    const planting = await this.prisma.planting.create({
      data: {
        lahanId: lahan.id,
        cropId: crop.id,
        metode: dto.metode,
        fase: dto.tanggalTanam ? 'PINDAH_TANAM' as any : 'SEMAI' as any,
        jumlah: dto.jumlah,
        tanggalSemai: new Date(dto.tanggalSemai + 'T00:00:00'),
        tanggalTanam: dto.tanggalTanam ? new Date(dto.tanggalTanam + 'T00:00:00') : null,
        status: 'AKTIF' as any,
        catatan: JSON.stringify(catatanPayload),
      },
      include: { crop: true, lahan: { include: { kebun: true } } },
    });
    return this.enrich(planting, prediksi);
  }

  private enrich(planting: any, prediksiOverride?: any) {
    // parse catatan
    let catatanText: string | undefined;
    let prediksi = prediksiOverride;
    try {
      const parsed = JSON.parse(planting.catatan ?? '{}');
      if (parsed?.prediksi && !prediksi) prediksi = parsed.prediksi;
      catatanText = parsed?.text ?? planting.catatan;
      if (typeof parsed === 'string') catatanText = parsed;
    } catch {
      catatanText = planting.catatan;
    }
    // fallback compute if no prediksi stored (old data)
    if (!prediksi) {
      // best effort: need crop guides — fetch not available here, skip
      prediksi = null;
    }
    const kebunId = planting.lahan?.kebun?.id ?? planting.lahan?.kebunId;
    return {
      ...planting,
      catatan: catatanText,
      prediksi,
      kebunId,
      lahanNama: planting.lahan?.nama,
      kebunNama: planting.lahan?.kebun?.nama,
      cropName: planting.crop?.name,
      cropSlug: planting.crop?.slug,
      cropCategory: planting.crop?.category,
    };
  }

  async findByKebun(kebunId: string, userId: string) {
    const kebun = await this.prisma.kebun.findUnique({ where: { id: kebunId } });
    if (!kebun) throw new NotFoundException('Kebun tidak ditemukan');
    const isPemilik = kebun.pemilikId === userId;
    if (!isPemilik) {
      const member = await this.prisma.kebunMember.findUnique({ where: { kebunId_userId: { kebunId, userId } } });
      if (!member) throw new ForbiddenException('Anda bukan anggota kebun ini');
    }
    const plantings = await this.prisma.planting.findMany({
      where: { lahan: { kebunId } },
      include: { crop: true, lahan: { include: { kebun: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(plantings.map(async (p) => {
      // recompute prediksi jika catatan tidak ada
      let pred: any = null;
      try {
        const parsed = JSON.parse((p as any).catatan ?? '{}');
        pred = parsed?.prediksi ?? null;
      } catch {}
      if (!pred && p.tanggalSemai) {
        const crop = await this.prisma.crop.findUnique({ where: { id: (p as any).cropId }, include: { sowingGuides: true, growingGuides: true } });
        if (crop) pred = this.computePrediksi(crop, (p.tanggalSemai as Date).toISOString().slice(0,10), p.tanggalTanam ? (p.tanggalTanam as Date).toISOString().slice(0,10) : undefined);
      }
      return this.enrich(p, pred);
    }));
  }

  async findAllForUser(userId: string) {
    // semua kebun user
    const kebuns = await this.prisma.kebun.findMany({
      where: { OR: [{ pemilikId: userId }, { members: { some: { userId } } }] },
      select: { id: true },
    });
    const kebunIds = kebuns.map((k) => k.id);
    const plantings = await this.prisma.planting.findMany({
      where: { lahan: { kebunId: { in: kebunIds } } },
      include: { crop: true, lahan: { include: { kebun: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(plantings.map(async (p) => {
      let pred: any = null;
      try { const parsed = JSON.parse((p as any).catatan ?? '{}'); pred = parsed?.prediksi ?? null; } catch {}
      if (!pred && p.tanggalSemai) {
        const crop = await this.prisma.crop.findUnique({ where: { id: (p as any).cropId }, include: { sowingGuides: true, growingGuides: true } });
        if (crop) pred = this.computePrediksi(crop, (p.tanggalSemai as Date).toISOString().slice(0,10), p.tanggalTanam ? (p.tanggalTanam as Date).toISOString().slice(0,10) : undefined);
      }
      return this.enrich(p, pred);
    }));
  }

  async update(id: string, dto: UpdatePlantingDto, userId: string) {
    const planting = await this.prisma.planting.findUnique({
      where: { id },
      include: { lahan: { include: { kebun: true } }, crop: { include: { sowingGuides: true, growingGuides: true } } },
    });
    if (!planting) throw new NotFoundException('Rencana tidak ditemukan');
    const kebunId = (planting as any).lahan.kebunId;
    const kebun = (planting as any).lahan.kebun;
    const isPemilik = kebun.pemilikId === userId;
    if (!isPemilik) {
      const member = await this.prisma.kebunMember.findUnique({ where: { kebunId_userId: { kebunId, userId } } });
      if (!member) throw new ForbiddenException('Anda bukan anggota kebun ini');
    }
    // update prediksi jika tanggalTanam berubah
    let catatanPayload: any = {};
    try { catatanPayload = JSON.parse((planting as any).catatan ?? '{}'); if (typeof catatanPayload === 'string') catatanPayload = { text: catatanPayload }; } catch { catatanPayload = {}; }
    if (dto.catatan !== undefined) catatanPayload.text = dto.catatan;
    if (dto.tanggalTanam) {
      const pred = this.computePrediksi((planting as any).crop, (planting.tanggalSemai as Date).toISOString().slice(0,10), dto.tanggalTanam);
      catatanPayload.prediksi = pred;
    }
    const updated = await this.prisma.planting.update({
      where: { id },
      data: {
        tanggalTanam: dto.tanggalTanam ? new Date(dto.tanggalTanam + 'T00:00:00') : undefined,
        status: (dto.status as any) ?? undefined,
        fase: (dto.fase as any) ?? undefined,
        catatan: Object.keys(catatanPayload).length ? JSON.stringify(catatanPayload) : undefined,
      },
      include: { crop: true, lahan: { include: { kebun: true } } },
    });
    // if status PANEN, set panen date in catatan
    let pred = catatanPayload.prediksi;
    if (!pred) {
      const pDate = (updated.tanggalSemai as Date).toISOString().slice(0,10);
      const tDate = updated.tanggalTanam ? (updated.tanggalTanam as Date).toISOString().slice(0,10) : undefined;
      pred = this.computePrediksi((updated as any).crop, pDate, tDate);
    }
    return this.enrich(updated, pred);
  }

  async remove(id: string, userId: string) {
    const planting = await this.prisma.planting.findUnique({
      where: { id },
      include: { lahan: { include: { kebun: true } } },
    });
    if (!planting) throw new NotFoundException('Rencana tidak ditemukan');
    const kebunId = (planting as any).lahan.kebunId;
    const kebun = (planting as any).lahan.kebun;
    const isPemilik = kebun.pemilikId === userId;
    if (!isPemilik) {
      const member = await this.prisma.kebunMember.findUnique({ where: { kebunId_userId: { kebunId, userId } } });
      if (!member) throw new ForbiddenException('Anda bukan anggota kebun ini');
    }
    await this.prisma.planting.delete({ where: { id } });
    return { success: true };
  }
}
