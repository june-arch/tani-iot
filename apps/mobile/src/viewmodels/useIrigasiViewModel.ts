import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { normalizeError } from '../api/client';
import { kebunService } from '../services/kebunService';
import { irigasiService } from '../services/irigasiService';
import { pemicuIrigasiSchema, type PemicuIrigasiForm } from '../models/irigasi';

export function useIrigasiViewModel() {
  const qc = useQueryClient();
  const [modeOtomatis, setModeOtomatis] = useState(false);

  const form = useForm({
    defaultValues: { durasiDetik: '30' } as PemicuIrigasiForm,
    validators: { onChange: pemicuIrigasiSchema },
  });

  const kebunQuery = useQuery({
    queryKey: ['irigasi', 'kebun'],
    queryFn: () => kebunService.daftarKebunSaya(),
  });
  const kebunAktif = kebunQuery.data?.[0];

  const lahanQuery = useQuery({
    queryKey: ['irigasi', 'lahan', kebunAktif?.id ?? ''],
    enabled: Boolean(kebunAktif?.id),
    queryFn: () => kebunService.daftarLahan(kebunAktif?.id ?? ''),
  });
  const lahanAktif = lahanQuery.data?.[0];

  const logQuery = useQuery({
    queryKey: ['irigasi', 'log', kebunAktif?.id ?? ''],
    enabled: Boolean(kebunAktif?.id),
    queryFn: () => irigasiService.daftarLog(kebunAktif?.id ?? ''),
  });

  const picu = useMutation({
    mutationFn: async (durasiDetik: number) => {
      if (!kebunAktif?.id || !lahanAktif?.id) {
        throw new Error('Belum ada kebun atau lahan. Buat dulu di tab Kebun.');
      }
      return irigasiService.picu({
        kebunId: kebunAktif.id,
        lahanId: lahanAktif.id,
        durationSec: durasiDetik,
        source: 'MANUAL',
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['irigasi', 'log'] });
    },
  });

  const siram = () => {
    const hasil = pemicuIrigasiSchema.safeParse(form.state.values);
    if (!hasil.success) {
      void form.handleSubmit();
      return;
    }
    picu.mutate(Number(hasil.data.durasiDetik));
  };

  return {
    form,
    modeOtomatis,
    setModeOtomatis,
    kebunAktif,
    lahanAktif,
    logs: logQuery.data ?? [],
    logsLoading: logQuery.isLoading,
    adaKebun: (kebunQuery.data ?? []).length > 0,
    siram,
    isMenyiram: picu.isPending,
    siramSukses: picu.isSuccess,
    pesanSiramError: picu.isError ? normalizeError(picu.error) : null,
    resetSiram: picu.reset,
    isRefetching: logQuery.isRefetching,
    refetch: logQuery.refetch,
  };
}
