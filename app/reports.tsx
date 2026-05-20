import React from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { SavedReport, useReports } from '../context/ReportsContext';

// Shared tokens — mirror app/index.tsx + how-they-work.tsx + profile.tsx.
const T = {
  bg: '#08080d',
  ink: '#ffffff',
  dim: 'rgba(255,255,255,0.56)',
  faint: 'rgba(255,255,255,0.36)',
  ghost: 'rgba(255,255,255,0.22)',
  line: 'rgba(255,255,255,0.07)',
  line2: 'rgba(255,255,255,0.12)',
  glass: 'rgba(255,255,255,0.035)',
  purple: '#9550ee',
  purpleSoft: 'rgba(149,80,238,0.18)',
  purpleEdge: 'rgba(149,80,238,0.45)',
  purpleInk: '#d6c0ff',
  green: '#3ddc97',
  amber: '#f0b34a',
  red: '#ff5d6c',
};
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string;

const VERDICT_TONE: Record<SavedReport['verdict'], { bg: string; border: string; ink: string }> = {
  INVEST:  { bg: 'rgba(61,220,151,0.12)',  border: 'rgba(61,220,151,0.45)',  ink: T.green },
  ITERATE: { bg: 'rgba(149,80,238,0.14)',  border: 'rgba(149,80,238,0.55)',  ink: T.purpleInk },
  WATCH:   { bg: 'rgba(240,179,74,0.12)',  border: 'rgba(240,179,74,0.45)',  ink: T.amber },
  PIVOT:   { bg: 'rgba(240,179,74,0.12)',  border: 'rgba(240,179,74,0.45)',  ink: T.amber },
  ACQUIRE: { bg: 'rgba(149,80,238,0.14)',  border: 'rgba(149,80,238,0.55)',  ink: T.purpleInk },
  PASS:    { bg: 'rgba(255,93,108,0.10)',  border: 'rgba(255,93,108,0.40)',  ink: T.red },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function Header({ onBack, count }: { onBack: () => void; count: number }) {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} style={s.headerBtn} accessibilityLabel="Back" hitSlop={10}>
        <Ionicons name="chevron-back" size={22} color={T.ink} />
      </TouchableOpacity>
      <Text style={s.headerTitle}>Reports</Text>
      <View style={s.headerCount}>
        <Text style={s.headerCountText}>{count}</Text>
      </View>
    </View>
  );
}

function VerdictPill({ verdict }: { verdict: SavedReport['verdict'] }) {
  const m = VERDICT_TONE[verdict] ?? VERDICT_TONE.WATCH;
  return (
    <View style={[s.verdictPill, { backgroundColor: m.bg, borderColor: m.border }]}>
      <Text style={[s.verdictPillText, { color: m.ink }]}>{verdict}</Text>
    </View>
  );
}

function ReportCard({ report, onPress }: { report: SavedReport; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={s.cardOuter}>
      <LinearGradient
        colors={['rgba(255,255,255,0.045)', 'rgba(255,255,255,0.012)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={s.card}
      >
        <View style={s.initial}>
          <Text style={s.initialText}>{report.name[0]?.toUpperCase() ?? '·'}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={s.titleRow}>
            <Text style={s.name} numberOfLines={1}>{report.name}</Text>
            <VerdictPill verdict={report.verdict} />
          </View>
          <View style={s.metaRow}>
            <Text style={s.metaScore}>{report.score} / 1000</Text>
            <Text style={s.metaDot}>·</Text>
            <Text style={s.metaTime}>{timeAgo(report.finishedAt)}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={T.faint} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

function EmptyState() {
  return (
    <View style={s.empty}>
      <View style={s.emptyGlyph}>
        <Ionicons name="document-text-outline" size={22} color={T.purpleInk} />
      </View>
      <Text style={s.emptyTitle}>No reports yet</Text>
      <Text style={s.emptySub}>
        Once you run your first analysis, the verdict and Aura score will show up here.
      </Text>
    </View>
  );
}

export default function ReportsScreen() {
  const router = useRouter();
  const { reports } = useReports();

  return (
    <SafeAreaView style={s.screen}>
      <Header onBack={() => router.back()} count={reports.length} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.section}>
          <Text style={s.eyebrow}>◢ HISTORY</Text>
          <Text style={s.sectionTitle}>All analyses</Text>

          {reports.length === 0 ? (
            <View style={{ marginTop: 14 }}>
              <EmptyState />
            </View>
          ) : (
            <View style={{ marginTop: 14, gap: 10 }}>
              {reports.map((r) => (
                <ReportCard
                  key={r.id}
                  report={r}
                  onPress={() => router.push({ pathname: '/report', params: { name: r.name } })}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.line,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: T.ink,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  headerCount: {
    width: 44,
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  headerCountText: {
    fontFamily: MONO,
    fontSize: 11,
    color: T.faint,
    letterSpacing: 0.4,
  },

  // section
  section: { paddingHorizontal: 20, paddingTop: 20 },
  eyebrow: {
    fontFamily: MONO,
    fontSize: 9.5,
    color: T.faint,
    letterSpacing: 1.4,
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: T.ink,
    letterSpacing: -0.5,
  },

  // card
  cardOuter: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.line2,
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 64,
  },
  initial: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: T.line2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    color: T.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    color: T.ink,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  metaScore: {
    fontFamily: MONO,
    fontSize: 10.5,
    color: T.purpleInk,
    letterSpacing: 0.4,
  },
  metaDot: {
    color: T.line2,
    marginHorizontal: 6,
    fontSize: 10,
  },
  metaTime: {
    fontFamily: MONO,
    fontSize: 10.5,
    color: T.faint,
    letterSpacing: 0.4,
  },

  // verdict pill
  verdictPill: {
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 5,
    borderWidth: 1,
  },
  verdictPillText: {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: 1.2,
    fontWeight: '600',
  },

  // empty state
  empty: {
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 22,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: T.line2,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 10,
  },
  emptyGlyph: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: T.purpleEdge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { color: T.ink, fontSize: 14.5, fontWeight: '600', letterSpacing: -0.2 },
  emptySub: { color: T.dim, fontSize: 12.5, lineHeight: 19, textAlign: 'center', maxWidth: 260 },
});
