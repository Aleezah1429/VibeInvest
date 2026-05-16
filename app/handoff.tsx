import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertTriangle, ArrowRight, CircleDollarSign, Crown, Search, Sparkles } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Fonts } from '../constants/theme';

// ── Agent Data ──────────────────────────────────────────────
const AGENTS: Record<string, { icon: any; name: string; role: string; color: string }> = {
  skeptic: { icon: Search, name: 'The Skeptic', role: 'Market researcher', color: '#FF6B6B' },
  munshi: { icon: CircleDollarSign, name: 'The Munshi', role: 'Financial analyst', color: '#D4FF3D' },
  hype: { icon: Sparkles, name: 'The Hype', role: 'Brand guru', color: '#A78BFA' },
  cvo: { icon: Crown, name: 'The CVO', role: 'Chief Vibe Officer', color: '#FFC83C' },
};

const AGENT_LIST = [AGENTS.skeptic, AGENTS.munshi, AGENTS.hype, AGENTS.cvo];

interface ChatMessage {
  agent?: string;
  text?: string;
  handoff?: string;
  flag?: boolean;
  final?: boolean;
}

const CHAT_SCRIPT: ChatMessage[] = [
  { agent: 'skeptic', text: 'yo team. did the deep scan. 47 articles, 12 funding rounds reviewed.' },
  { agent: 'skeptic', text: 'competitors: Foodpanda (consumer), Cheetay (DEAD), HungerHut. but Bazaar is B2B kirana → much less crowded.' },
  { agent: 'skeptic', text: 'red flag: logistics burn in tier-2 cities. risk = high.', flag: true },
  { handoff: 'skeptic → munshi' },
  { agent: 'munshi', text: 'okay let me crunch. $50M raised across A & B. GMV ~$200M annualized.' },
  { agent: 'munshi', text: 'burn ~Rs 38M/mo. runway 14 months. tight but viable.' },
  { agent: 'munshi', text: 'margins thin (~6%). need to fix or bleed. but b2b fintech upside is real.' },
  { handoff: 'munshi → hype' },
  { agent: 'hype', text: 'okay slay. B2B kiranas as the target? chef\'s kiss.' },
  { agent: 'hype', text: 'founder ex-Careem = credibility. twitter game: 12k engaged. press: TechCrunch + Reuters.' },
  { agent: 'hype', text: 'brand vibes: trustworthy, gritty, very PK-coded. regional potential.' },
  { handoff: '3 reports → CVO' },
  { agent: 'cvo', text: 'synthesizing. skeptic flagged logistics. munshi confirms margin risk. hype says trust is the moat.' },
  { agent: 'cvo', text: 'weighting risk × upside × vibe…' },
  { agent: 'cvo', text: 'verdict locked. tap to reveal the aura score.', final: true },
];

