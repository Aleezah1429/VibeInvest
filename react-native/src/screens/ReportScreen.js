import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, radius, typography } from '../theme';

const DIMENSIONS = [
  { icon: 'map',       name: 'Market fit',  score: 78, color: colors.primary },
  { icon: 'dollar-sign', name: 'Financials', score: 63, color: colors.success },
  { icon: 'award',     name: 'Brand power', score: 81, color: colors.purple },
  { icon: 'target',    name: 'Strategy',    score: 70, color: colors.warning },
];

const METRICS = [
  { label: 'Est. valuation',   value: '$28M',  change: '+12% YoY',  changeColor: colors.success },
  { label: 'Monthly GMV (PKR)', value: '₨ 2.4B', change: 'Growing',   changeColor: colors.success },
  { label: 'Burn rate / mo',   value: '$180K', change: 'High risk', changeColor: colors.danger },
  { label: 'Runway est.',      value: '14 mo', change: 'Watch',     changeColor: colors.warning },
];

const AGENTS = [
  {
    id: 1,
    emoji: '🔍',
    tint: 'danger',
    name: 'The Skeptic',
    role: 'Market & competition',
    badge: { text: '3 red flags', bg: 'rgba(239,68,68,0.12)', color: colors.danger, border: 'rgba(239,68,68,0.25)' },
    summary:
      'Bykea operates in a market with significant structural risk — two-wheel mobility in Pakistan faces regulatory uncertainty and an over-reliance on the Karachi market (68% of GMV from one city).',
    findings: [
      { color: colors.danger,  text: 'InDrive entered PK market Q3 2023 — pricing pressure already visible in Karachi' },
      { color: colors.danger,  text: 'No clear moat in logistics vs Trax and Leopards Courier' },
      { color: colors.warning, text: 'Lahore expansion stalled since 2022 — geographic concentration risk' },
    ],
  },
  {
    id: 2,
    emoji: '💰',
    tint: 'success',
    name: 'The Munshi',
    role: 'Financial analysis (PKR)',
    badge: { text: 'Borderline', bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
    summary:
      'Unit economics are directionally solid but the PKR devaluation (40% since funding) has materially impacted USD-denominated burn vs PKR revenues. CAC/LTV ratio is 1:5.8 — acceptable for this stage.',
    findings: [
      { color: colors.success, text: 'LTV:CAC of 5.8x — above the 3x minimum threshold for Series A' },
      { color: colors.danger,  text: 'FX mismatch: costs in USD, revenue in PKR — runway shrinks 20% in real terms' },
      { color: colors.warning, text: 'No path to profitability document provided — request before term sheet' },
    ],
  },
  {
    id: 3,
    emoji: '✨',
    tint: 'purple',
    name: 'The Hype',
    role: 'Brand & positioning',
    badge: { text: 'Strong', bg: 'rgba(34,197,94,0.10)', color: colors.success, border: 'rgba(34,197,94,0.25)' },
    summary:
      'Bykea has genuine brand equity in Karachi — unprompted recall is high among daily-wage users, which is the target segment. The Urdu-first UX is a real differentiator vs Uber and Careem.',
    findings: [
      { color: colors.success, text: 'Top-of-mind in Karachi for affordable mobility — strong word-of-mouth loop' },
      { color: colors.success, text: 'Urdu UX + cash payments = untapped rural expansion potential' },
      { color: colors.warning, text: 'No digital brand presence beyond Karachi — social following weak vs market position' },
    ],
  },
  {
    id: 4,
    emoji: '👑',
    tint: 'warning',
    name: 'The CVO',
    role: 'Final verdict',
    badge: { text: 'INVEST ⚡', bg: 'rgba(99,102,241,0.12)', color: colors.primaryLight, border: 'rgba(99,102,241,0.25)' },
    summary:
      'Bykea is a conditional invest. The brand and PMF are real. The financial model needs stress-testing on the FX gap before a term sheet. Recommend requesting 18-month financial projections with PKR-denominated cost structure before proceeding.',
    findings: [
      { color: colors.primary, text: 'Negotiation lever: FX risk — use to push for better valuation' },
      { color: colors.primary, text: 'Due diligence priority: city-level P&L for Karachi vs Lahore' },
      { color: colors.primary, text: 'Acquirer note: logistics vertical has standalone value — consider carve-out scenario' },
    ],
  },
];

const TINTS = {
  danger:  { bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.20)' },
  success: { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.20)' },
  purple:  { bg: 'rgba(168,85,247,0.10)', border: 'rgba(168,85,247,0.20)' },
  warning: { bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.20)' },
};

export default function ReportScreen({ navigation, route }) {
  const startup = route?.params?.startup || 'Bykea';
  const [openId, setOpenId] = useState(null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backRow} onPress={() => navigation.navigate('Search')}>
            <Icon name="arrow-left" size={14} color="rgba(255,255,255,0.4)" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.actions}>
            <IconBtn name="download" />
            <IconBtn name="share-2" />
          </View>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoLg}>
            <Text style={{ fontSize: 22 }}>🛵</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.startupName}>{startup}</Text>
            <View style={styles.tags}>
              {['Mobility', 'Series A', 'Karachi', 'B2C'].map((t) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Verdict banner */}
        <View style={styles.verdict}>
          <View style={styles.verdictScore}>
            <Text style={styles.vsNum}>712</Text>
            <Text style={styles.vsLabel}>/ 1000</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={{ flex: 1 }}>
            <Text style={styles.vTitle}>INVEST — with conditions</Text>
            <Text style={styles.vSub}>
              Strong PMF in Karachi. Unit economics need tightening before Series B.
            </Text>
          </View>
        </View>

        {/* Dimensions */}
        <Text style={styles.sectionLabel}>Dimension scores</Text>
        <View style={styles.dimGrid}>
          {DIMENSIONS.map((d) => (
            <View key={d.name} style={styles.dimItem}>
              <Icon name={d.icon} size={14} color="rgba(255,255,255,0.5)" style={{ width: 22, textAlign: 'center' }} />
              <Text style={styles.dimName}>{d.name}</Text>
              <View style={styles.dimTrack}>
                <View style={[styles.dimFill, { width: `${d.score}%`, backgroundColor: d.color }]} />
              </View>
              <Text style={styles.dimScore}>{d.score}</Text>
            </View>
          ))}
        </View>

        {/* Metrics */}
        <Text style={styles.sectionLabel}>Key metrics</Text>
        <View style={styles.metrics}>
          {METRICS.map((m) => (
            <View key={m.label} style={styles.kmCard}>
              <Text style={styles.kmLabel}>{m.label}</Text>
              <Text style={styles.kmValue}>{m.value}</Text>
              <Text style={[styles.kmChange, { color: m.changeColor }]}>{m.change}</Text>
            </View>
          ))}
        </View>

        {/* Agent reports */}
        <Text style={styles.sectionLabel}>Agent reports</Text>
        <View style={styles.agentReports}>
          {AGENTS.map((a) => (
            <AgentCard
              key={a.id}
              agent={a}
              expanded={openId === a.id}
              onPress={() => setOpenId(openId === a.id ? null : a.id)}
            />
          ))}
        </View>

        {/* CTAs */}
        <View style={styles.ctaStrip}>
          <TouchableOpacity style={styles.ctaA} onPress={() => navigation.navigate('Search')}>
            <Text style={styles.ctaAText}>New Analysis</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaB}>
            <Text style={styles.ctaBText}>Save Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function IconBtn({ name }) {
  return (
    <TouchableOpacity style={styles.iconBtn}>
      <Icon name={name} size={16} color="rgba(255,255,255,0.6)" />
    </TouchableOpacity>
  );
}

