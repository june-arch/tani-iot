import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm, useStore } from '@tanstack/react-form';
import { normalizeError } from '../api/client';
import { kebunService } from '../services/kebunService';
import { sensorService } from '../services/sensorService';
import {
  filterSensorSchema,
  kategoriDariTipe,
  type FilterSensorForm,
} from '../models/sensor';
import { useDebouncedValue } from './useDebouncedValue';

export function useSensorViewModel() {
  const form = useForm({
    defaultValues: { kategori: 'Semua', cari: '' } as FilterSensorForm,
    validators: { onChange: filterSensorSchema },
  });
  const kategori = useStore(form.store, (s) => s.values.kategori);
  const cari = useStore(form.store, (s) => s.values.cari);
  const cariDebounced = useDebouncedValue(cari, 300);

  const query = useQuery({
    queryKey: ['sensor', 'agregat'],
    queryFn: async () => {
      const kebuns = await kebunService.daftarKebunSaya();
      return sensorService.agregatSemua(kebuns);
    },
  });

  const sensors = useMemo(() => {
    const semua = query.data?.sensors ?? [];
    const q = cariDebounced.trim().toLowerCase();
    return semua.filter((s) => {
      if (kategori !== 'Semua' && kategoriDariTipe(s) !== kategori) return false;
      if (!q) return true;
      const label = (s.type ?? s.tipe ?? '').toString().toLowerCase();
      return (
        label.includes(q) ||
        (s.deviceNama ?? '').toLowerCase().includes(q) ||
        (s.kebunNama ?? '').toLowerCase().includes(q)
      );
    });
  }, [query.data, kategori, cariDebounced]);

  return {
    form,
    kategori,
    sensors,
    total: query.data?.sensors.length ?? 0,
    tandonPersen: query.data?.tandonPersen ?? null,
    tandonNama: query.data?.tandon?.deviceNama ?? null,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    isError: query.isError,
    pesanError: query.isError ? normalizeError(query.error) : null,
    refetch: query.refetch,
  };
}
