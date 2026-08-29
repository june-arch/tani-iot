import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#2E7D32';

type GaugeProps = { label: string; value: number; unit: string; max: number; color: string };
function Gauge({ label, value, unit, max, color }: GaugeProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <View style={styles.gaugeCard}>
      <Text style={styles.gaugeLabel}>{label}</Text>
      <View style={styles.gaugeBarBg}>
        <View style={[styles.gaugeBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.gaugeValue}>
        {value} <Text style={styles.gaugeUnit}>{unit}</Text>
      </Text>
      <Text style={styles.gaugeMax}>/ {max} {unit}</Text>
    </View>
  );
}

type SensorCardProps = { icon: string; label: string; value: string; status: string; color: string };
function SensorCard({ icon, label, value, status, color }: SensorCardProps) {
  return (
    <View style={[styles.sensorCard, { borderLeftColor: color }]}>
      <Text style={styles.sensorIcon}>{icon}</Text>
      <Text style={styles.sensorLabel}>{label}</Text>
      <Text style={styles.sensorValue}>{value}</Text>
      <View style={[styles.statusBadge, { backgroundColor: color + '18', borderColor: color }]}>
        <Text style={[styles.statusText, { color }]}>{status}</Text>
      </View>
    </View>
  );
}

export default function SensorScreen() {
  // Mock data — tandon + environment
  const tandonLevel = 72;
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Sensor & Monitoring</Text>
        <Text style={styles.subtitle}>Data real-time dari perangkat IoT</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Tandon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💧 Tandon Air</Text>
          <Gauge label="Level Air" value={tandonLevel} unit="%" max={100} color={PRIMARY} />
          <View style={styles.tandonInfo}>
            <Text style={styles.tandonText}>Kapasitas: 1000 L • Estimasi sisa: {Math.round((tandonLevel / 100) * 1000)} L</Text>
            <Text style={[styles.tandonStatus, { color: tandonLevel < 20 ? '#DC2626' : PRIMARY }]}>
              {tandonLevel < 20 ? '⚠️ Air hampir habis' : '✅ Normal'}
            </Text>
          </View>
        </View>

        {/* Grid sensor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Sensor Lingkungan</Text>
          <View style={styles.grid}>
            <SensorCard icon="🧪" label="pH Air" value="6.2" status="Optimal" color="#2E7D32" />
            <SensorCard icon="🧂" label="PPM / TDS" value="850 ppm" status="Normal" color="#0EA5E9" />
            <SensorCard icon="🌡️" label="Suhu" value="28 °C" status="Hangat" color="#F59E0B" />
            <SensorCard icon="💦" label="Kelembaban" value="68 %" status="Optimal" color="#8B5CF6" />
            <SensorCard icon="🌱" label="Soil Moisture" value="42 %" status="Cukup" color="#10B981" />
            <SensorCard icon="⚡" label="EC" value="1.7 mS" status="Normal" color="#06B6D4" />
          </View>
          <Text style={styles.mockNote}>Data mock — hubungkan perangkat untuk data real-time via MQTT</Text>
        </View>

        {/* Detail pH & PPM */}
        <View style={styles.detailRow}>
          <View style={[styles.detailCard, { borderTopColor: '#2E7D32' }]}>
            <Text style={styles.detailLabel}>pH Optimal</Text>
            <Text style={styles.detailValue}>5.5 – 6.5</Text>
            <Text style={styles.detailSub}>Saat ini 6.2 (baik untuk sayur)</Text>
          </View>
          <View style={[styles.detailCard, { borderTopColor: '#0EA5E9' }]}>
            <Text style={styles.detailLabel}>PPM Optimal</Text>
            <Text style={styles.detailValue}>800 – 1200</Text>
            <Text style={styles.detailSub}>Saat ini 850 ppm (vegetatif)</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFCF8' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  section: { backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', gap: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
  gaugeCard: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', gap: 8 },
  gaugeLabel: { fontSize: 12, fontWeight: '700', color: '#374151' },
  gaugeBarBg: { height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden' },
  gaugeBarFill: { height: 12, borderRadius: 6 },
  gaugeValue: { fontSize: 22, fontWeight: '800', color: '#111827' },
  gaugeUnit: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  gaugeMax: { fontSize: 11, color: '#9CA3AF' },
  tandonInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tandonText: { fontSize: 12, color: '#6B7280' },
  tandonStatus: { fontSize: 12, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sensorCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    gap: 4,
  },
  sensorIcon: { fontSize: 20 },
  sensorLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600', marginTop: 2 },
  sensorValue: { fontSize: 16, fontWeight: '800', color: '#111827' },
  statusBadge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
  mockNote: { fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', marginTop: 4 },
  detailRow: { flexDirection: 'row', gap: 12 },
  detailCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderTopWidth: 3,
    gap: 4,
  },
  detailLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
  detailValue: { fontSize: 14, fontWeight: '800', color: '#111827' },
  detailSub: { fontSize: 11, color: '#6B7280' },
});
