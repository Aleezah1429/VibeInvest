import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { colors, radius, typography } from '../theme';

export default function SplashScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top}>
        <GridBg />
        <View style={styles.mark}>
          <View style={styles.markInner}>
            <View style={styles.markDot} />
          </View>
        </View>

        <Text style={styles.heading}>
          Vibe<Text style={styles.headingAccent}>Invest</Text>
        </Text>
        <Text style={styles.subtitle}>
          AI-powered due diligence on any Pakistan startup — before you write the cheque.
        </Text>

        <View style={styles.statsRow}>
          <StatBox value="4" label="AI agents" />
          <StatBox value="5m" label="avg report" />
          <StatBox value="PKR" label="native data" />
        </View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.btnPrimary}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.btnPrimaryText}>Analyze a Startup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnGhost}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.btnGhostText}>Browse Recent Reports</Text>
        </TouchableOpacity>

        <View style={styles.trustRow}>
          <View style={styles.trustDot} />
          <Text style={styles.trustText}>Trusted by 200+ investors & acquirers in Pakistan</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function StatBox({ value, label }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// A faint grid backdrop — recreated with overlapping borders.
function GridBg() {
  const cells = Array.from({ length: 12 * 18 });
  return (
    <View style={styles.gridBg} pointerEvents="none">
      {cells.map((_, i) => (
        <View key={i} style={styles.gridCell} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  top: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 24,
    position: 'relative',
  },
  gridBg: {
    position: 'absolute',
    inset: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    opacity: 0.5,
  },
  gridCell: {
    width: 32,
    height: 32,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(99,102,241,0.06)',
  },

  mark: {
    width: 64,
    height: 64,
    backgroundColor: colors.primary,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  markInner: {
    width: 32,
    height: 32,
    borderWidth: 2.5,
    borderColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markDot: { width: 10, height: 10, backgroundColor: '#fff', borderRadius: 3 },

  heading: {
    fontSize: 26,
    fontWeight: typography.weight.bold,
    color: colors.text,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  headingAccent: { color: colors.primaryLight },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },

  statsRow: { flexDirection: 'row', gap: 8, width: '100%', marginTop: 32 },
  statBox: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: typography.weight.bold, color: colors.text },
  statLabel: { fontSize: 10, color: colors.textDim, marginTop: 2 },

  bottom: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 36 },
  btnPrimary: {
    paddingVertical: 17,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.2,
  },
  btnGhost: {
    paddingVertical: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.pill,
    alignItems: 'center',
    marginTop: 10,
  },
  btnGhostText: { color: 'rgba(255,255,255,0.5)', fontSize: 13 },

  trustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  trustDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  trustText: { fontSize: 11, color: 'rgba(255,255,255,0.3)' },
});
