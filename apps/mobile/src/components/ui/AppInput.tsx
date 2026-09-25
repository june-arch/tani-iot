import type { ReactNode } from 'react';
import type { StyleProp, TextInputProps, ViewStyle } from 'react-native';
import { FieldError as HeroFieldError, Input, Label, TextField } from 'heroui-native';

type AppInputProps = TextInputProps & {
  label?: string;
  error?: string | null;
  wadahStyle?: StyleProp<ViewStyle>;
};

export function AppInput({ label, error, wadahStyle, ...rest }: AppInputProps) {
  return (
    <TextField isInvalid={Boolean(error)} style={wadahStyle}>
      {label ? (
        <Label>
          <Label.Text>{label}</Label.Text>
        </Label>
      ) : null}
      <Input {...rest} />
      {error ? <HeroFieldError isInvalid>{error}</HeroFieldError> : null}
    </TextField>
  );
}

export function AppField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <TextField>
      <Label>
        <Label.Text>{label}</Label.Text>
      </Label>
      {children}
    </TextField>
  );
}
