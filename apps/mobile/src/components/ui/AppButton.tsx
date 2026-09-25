import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Button, type ButtonSize, type ButtonVariant } from 'heroui-native';

type AppVariant = 'utama' | 'kedua' | 'garis' | 'bahaya';

const PETAVariant: Record<AppVariant, ButtonVariant> = {
  utama: 'primary',
  kedua: 'secondary',
  garis: 'outline',
  bahaya: 'danger',
};

type AppButtonProps = {
  judul: string;
  onPress?: () => void;
  variant?: AppVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  judul,
  onPress,
  variant = 'utama',
  size = 'md',
  disabled,
  loading,
  style,
}: AppButtonProps) {
  return (
    <Button
      variant={PETAVariant[variant]}
      size={size}
      onPress={onPress}
      isDisabled={Boolean(disabled ?? loading)}
      style={style}>
      <Button.Label>{loading ? 'Memuat...' : judul}</Button.Label>
    </Button>
  );
}

export function AppButtonRow({ children }: { children: ReactNode }) {
  return children;
}
