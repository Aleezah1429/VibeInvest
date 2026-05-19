import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Animated, Easing } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { FileText, FileQuestion, FileEdit, Bike, Search, CircleDollarSign, Sparkles } from 'lucide-react-native';
import { useDueDiligence } from '../context/DueDiligenceContext';


const DELIVERABLES = [
  {
    key: 'brief', icon: FileText, title: 'Investor Brief',
    sub: '2-page PDF · tl;dr + appendix', color: '#6366f1',
    bullets: [
      'Aura Score: 712 / 1000',
      'Verdict: INVEST',
      'Stage: Series A',
      'Suggested check size: $250k–$500k',
    ],
  },
  {
    key: 'questions', icon: FileQuestion, title: 'Questions to Ask',
    sub: '12 sharp questions for the founder', color: '#a855f7',
    bullets: [
      'How do you plan to push margins above 10%?',
      'When do tier-2 cities turn unit-econ positive?',
      'What\'s your dollar-denominated raise hedge?',
    ],
  },
  {
    key: 'memo', icon: FileEdit, title: 'Deal Memo Draft',
    sub: 'Editable doc · 800 words', color: '#f59e0b',
    bullets: [
      'Thesis · why now',
      'Market · B2C Mobility',
      'Risks · FX mismatch, logistics',
      'Recommendation · INVEST · with conditions',
    ],
  },
];

