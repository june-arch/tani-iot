import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ColorValue } from 'react-native';

const ACTIVE = '#2E7D32';
const INACTIVE = '#9CA3AF';

function TabIcon({ ios, android, color }: { ios: string; android: string; color: ColorValue }) {
  return (
    <SymbolView
      name={{ ios: ios as any, android: android as any, web: android as any }}
      tintColor={color}
      size={26}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        headerShown: false,
        tabBarStyle: { height: 60, paddingBottom: 6, paddingTop: 4 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="tanaman"
        options={{
          title: 'Tanaman',
          tabBarIcon: ({ color }) => <TabIcon ios="leaf.fill" android="eco" color={color} />,
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
        name="doctor"
        options={{
          title: 'Doctor',
          tabBarIcon: ({ color }) => <TabIcon ios="stethoscope" android="medical_services" color={color} />,
        }}
      />
      {/* hide legacy tabs from tab bar if still present */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
