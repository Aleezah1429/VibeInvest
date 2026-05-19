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
import { CircleDollarSign, Crown, LucideIcon, Search, Sparkles } from 'lucide-react-native';

// Shared tokens — mirror app/index.tsx so the screen feels of-a-piece.
const T = {
  bg: '#08080d',
  ink: '#ffffff',
  dim: 'rgba(255,255,255,0.56)',
  faint: 'rgba(255,255,255,0.36)',
  line: 'rgba(255,255,255,0.07)',
  line2: 'rgba(255,255,255,0.12)',
  purple: '#9550ee',
  purpleSoft: 'rgba(149,80,238,0.18)',
  purpleEdge: 'rgba(149,80,238,0.45)',
  purpleInk: '#d6c0ff',
};
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string;

type Agent = {
  Icon: LucideIcon;
  color: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
};

const AGENTS: Agent[] = [
  {
    Icon: Search,
    color: '#FF6B6B',
    name: 'The Skeptic',
    role: 'Risk · Red flags',
    description:
      "Reads the market before you write the cheque. Searches for direct + indirect competitors in Pakistan, scores how saturated the space already is, and flags the things that should make you walk away. Won't sugarcoat — if three competitors are already raising Series B in your sector, you'll hear it plainly.",
    capabilities: [
      'Names direct + indirect competitors with sources',
      'Scores market saturation 1–10',
      'Surfaces three red flags you would miss',
      'Raises a kill_signal on dead-saturated markets',
    ],
  },
  {
    Icon: CircleDollarSign,
    color: '#D4FF3D',
    name: 'The Munshi',
    role: 'Financials · Unit econ',
    description:
      "Pakistan's financial analyst. Crunches unit economics, burn rate, and break-even in PKR using real local market rates — Karachi dev salaries, Lahore co-working desks, the current USD/PKR. If a number is off by an order of magnitude, the Munshi will call it out.",
    capabilities: [
      'Unit economics (revenue, cost, gross margin)',
      'Realistic Year-1 revenue projection',
      'Burn rate (PKR/month) and runway',
      'Break-even months · financial red flags',
    ],
  },
  {
    Icon: Sparkles,
    color: '#A78BFA',
    name: 'The Hype',
    role: 'Brand · Sentiment',
    description:
      "Brand strategist with main-character energy. Generates three taglines, three pitch deck fixes, and a soft-launch playbook tuned for Pakistan — LinkedIn, university WhatsApp groups (LUMS, NUST, IBA, FAST), founder Twitter. Honest about cringe.",
    capabilities: [
      'Three tagline options (no filler)',
      'Brand vibe direction',
      'Three pitch deck fixes (verbs only)',
      'Pakistan-specific soft-launch strategy',
    ],
  },
  {
    Icon: Crown,
    color: '#FFC83C',
    name: 'The CVO',
    role: 'Verdict · Synthesis',
    description:
      "Chief Vibe Officer. Synthesizes the three upstream reports into a single verdict. Names the contradictions across agents, weighs the tradeoffs, and outputs the Aura Score plus the three things to fix next. The grown-up in the room.",
    capabilities: [
      'Aura Score (0–1000)',
      'Verdict: Invest · Iterate · Pivot · Pass',
      'Dimensional scores: Market · Money · Brand · Strategy',
      'Three top fixes, each starts with a verb',
    ],
  },
];

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={s.header}>
      <TouchableOpacity
        onPress={onBack}
        style={s.backBtn}
        accessibilityLabel="Back"
        hitSlop={10}
      >
        <Ionicons name="chevron-back" size={22} color={T.ink} />
      </TouchableOpacity>
      <Text style={s.headerTitle}>How agents work</Text>
      <View style={{ width: 44 }} />
    </View>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <View style={s.cardOuter}>
      <LinearGradient
        colors={['rgba(255,255,255,0.045)', 'rgba(255,255,255,0.012)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={s.card}
      >
        <View style={s.cardHead}>
          <View
            style={[
              s.iconBubble,
              { backgroundColor: `${agent.color}1f`, borderColor: `${agent.color}55` },
            ]}
          >
            <agent.Icon size={20} color={agent.color} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.agentName}>{agent.name}</Text>
            <Text style={s.agentRole}>{agent.role.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={s.description}>{agent.description}</Text>

        <View style={s.capList}>
          <Text style={s.capEyebrow}>◢ WHAT IT PRODUCES</Text>
          {agent.capabilities.map((cap) => (
            <View key={cap} style={s.capRow}>
              <View style={[s.capDot, { backgroundColor: agent.color }]} />
              <Text style={s.capText}>{cap}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}

export default function HowTheyWorkScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={s.screen}>
      <Header onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.intro}>
          <Text style={s.introEyebrow}>◢ THE PIPELINE</Text>
          <Text style={s.introTitle}>
            Four agents. <Text style={{ color: T.dim }}>One verdict.</Text>
          </Text>
          <Text style={s.introBody}>
            Each VibeInvest run streams through four specialised agents in sequence — Skeptic
            → Munshi → Hype → CVO. They share notes, contradict each other when it matters,
            and end with a single Aura Score and a punchy verdict.
          </Text>
        </View>

        {AGENTS.map((a, i) => (
          <View key={a.name} style={{ paddingHorizontal: 20, marginBottom: 14 }}>
            <View style={s.stepRow}>
              <Text style={s.stepNumber}>0{i + 1}</Text>
              {i < AGENTS.length - 1 && <View style={s.stepLine} />}
            </View>
            <AgentCard agent={a} />
          </View>
        ))}

        <View style={{ height: 16 }} />
        <Text style={s.footer}>◢ END · PIPELINE</Text>
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
  backBtn: {
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

  // scroll
  scroll: { paddingBottom: 36 },

  // intro
  intro: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 22 },
  introEyebrow: {
    fontFamily: MONO,
    fontSize: 9.5,
    color: T.faint,
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: T.ink,
    letterSpacing: -0.6,
    lineHeight: 28,
  },
  introBody: {
    marginTop: 10,
    fontSize: 13,
    color: T.dim,
    lineHeight: 20,
  },

  // step indicator
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontFamily: MONO,
    fontSize: 11,
    color: T.purpleInk,
    letterSpacing: 1.4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: T.purpleSoft,
    borderWidth: 1,
    borderColor: T.purpleEdge,
  },
  stepLine: {
    flex: 1,
    height: 1,
    marginLeft: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: T.line2,
    borderStyle: 'dashed',
  },

  // card
  cardOuter: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: T.line2,
    overflow: 'hidden',
  },
  card: {
    padding: 16,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  agentName: {
    color: T.ink,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  agentRole: {
    fontFamily: MONO,
    fontSize: 10,
    color: T.faint,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: T.dim,
    marginBottom: 14,
  },

  // capabilities
  capList: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: T.line2,
    borderStyle: 'dashed',
    gap: 6,
  },
  capEyebrow: {
    fontFamily: MONO,
    fontSize: 9,
    color: T.faint,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  capRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  capDot: {
    width: 5,
    height: 5,
    borderRadius: 5,
  },
  capText: {
    color: T.dim,
    fontSize: 12.5,
    lineHeight: 18,
    flex: 1,
  },

  // footer
  footer: {
    fontFamily: MONO,
    fontSize: 9.5,
    color: T.faint,
    letterSpacing: 1.4,
    textAlign: 'center',
  },
});
