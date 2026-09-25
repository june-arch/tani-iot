import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Crop, type Kebun } from "@/lib/api";
import { ENDPOINTS, errorMessage, kebunName } from "@/lib/endpoints";
import {
  addDays, formatIndo, mapBackend, parsePanenRange,
  type LahanOpt, type MetodeTanam, type Rencana,
} from "@/lib/kalender";

export type SaveRencanaInput = {
  lahanId: string; cropSlug: string; metode: MetodeTanam;
  tanggalSemai: string; tanggalTanam?: string; jumlah?: number; catatan?: string;
};

type SaveVars = { input: SaveRencanaInput; editId: string | null; orig: Rencana | undefined };
type SaveResult = { kind: "created" | "recreated" | "updated"; cropName: string; tanam: string };
type TanamVars = { id: string; today: string; avg: number };

function isRec(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export function useKalender(notify: (m: string) => void) {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const plantingsQuery = useQuery({
    queryKey: ["plantings"],
    queryFn: async (): Promise<Rencana[]> => {
      const data = await api.get<unknown[]>(ENDPOINTS.plantings);
      return data.map(mapBackend).filter((r): r is Rencana => r !== null);
    },
  });
  const { refetch: refetchPlantings } = plantingsQuery;

  const cropsQuery = useQuery({
    queryKey: ["crops"],
    queryFn: async (): Promise<Crop[]> => {
      try {
        return await api.get<Crop[]>(ENDPOINTS.crops);
      } catch {
        return [];
      }
    },
  });

  const kebunsQuery = useQuery({
    queryKey: ["kebuns-my"],
    queryFn: async (): Promise<Kebun[]> => {
      try {
        return await api.get<Kebun[]>(ENDPOINTS.kebunsMy);
      } catch {
        return [];
      }
    },
  });
  const kebuns = kebunsQuery.data ?? null;
  const kebunOpts = useMemo(
    () => (kebuns ?? []).map((k) => ({ id: String(k.id), nama: kebunName(k) })),
    [kebuns],
  );

  const lahansQuery = useQuery({
    queryKey: ["lahans", kebunOpts],
    enabled: kebunOpts.length > 0,
    queryFn: async (): Promise<LahanOpt[]> => {
      const perKebun = await Promise.all(kebunOpts.map(async (k): Promise<LahanOpt[]> => {
        const name = kebunName(k);
        try {
          const ls = await api.get<unknown[]>(ENDPOINTS.lahans(String(k.id)));
          const out: LahanOpt[] = [];
          for (const l of ls) {
            if (!isRec(l) || l.id === undefined) continue;
            out.push({ id: String(l.id), nama: String(l.nama ?? l.name ?? "Lahan"), kebunNama: name });
          }
          return out;
        } catch {
          return [];
        }
      }));
      return perKebun.flat();
    },
  });

  const rencana = useMemo(() => plantingsQuery.data ?? [], [plantingsQuery.data]);
  const loading = plantingsQuery.isLoading;

  const fetchRencana = useCallback(async (): Promise<void> => {
    const r = await refetchPlantings();
    if (r.error) notify(errorMessage(r.error, "Gagal memuat kalender"));
  }, [refetchPlantings, notify]);

  const { mutateAsync: saveAsync } = useMutation({
    mutationFn: async ({ input, editId, orig }: SaveVars): Promise<SaveResult> => {
      const payload: Record<string, unknown> = {
        lahanId: input.lahanId, cropId: input.cropSlug, metode: input.metode, tanggalSemai: input.tanggalSemai,
      };
      if (input.tanggalTanam) payload.tanggalTanam = input.tanggalTanam;
      if (input.jumlah !== undefined) payload.jumlah = input.jumlah;
      if (input.catatan) payload.catatan = input.catatan;
      if (editId) {
        const needRecreate = orig && (orig.cropSlug !== input.cropSlug || orig.lahanId !== input.lahanId || orig.tanggalSemai !== input.tanggalSemai);
        if (needRecreate) {
          await api.del(ENDPOINTS.planting(editId));
          const m = mapBackend(await api.post<unknown>(ENDPOINTS.plantings, payload));
          return { kind: "recreated", cropName: m?.cropName ?? "", tanam: m?.prediksi.tanam ?? "" };
        }
        await api.patch(ENDPOINTS.planting(editId), { tanggalTanam: input.tanggalTanam || undefined, catatan: input.catatan || undefined });
        return { kind: "updated", cropName: "", tanam: "" };
      }
      const m = mapBackend(await api.post<unknown>(ENDPOINTS.plantings, payload));
      return { kind: "created", cropName: m?.cropName ?? "", tanam: m?.prediksi.tanam ?? "" };
    },
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: ["plantings"] });
      if (res.kind === "recreated") notify(`Rencana diperbarui — tanam prediksi ${formatIndo(res.tanam)}`);
      else if (res.kind === "updated") notify("Rencana diperbarui");
      else notify(`Semai ${res.cropName} dicatat — tanam prediksi ${formatIndo(res.tanam)}`);
    },
    onError: (e) => { notify(errorMessage(e, "Gagal menyimpan")); },
  });

  const saveRencana = useCallback(async (input: SaveRencanaInput, editId: string | null): Promise<boolean> => {
    try {
      const orig = editId ? rencana.find((r) => r.id === editId) : undefined;
      await saveAsync({ input, editId, orig });
      return true;
    } catch {
      return false;
    }
  }, [rencana, saveAsync]);

  const { mutateAsync: removeAsync } = useMutation({
    mutationFn: (id: string) => api.del(ENDPOINTS.planting(id)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plantings"] });
      notify("Rencana dihapus");
    },
    onError: (e) => { notify(errorMessage(e, "Gagal hapus")); },
  });

  const removeRencana = useCallback(async (id: string): Promise<void> => {
    try {
      await removeAsync(id);
    } catch { /* sudah di-notify via onError */ }
  }, [removeAsync]);

  const { mutateAsync: tanamAsync } = useMutation({
    mutationFn: ({ id, today }: TanamVars) =>
      api.patch(ENDPOINTS.planting(id), { tanggalTanam: today, fase: "PINDAH_TANAM", status: "AKTIF" }),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({ queryKey: ["plantings"] });
      notify(`Tanam tercatat hari ini — panen prediksi ${formatIndo(addDays(vars.today, vars.avg))}`);
    },
    onError: (e) => { notify(errorMessage(e, "Gagal tandai tanam")); },
  });

  const markTanam = useCallback(async (id: string): Promise<void> => {
    const r = rencana.find((x) => x.id === id);
    if (!r) return;
    const today = new Date().toISOString().slice(0, 10);
    const avg = parsePanenRange(r.prediksi.panenRangeLabel).avg;
    try {
      await tanamAsync({ id, today, avg });
    } catch { /* sudah di-notify via onError */ }
  }, [rencana, tanamAsync]);

  const { mutateAsync: panenAsync } = useMutation({
    mutationFn: (id: string) => api.patch(ENDPOINTS.planting(id), { status: "PANEN", fase: "PANEN" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plantings"] });
      notify("Panen tercatat — selamat!");
    },
    onError: (e) => { notify(errorMessage(e, "Gagal tandai panen")); },
  });

  const markPanen = useCallback(async (id: string): Promise<void> => {
    try {
      await panenAsync(id);
    } catch { /* sudah di-notify via onError */ }
  }, [panenAsync]);

  return {
    crops: cropsQuery.data ?? null, kebuns, lahans: lahansQuery.data ?? [], rencana, loading,
    month, setMonth, selectedDay, setSelectedDay,
    fetchRencana, saveRencana, removeRencana, markTanam, markPanen,
  };
}
