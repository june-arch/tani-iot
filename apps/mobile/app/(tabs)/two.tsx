import { Redirect } from 'expo-router';

/** Rute warisan — arahkan ke Beranda. Disembunyikan dari tab (href: null). */
export default function TabTwoRedirect() {
  return <Redirect href="/(tabs)/" />;
}
