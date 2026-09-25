import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ColorValue } from 'react-native';
import type { ComponentProps } from 'react';
import { MIST, PARCHMENT, STONE, WINE } from '@/src/theme';

// Superhuman palette — token tunggal di src/theme.ts
const ACTIVE = WINE;
const INACTIVE = STONE;

type NamaSimbol = ComponentProps<typeof SymbolView>['name'];

function TabIcon({ ios, android, color }: { ios: string; android: string; color: ColorValue }) {
  // Nama ikon berasal dari literal internal (SF Symbols + Material) — ditegaskan
  // ke tipe `name` SymbolView agar aman di iOS/Android/Web tanpa `any`.
  const name = { ios, android, web: android } as NamaSimbol;
  return <SymbolView name={name} tintColor={color} size={26} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        headerShown: false,
        tabBarStyle: { height: 60, paddingBottom: 6, paddingTop: 4, backgroundColor: PARCHMENT, borderTopColor: MIST, borderTopWidth: 1 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color }) => <TabIcon ios="house.fill" android="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="kebun"
        options={{
          title: 'Kebun',
          tabBarIcon: ({ color }) => <TabIcon ios="map.fill" android="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="sensor"
        options={{
          title: 'Sensor',
          tabBarIcon: ({ color }) => <TabIcon ios="chart.bar.fill" android="analytics" color={color} />,
        }}
      />
      <Tabs.Screen
        name="irigasi"
        options={{
          title: 'Irigasi',
          tabBarIcon: ({ color }) => <TabIcon ios="drop.fill" android="water_drop" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tanaman"
        options={{
          title: 'Tanaman',
          tabBarIcon: ({ color }) => <TabIcon ios="leaf.fill" android="eco" color={color} />,
        }}
      />
      <Tabs.Screen
        name="doctor"
        options={{
          title: 'Doctor',
          tabBarIcon: ({ color }) => <TabIcon ios="stethoscope" android="medical_services" color={color} />,
        }}
      />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
