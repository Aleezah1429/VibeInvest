import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function ReportScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const startupName = name || 'Bykea';

  const [expandedCard, setExpandedCard] = useState<number | null>(1);

  const toggleCard = (id: number) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.reportHeader}>
        <TouchableOpacity style={styles.reportBack} onPress={() => router.push('/search')}>
          <Ionicons name="arrow-back" size={14} color="rgba(255,255,255,0.4)" style={{ marginRight: 4 }} />
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Back</Text>
        </TouchableOpacity>
        <View style={styles.reportActions}>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="download-outline" size={16} color="rgba(255,255,255,0.6)" /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="share-outline" size={16} color="rgba(255,255,255,0.6)" /></TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.startupHero}>
          <View style={styles.startupLogoLg}>
            <Text style={{ fontSize: 22 }}>🛵</Text>
          </View>
          <View style={styles.startupMeta}>
            <Text style={styles.startupNameLg}>{startupName}</Text>
            <View style={styles.startupTags}>
              <Text style={styles.tag}>Mobility</Text>
              <Text style={styles.tag}>Series A</Text>
              <Text style={styles.tag}>Karachi</Text>
              <Text style={styles.tag}>B2C</Text>
            </View>
          </View>
        </View>

        <View style={styles.verdictBanner}>
          <View style={styles.verdictScore}>
            <Text style={styles.vsNum}>712</Text>
            <Text style={styles.vsLabel}>/ 1000</Text>
          </View>
          <View style={styles.verdictDivider} />
          <View style={styles.verdictText}>
            <Text style={styles.verdictTitle}>INVEST — with conditions</Text>
            <Text style={styles.verdictSub}>Strong PMF in Karachi. Unit economics need tightening before Series B.</Text>
          </View>
        </View>

        <Text style={styles.rSectionLbl}>DIMENSION SCORES</Text>
        <View style={styles.dimGrid}>
          <DimItem icon="map" name="Market fit" score={78} color="#6366f1" />
          <DimItem icon="cash" name="Financials" score={63} color="#22c55e" />
          <DimItem icon="speedometer" name="Brand power" score={81} color="#a855f7" />
          <DimItem icon="extension-puzzle" name="Strategy" score={70} color="#f59e0b" />
        </View>

        <Text style={styles.rSectionLbl}>KEY METRICS</Text>
        <View style={styles.keyMetrics}>
          <MetricCard label="Est. valuation" value="$28M" change="+12% YoY" changeColor="#22c55e" />
          <MetricCard label="Monthly GMV (PKR)" value="₨ 2.4B" change="Growing" changeColor="#22c55e" />
          <MetricCard label="Burn rate / mo" value="$180K" change="High risk" changeColor="#ef4444" />
          <MetricCard label="Runway est." value="14 mo" change="Watch" changeColor="#f59e0b" />
        </View>

        <Text style={styles.rSectionLbl}>AGENT REPORTS</Text>
        <View style={styles.agentReports}>
          <AgentCard
            id={1}
            icon="🔍"
            iconBg="rgba(239,68,68,0.1)"
            iconBorder="rgba(239,68,68,0.2)"
            name="The Skeptic"
            role="Market & competition"
            badge="3 red flags"
            badgeColor="#ef4444"
            badgeBg="rgba(239,68,68,0.12)"
            badgeBorder="rgba(239,68,68,0.25)"
            body="Bykea operates in a market with significant structural risk — two-wheel mobility in Pakistan faces regulatory uncertainty and an over-reliance on the Karachi market (68% of GMV from one city)."
            findings={[
              { text: "InDrive entered PK market Q3 2023 — pricing pressure already visible in Karachi", color: "#ef4444" },
              { text: "No clear moat in logistics vs Trax and Leopards Courier", color: "#ef4444" },
              { text: "Lahore expansion stalled since 2022 — geographic concentration risk", color: "#f59e0b" }
            ]}
            expanded={expandedCard === 1}
            onToggle={() => toggleCard(1)}
          />
          <AgentCard
            id={2}
            icon="💰"
            iconBg="rgba(34,197,94,0.08)"
            iconBorder="rgba(34,197,94,0.2)"
            name="The Munshi"
            role="Financial analysis (PKR)"
            badge="Borderline"
            badgeColor="#fbbf24"
            badgeBg="rgba(251,191,36,0.12)"
            badgeBorder="rgba(251,191,36,0.25)"
            body="Unit economics are directionally solid but the PKR devaluation (40% since funding) has materially impacted USD-denominated burn vs PKR revenues. CAC/LTV ratio is 1:5.8 — acceptable for this stage."
            findings={[
              { text: "LTV:CAC of 5.8x — above the 3x minimum threshold for Series A", color: "#22c55e" },
              { text: "FX mismatch: costs in USD, revenue in PKR — runway shrinks 20% in real terms", color: "#ef4444" },
              { text: "No path to profitability document provided — request before term sheet", color: "#f59e0b" }
            ]}
            expanded={expandedCard === 2}
            onToggle={() => toggleCard(2)}
          />
          <AgentCard
            id={3}
            icon="✨"
            iconBg="rgba(168,85,247,0.1)"
            iconBorder="rgba(168,85,247,0.2)"
            name="The Hype"
            role="Brand & positioning"
            badge="Strong"
            badgeColor="#22c55e"
            badgeBg="rgba(34,197,94,0.1)"
            badgeBorder="rgba(34,197,94,0.25)"
            body="Bykea has genuine brand equity in Karachi — unprompted recall is high among daily-wage users, which is the target segment. The Urdu-first UX is a real differentiator vs Uber and Careem."
            findings={[
              { text: "Top-of-mind in Karachi for affordable mobility — strong word-of-mouth loop", color: "#22c55e" },
              { text: "Urdu UX + cash payments = untapped rural expansion potential", color: "#22c55e" },
              { text: "No digital brand presence beyond Karachi — social following weak vs market position", color: "#f59e0b" }
            ]}
            expanded={expandedCard === 3}
            onToggle={() => toggleCard(3)}
          />
          <AgentCard
            id={4}
            icon="👑"
            iconBg="rgba(251,191,36,0.1)"
            iconBorder="rgba(251,191,36,0.2)"
            name="The CVO"
            role="Final verdict"
            badge="INVEST ⚡"
            badgeColor="#818cf8"
            badgeBg="rgba(99,102,241,0.12)"
            badgeBorder="rgba(99,102,241,0.25)"
            body="Bykea is a conditional invest. The brand and PMF are real. The financial model needs stress-testing on the FX gap before a term sheet. Recommend requesting 18-month financial projections with PKR-denominated cost structure before proceeding."
            findings={[
              { text: "Negotiation lever: FX risk — use to push for better valuation", color: "#6366f1" },
              { text: "Due diligence priority: city-level P&L for Karachi vs Lahore", color: "#6366f1" },
              { text: "Acquirer note: logistics vertical has standalone value — consider carve-out scenario", color: "#6366f1" }
            ]}
            expanded={expandedCard === 4}
            onToggle={() => toggleCard(4)}
          />
        </View>

        <View style={styles.ctaStrip}>
          <TouchableOpacity style={styles.ctaA} onPress={() => router.push('/search')}>
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

