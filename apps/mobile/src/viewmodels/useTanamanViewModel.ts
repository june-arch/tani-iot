import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm, useStore } from '@tanstack/react-form';
import { normalizeError } from '../api/client';
import { tanamanService } from '../services/tanamanService';
import { cariTanamanSchema, type CariTanamanForm, type Crop } from '../models/tanaman';
import { useDebouncedValue } from './useDebouncedValue';

export function useTanamanViewModel() {
  const [terpilih, setTerpilih] = useState<Crop | null>(null);

  const form = useForm({
    defaultValues: { cari: '' } as CariTanamanForm,
    validators: { onChange: cariTanamanSchema },
  });
  const cari = useStore(form.store, (s) => s.values.cari);
  const cariDebounced = useDebouncedValue(cari, 300);

  const query = useQuery({
    queryKey: ['tanaman', 'daftar'],
    queryFn: () => tanamanService.daftarCrop(),
  });

  const crops = useMemo(() => {
    const semua = query.data ?? [];
    const q = cariDebounced.trim().toLowerCase();
    if (!q) return semua;
    return semua.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.scientificName ?? '').toLowerCase().includes(q),
    );
  }, [query.data, cariDebounced]);

  return {
    form,
    crops,
    terpilih,
    setTerpilih,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    isError: query.isError,
    pesanError: query.isError ? normalizeError(query.error) : null,
    refetch: query.refetch,
  };
}
