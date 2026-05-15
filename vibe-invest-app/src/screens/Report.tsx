import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';

type Props = {
  startupName: string;
  onBack: () => void;
  onNewAnalysis: () => void;
};

type Dimension = {
  name: string;
  icon: 'map' | 'cash' | 'speedo' | 'chess';
  pct: number;
  color: string;
};

const DIMS: Dimension[] = [
  { name: 'Market fit',  icon: 'map',    pct: 78, color: colors.brand   },
  { name: 'Financials',  icon: 'cash',   pct: 63, color: colors.success },
  { name: 'Brand power', icon: 'speedo', pct: 81, color: colors.purple  },
  { name: 'Strategy',    icon: 'chess',  pct: 70, color: colors.warning },
];

const TAGS = ['Mobility', 'Series A', 'Karachi', 'B2C'];

type MetricChange = { text: string; color: string };
type Metric = { label: string; value: string; change: MetricChange };
const METRICS: Metric[] = [
  { label: 'Est. valuation',    value: '$28M',   change: { text: '+12% YoY',  color: colors.success } },
  { label: 'Monthly GMV (PKR)', value: '₨ 2.4B', change: { text: 'Growing',   color: colors.success } },
  { label: 'Burn rate / mo',    value: '$180K',  change: { text: 'High risk', color: colors.danger  } },
  { label: 'Runway est.',       value: '14 mo',  change: { text: 'Watch',     color: colors.warning } },
];

type Finding = { dotColor: string; text: string };
type AgentReport = {
  emoji: string;
  bg: string;
  border: string;
  name: string;
  role: string;
  badge: { text: string; bg: string; fg: string; border: string };
  summary: string;
  findings: Finding[];
};

const REPORTS: AgentReport[] = [
  {
    emoji: '🔍',
    bg: colors.dangerBg, border: colors.dangerBorder,
    name: 'The Skeptic', role: 'Market & competition',
    badge: { text: '3 red flags', bg: colors.dangerBgMid, fg: colors.danger, border: colors.dangerBorderHi },
    summary: 'Bykea operates in a market with significant structural risk — two-wheel mobility in Pakistan faces regulatory uncertainty and an over-reliance on the Karachi market (68% of GMV from one city).',
    findings: [
      { dotColor: colors.danger,  text: 'InDrive entered PK market Q3 2023 — pricing pressure already visible in Karachi' },
      { dotColor: colors.danger,  text: 'No clear moat in logistics vs Trax and Leopards Courier' },
      { dotColor: colors.warning, text: 'Lahore expansion stalled since 2022 — geographic concentration risk' },
    ],
  },
  {
    emoji: '💰',
    bg: colors.successBgMid, border: colors.successBorder,
    name: 'The Munshi', role: 'Financial analysis (PKR)',
    badge: { text: 'Borderline', bg: colors.amberBgHi, fg: colors.amber, border: colors.amberBorder },
    summary: 'Unit economics are directionally solid but the PKR devaluation (40% since funding) has materially impacted USD-denominated burn vs PKR revenues. CAC/LTV ratio is 1:5.8 — acceptable for this stage.',
    findings: [
      { dotColor: colors.success, text: 'LTV:CAC of 5.8x — above the 3x minimum threshold for Series A' },
      { dotColor: colors.danger,  text: 'FX mismatch: costs in USD, revenue in PKR — runway shrinks 20% in real terms' },
      { dotColor: colors.warning, text: 'No path to profitability document provided — request before term sheet' },
    ],
  },
  {
    emoji: '✨',
    bg: colors.purpleBg, border: colors.purpleBorder,
    name: 'The Hype', role: 'Brand & positioning',
    badge: { text: 'Strong', bg: colors.successBgHi, fg: colors.success, border: colors.successBorderHi },
    summary: 'Bykea has genuine brand equity in Karachi — unprompted recall is high among daily-wage users, which is the target segment. The Urdu-first UX is a real differentiator vs Uber and Careem.',
    findings: [
      { dotColor: colors.success, text: 'Top-of-mind in Karachi for affordable mobility — strong word-of-mouth loop' },
      { dotColor: colors.success, text: 'Urdu UX + cash payments = untapped rural expansion potential' },
      { dotColor: colors.warning, text: 'No digital brand presence beyond Karachi — social following weak vs market position' },
    ],
  },
  {
    emoji: '👑',
    bg: colors.amberBg, border: colors.amberBorderSoft,
    name: 'The CVO', role: 'Final verdict',
    badge: { text: 'INVEST ⚡', bg: colors.brandTintMid, fg: colors.brandSoft, border: colors.brandBorderSoft },
    summary: 'Bykea is a conditional invest. The brand and PMF are real. The financial model needs stress-testing on the FX gap before a term sheet. Recommend requesting 18-month financial projections with PKR-denominated cost structure before proceeding.',
    findings: [
      { dotColor: colors.brand, text: 'Negotiation lever: FX risk — use to push for better valuation' },
      { dotColor: colors.brand, text: 'Due diligence priority: city-level P&L for Karachi vs Lahore' },
      { dotColor: colors.brand, text: 'Acquirer note: logistics vertical has standalone value — consider carve-out scenario' },
    ],
  },
];