const DimItem = ({ icon, name, score, color }: any) => (
  <View style={styles.dimItem}>
    <Ionicons name={icon} size={16} color="rgba(255,255,255,0.5)" style={{ width: 22, textAlign: 'center' }} />
    <Text style={styles.dimName}>{name}</Text>
    <View style={styles.dimTrack}>
      <View style={[styles.dimFill, { width: `${score}%`, backgroundColor: color }]} />
    </View>
    <Text style={styles.dimScore}>{score}</Text>
  </View>
);

const MetricCard = ({ label, value, change, changeColor }: any) => (
  <View style={styles.kmCard}>
    <Text style={styles.kmLabel}>{label}</Text>
    <Text style={styles.kmValue}>{value}</Text>
    <Text style={[styles.kmChange, { color: changeColor }]}>{change}</Text>
  </View>
);

const AgentCard = ({ icon, iconBg, iconBorder, name, role, badge, badgeColor, badgeBg, badgeBorder, body, findings, expanded, onToggle }: any) => (
  <TouchableOpacity
    style={[styles.arCard, expanded && styles.arCardExpanded]}
    onPress={onToggle}
    activeOpacity={0.8}
  >
    <View style={styles.arHeader}>
      <View style={[styles.arAvatar, { backgroundColor: iconBg, borderColor: iconBorder }]}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <View style={styles.arTitle}>
        <Text style={styles.arAgentName}>{name}</Text>
        <Text style={styles.arAgentRole}>{role}</Text>
      </View>
      <View style={[styles.arBadge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
        <Text style={{ color: badgeColor, fontSize: 11, fontWeight: '600' }}>{badge}</Text>
      </View>
      <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={14} color="rgba(255,255,255,0.3)" />
    </View>
    {expanded && (
      <View style={styles.arBody}>
        <Text style={styles.arBodyText}>{body}</Text>
        <View style={styles.arFindings}>
          {findings.map((f: any, i: number) => (
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090F' },
  reportHeader: { paddingHorizontal: 20, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportBack: { flexDirection: 'row', alignItems: 'center' },
  reportActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  startupHero: { paddingHorizontal: 20, paddingTop: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  startupLogoLg: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#1e1b4b', borderWidth: 0.5, borderColor: 'rgba(99,102,241,0.3)', alignItems: 'center', justifyContent: 'center' },
  startupMeta: { flex: 1 },
  startupNameLg: { fontSize: 20, fontWeight: '700', color: '#fff' },
  startupTags: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  tag: { fontSize: 10, paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  verdictBanner: { marginHorizontal: 20, marginTop: 16, backgroundColor: 'rgba(99,102,241,0.12)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 },
  verdictScore: { alignItems: 'center' },
  vsNum: { fontSize: 32, fontWeight: '800', color: '#fff', lineHeight: 32 },
  vsLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  verdictDivider: { width: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.1)' },
  verdictText: { flex: 1 },
  verdictTitle: { fontSize: 17, fontWeight: '700', color: '#818cf8' },
  verdictSub: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3, lineHeight: 17 },
  rSectionLbl: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8, fontSize: 11, letterSpacing: 1, color: 'rgba(255,255,255,0.3)' },
  dimGrid: { paddingHorizontal: 20, gap: 8 },
  dimItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dimName: { fontSize: 12, color: 'rgba(255,255,255,0.45)', width: 76 },
  dimTrack: { flex: 1, height: 5, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 50, overflow: 'hidden' },
  dimFill: { height: '100%', borderRadius: 50 },
  dimScore: { fontSize: 12, fontWeight: '600', color: '#fff', width: 28, textAlign: 'right' },
  keyMetrics: { paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kmCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14 },
  kmLabel: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4 },
  kmValue: { fontSize: 16, fontWeight: '700', color: '#fff' },
  kmChange: { fontSize: 11, marginTop: 2 },
  agentReports: { paddingHorizontal: 20, gap: 10 },
  arCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 16 },
  arCardExpanded: { borderColor: 'rgba(99,102,241,0.3)', backgroundColor: 'rgba(99,102,241,0.06)' },
  arHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  arAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  arTitle: { flex: 1 },
  arAgentName: { fontSize: 13, fontWeight: '600', color: '#fff' },
  arAgentRole: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 },
  arBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, borderWidth: 0.5 },
  arBody: { marginTop: 12, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.07)' },
  arBodyText: { fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 20 },
  arFindings: { marginTop: 10, gap: 6 },
  finding: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  findingDot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 6 },
  findingText: { flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 18 },
  ctaStrip: { paddingHorizontal: 20, paddingTop: 20, flexDirection: 'row', gap: 8 },
  ctaA: { flex: 1, padding: 16, borderRadius: 50, backgroundColor: '#6366f1', alignItems: 'center' },
  ctaAText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  ctaB: { flex: 1, padding: 16, borderRadius: 50, backgroundColor: 'transparent', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  ctaBText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.6)' }
});
