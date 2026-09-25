import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { AppButton, AppInput, pesanField } from './ui';
import { kebunSchema } from '../models/kebun';
import type { KebunBaru } from '../services/kebunService';
import { INK, PARCHMENT, STONE } from '../theme';

type Props = {
  terlihat: boolean;
  onTutup: () => void;
  onSimpan: (input: KebunBaru) => Promise<unknown>;
  menyimpan: boolean;
  pesanGalat: string | null;
};

/** Formulir tambah kebun — useForm TanStack + zod, pesan Indonesia. */
export function KebunFormModal({ terlihat, onTutup, onSimpan, menyimpan, pesanGalat }: Props) {

  const [galatForm, setGalatForm] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { nama: '', lokasi: '', luas: '', deskripsi: '' },
    onSubmit: async ({ value }) => {
      setGalatForm(null);
      const parsed = kebunSchema.safeParse(value);
      if (!parsed.success) {
        setGalatForm(parsed.error.issues[0]?.message ?? 'Data kebun tidak valid.');
        return;
      }
      const v = parsed.data;
      const luas = (v.luas ?? '').trim() === '' ? undefined : Number(v.luas);
      await onSimpan({
        nama: v.nama.trim(),
        lokasi: v.lokasi.trim(),
        ...(luas !== undefined && !Number.isNaN(luas) ? { luas } : {}),
        ...((v.deskripsi ?? '').trim() ? { deskripsi: (v.deskripsi ?? '').trim() } : {}),
      });
      form.reset();
      onTutup();
    },
  });

  return (
    <Modal visible={terlihat} animationType="slide" transparent onRequestClose={onTutup}>
      <View style={st.latar}>
        <View style={st.kartu} accessible accessibilityLabel="Tambah kebun">
          <Text style={st.judul}>Tambah Kebun</Text>
          <Text style={st.sub}>Anda otomatis menjadi OWNER kebun ini.</Text>
          <form.Field name="nama">
            {(field) => (
              <AppInput label="Nama kebun *" placeholder="Kebun Sawah Teras" value={field.state.value}
                onChangeText={field.handleChange} onBlur={field.handleBlur} error={pesanField(field)} />
            )}
          </form.Field>
          <form.Field name="lokasi">
            {(field) => (
              <AppInput label="Lokasi *" placeholder="Sawah Teras, Bandung" value={field.state.value}
                onChangeText={field.handleChange} onBlur={field.handleBlur} error={pesanField(field)} />
            )}
          </form.Field>
          <form.Field name="luas">
            {(field) => (
              <AppInput label="Luas (m²)" placeholder="1000" keyboardType="numeric" value={field.state.value}
                onChangeText={field.handleChange} onBlur={field.handleBlur} error={pesanField(field)} />
            )}
          </form.Field>
          <form.Field name="deskripsi">
            {(field) => (
              <AppInput label="Deskripsi" placeholder="Deskripsi singkat" multiline numberOfLines={3}
                value={field.state.value} onChangeText={field.handleChange} onBlur={field.handleBlur}
                error={pesanField(field)} />
            )}
          </form.Field>
          {galatForm ?? pesanGalat ? <Text style={st.galat}>{galatForm ?? pesanGalat}</Text> : null}
          <View style={st.aksi}>
            <View style={st.tombol}>
              <AppButton judul="Batal" variant="garis" onPress={onTutup} />
            </View>
            <View style={st.tombol}>
              <AppButton judul="Simpan" loading={menyimpan} onPress={() => void form.handleSubmit()} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  latar: { flex: 1, backgroundColor: 'rgba(41,40,39,0.4)', justifyContent: 'flex-end' },
  kartu: { backgroundColor: PARCHMENT, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 10 },
  judul: { fontSize: 18, fontWeight: '800', color: INK },
  sub: { fontSize: 12, color: STONE, marginBottom: 4 },
  galat: { fontSize: 12, color: '#991B1B' },
  aksi: { flexDirection: 'row', gap: 10, marginTop: 4 },
  tombol: { flex: 1 },
});
