import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Animated, ActivityIndicator, Alert, Linking, Share, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { FileText, FileQuestion, FileEdit, Bike, Search, CircleDollarSign, Sparkles, Crown } from 'lucide-react-native';
import { getAnalysis, API_BASE_URL } from '../services/api';

import type { AgentReport, ReportData, Verdict } from '../services/types';
import { findingColor } from '../services/types';

const PLACEHOLDER_REPORT: ReportData = {
  startup_name: 'Bykea',
  intent: 'invest',
  tags: ['Mobility', 'Series A', 'Karachi', 'B2C'],
  score: 712,
  verdict: 'INVEST',
  verdict_sub: 'WITH CONDITIONS',
  dimensions: [
    { name: 'Market fit', score: 78 },
    { name: 'Financials', score: 63 },
    { name: 'Brand power', score: 81 },
    { name: 'Strategy', score: 70 },
  ],
  metrics: [
    { label: 'Est. valuation', value: '$28M', change: '+12% YoY', change_type: 'positive' },
    { label: 'Monthly GMV', value: '₨ 2.4B', change: 'Growing', change_type: 'positive' },
    { label: 'Burn rate / mo', value: '$180K', change: 'High risk', change_type: 'negative' },
    { label: 'Runway est.', value: '14 mo', change: 'Watch', change_type: 'warning' },
  ],
  agent_reports: [],
};

const DIM_COLORS = ['#6366f1', '#22c55e', '#a855f7', '#f59e0b'];
const DIM_ICONS = ['map', 'cash', 'speedometer', 'extension-puzzle'] as const;

const VERDICT_STYLE: Record<Verdict, { color: string; bg: string }> = {
  INVEST: { color: '#22c55e', bg: 'rgba(34,197,94,0.05)' },
  WATCH: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  PASS: { color: '#ef4444', bg: 'rgba(239,68,68,0.06)' },
  ACQUIRE: { color: '#818cf8', bg: 'rgba(129,140,248,0.08)' },
};

