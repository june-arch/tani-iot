import { FieldError as HeroFieldError } from 'heroui-native';

export function FieldError({ pesan }: { pesan?: string | null }) {
  if (!pesan) return null;
  return <HeroFieldError isInvalid>{pesan}</HeroFieldError>;
}