export default function ReportScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const startupName = name || 'Bykea';
  const { results, finalScore } = useDueDiligence();

  const [expandedCard, setExpandedCard] = useState<number | null>(1);
  const [expandedDeliv, setExpandedDeliv] = useState<string | null>('brief');

  const [score, setScore] = useState(0);
  const stampAnim = useRef(new Animated.Value(0)).current;

  const targetScore = finalScore !== null ? finalScore : 712;

  let verdict = 'INVEST';
  let verdictSub = 'WITH CONDITIONS';
  let stampColor = '#22c55e'; // Green for invest

  if (finalScore !== null) {
    if (finalScore >= 800) {
      verdict = 'INVEST';
      verdictSub = 'WITH CONDITIONS';
      stampColor = '#22c55e';
    } else if (finalScore >= 600) {
      verdict = 'WATCH';
      verdictSub = 'MONITOR RISK';
      stampColor = '#f59e0b';
    } else {
      verdict = 'PASS';
      verdictSub = 'HIGH RISK';
      stampColor = '#ef4444';
    }
  }

  useEffect(() => {
    // Animate score from 0 to targetScore
    let start = 0;
    const duration = 1500;
    const startTime = Date.now();
    
    const animateScore = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setScore(Math.round(eased * targetScore));
      
      if (progress < 1) {
        requestAnimationFrame(animateScore);
      } else {
        Animated.spring(stampAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }
    };
    requestAnimationFrame(animateScore);
  }, [targetScore]);

  const toggleCard = (id: number) => setExpandedCard(expandedCard === id ? null : id);
  const toggleDeliv = (key: string) => setExpandedDeliv(expandedDeliv === key ? null : key);


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
            {
              borderColor: stampColor,
              opacity: stampAnim,
              transform: [
                { scale: stampAnim.interpolate({ inputRange: [0, 1], outputRange: [2, 1] }) },
                { rotate: '-5deg' }
              ]
            }
          ]}>
            <Text style={[styles.stampText, { color: stampColor }]}>{verdict}</Text>
          </Animated.View>
          
          <Animated.View style={[styles.stampSubTextContainer, { opacity: stampAnim }]}>
             <Text style={[styles.stampSubText, { color: stampColor }]}>{verdictSub}</Text>
          </Animated.View>
        </View>

        {/* DETAILS OVERVIEW */}
        <View style={styles.startupHero}>
          <View style={styles.startupLogoLg}>
            <Bike color="rgba(255,255,255,0.8)" size={24} />
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
          <MetricCard label="Monthly GMV" value="₨ 2.4B" change="Growing" changeColor="#22c55e" />
          <MetricCard label="Burn rate / mo" value="$180K" change="High risk" changeColor="#ef4444" />
          <MetricCard label="Runway est." value="14 mo" change="Watch" changeColor="#f59e0b" />
        </View>

        <Text style={styles.rSectionLbl}>AGENT REPORTS</Text>
        <View style={styles.agentReports}>
          {(() => {
            const skepticData = results.find(r => r.agent.toLowerCase().includes('skeptic'));
            const munshiData = results.find(r => r.agent.toLowerCase().includes('munshi'));
            const hypeData = results.find(r => r.agent.toLowerCase().includes('hype'));
            const cvoData = results.find(r => r.agent.toLowerCase().includes('cvo'));

            const skepticBody = skepticData?.summary || "Bykea operates in a market with significant structural risk — two-wheel mobility faces regulatory uncertainty.";
            const munshiBody = munshiData?.summary || "Unit economics are solid but PKR devaluation has impacted USD-denominated burn.";
            const hypeBody = hypeData?.summary || "Strong brand signals, founder credibility, and customer acquisition viral loops.";
            const cvoBody = cvoData?.summary || "Synthesized analysis indicates a strong candidate for conditional investment.";

            return (
              <>
                <AgentCard
                  id={1} icon={<Search color="#ef4444" size={18} />} iconBg="rgba(239,68,68,0.1)" iconBorder="rgba(239,68,68,0.2)"
                  name="The Skeptic" role="Market & competition"
                  badge={skepticData ? "Gathered" : "3 flags"} badgeColor={skepticData ? "#22c55e" : "#ef4444"} badgeBg={skepticData ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.12)"} badgeBorder={skepticData ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.25)"}
                  body={skepticBody}
                  findings={[
                    { text: "InDrive entered PK market Q3 2023", color: "#ef4444" },
                    { text: "Lahore expansion stalled since 2022", color: "#f59e0b" }
                  ]}
                  expanded={expandedCard === 1} onToggle={() => toggleCard(1)}
                />
                <AgentCard
                  id={2} icon={<CircleDollarSign color="#22c55e" size={18} />} iconBg="rgba(34,197,94,0.08)" iconBorder="rgba(34,197,94,0.2)"
                  name="The Munshi" role="Financial analysis"
                  badge={munshiData ? "Calculated" : "Borderline"} badgeColor={munshiData ? "#22c55e" : "#fbbf24"} badgeBg={munshiData ? "rgba(34,197,94,0.1)" : "rgba(251,191,36,0.12)"} badgeBorder={munshiData ? "rgba(34,197,94,0.2)" : "rgba(251,191,36,0.25)"}
                  body={munshiBody}
                  findings={[
                    { text: "LTV:CAC of 5.8x — above minimum threshold", color: "#22c55e" },
                    { text: "FX mismatch: costs in USD, revenue in PKR", color: "#ef4444" }
                  ]}
                  expanded={expandedCard === 2} onToggle={() => toggleCard(2)}
                />
                <AgentCard
                  id={3} icon={<Sparkles color="#a855f7" size={18} />} iconBg="rgba(168,85,247,0.08)" iconBorder="rgba(168,85,247,0.2)"
                  name="The Hype" role="Brand & sentiment"
                  badge={hypeData ? "Analyzed" : "Slaying"} badgeColor={hypeData ? "#22c55e" : "#a855f7"} badgeBg={hypeData ? "rgba(34,197,94,0.1)" : "rgba(168,85,247,0.12)"} badgeBorder={hypeData ? "rgba(34,197,94,0.2)" : "rgba(168,85,247,0.25)"}
                  body={hypeBody}
                  findings={[
                    { text: "Founder Twitter footprint: 12k highly engaged", color: "#22c55e" },
                    { text: "Product reviews positive, minor app crash reports", color: "#fbbf24" }
                  ]}
                  expanded={expandedCard === 3} onToggle={() => toggleCard(3)}
                />
                <AgentCard
                  id={4} icon={<Ionicons name="crown-outline" color="#fbbf24" size={18} />} iconBg="rgba(251,191,36,0.08)" iconBorder="rgba(251,191,36,0.2)"
                  name="The CVO" role="Verdict & scoring"
                  badge={cvoData ? "Decision Locked" : "Synthesizing"} badgeColor={cvoData ? "#22c55e" : "#fbbf24"} badgeBg={cvoData ? "rgba(34,197,94,0.1)" : "rgba(251,191,36,0.12)"} badgeBorder={cvoData ? "rgba(34,197,94,0.2)" : "rgba(251,191,36,0.25)"}
                  body={cvoBody}
                  findings={[
                    { text: `Final score computed: ${targetScore}/1000`, color: "#22c55e" },
                    { text: "Risk adjusted recommendations generated", color: "#6366f1" }
                  ]}
                  expanded={expandedCard === 4} onToggle={() => toggleCard(4)}
                />
              </>
            );
          })()}
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
                    {d.bullets.map((b, i) => (
                      <View key={i} style={styles.delivBullet}>
                        <Text style={styles.delivNum}>{(i + 1).toString().padStart(2, '0')}</Text>
                        <Text style={styles.delivBulletText}>{b}</Text>
                      </View>
                    ))}
                    <View style={styles.delivActions}>
                      <TouchableOpacity style={styles.delivBtn}>
                        <Ionicons name="download-outline" size={14} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.delivBtnText}>Download</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.delivBtn}>
                        <Ionicons name="share-outline" size={14} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.delivBtnText}>Share</Text>
                      </TouchableOpacity>
                    </View>
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
  iconBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  
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