export default function Report({ startupName, onBack, onNewAnalysis }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);

  // verdict score countUp (scale 0.85 -> 1.0)
  const scoreScale = useRef(new Animated.Value(0.85)).current;
  const scoreOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scoreScale,   { toValue: 1,   duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(scoreOpacity, { toValue: 1,   duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  }, [scoreScale, scoreOpacity]);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backRow} onPress={onBack}>
            <Feather name="arrow-left" size={14} color={colors.textFaint} />
            <Text style={styles.backText}> Back</Text>
          </Pressable>
          <View style={styles.headerActions}>
            <View style={styles.iconBtn}>
              <Feather name="download" size={16} color={colors.textMuted} />
            </View>
            <View style={styles.iconBtn}>
              <Feather name="share-2" size={16} color={colors.textMuted} />
            </View>
          </View>
        </View>

        {/* Startup hero */}
        <View style={styles.hero}>
          <View style={styles.heroLogo}>
            <Text style={styles.heroEmoji}>🛵</Text>
          </View>
          <View style={styles.heroMeta}>
            <Text style={styles.heroName}>{startupName}</Text>
            <View style={styles.tagsRow}>
              {TAGS.map((t) => (
                <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
              ))}
            </View>
          </View>
        </View>

        {/* Verdict banner */}
        <View style={styles.verdictBanner}>
          <Animated.View style={[styles.verdictScore, { opacity: scoreOpacity, transform: [{ scale: scoreScale }] }]}>
            <Text style={styles.verdictNum}>712</Text>
            <Text style={styles.verdictLabel}>/ 1000</Text>
          </Animated.View>
          <View style={styles.verdictDivider} />
          <View style={styles.verdictText}>
            <Text style={styles.verdictTitle}>INVEST — with conditions</Text>
            <Text style={styles.verdictSub}>
              Strong PMF in Karachi. Unit economics need tightening before Series B.
            </Text>
          </View>
        </View>

        {/* Dimension scores */}
        <Text style={styles.rSectionLbl}>Dimension scores</Text>
        <View style={styles.dimGrid}>
          {DIMS.map((d) => (
            <View key={d.name} style={styles.dimItem}>
              <DimIcon kind={d.icon} />
              <Text style={styles.dimName}>{d.name}</Text>
              <View style={styles.dimTrack}>
                <View style={[styles.dimFill, { width: `${d.pct}%`, backgroundColor: d.color }]} />
              </View>
              <Text style={styles.dimScore}>{d.pct}</Text>
            </View>
          ))}
        </View>

        {/* Key metrics */}
        <Text style={styles.rSectionLbl}>Key metrics</Text>
        <View style={styles.kmGrid}>
          {METRICS.map((m) => (
            <View key={m.label} style={styles.kmCard}>
              <Text style={styles.kmLabel}>{m.label}</Text>
              <Text style={styles.kmValue}>{m.value}</Text>
              <Text style={[styles.kmChange, { color: m.change.color }]}>{m.change.text}</Text>
            </View>
          ))}
        </View>

        {/* Agent reports */}
        <Text style={styles.rSectionLbl}>Agent reports</Text>
        <View style={styles.reportsList}>
          {REPORTS.map((r, i) => {
            const isOpen = expanded === i;
            return (
              <Pressable
                key={r.name}
                style={[styles.arCard, isOpen && styles.arCardExpanded]}
                onPress={() => setExpanded(isOpen ? null : i)}
              >
                <View style={styles.arHeader}>
                  <View style={[styles.arAvatar, { backgroundColor: r.bg, borderColor: r.border }]}>
                    <Text style={styles.arEmoji}>{r.emoji}</Text>
                  </View>
                  <View style={styles.arTitle}>
                    <Text style={styles.arAgentName}>{r.name}</Text>
                    <Text style={styles.arAgentRole}>{r.role}</Text>
                  </View>
                  <View style={[
                    styles.arBadge,
                    { backgroundColor: r.badge.bg, borderColor: r.badge.border },
                  ]}>
                    <Text style={[styles.arBadgeText, { color: r.badge.fg }]}>{r.badge.text}</Text>
                  </View>
                  <Feather
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={colors.textWhisper}
                  />
                </View>
                {isOpen && (
                  <View style={styles.arBody}>
                    <Text style={styles.arSummary}>{r.summary}</Text>
                    <View style={styles.arFindings}>
                      {r.findings.map((f, j) => (
                        <View key={j} style={styles.finding}>
                          <View style={[styles.findingDot, { backgroundColor: f.dotColor }]} />
                          <Text style={styles.findingText}>{f.text}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* CTA strip */}
        <View style={styles.ctaStrip}>
          <Pressable style={styles.ctaA} onPress={onNewAnalysis}>
            <Text style={styles.ctaAText}>New Analysis</Text>
          </Pressable>
          <Pressable style={styles.ctaB}>
            <Text style={styles.ctaBText}>Save Report</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DimIcon({ kind }: { kind: Dimension['icon'] }) {
  const common = { size: 16, color: colors.textDim, style: styles.dimIcon as any };
  switch (kind) {
    case 'map':    return <MaterialCommunityIcons name="map-search-outline" {...common} />;
    case 'cash':   return <MaterialCommunityIcons name="cash-multiple"       {...common} />;
    case 'speedo': return <MaterialCommunityIcons name="speedometer"         {...common} />;
    case 'chess':  return <MaterialCommunityIcons name="chess-knight"        {...common} />;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 40 },

  header: {
    paddingHorizontal: 20, paddingTop: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  backRow: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 13, color: colors.textFaint },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.surfaceTop,
    borderWidth: 0.5, borderColor: colors.borderTop,
    alignItems: 'center', justifyContent: 'center',
  },

  hero: {
    paddingHorizontal: 20, paddingTop: 20,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  heroLogo: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: colors.deepIndigo,
    borderWidth: 0.5, borderColor: colors.brandBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  heroEmoji: { fontSize: 22 },
  heroMeta: { flex: 1 },
  heroName: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: {
    paddingVertical: 3, paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: colors.surfaceTop,
    borderWidth: 0.5, borderColor: colors.borderStrong,
  },
  tagText: { fontSize: 10, color: colors.textDimmer },

  verdictBanner: {
    marginHorizontal: 20, marginTop: 16,
    backgroundColor: colors.brandTintMid,
    borderWidth: 1, borderColor: colors.brandBorder,
    borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  verdictScore: { alignItems: 'center' },
  verdictNum: { fontSize: 32, fontWeight: '800', color: colors.textPrimary, lineHeight: 32 },
  verdictLabel: { fontSize: 10, color: colors.textFaint, marginTop: 2 },
  verdictDivider: {
    width: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.1)',
  },
  verdictText: { flex: 1 },
  verdictTitle: { fontSize: 17, fontWeight: '700', color: colors.brandSoft },
  verdictSub: { fontSize: 12, color: colors.textDimmer, marginTop: 3, lineHeight: 17 },

  rSectionLbl: {
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
    fontSize: 11, letterSpacing: 1,
    color: colors.textWhisper, textTransform: 'uppercase',
  },

  dimGrid: { paddingHorizontal: 20, gap: 8 },
  dimItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dimIcon: { width: 22, textAlign: 'center' },
  dimName: { fontSize: 12, color: colors.textDimmer, width: 76 },
  dimTrack: {
    flex: 1, height: 5,
    backgroundColor: colors.surfaceTop,
    borderRadius: 50, overflow: 'hidden',
  },
  dimFill: { height: '100%', borderRadius: 50 },
  dimScore: {
    fontSize: 12, fontWeight: '600',
    color: colors.textPrimary, width: 28, textAlign: 'right',
  },

  kmGrid: {
    paddingHorizontal: 20,
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  kmCard: {
    width: '48%', flexGrow: 1,
    backgroundColor: colors.surfaceMid,
    borderWidth: 0.5, borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 14,
  },
  kmLabel: { fontSize: 11, color: colors.textHint, marginBottom: 4 },
  kmValue: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  kmChange: { fontSize: 11, marginTop: 2 },

  reportsList: { paddingHorizontal: 20, gap: 10 },
  arCard: {
    backgroundColor: colors.surfaceLow,
    borderWidth: 0.5, borderColor: colors.border,
    borderRadius: 16, padding: 16,
  },
  arCardExpanded: {
    borderColor: colors.brandBorder,
    backgroundColor: 'rgba(99,102,241,0.06)',
  },
  arHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  arAvatar: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 0.5,
    alignItems: 'center', justifyContent: 'center',
  },
  arEmoji: { fontSize: 16 },
  arTitle: { flex: 1 },
  arAgentName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  arAgentRole: { fontSize: 11, color: colors.textHint, marginTop: 1 },
  arBadge: {
    paddingVertical: 4, paddingHorizontal: 10,
    borderRadius: 20, borderWidth: 0.5,
  },
  arBadgeText: { fontSize: 11, fontWeight: '600' },
  arBody: {
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.07)',
  },
  arSummary: { fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 20 },
  arFindings: { marginTop: 10, gap: 6 },
  finding: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  findingDot: {
    width: 5, height: 5, borderRadius: 2.5,
    marginTop: 6,
  },
  findingText: { flex: 1, fontSize: 12, color: colors.textDim, lineHeight: 18 },

  ctaStrip: {
    paddingHorizontal: 20, paddingTop: 20,
    flexDirection: 'row', gap: 8,
  },
  ctaA: {
    flex: 1, paddingVertical: 16, borderRadius: 50,
    backgroundColor: colors.brand,
    alignItems: 'center',
  },
  ctaAText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  ctaB: {
    flex: 1, paddingVertical: 16, borderRadius: 50,
    backgroundColor: 'transparent',
    borderWidth: 0.5, borderColor: colors.borderGhost,
    alignItems: 'center',
  },
  ctaBText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
});
