import { Chip, type ChipColor } from 'heroui-native';

export type NadaChip = 'aman' | 'rendah' | 'netral' | 'info' | 'bahaya';

const PETA_WARNA: Record<NadaChip, ChipColor> = {
  aman: 'success',
  rendah: 'warning',
  netral: 'default',
  info: 'accent',
  bahaya: 'danger',
};

export function nadaTandon(persen: number | null): NadaChip {
  if (persen === null) return 'netral';
  return persen >= 20 ? 'aman' : 'rendah';
}

export function AppChip({ label, nada = 'netral' }: { label: string; nada?: NadaChip }) {
  return (
    <Chip color={PETA_WARNA[nada]} variant="soft" size="sm">
      <Chip.Label>{label}</Chip.Label>
    </Chip>
  );
}
