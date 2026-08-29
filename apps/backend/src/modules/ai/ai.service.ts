import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  buildDoctorTaniPrompt,
  AiDiagnosisResult,
} from './prompts/doctor-tani.prompt';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private prisma: PrismaService) {}

  // ===================== DIAGNOSE =====================
  async diagnose(
    filePath: string,
    originalName: string,
    mimeType: string,
    cropSlug?: string,
    lahanId?: string,
    plantingId?: string,
    userId?: string,
  ) {
    const imageUrl = filePath; // relative path like uploads/ai/uuid.jpg

    // Validasi planting ownership jika disediakan
    if (plantingId) {
      const planting = await this.prisma.planting.findUnique({
        where: { id: plantingId },
      });
      if (!planting) {
        // tidak throw, tetap lanjut tapi warning
        this.logger.warn(`Planting ${plantingId} tidak ditemukan`);
      }
    }

    let result: AiDiagnosisResult;

    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    if (geminiKey) {
      try {
        result = await this.callGeminiVision(filePath, mimeType, cropSlug, geminiKey);
      } catch (e: any) {
        this.logger.warn(`Gemini gagal: ${e.message} — fallback heuristic`);
        result = this.heuristicFallback(cropSlug);
      }
    } else {
      this.logger.log('GEMINI_API_KEY kosong — memakai heuristic fallback');
      result = this.heuristicFallback(cropSlug);
    }

    // Simpan ke DB
    const diagnosis = await this.prisma.diagnosis.create({
      data: {
        userId: userId ?? null,
        plantingId: plantingId ?? null,
        imageUrl,
        cropSlug: cropSlug ?? null,
        diagnosis: result.diagnosis,
        confidence: result.confidence,
        penyebab: result.penyebab,
        solusi: result.solusi as any,
        pencegahan: result.pencegahan,
      },
    });

    return {
      id: diagnosis.id,
      imageUrl: diagnosis.imageUrl,
      cropSlug: diagnosis.cropSlug,
      ...result,
      createdAt: diagnosis.createdAt,
    };
  }

  // ===================== GEMINI 2.5 FLASH VISION =====================
  private async callGeminiVision(
    filePath: string,
    mimeType: string,
    cropSlug: string | undefined,
    apiKey: string,
  ): Promise<AiDiagnosisResult> {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);

    // Jika filePath relative uploads/ai/..., resolve
    let buffer: Buffer;
    try {
      buffer = fs.readFileSync(absolutePath);
    } catch {
      // coba relative terhadap backend root
      const alt = path.join(process.cwd(), 'apps', 'backend', filePath);
      buffer = fs.readFileSync(alt);
    }

    const base64 = buffer.toString('base64');
    const prompt = buildDoctorTaniPrompt(cropSlug);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: base64 } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API ${res.status}: ${errText.slice(0, 500)}`);
    }

    const json: any = await res.json();
    const textPart: string =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!textPart) throw new Error('Gemini response kosong');

    // Parse JSON dari response (kadang dibungkus markdown)
    let cleaned = textPart.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // coba extract JSON object pertama
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error('Gagal parse JSON dari Gemini');
    }

    return this.normalizeResult(parsed);
  }

  private normalizeResult(raw: any): AiDiagnosisResult {
    return {
      diagnosis: String(raw.diagnosis ?? 'Tidak teridentifikasi'),
      confidence: typeof raw.confidence === 'number' ? Math.min(1, Math.max(0, raw.confidence)) : 0.7,
      penyebab: String(raw.penyebab ?? 'Penyebab belum dapat dipastikan, perlu pengamatan lebih lanjut.'),
      solusi: Array.isArray(raw.solusi) && raw.solusi.length > 0
        ? raw.solusi.map((s: any) => ({
            langkah: String(s.langkah ?? '-'),
            bahan: String(s.bahan ?? '-'),
            takaran: String(s.takaran ?? '-'),
          }))
        : [{ langkah: 'Lakukan observasi lanjutan', bahan: '-', takaran: '-' }],
      pencegahan: String(raw.pencegahan ?? 'Jaga kebersihan lahan dan lakukan monitoring rutin.'),
    };
  }

  // ===================== HEURISTIC FALLBACK =====================
  private heuristicFallback(cropSlug?: string): AiDiagnosisResult {
    // Heuristic sederhana: kembalikan diagnosis umum yang membantu petani
    // Tidak analisis warna pixel — fallback informatif dengan saran umum
    const cropName = cropSlug ?? 'tanaman';
    return {
      diagnosis: `Gejala umum pada ${cropName} — perlu observasi lanjutan`,
      confidence: 0.45,
      penyebab:
        'Diagnosis AI tidak tersedia saat ini (kunci API belum dikonfigurasi atau layanan sementara tidak dapat dihubungi). Gejala umum seperti daun menguning sering terkait kekurangan nitrogen (N), bercak coklat terkait jamur, dan daun keriting terkait hama kutu/virus.',
      solusi: [
        {
          langkah: 'Periksa daun: jika menguning merata dari daun tua, berikan pupuk nitrogen',
          bahan: 'Urea / NPK 16-16-16',
          takaran: '1-2 gram per liter air, kocor seminggu sekali',
        },
        {
          langkah: 'Jika ada bercak coklat/hitam atau busuk, semprot fungisida dan pangkas daun sakit',
          bahan: 'Fungisida Mancozeb atau Trichoderma',
          takaran: '2 gram per liter air, semprot sore hari',
        },
        {
          langkah: 'Jika ada hama kecil (kutu, ulat), semprot pestisida nabati dan jaga kebersihan lahan',
          bahan: 'Neem oil / pestisida nabati',
          takaran: '5 ml per liter air + sedikit sabun cair',
        },
      ],
      pencegahan:
        'Gunakan bibit sehat, jaga drainase dan sirkulasi udara, lakukan rotasi tanaman, dan pantau lahan setiap 2-3 hari.',
    };
  }

  // ===================== HISTORY =====================
  async getHistory(params: {
    userId?: string;
    lahanId?: string;
    plantingId?: string;
    limit?: number;
  }) {
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);

    // Jika filter lahanId, cari planting yang ada di lahan tersebut
    let plantingIds: string[] | undefined;
    if (params.lahanId) {
      const plantings = await this.prisma.planting.findMany({
        where: { lahanId: params.lahanId },
        select: { id: true },
      });
      plantingIds = plantings.map((p) => p.id);
      // Jika lahanId ada tapi tidak ada planting, return kosong
      if (plantingIds.length === 0) return [];
    }

    const where: any = {};
    if (params.plantingId) where.plantingId = params.plantingId;
    else if (plantingIds) where.plantingId = { in: plantingIds };
    // Jika userId ada, filter juga (opsional — user lihat history sendiri)
    // Tidak wajib filter user agar admin bisa lihat semua
    if (params.userId) where.userId = params.userId;

    return this.prisma.diagnosis.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        planting: {
          include: { crop: { select: { name: true, slug: true } }, lahan: { select: { nama: true } } },
        },
      },
    });
  }

  // ===================== FEEDBACK =====================
  async giveFeedback(id: string, dto: { helpful: boolean; catatan?: string }) {
    const existing = await this.prisma.diagnosis.findUnique({ where: { id } });
    if (!existing) {
      const err: any = new Error('Diagnosis tidak ditemukan');
      err.status = 404;
      throw err;
    }

    const feedback = {
      helpful: dto.helpful,
      catatan: dto.catatan ?? null,
      at: new Date().toISOString(),
    };

    const updated = await this.prisma.diagnosis.update({
      where: { id },
      data: { feedback: feedback as any },
    });

    return updated;
  }
}
