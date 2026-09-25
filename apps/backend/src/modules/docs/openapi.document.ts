/**
 * Tani IoT — Dokumen OpenAPI 3.1 (ditulis manual, tanpa @nestjs/swagger).
 * Disajikan via Scalar di GET /api/docs, mentahan JSON di GET /api/openapi.json.
 * Sumber kebenaran: controller + DTO di src/modules/* (di-frozen, jangan ubah path).
 *
 * PENTING — 3 dialek amplop respons (backend di-frozen):
 *  a) { message, data } .......... auth, kebuns
 *  b) { sukses, pesan, data } ..... crops, plantings, ai
 *  c) mentah / { data, meta } ..... devices, sensors, irrigation, telemetry
 * Frontend wajib lewat adapter normalizeList()/normalizeOne().
 */

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Tani IoT API',
    version: '1.0.0',
    description:
      'Platform IoT pertanian multi-kebun: sensor tandon/irigasi/pH/NPK/PPM, irigasi otomatis, ' +
      'AI Doctor Tani, dan 60+ komoditas Indonesia. Full Bahasa Indonesia. ' +
      'Seluruh path di bawah prefix /api. Error validasi: { statusCode, message[], error }.',
  },
  servers: [
    { url: 'http://localhost:3101/api', description: 'Lokal (dev)' },
    { url: 'http://101.50.2.190:3101/api', description: 'VPS dragon (prod)' },
  ],
  tags: [
    { name: 'Kesehatan', description: 'Healthcheck service' },
    {
      name: 'Auth',
      description:
        'Login/refresh. Register butuh token ADMIN — tidak ada self-signup publik',
    },
    {
      name: 'Kebun',
      description: 'CRUD kebun, anggota per-kebun (RBAC), dan lahan',
    },
    {
      name: 'Device',
      description: 'ESP32/gateway per kebun. Respons mentah (tanpa amplop)',
    },
    {
      name: 'Sensor',
      description: 'Registrasi + threshold/kalibrasi + telemetry',
    },
    {
      name: 'Telemetri',
      description: 'Ingest perangkat IoT — PUBLIK (tanpa JWT)',
    },
    {
      name: 'Tanaman',
      description: '60+ komoditas + panduan semai/tumbuh/hidroponik — PUBLIK',
    },
    {
      name: 'Planting',
      description: 'Rencana budidaya (semai → tanam → panen)',
    },
    {
      name: 'Irigasi',
      description: 'Trigger manual, jadwal cron, dan log solenoid',
    },
    {
      name: 'AI Doctor Tani',
      description: 'Diagnosis foto daun + histori + umpan balik',
    },
    {
      name: 'Rilis APK',
      description:
        'Upload APK oleh SUPERADMIN + cek versi terbaru (publik) untuk update mobile',
    },
  ],
  security: [{ bearer: [] }],
  paths: {
    '/': {
      get: {
        tags: ['Kesehatan'],
        summary: 'Sapaan service',
        security: [],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/health': {
      get: {
        tags: ['Kesehatan'],
        summary: 'Healthcheck (status service + timestamp)',
        security: [],
        responses: {
          '200': {
            description: 'Sehat',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    service: { type: 'string', example: 'tani-iot' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Daftarkan user (butuh JWT ADMIN/SUPERADMIN)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'nama'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  nama: { type: 'string' },
                  role: {
                    type: 'string',
                    enum: ['ADMIN', 'PETANI', 'VIEWER'],
                    default: 'PETANI',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description:
              'Terdaftar. Amplop { message, data: { user, accessToken, refreshToken } }',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthHasil' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary:
          'Masuk (publik). Lockout: 5x salah → kunci 15 menit (in-memory)',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'petani@tani.id',
                  },
                  password: { type: 'string', example: 'rahasia123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description:
              'Amplop { message, data: { user, accessToken, refreshToken } }',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthHasil' },
              },
            },
          },
          '401': { description: 'Email atau password salah' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Tukar refreshToken menjadi pasangan token baru',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: { refreshToken: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          '200': {
            description:
              'Amplop { message, data: { accessToken, refreshToken } } (tanpa user)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/kebuns': {
      post: {
        tags: ['Kebun'],
        summary: 'Buat kebun (pembuat otomatis OWNER)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/KebunBaru' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Amplop { message, data: Kebun+members }',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AmplopKebun' },
              },
            },
          },
        },
      },
    },
    '/kebuns/my': {
      get: {
        tags: ['Kebun'],
        summary: 'Daftar kebun saya (milik + anggota), include lahans/_count',
        responses: {
          '200': {
            description: 'Amplop { message, data: Kebun[] }',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Kebun' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/kebuns/{id}': {
      get: {
        tags: ['Kebun'],
        summary: 'Detail kebun (harus anggota kebun)',
        parameters: [{ $ref: '#/components/parameters/KebunId' }],
        responses: {
          '200': {
            description: 'Amplop { message, data: Kebun }',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AmplopKebun' },
              },
            },
          },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/TidakDitemukan' },
        },
      },
    },
    '/kebuns/{id}/members': {
      post: {
        tags: ['Kebun'],
        summary: 'Undang anggota (kirim userId ATAU email + role)',
        parameters: [{ $ref: '#/components/parameters/KebunId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['role'],
                properties: {
                  userId: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  role: { $ref: '#/components/schemas/KebunRole' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Amplop { message, data: member+user }' },
        },
      },
    },
    '/kebuns/{kebunId}/lahans': {
      get: {
        tags: ['Kebun'],
        summary: 'Daftar lahan dalam kebun',
        parameters: [
          {
            name: 'kebunId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Amplop { message, data: Lahan[] }',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Lahan' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Kebun'],
        summary: 'Tambah lahan (tipe TANAH/HIDROPONIK, luas ≥ 0.01)',
        parameters: [
          {
            name: 'kebunId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nama', 'tipe', 'luas'],
                properties: {
                  nama: { type: 'string', minLength: 2, maxLength: 100 },
                  tipe: { type: 'string', enum: ['TANAH', 'HIDROPONIK'] },
                  luas: { type: 'number', minimum: 0.01 },
                  lokasi: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Amplop { message, data: Lahan }' },
        },
      },
    },
    '/kebuns/{kebunId}/devices': {
      get: {
        tags: ['Device'],
        summary:
          'Daftar device + sensor dalam kebun (RESPONS MENTAH, tanpa amplop)',
        parameters: [
          {
            name: 'kebunId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Array Device Prisma mentah',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Device' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Device'],
        summary: 'Daftarkan device (mqttTopic wajib, lahanId opsional)',
        parameters: [
          {
            name: 'kebunId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DeviceBaru' },
            },
          },
        },
        responses: { '201': { description: 'Device mentah' } },
      },
    },
    '/devices/{id}': {
      patch: {
        tags: ['Device'],
        summary:
          'Ubah device (kirim lahanId: null untuk lepas; jangan kirim string kosong)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DeviceUbah' },
            },
          },
        },
        responses: { '200': { description: 'Device mentah hasil update' } },
      },
      delete: {
        tags: ['Device'],
        summary: 'Hapus device',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { '200': { description: '{ message }' } },
      },
    },
    '/devices/{deviceId}/sensors': {
      post: {
        tags: ['Sensor'],
        summary: 'Pasang sensor ke device (RESPONS MENTAH Sensor)',
        parameters: [
          {
            name: 'deviceId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SensorBaru' },
            },
          },
        },
        responses: { '201': { description: 'Sensor mentah' } },
      },
    },
    '/sensors/{id}/config': {
      patch: {
        tags: ['Sensor'],
        summary:
          'Atur threshold/kalibrasi (null = hapus batas; jangan kirim config: null bila hanya update threshold)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SensorConfig' },
            },
          },
        },
        responses: { '200': { description: 'Sensor mentah hasil update' } },
      },
    },
    '/sensors/{id}/telemetry': {
      get: {
        tags: ['Sensor'],
        summary:
          'Riwayat telemetry (paginasi: from/to ISO, limit 1–1000, page ≥ 1)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'from',
            in: 'query',
            schema: { type: 'string', format: 'date-time' },
          },
          {
            name: 'to',
            in: 'query',
            schema: { type: 'string', format: 'date-time' },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 1000, default: 20 },
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
        ],
        responses: {
          '200': {
            description:
              '{ data: Telemetry[], meta: { total, page, limit, totalPages } }',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Telemetri' },
                    },
                    meta: { $ref: '#/components/schemas/MetaHalaman' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/telemetry/ingest': {
      post: {
        tags: ['Telemetri'],
        summary: 'Ingest dari perangkat IoT — PUBLIK TANPA JWT',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sensorId', 'value'],
                properties: {
                  sensorId: { type: 'string' },
                  value: { type: 'number' },
                  raw: { type: 'object', additionalProperties: true },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: '{ telemetry, alert } — alert null bila dalam ambang',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    telemetry: { $ref: '#/components/schemas/Telemetri' },
                    alert: { type: 'object', nullable: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/crops': {
      get: {
        tags: ['Tanaman'],
        summary: 'Daftar komoditas (filter category/search) — PUBLIK',
        security: [],
        parameters: [
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string', enum: ['SAYUR', 'BUAH'] },
          },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Amplop { sukses, pesan, data: Crop[] }',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sukses: { type: 'boolean' },
                    pesan: { type: 'string' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Crop' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/crops/{slug}': {
      get: {
        tags: ['Tanaman'],
        summary: 'Detail komoditas + panduan semai/tumbuh/hidroponik — PUBLIK',
        security: [],
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { '200': { description: 'Amplop { sukses, pesan, data }' } },
      },
    },
    '/crops/{slug}/timeline': {
      get: {
        tags: ['Tanaman'],
        summary: 'Linimasa hari 0..panen per komoditas — PUBLIK',
        security: [],
        parameters: [
          {
            name: 'slug',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: { '200': { description: 'Amplop { sukses, pesan, data }' } },
      },
    },
    '/plantings': {
      get: {
        tags: ['Planting'],
        summary:
          'Daftar rencana budidaya (filter ?kebunId=). Field virtual: prediksi, kebunId, lahanNama, kebunNama, cropName, cropSlug',
        parameters: [
          { name: 'kebunId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Amplop { sukses, pesan, data: Planting[] }',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sukses: { type: 'boolean' },
                    pesan: { type: 'string' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Planting' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Planting'],
        summary:
          'Catat semai (cropId boleh slug/id; tanggalPanen DIABAIKAN service)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PlantingBaru' },
            },
          },
        },
        responses: {
          '201': { description: 'Amplop { sukses, pesan, data: Planting }' },
        },
      },
    },
    '/plantings/{id}': {
      patch: {
        tags: ['Planting'],
        summary:
          'Ubah rencana (status/fase berupa string; catatan string polos)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  tanggalTanam: { type: 'string', format: 'date' },
                  status: { type: 'string', example: 'PANEN' },
                  fase: { type: 'string', example: 'PANEN' },
                  catatan: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Amplop { sukses, pesan, data }' } },
      },
      delete: {
        tags: ['Planting'],
        summary: 'Hapus rencana (data: { success: true })',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Amplop { sukses, pesan, data: { success: true } }',
          },
        },
      },
    },
    '/irrigation/trigger': {
      post: {
        tags: ['Irigasi'],
        summary:
          'Buka solenoid manual. Cek `status`: GAGAL/BATAL_TANDON_KOSONG bukan error HTTP (tandon < 20% membatalkan)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/IrigasiTrigger' },
            },
          },
        },
        responses: {
          '201': {
            description: '{ status, message, topic, log }',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'BERHASIL' },
                    message: { type: 'string' },
                    topic: { type: 'string' },
                    log: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/irrigation/schedule': {
      post: {
        tags: ['Irigasi'],
        summary: 'Jadwalkan irigasi cron (in-memory; hilang saat restart)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/IrigasiJadwal' },
            },
          },
        },
        responses: {
          '201': {
            description: '{ jobName, cron, ... }',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    jobName: { type: 'string' },
                    cron: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/irrigation/logs': {
      get: {
        tags: ['Irigasi'],
        summary: 'Log irigasi (?kebunId&lahanId&page&limit)',
        parameters: [
          { name: 'kebunId', in: 'query', schema: { type: 'string' } },
          { name: 'lahanId', in: 'query', schema: { type: 'string' } },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 20 },
          },
        ],
        responses: {
          '200': {
            description: '{ data, meta }',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { type: 'object' } },
                    meta: { $ref: '#/components/schemas/MetaHalaman' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/irrigation/schedules': {
      get: {
        tags: ['Irigasi'],
        summary: 'Daftar job cron aktif (tanpa filter kebun — JWT saja)',
        responses: { '200': { description: 'Array { name, running }' } },
      },
    },
    '/releases': {
      post: {
        tags: ['Rilis APK'],
        summary: 'Unggah APK baru (SUPERADMIN, multipart field: apk)',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['apk', 'versionName', 'versionCode'],
                properties: {
                  apk: { type: 'string', format: 'binary' },
                  versionName: { type: 'string', example: '1.1.0' },
                  versionCode: { type: 'integer', example: 2 },
                  changelog: { type: 'string' },
                  isPublished: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Amplop { message, data: Rilis }' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '409': { description: 'Kode versi sudah dipakai' },
        },
      },
      get: {
        tags: ['Rilis APK'],
        summary: 'Daftar semua rilis termasuk draft (SUPERADMIN)',
        responses: {
          '200': { description: 'Amplop { message, data: Rilis[] }' },
        },
      },
    },
    '/releases/latest': {
      get: {
        tags: ['Rilis APK'],
        summary:
          'Rilis terbaru yang dipublikasikan — PUBLIK. Query ?currentCode= untuk flag adaPembaruan',
        security: [],
        parameters: [
          { name: 'currentCode', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          '200': {
            description: 'Amplop { message, data: Rilis+downloadPath }',
          },
          '404': { description: 'Belum ada APK yang dipublikasikan' },
        },
      },
    },
    '/releases/{id}/download': {
      get: {
        tags: ['Rilis APK'],
        summary: 'Unduh file APK — PUBLIK (attachment .apk)',
        security: [],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'File application/vnd.android.package-archive',
          },
          '404': { $ref: '#/components/responses/TidakDitemukan' },
        },
      },
    },
    '/ai/diagnose': {
      post: {
        tags: ['AI Doctor Tani'],
        summary:
          'Diagnosis foto daun (multipart; imageUrl kembali sebagai path relatif uploads/ai/…)',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: { type: 'string', format: 'binary' },
                  cropSlug: { type: 'string' },
                  lahanId: { type: 'string' },
                  plantingId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Amplop { sukses, pesan, data: Diagnosis }' },
        },
      },
    },
    '/ai/history': {
      get: {
        tags: ['AI Doctor Tani'],
        summary: 'Riwayat diagnosis (?lahanId&plantingId&limit)',
        parameters: [
          { name: 'lahanId', in: 'query', schema: { type: 'string' } },
          { name: 'plantingId', in: 'query', schema: { type: 'string' } },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20 },
          },
        ],
        responses: {
          '200': { description: 'Amplop { sukses, pesan, data: Diagnosis[] }' },
        },
      },
    },
    '/ai/{id}/feedback': {
      post: {
        tags: ['AI Doctor Tani'],
        summary: 'Umpan balik diagnosis (helpful + catatan opsional)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['helpful'],
                properties: {
                  helpful: { type: 'boolean' },
                  catatan: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Amplop { sukses, pesan, data }' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearer: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Header: Authorization: Bearer <accessToken>',
      },
    },
    parameters: {
      KebunId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string' },
        description:
          'ID kebun (nama param JANGAN diubah — guard bergantung padanya)',
      },
    },
    responses: {
      Unauthorized: {
        description: 'Tanpa/invalid JWT (frontend redirect ke /login)',
      },
      Forbidden: { description: 'Bukan anggota kebun / role tidak cukup' },
      TidakDitemukan: { description: 'ID tidak ada' },
    },
    schemas: {
      AuthHasil: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  nama: { type: 'string' },
                  role: { type: 'string' },
                },
              },
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
            },
          },
        },
      },
      KebunRole: {
        type: 'string',
        enum: ['OWNER', 'ADMIN', 'PETANI', 'VIEWER'],
      },
      KebunBaru: {
        type: 'object',
        required: ['nama', 'lokasi'],
        properties: {
          nama: { type: 'string', minLength: 2, maxLength: 100 },
          lokasi: { type: 'string', minLength: 2 },
          luas: { type: 'number', minimum: 0 },
          deskripsi: { type: 'string', maxLength: 1000 },
        },
      },
      Kebun: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nama: { type: 'string' },
          lokasi: { type: 'string', nullable: true },
          luas: { type: 'number', nullable: true },
          deskripsi: { type: 'string', nullable: true },
        },
      },
      AmplopKebun: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          data: { $ref: '#/components/schemas/Kebun' },
        },
      },
      Lahan: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nama: { type: 'string' },
          tipe: { type: 'string', enum: ['TANAH', 'HIDROPONIK'] },
          luas: { type: 'number' },
          lokasi: { type: 'string', nullable: true },
          kebunId: { type: 'string' },
        },
      },
      Device: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nama: { type: 'string' },
          type: {
            type: 'string',
            enum: ['TANDON', 'IRRIGATION', 'SOIL', 'HYDROPONIC', 'GATEWAY'],
          },
          status: { type: 'string', enum: ['ONLINE', 'OFFLINE', 'ERROR'] },
          kebunId: { type: 'string' },
          lahanId: { type: 'string', nullable: true },
          mqttTopic: { type: 'string', nullable: true },
          sensors: {
            type: 'array',
            items: { $ref: '#/components/schemas/Sensor' },
          },
        },
      },
      DeviceBaru: {
        type: 'object',
        required: ['nama', 'type', 'mqttTopic'],
        properties: {
          nama: { type: 'string' },
          type: {
            type: 'string',
            enum: ['TANDON', 'IRRIGATION', 'SOIL', 'HYDROPONIC', 'GATEWAY'],
          },
          lokasi: { type: 'string' },
          status: { type: 'string', enum: ['ONLINE', 'OFFLINE', 'ERROR'] },
          mqttTopic: { type: 'string' },
          lahanId: { type: 'string' },
        },
      },
      DeviceUbah: {
        type: 'object',
        properties: {
          nama: { type: 'string' },
          status: { type: 'string' },
          lahanId: { type: 'string', nullable: true },
          mqttTopic: { type: 'string', nullable: true },
        },
      },
      Sensor: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: {
            type: 'string',
            enum: [
              'WATER_LEVEL',
              'SOLENOID',
              'PH',
              'NPK_N',
              'NPK_P',
              'NPK_K',
              'EC',
              'TDS_PPM',
              'TEMP',
              'HUMIDITY',
              'SOIL_MOISTURE',
            ],
          },
          unit: { type: 'string', nullable: true },
          minThreshold: { type: 'number', nullable: true },
          maxThreshold: { type: 'number', nullable: true },
          isEnabled: { type: 'boolean' },
          deviceId: { type: 'string' },
        },
      },
      SensorBaru: {
        type: 'object',
        required: ['type', 'unit'],
        properties: {
          type: {
            type: 'string',
            enum: [
              'WATER_LEVEL',
              'SOLENOID',
              'PH',
              'NPK_N',
              'NPK_P',
              'NPK_K',
              'EC',
              'TDS_PPM',
              'TEMP',
              'HUMIDITY',
              'SOIL_MOISTURE',
            ],
          },
          unit: { type: 'string' },
          minThreshold: { type: 'number' },
          maxThreshold: { type: 'number' },
          isEnabled: { type: 'boolean' },
          config: { type: 'object', additionalProperties: true },
        },
      },
      SensorConfig: {
        type: 'object',
        properties: {
          minThreshold: { type: 'number', nullable: true },
          maxThreshold: { type: 'number', nullable: true },
          isEnabled: { type: 'boolean' },
          config: {
            type: 'object',
            nullable: true,
            additionalProperties: true,
          },
        },
      },
      Telemetri: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          sensorId: { type: 'string' },
          value: { type: 'number' },
          recordedAt: { type: 'string', format: 'date-time' },
        },
      },
      MetaHalaman: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          page: { type: 'integer' },
          limit: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
      Crop: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          slug: { type: 'string' },
          category: { type: 'string', enum: ['SAYUR', 'BUAH'] },
          scientificName: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
        },
      },
      Planting: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          lahanId: { type: 'string' },
          cropSlug: { type: 'string' },
          cropName: { type: 'string' },
          metode: { type: 'string', enum: ['TANAH', 'HIDROPONIK'] },
          tanggalSemai: { type: 'string', format: 'date' },
          tanggalTanam: { type: 'string', format: 'date', nullable: true },
          status: {
            type: 'string',
            enum: ['AKTIF', 'PANEN', 'GAGAL', 'SELESAI'],
          },
          fase: {
            type: 'string',
            enum: [
              'SEMAI',
              'PINDAH_TANAM',
              'VEGETATIF',
              'GENERATIF',
              'PANEN',
              'SELESAI',
            ],
          },
          prediksi: {
            type: 'object',
            description: 'Field virtual (dihitung service)',
          },
        },
      },
      PlantingBaru: {
        type: 'object',
        required: ['lahanId', 'cropId', 'metode', 'tanggalSemai'],
        properties: {
          lahanId: { type: 'string' },
          cropId: { type: 'string', description: 'Boleh slug atau id' },
          metode: { type: 'string', enum: ['TANAH', 'HIDROPONIK'] },
          tanggalSemai: { type: 'string', format: 'date' },
          tanggalTanam: { type: 'string', format: 'date' },
          jumlah: { type: 'integer' },
          catatan: { type: 'string' },
        },
      },
      IrigasiTrigger: {
        type: 'object',
        required: ['kebunId', 'lahanId', 'durationSec'],
        properties: {
          kebunId: { type: 'string' },
          deviceId: { type: 'string' },
          lahanId: { type: 'string' },
          durationSec: { type: 'integer', minimum: 1, maximum: 86400 },
          source: { type: 'string', enum: ['MANUAL', 'SCHEDULE', 'AUTO'] },
        },
      },
      IrigasiJadwal: {
        type: 'object',
        required: ['kebunId', 'lahanId', 'cron', 'durationSec'],
        properties: {
          kebunId: { type: 'string' },
          lahanId: { type: 'string' },
          cron: { type: 'string', example: '0 6 * * *' },
          durationSec: { type: 'integer', minimum: 1, maximum: 86400 },
          deviceId: { type: 'string' },
        },
      },
    },
  },
} as const;
