import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Card } from 'heroui-native';

type AppCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function AppCard({ children, style }: AppCardProps) {
  return <Card style={style}>{children}</Card>;
}

export function AppCardHeader({ children }: { children: ReactNode }) {
  return <Card.Header>{children}</Card.Header>;
}

export function AppCardBody({ children }: { children: ReactNode }) {
  return <Card.Body>{children}</Card.Body>;
}

export function AppCardFooter({ children }: { children: ReactNode }) {
  return <Card.Footer>{children}</Card.Footer>;
}

export function AppCardTitle({ children }: { children: ReactNode }) {
  return <Card.Title>{children}</Card.Title>;
}

export function AppCardDesc({ children }: { children: ReactNode }) {
  return <Card.Description>{children}</Card.Description>;
}