function AgentCard({ agent, expanded, onPress }) {
  const tint = TINTS[agent.tint];
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.arCard, expanded && styles.arCardExpanded]}
      onPress={onPress}
    >
      <View style={styles.arHeader}>
        <View style={[styles.arAvatar, { backgroundColor: tint.bg, borderColor: tint.border }]}>
          <Text style={{ fontSize: 16 }}>{agent.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.arAgentName}>{agent.name}</Text>
          <Text style={styles.arAgentRole}>{agent.role}</Text>
        </View>
        <View
          style={[
            styles.arBadge,
            { backgroundColor: agent.badge.bg, borderColor: agent.badge.border },
          ]}
        >
          <Text style={{ color: agent.badge.color, fontSize: 11, fontWeight: typography.weight.semibold }}>
            {agent.badge.text}
          </Text>
        </View>
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color="rgba(255,255,255,0.3)"
          style={{ marginLeft: 4 }}
        />
      </View>

      {expanded && (
        <View style={styles.arBody}>
          <Text style={styles.arBodyText}>{agent.summary}</Text>
          <View style={{ marginTop: 10, gap: 6 }}>
            {agent.findings.map((f, i) => (
              <View key={i} style={styles.finding}>
                <View style={[styles.findingDot, { backgroundColor: f.color }]} />
                <Text style={styles.findingText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  hero: { paddingHorizontal: 20, paddingTop: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  logoLg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1e1b4b',
    borderWidth: 0.5,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startupName: { fontSize: 20, fontWeight: typography.weight.bold, color: colors.text },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  tagText: { fontSize: 10, color: colors.textMuted },

  verdict: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  verdictScore: { alignItems: 'center' },
  vsNum: { fontSize: 32, fontWeight: typography.weight.extrabold, color: colors.text, lineHeight: 34 },
  vsLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  vDivider: { width: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.1)' },
  vTitle: { fontSize: 17, fontWeight: typography.weight.bold, color: colors.primaryLight },
  vSub: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3, lineHeight: 17 },

  sectionLabel: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    fontSize: 11,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
  },

  dimGrid: { paddingHorizontal: 20, gap: 8 },
  dimItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dimName: { fontSize: 12, color: 'rgba(255,255,255,0.45)', width: 76 },
  dimTrack: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  dimFill: { height: '100%', borderRadius: radius.pill },
  dimScore: {
    fontSize: 12,
    fontWeight: typography.weight.semibold,
    color: colors.text,
    width: 28,
    textAlign: 'right',
  },

  metrics: { paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kmCard: {
    flexBasis: '48.5%',
    flexGrow: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  kmLabel: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4 },
  kmValue: { fontSize: 16, fontWeight: typography.weight.bold, color: colors.text },
  kmChange: { fontSize: 11, marginTop: 2 },

  agentReports: { paddingHorizontal: 20, gap: 10 },
  arCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
  },
  arCardExpanded: { borderColor: colors.primaryBorder, backgroundColor: 'rgba(99,102,241,0.06)' },
  arHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  arAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arAgentName: { fontSize: 13, fontWeight: typography.weight.semibold, color: colors.text },
  arAgentRole: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 },
  arBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  arBody: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  arBodyText: { fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 20 },
  finding: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  findingDot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 6 },
  findingText: { flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 18 },

  ctaStrip: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 20 },
  ctaA: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  ctaAText: { color: '#fff', fontSize: 14, fontWeight: typography.weight.semibold },
  ctaB: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radius.pill,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  ctaBText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: typography.weight.semibold },
});