const AGENT_ICONS: Record<number, { icon: any; color: string; bg: string; border: string }> = {
  1: { icon: Search, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
  2: { icon: CircleDollarSign, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
  3: { icon: Sparkles, color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)' },
  4: { icon: Crown, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
};

const DELIVERABLES = [
  {
    key: 'brief', icon: FileText, title: 'Investor Brief',
    sub: '2-page PDF · tl;dr + appendix', color: '#6366f1',
  },
  {
    key: 'questions', icon: FileQuestion, title: 'Questions to Ask',
    sub: '12 sharp questions for the founder', color: '#a855f7',
  },
  {
    key: 'memo', icon: FileEdit, title: 'Deal Memo Draft',
    sub: 'Editable doc · 800 words', color: '#f59e0b',
  },
];

function buildBullets(report: ReportData, key: string): string[] {
  if (key === 'brief') {
    return [
      `Aura Score: ${report.score} / 1000`,
      `Verdict: ${report.verdict}${report.verdict_sub ? ` · ${report.verdict_sub}` : ''}`,
      report.tags[0] ? `Sector: ${report.tags[0]}` : 'Sector: —',
      `Dimensions: ${report.dimensions.map((d) => `${d.name} ${d.score}`).join(' · ')}`,
    ];
  }
  if (key === 'questions') {
    const negatives = report.agent_reports
      .flatMap((r) => r.findings)
      .filter((f) => f.type === 'negative' || f.type === 'warning')
      .slice(0, 4)
      .map((f) => f.text);
    return negatives.length ? negatives : ['Margin path?', 'Unit econ at scale?', 'Cash runway?'];
  }
  return [
    `Thesis · ${report.verdict.toLowerCase()} · ${report.startup_name}`,
    `Market · ${report.tags[0] || 'unknown'}`,
    `Risks · ${report.agent_reports.flatMap((r) => r.findings).filter((f) => f.type !== 'positive').slice(0, 2).map((f) => f.text.slice(0, 40)).join('; ') || 'see findings'}`,
    `Recommendation · ${report.verdict}${report.verdict_sub ? ` · ${report.verdict_sub}` : ''}`,
  ];
}

export default function ReportScreen() {
  const router = useRouter();
  const { name, id } = useLocalSearchParams<{ name: string; id?: string }>();

  const [report, setReport] = useState<ReportData | null>(id ? null : PLACEHOLDER_REPORT);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [expandedCard, setExpandedCard] = useState<number | null>(1);
  const [expandedDeliv, setExpandedDeliv] = useState<string | null>('brief');

  const [score, setScore] = useState(0);
  const stampAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getAnalysis(id)
      .then((a) => {
        if (cancelled) return;
        if (a.report) setReport(a.report);
        else if (a.status === 'failed') {
          setLoadError(a.error || 'Analysis failed.');
          setReport(PLACEHOLDER_REPORT);
        } else {
          setReport(PLACEHOLDER_REPORT);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadError(e?.message || 'Could not load report.');
        setReport(PLACEHOLDER_REPORT);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const target = report?.score ?? 0;
  const startupName = report?.startup_name || name || 'Bykea';

  useEffect(() => {
    if (!report) return;
    const duration = 1500;
    const startTime = Date.now();
    let rafId: number;
    const animateScore = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setScore(Math.round(eased * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(animateScore);
      } else {
        Animated.spring(stampAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }
    };
    rafId = requestAnimationFrame(animateScore);
    return () => cancelAnimationFrame(rafId);
  }, [report, target]);

  const toggleCard = (id: number) => setExpandedCard(expandedCard === id ? null : id);
  const toggleDeliv = (key: string) => setExpandedDeliv(expandedDeliv === key ? null : key);

  const handleDownloadPdf = async () => {
    if (!id) {
      Alert.alert('Error', 'Cannot download report: No analysis ID available.');
      return;
    }
    const pdfUrl = `${API_BASE_URL}/api/analyses/${id}/pdf`;
    try {
      await WebBrowser.openBrowserAsync(pdfUrl);
    } catch (error) {
      Linking.openURL(pdfUrl).catch(() => {
        Alert.alert('Download Failed', 'Could not open the PDF report link.');
      });
    }
  };

  const handleShare = async () => {
    if (!id) return;
    const pdfUrl = `${API_BASE_URL}/api/analyses/${id}/pdf`;
    
    // Natively support clipboard copy on web/browsers since standard OS Share sheets fail there
    if (Platform.OS === 'web') {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(pdfUrl);
          Alert.alert('Link Copied', 'The PDF report link has been copied to your clipboard!');
          return;
        }
      } catch (err) {
        // fallback
      }
    }

    try {
      await Share.share({
        message: `Check out VibeInvest due diligence report for ${startupName}: ${pdfUrl}`,
        url: pdfUrl,
        title: `${startupName} Due Diligence Report`,
      });
    } catch (e) {
      Alert.alert('Share Failed', 'Could not share the due diligence report.');
    }
  };



  if (!report) {
    return (
      <SafeAreaView style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color="#818cf8" />
        <Text style={{ color: 'rgba(255,255,255,0.4)', marginTop: 12, fontSize: 12 }}>
          loading report…
        </Text>
      </SafeAreaView>
    );
  }

  const verdictStyle = VERDICT_STYLE[report.verdict] ?? VERDICT_STYLE.WATCH;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.reportHeader}>
        <TouchableOpacity style={styles.reportBack} onPress={() => router.push('/search')}>
          <Ionicons name="arrow-back" size={14} color="rgba(255,255,255,0.4)" style={{ marginRight: 4 }} />
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Back</Text>
        </TouchableOpacity>
        <View style={styles.reportActions}>
          <TouchableOpacity
            style={styles.downloadPill}
            onPress={handleDownloadPdf}
            accessibilityLabel="Download report PDF"
          >
            <Ionicons name="download-outline" size={14} color="#fff" style={{ marginRight: 5 }} />
            <Text style={styles.pillText}>PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sharePill}
            onPress={handleShare}
            accessibilityLabel="Share report"
          >
            <Ionicons name="share-outline" size={14} color="rgba(255,255,255,0.85)" style={{ marginRight: 5 }} />
            <Text style={styles.pillTextSec}>Share</Text>
          </TouchableOpacity>
        </View>


      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* SCORE REVEAL SECTION */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreEyebrow}>▸ AURA SCORE · FINAL</Text>
          
          <View style={styles.scoreHero}>
            {/* Ambient glow simulation */}
            <View style={styles.glow} />
            <Text style={styles.bigScore}>{score}</Text>
            <Text style={styles.scoreMax}>/ 1000</Text>
          </View>

          {/* Stamp Reveal */}
          <Animated.View style={[
            styles.stampContainer,
            { borderColor: verdictStyle.color, backgroundColor: verdictStyle.bg },
            {
              opacity: stampAnim,
              transform: [
                { scale: stampAnim.interpolate({ inputRange: [0, 1], outputRange: [2, 1] }) },
                { rotate: '-5deg' }
              ]
            }
          ]}>
            <Text style={[styles.stampText, { color: verdictStyle.color }]}>{report.verdict}</Text>
          </Animated.View>

          {report.verdict_sub ? (
            <Animated.View style={[styles.stampSubTextContainer, { opacity: stampAnim }]}>
              <Text style={[styles.stampSubText, { color: verdictStyle.color, opacity: 0.7 }]}>
                {report.verdict_sub}
              </Text>
            </Animated.View>
          ) : null}

          {loadError ? (
            <Text style={{ marginTop: 14, color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
              showing placeholder · {loadError}
            </Text>
          ) : null}
        </View>

        {/* DETAILS OVERVIEW */}
        <View style={styles.startupHero}>
          <View style={styles.startupLogoLg}>
            <Bike color="rgba(255,255,255,0.8)" size={24} />
          </View>
          <View style={styles.startupMeta}>
            <Text style={styles.startupNameLg}>{startupName}</Text>
            <View style={styles.startupTags}>
              {(report.tags.length ? report.tags : ['—']).slice(0, 5).map((t, i) => (
                <Text key={`${t}-${i}`} style={styles.tag}>{t}</Text>
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.rSectionLbl}>DIMENSION SCORES</Text>
        <View style={styles.dimGrid}>
          {report.dimensions.map((d, i) => (
            <DimItem
              key={d.name}
              icon={DIM_ICONS[i] ?? 'analytics'}
              name={d.name}
              score={d.score}
              color={DIM_COLORS[i % DIM_COLORS.length]}
            />
          ))}
        </View>

        <Text style={styles.rSectionLbl}>KEY METRICS</Text>
        <View style={styles.keyMetrics}>
          {report.metrics.length === 0 ? (
            <Text style={{ paddingHorizontal: 20, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
              No metrics surfaced.
            </Text>
          ) : (
            report.metrics.map((m, i) => (
              <MetricCard
                key={`${m.label}-${i}`}
                label={m.label}
                value={m.value}
                change={m.change}
                changeColor={findingColor(m.change_type)}
              />
            ))
          )}
        </View>

        <Text style={styles.rSectionLbl}>AGENT REPORTS</Text>
        <View style={styles.agentReports}>
          {(report.agent_reports.length ? report.agent_reports : []).map((r: AgentReport) => {
            const meta = AGENT_ICONS[r.id] ?? AGENT_ICONS[1];
            const Icon = meta.icon;
            return (
              <AgentCard
                key={r.id}
                id={r.id}
                icon={<Icon color={meta.color} size={18} />}
                iconBg={meta.bg}
                iconBorder={meta.border}
                name={r.name}
                role={r.role}
                badge={r.badge || '—'}
                badgeColor={meta.color}
                badgeBg={meta.bg}
                badgeBorder={meta.border}
                body={r.body}
                findings={r.findings.map((f) => ({ text: f.text, color: findingColor(f.type) }))}
                expanded={expandedCard === r.id}
                onToggle={() => toggleCard(r.id)}
              />
            );
          })}
          {report.agent_reports.length === 0 ? (
            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
              No agent reports yet.
            </Text>
          ) : null}
        </View>

        {/* DELIVERABLES SECTION */}
        <View style={styles.deliverablesHeader}>
          <Text style={styles.rSectionLbl}>DELIVERABLES</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 14 }}>
            <Sparkles size={10} color="#818cf8" />
            <Text style={[styles.cvoAuto, { paddingTop: 0 }]}>CVO AUTO-GENERATED</Text>
          </View>
        </View>
        
        <View style={styles.deliverablesList}>
          {DELIVERABLES.map((d) => {
            const isOpen = expandedDeliv === d.key;
            const bullets = buildBullets(report, d.key);
            return (
              <View key={d.key} style={styles.delivItem}>
                <TouchableOpacity
                  style={[styles.delivHeader, isOpen && styles.delivHeaderOpen, { borderLeftColor: d.color }]}
                  onPress={() => toggleDeliv(d.key)}
                  activeOpacity={0.8}
                >
                  <View style={styles.delivIcon}>
                    <d.icon color={d.color} size={20} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.delivTitle}>{d.title}</Text>
                    <Text style={styles.delivSub}>{d.sub}</Text>
                  </View>
                  <Ionicons name={isOpen ? "remove" : "add"} size={20} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>

                {isOpen && (
                  <View style={[styles.delivBody, { borderLeftColor: d.color }]}>
                    {bullets.map((b, i) => (
                      <View key={i} style={styles.delivBullet}>
                        <Text style={styles.delivNum}>{(i + 1).toString().padStart(2, '0')}</Text>
                        <Text style={styles.delivBulletText}>{b}</Text>
                      </View>
                    ))}

                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.ctaStrip}>
          <TouchableOpacity style={styles.ctaA} onPress={() => router.push('/search')}>
            <Text style={styles.ctaAText}>New Analysis</Text>
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
  <TouchableOpacity style={[styles.arCard, expanded && styles.arCardExpanded]} onPress={onToggle} activeOpacity={0.8}>
    <View style={styles.arHeader}>
      <View style={[styles.arAvatar, { backgroundColor: iconBg, borderColor: iconBorder }]}>{icon}</View>
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
  reportHeader: { paddingHorizontal: 20, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  reportBack: { flexDirection: 'row', alignItems: 'center' },
  reportActions: { flexDirection: 'row', gap: 8 },
  downloadPill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#6366f1', borderWidth: 0.5, borderColor: 'rgba(99,102,241,0.5)', minHeight: 36 },
  sharePill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)', minHeight: 36 },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  pillTextSec: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700' },

  
  // Score Section
  scoreSection: { alignItems: 'center', marginTop: 60, marginBottom: 20 },
  scoreEyebrow: { fontSize: 11, fontWeight: '600', color: '#818cf8', letterSpacing: 1.5, marginBottom: 16 },
  scoreHero: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  glow: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(99,102,241,0.15)', top: '50%', left: '50%', transform: [{ translateX: -140 }, { translateY: -140 }] },
  bigScore: { fontSize: 84, fontWeight: '800', color: '#fff', letterSpacing: -2 },
  scoreMax: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: -10, letterSpacing: 1 },
  
  stampContainer: { marginTop: 20, paddingVertical: 10, paddingHorizontal: 24, borderWidth: 3, borderColor: '#22c55e', borderRadius: 8, backgroundColor: 'rgba(34,197,94,0.05)' },
  stampText: { fontSize: 26, fontWeight: '800', color: '#22c55e', letterSpacing: 3 },
  stampSubTextContainer: { marginTop: 8 },
  stampSubText: { fontSize: 10, fontWeight: '600', color: 'rgba(34,197,94,0.7)', letterSpacing: 1 },

  // Details
  startupHero: { paddingHorizontal: 20, paddingTop: 10, flexDirection: 'row', alignItems: 'center', gap: 14 },
  startupLogoLg: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#1e1b4b', borderWidth: 0.5, borderColor: 'rgba(99,102,241,0.3)', alignItems: 'center', justifyContent: 'center' },
  startupMeta: { flex: 1 },
  startupNameLg: { fontSize: 20, fontWeight: '700', color: '#fff' },
  startupTags: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  tag: { fontSize: 10, paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  
  rSectionLbl: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 10, fontSize: 11, fontWeight: '600', letterSpacing: 1, color: 'rgba(255,255,255,0.3)' },
  
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
  
  // Deliverables
  deliverablesHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 20 },
  cvoAuto: { fontSize: 9, fontWeight: '700', color: '#818cf8', letterSpacing: 0.5, paddingTop: 14 },
  deliverablesList: { paddingHorizontal: 20, gap: 10 },
  delivItem: { marginBottom: 4 },
  delivHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderLeftWidth: 3, borderRadius: 14, padding: 14 },
  delivHeaderOpen: { borderBottomWidth: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, backgroundColor: 'rgba(255,255,255,0.06)' },
  delivIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  delivTitle: { fontSize: 14, fontWeight: '600', color: '#fff' },
  delivSub: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  delivBody: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderTopWidth: 0, borderColor: 'rgba(255,255,255,0.08)', borderLeftWidth: 3, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, padding: 16 },
  delivBullet: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  delivNum: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 },
  delivBulletText: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 18 },
  delivActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  delivBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8 },
  delivBtnText: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },

  ctaStrip: { paddingHorizontal: 20, paddingTop: 30, flexDirection: 'row' },
  ctaA: { flex: 1, padding: 16, borderRadius: 50, backgroundColor: '#6366f1', alignItems: 'center' },
  ctaAText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
