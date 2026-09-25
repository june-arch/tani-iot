import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useStore } from '@tanstack/react-form';
import { normalizeError } from '../api/client';
import { kebunService, type KebunBaru } from '../services/kebunService';
import { cariKebunSchema, type CariKebunForm } from '../models/kebun';
import { useDebouncedValue } from './useDebouncedValue';

export function useKebunViewModel() {
  const qc = useQueryClient();
  const form = useForm({
    defaultValues: { cari: '' } as CariKebunForm,
    validators: { onChange: cariKebunSchema },
  });
  const cari = useStore(form.store, (s) => s.values.cari);
  const cariDebounced = useDebouncedValue(cari, 300);

  const tambah = useMutation({
    mutationFn: (input: KebunBaru) => kebunService.tambahKebun(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['kebun', 'daftar'] });
    },
  });

  const query = useQuery({
    queryKey: ['kebun', 'daftar'],
    queryFn: () => kebunService.daftarKebunSaya(),
  });

  const kebuns = useMemo(() => {
    const semua = query.data ?? [];
    const q = cariDebounced.trim().toLowerCase();
    if (!q) return semua;
    return semua.filter(
      (k) =>
        k.nama.toLowerCase().includes(q) ||
        k.lokasi.toLowerCase().includes(q) ||
        (k.deskripsi ?? '').toLowerCase().includes(q),
    );
  }, [query.data, cariDebounced]);

  return {
    form,
    kebuns,
    total: (query.data ?? []).length,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    isError: query.isError,
    pesanError: query.isError ? normalizeError(query.error) : null,
    refetch: query.refetch,
    tambah,
    pesanTambah: tambah.isError ? normalizeError(tambah.error) : null,
  };
}
