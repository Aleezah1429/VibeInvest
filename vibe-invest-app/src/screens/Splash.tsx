import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { colors } from '../theme';

type Props = {
  onAnalyze: () => void;
  onBrowse: () => void;
};

const STATS: Array<{ n: string; l: string }> = [
  { n: '4',   l: 'AI agents' },
  { n: '5m',  l: 'avg report' },
  { n: 'PKR', l: 'native data' },
];

export default function Splash({ onAnalyze, onBrowse }: Props) {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <GridBackground />
        <View style={styles.mark}>
          <View style={styles.markInner}>
            <View style={styles.markDot} />
          </View>
        </View>
        <Text style={styles.headline}>
          Vibe<Text style={styles.headlineAccent}>Invest</Text>
        </Text>
        <Text style={styles.tagline}>
          AI-powered due diligence on any Pakistan startup — before you write the cheque.
        </Text>
        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <View key={s.l} style={styles.statBox}>
              <Text style={styles.statN}>{s.n}</Text>
              <Text style={styles.statL}>{s.l}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottom}>
        <Pressable style={styles.btnPrimary} onPress={onAnalyze}>
          <Text style={styles.btnPrimaryText}>Analyze a Startup</Text>
        </Pressable>
        <Pressable style={styles.btnGhost} onPress={onBrowse}>
          <Text style={styles.btnGhostText}>Browse Recent Reports</Text>
        </Pressable>
        <View style={styles.trustRow}>
          <View style={styles.trustDot} />
          <Text style={styles.trustText}>
            Trusted by 200+ investors &amp; acquirers in Pakistan
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// CSS .grid-bg is a layered linear-gradient producing a 32px grid. React Native
// has no gradient primitive, so we render thin lines on a transparent layer.
// 12 columns x 24 rows is comfortably more than any phone needs.
function GridBackground() {
  const lines: React.ReactElement[] = [];
  const GAP = 32;
  for (let i = 1; i <= 24; i++) {
    lines.push(<View key={`h${i}`} style={[styles.gridLineH, { top: i * GAP }]} />);
  }
  for (let i = 1; i <= 12; i++) {
    lines.push(<View key={`v${i}`} style={[styles.gridLineV, { left: i * GAP }]} />);
  }
  return <View style={styles.gridBg} pointerEvents="none">{lines}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
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
    top: 0, left: 0, right: 0, bottom: 0,
  },
  gridLineH: {
    position: 'absolute',
    left: 0, right: 0,
    height: 1,
    backgroundColor: colors.brandGridLine,
  },
  gridLineV: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: 1,
    backgroundColor: colors.brandGridLine,
  },
  mark: {
    width: 64, height: 64,
    backgroundColor: colors.brand,
    borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  markInner: {
    width: 32, height: 32,
    borderWidth: 2.5,
    borderColor: '#fff',
    borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  markDot: {
    width: 10, height: 10,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  headlineAccent: {
    color: colors.brandSoft,
  },
  tagline: {
    fontSize: 13,
    color: colors.textDimmer,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginTop: 32,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surfaceHi,
    borderWidth: 0.5,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statN: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statL: {
    fontSize: 10,
    color: colors.textHint,
    marginTop: 2,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
  },
  btnPrimary: {
    paddingVertical: 17,
    backgroundColor: colors.brand,
    borderRadius: 50,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  btnGhost: {
    paddingVertical: 14,
    borderWidth: 0.5,
    borderColor: colors.borderGhost,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 10,
  },
  btnGhostText: {
    color: colors.textDim,
    fontSize: 13,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  trustDot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  trustText: {
    fontSize: 11,
    color: colors.textWhisper,
  },
});