// ── Chat Bubble ─────────────────────────────────────────────
function ChatBubble({ message }: { message: ChatMessage }) {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0, duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handoff divider
  if (message.handoff) {
    return (
      <Animated.View
        style={[
          styles.handoffRow,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.handoffLine} />
        <Text style={styles.handoffText}>{message.handoff}</Text>
        <View style={styles.handoffLine} />
      </Animated.View>
    );
  }

  const agent = AGENTS[message.agent!];

  return (
    <Animated.View
      style={[
        styles.chatRow,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Avatar */}
      <View style={styles.chatAvatar}>
        <agent.icon color={agent.color} size={16} />
        <View style={[styles.chatAvatarDot, { backgroundColor: agent.color }]} />
      </View>

      {/* Content */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.chatMeta}>
          <Text style={styles.chatName}>{agent.name.replace('The ', '')}</Text>
          <Text style={styles.chatRole}>{agent.role}</Text>
        </View>
        <View
          style={[
            styles.bubble,
            message.final && styles.bubbleFinal,
            message.flag && styles.bubbleFlagged,
          ]}
        >
          {message.flag && (
            <View style={styles.flagBadge}>
              <AlertTriangle size={10} color="#FF6B6B" />
              <Text style={styles.flagBadgeText}>flag</Text>
            </View>
          )}
          <Text
            style={[
              styles.bubbleText,
              message.final && styles.bubbleTextFinal,
            ]}
          >
            {message.text}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ── Main Handoff Screen ─────────────────────────────────────
export default function HandoffScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const startupName = name || 'Bykea';

  const [step, setStep] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (step >= CHAT_SCRIPT.length) return;
    const delay = step === 0 ? 400 : 950;
    const t = setTimeout(() => setStep((s) => s + 1), delay);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [step]);

  const messages = CHAT_SCRIPT.slice(0, step);
  const isDone = step >= CHAT_SCRIPT.length;

  const handleReveal = () => {
    router.replace({ pathname: '/report', params: { name: startupName } });
  };

  const handleSkip = () => {
    router.replace({ pathname: '/report', params: { name: startupName } });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.eyebrow}>agent room · live</Text>
          </View>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>skip →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerMid}>
          <Text style={styles.startupName} numberOfLines={1}>{startupName}</Text>
          <View style={styles.inRoomBadge}>
            <Text style={styles.inRoomText}>4 in room</Text>
          </View>
        </View>

        {/* Stacked avatars */}
        <View style={styles.avatarStack}>
          {AGENT_LIST.map((a, i) => (
            <View
              key={a.name}
              style={[styles.stackAvatar, { marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i }]}
            >
              <a.icon color={a.color} size={12} />
              <View style={[styles.stackDot, { backgroundColor: a.color }]} />
            </View>
          ))}
        </View>
      </View>

      {/* Chat area */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}

        {/* Typing indicator */}
        {!isDone && (
          <View style={styles.typingRow}>
            <View style={{ width: 34 }} />
            <Text style={styles.typingDots}>●●●</Text>
          </View>
        )}
      </ScrollView>

      {/* Reveal CTA */}
      {isDone && (
        <Animated.View style={styles.ctaDock}>
          <TouchableOpacity
            style={styles.revealBtn}
            activeOpacity={0.85}
            onPress={handleReveal}
          >
            <Text style={styles.revealText}>Reveal aura score</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Sparkles size={16} color="white" />
              <ArrowRight size={16} color="white" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

// ── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090F' },

  // Header
  header: {
    paddingHorizontal: 18, paddingTop: 12, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#818cf8',
  },
  eyebrow: {
    fontSize: 10, fontWeight: '600', letterSpacing: 1,
    color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase',
  },
  skipText: {
    fontFamily: Fonts.mono, fontSize: 12, color: 'rgba(255,255,255,0.4)',
  },
  headerMid: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10,
  },
  startupName: {
    fontSize: 18, fontWeight: '700', color: '#fff', flex: 1,
  },
  inRoomBadge: {
    paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  inRoomText: { fontFamily: Fonts.mono, fontSize: 10, color: 'rgba(255,255,255,0.4)' },
  avatarStack: { flexDirection: 'row', marginTop: 10 },
  stackAvatar: {
    width: 24, height: 24, borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  stackDot: {
    position: 'absolute', bottom: -1, right: -1,
    width: 7, height: 7, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#09090F',
  },

  // Chat
  chatArea: { flex: 1 },
  chatContent: { padding: 18, paddingBottom: 30 },
  chatRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  chatAvatar: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  chatAvatarDot: {
    position: 'absolute', bottom: -2, right: -2,
    width: 9, height: 9, borderRadius: 5,
    borderWidth: 1.5, borderColor: '#09090F',
  },
  chatMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  chatName: { fontSize: 12, fontWeight: '600', color: '#fff' },
  chatRole: { fontFamily: Fonts.mono, fontSize: 9, color: 'rgba(255,255,255,0.35)' },

  // Bubble
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14, borderTopLeftRadius: 4,
    paddingVertical: 10, paddingHorizontal: 14,
  },
  bubbleFinal: {
    backgroundColor: '#6366f1', borderColor: '#6366f1',
  },
  bubbleFlagged: {
    borderColor: 'rgba(255,107,107,0.45)',
  },
  bubbleText: { fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.8)' },
  bubbleTextFinal: { color: '#0A0A0C', fontWeight: '600' },

  // Flag badge
  flagBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 2, paddingHorizontal: 8,
    borderRadius: 4, backgroundColor: 'rgba(255,107,107,0.15)',
    marginBottom: 6,
  },
  flagBadgeText: { fontSize: 9, fontWeight: '600', color: '#FF6B6B', textTransform: 'uppercase' },

  // Handoff divider
  handoffRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginVertical: 14,
  },
  handoffLine: {
    flex: 1, height: 1,
    borderWidth: 0.5, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.12)',
  },
  handoffText: {
    fontFamily: Fonts.mono, fontSize: 9, letterSpacing: 0.5,
    color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
  },

  // Typing
  typingRow: { flexDirection: 'row', gap: 10, paddingVertical: 6 },
  typingDots: {
    fontFamily: Fonts.mono, fontSize: 12, color: 'rgba(255,255,255,0.25)',
  },

  // CTA
  ctaDock: {
    paddingHorizontal: 18, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  revealBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 10, paddingVertical: 17,
    backgroundColor: '#6366f1', borderRadius: 50,
  },
  revealText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  revealIcon: { fontSize: 18 },
});
