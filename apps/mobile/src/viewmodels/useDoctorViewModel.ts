import { useState } from 'react';
import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import * as ImagePicker from 'expo-image-picker';
import { normalizeError } from '../api/client';
import { doctorService } from '../services/doctorService';
import { catatanDiagnosisSchema, type CatatanDiagnosisForm } from '../models/diagnosis';

export function useDoctorViewModel() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { catatan: '' } as CatatanDiagnosisForm,
    validators: { onChange: catatanDiagnosisSchema },
  });

  const diagnosis = useMutation({
    mutationFn: (uri: string) => doctorService.diagnosis(uri),
  });

  const pilihFoto = (uri: string) => {
    setImageUri(uri);
    diagnosis.reset();
  };

  const dariGaleri = async () => {
    const izin = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!izin.granted) {
      Alert.alert('Izin Ditolak', 'Butuh izin galeri untuk memilih foto daun.');
      return;
    }
    const hasil = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!hasil.canceled && hasil.assets[0]) pilihFoto(hasil.assets[0].uri);
  };

  const dariKamera = async () => {
    const izin = await ImagePicker.requestCameraPermissionsAsync();
    if (!izin.granted) {
      Alert.alert('Izin Ditolak', 'Butuh izin kamera untuk memotret daun.');
      return;
    }
    const hasil = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!hasil.canceled && hasil.assets[0]) pilihFoto(hasil.assets[0].uri);
  };

  const hapusFoto = () => {
    setImageUri(null);
    diagnosis.reset();
  };

  const diagnosa = () => {
    if (!imageUri || diagnosis.isPending) return;
    diagnosis.mutate(imageUri);
  };

  return {
    form,
    imageUri,
    dariGaleri,
    dariKamera,
    hapusFoto,
    diagnosa,
    isLoading: diagnosis.isPending,
    hasil: diagnosis.data ?? null,
    pesanError: diagnosis.isError ? normalizeError(diagnosis.error) : null,
  };
}
