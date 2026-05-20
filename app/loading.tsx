import { useLocalSearchParams, useRouter } from 'expo-router';
import { Banknote, CircleDollarSign, Crown, Search, Sparkles } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Fonts } from '../constants/theme';
import { createAnalysis, getAnalysis } from '../services/api';
import { consumePendingAnalysis } from '../services/pendingAnalysis';
import { useToast } from '../context/ToastContext';
import type { AnalysisDetail } from '../services/types';

const POLL_INTERVAL_MS = 1500;
const FAKE_TICK_MS = 3200;
const AGENT_KEYS = ['skeptic', 'munshi', 'hype', 'cvo'] as const;

// ── Agent Data ──────────────────────────────────────────────
const AGENTS = [
  {
    key: 'skeptic',
    icon: Search,
    name: 'The Skeptic',
    role: 'Market researcher',
    color: '#FF6B6B',
    sayings: [
      'let me scan the web for receipts…',
      'found 4 competitors already doing this',
      'market saturation: HIGH 🚩',
      'logistics burn rate is gonna sting',
    ],
  },
  {
    key: 'munshi',
    icon: CircleDollarSign,
    name: 'The Munshi',
    role: 'Financial analyst (PKR)',
    color: '#D4FF3D',
    sayings: [
      'okay let me pull out the calculator…',
      'CAC: Rs 480 · LTV: Rs 1,920 → 4× ratio',
      'burn rate Rs 38M/mo. runway ≈ 14 months.',
      'unit economics: barely working. fix margins.',
    ],
  },
  {
    key: 'hype',
    icon: Sparkles,
    name: 'The Hype',
    role: 'Brand guru (Gen Z)',
    color: '#A78BFA',
    sayings: [
      'okay slay let me cook…',
      'logo is mid but the name slaps',
      'founder twitter? 12k engaged followers ✅',
      'tagline could go viral. wrote 3 options.',
    ],
  },
  {
    key: 'cvo',
    icon: Crown,
    name: 'The CVO',
    role: 'Chief Vibe Officer',
    color: '#FFC83C',
    sayings: [
      'synthesizing reports from all 3 agents…',
      'resolving conflicts: Skeptic vs Hype',
      'weighting risk × upside × vibe…',
      'verdict locked in. revealing aura score.',
    ],
  },
];

// ── Skeptic Scene ───────────────────────────────────────────
function SkepticScene() {
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const lines = [
    'GET techcrunch.com/bazaar-funding ... 200',
    'PARSING "bazaar raises $70M B" ✓',
    '> founder: ex-careem ........... [✓]',
    '> competitor: foodpanda ....... [active]',
    '⚠ competitor: cheetay ....... [SHUT 2023]',
    'PARSING reuters.com/bazaar-b2b ... ✓',
    '> market saturation PK b2b .... low',
    'FETCH dealstreetasia.com ......... ✓',
    '⚠ risk flag: logistics burn tier-2',
    'PARSING crunchbase.com/bazaar ... ✓',
    '> 47 articles · 12 risks surfaced',
    'GET twitter.com/founder ......... 200',
    '> twitter activity: 87 posts/mo',
    '⚠ risk flag: margin erosion q3',
    'CROSS-REF investors: tiger, defy ✓',
  ];

  useEffect(() => {
    Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateY = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -lines.length * 18],
  });

  return (
    <View style={sceneStyles.skepticStage}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {[...lines, ...lines].map((l, i) => (
          <Text
            key={i}
            style={[
              sceneStyles.intelLine,
              l.startsWith('⚠') && sceneStyles.flagLine,
            ]}
          >
            {l}
          </Text>
        ))}
      </Animated.View>
      {/* Scanline overlay effect */}
      <View style={sceneStyles.skepticOverlay} />
      {/* Magnifier indicator */}
      <PulsingDot color="#FF6B6B" style={{ position: 'absolute', top: 16, right: 16 }} />
    </View>
  );
}

// ── Munshi Scene ────────────────────────────────────────────
function MunshiScene() {
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const [tick, setTick] = useState('Rs 38.4M');

  const lines = [
    'GMV annualized ............ Rs 56.0B',
    'CAC per kirana ............ Rs 480',
    'LTV (24mo) ................ Rs 1,920',
    'LTV / CAC .................. 4.0×  ✓',
    'gross margin .............. 6.2%   ⚠',
    'net margin ................ -3.1%  ⚠',
    'monthly burn .............. Rs 38.4M',
    'cash on hand .............. Rs 540M',
    'runway .................... 14 mo',
    'series A val .............. $50M',
    'series B val .............. $300M',
    'fintech upside (BNPL) ..... +3× rev',
    'unit econ verdict ......... viable',
  ];

  useEffect(() => {
    Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: 1,
        duration: 7000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    const burns = ['Rs 38.4M', 'Rs 41.2M', 'Rs 39.8M', 'Rs 42.1M', 'Rs 40.6M'];
    let i = 0;
    const id = setInterval(() => {
      setTick(burns[i % burns.length]);
      i++;
    }, 380);
    return () => clearInterval(id);
  }, []);

  const translateY = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -lines.length * 18],
  });

  return (
    <View style={sceneStyles.munshiStage}>
      <Animated.View style={{ transform: [{ translateY }], paddingHorizontal: 14, paddingTop: 12 }}>
        {[...lines, ...lines].map((l, i) => (
          <Text
            key={i}
            style={[
              sceneStyles.calcLine,
              l.includes('⚠') && sceneStyles.calcNeg,
              l.includes('verdict') && sceneStyles.calcTotal,
            ]}
          >
            {l}
          </Text>
        ))}
      </Animated.View>
      {/* Burn rate counter */}
      <View style={sceneStyles.burnCounter}>
        <View>
          <Text style={sceneStyles.burnLabel}>LIVE BURN RATE</Text>
          <Text style={sceneStyles.burnValue}>
            {tick}<Text style={sceneStyles.burnUnit}>/mo</Text>
          </Text>
        </View>
        <Banknote color="#110D0D" size={28} />
      </View>
    </View>
  );
}

// ── Hype Scene ──────────────────────────────────────────────
function HypeScene() {
  const glitchAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnims = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glitchAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(glitchAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.delay(2000),
      ])
    ).start();

    sparkleAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 300),
          Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  const sparkPositions = [
    { top: 22, left: 50 },
    { top: 154, left: 68 },
    { top: 44, left: 265 },
    { top: 121, left: 289 },
    { top: 84, left: 27 },
  ];

  return (
    <View style={sceneStyles.hypeStage}>
      {sparkPositions.map((pos, i) => (
        <Animated.Text
          key={i}
          style={[
            sceneStyles.sparkle,
            { top: pos.top, left: pos.left },
            {
              opacity: sparkleAnims[i],
              transform: [{
                scale: sparkleAnims[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.4, 1.4],
                }),
              }],
            },
          ]}
        >
          ✦
        </Animated.Text>
      ))}
      <Animated.Text
        style={[
          sceneStyles.glitchText,
          {
            transform: [{
              translateX: glitchAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, -3, 3],
              }),
            }],
          },
        ]}
      >
        ICONIC
      </Animated.Text>
      <View style={sceneStyles.hypeStats}>
        <Text style={sceneStyles.hypeStat}>{'>'} scraping social...</Text>
        <Text style={[sceneStyles.hypeStat, { color: '#A78BFA' }]}>● 12.4k followers</Text>
      </View>
      <View style={sceneStyles.hypeBottom}>
        <Text style={sceneStyles.hypeStat}>brand sentiment +84%</Text>
        <Text style={sceneStyles.hypeStat}>founder trust 9/10</Text>
      </View>
    </View>
  );
}

// ── CVO Scene ───────────────────────────────────────────────
function CVOScene() {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const nodeAnims = useRef(
    Array.from({ length: 3 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    nodeAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 400),
          Animated.timing(anim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  const nodeIcons = [Search, CircleDollarSign, Sparkles];
  const nodePositions = [
    { top: 20, left: 20 },
    { top: 20, right: 20 },
    { bottom: 20, alignSelf: 'center' as const },
  ];

  return (
    <View style={sceneStyles.cvoStage}>
      {/* Rotating ring */}
      <Animated.View
        style={[
          sceneStyles.cvoRing,
          {
            transform: [{
              rotate: spinAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            }],
          },
        ]}
      />
      <View style={sceneStyles.cvoCrown}>
        <Crown color="#FFC83C" size={32} />
      </View>

      {/* Orbiting nodes */}
      {nodeIcons.map((_, i) => (
        <Animated.View
          key={i}
          style={[
            sceneStyles.cvoNode,
            i === 0 && { top: 20, left: 20 },
            i === 1 && { top: 20, right: 20 },
            i === 2 && { bottom: 20, left: '42%' },
            {
              opacity: nodeAnims[i].interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 0.3, 1],
              }),
              transform: [{
                scale: nodeAnims[i].interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 0.6, 1],
                }),
              }],
            },
          ]}
        >
          {(() => {
            const IconComp = nodeIcons[i];
            return <IconComp color="#fff" size={18} />;
          })()}
        </Animated.View>
      ))}

      <View style={sceneStyles.cvoStats}>
        <Text style={sceneStyles.cvoStatText}>{'>'} synthesizing 47 datapoints</Text>
        <Text style={[sceneStyles.cvoStatText, { color: '#FFC83C' }]}>● weighing</Text>
      </View>
      <View style={sceneStyles.cvoBottom}>
        <Text style={sceneStyles.cvoStatText}>resolving 3 conflicts...</Text>
        <Text style={sceneStyles.cvoStatText}>verdict pending</Text>
      </View>
    </View>
  );
}

// ── Shared: Pulsing Dot ─────────────────────────────────────
function PulsingDot({ color, style }: { color: string; style?: object }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[
        { width: 10, height: 10, borderRadius: 5, backgroundColor: color },
        { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
        style,
      ]}
    />
  );
}

// ── Scene Map ───────────────────────────────────────────────
const SCENES: Record<string, React.FC> = {
  skeptic: SkepticScene,
  munshi: MunshiScene,
  hype: HypeScene,
  cvo: CVOScene,
};

// ── Main Screen ─────────────────────────────────────────────
export default function LoadingScreen() {
  const router = useRouter();
  const { name, id: paramId } = useLocalSearchParams<{ name: string; id?: string }>();
  const startupName = name || 'Bykea';
  const toast = useToast();

  // `realId` starts as whatever the URL had (legacy direct nav); otherwise it
  // is filled in once the createAnalysis POST we kick off here resolves.
  const [realId, setRealId] = useState<string | undefined>(paramId);
  const id = realId;
  const [agentIdx, setAgentIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasRealRun, setHasRealRun] = useState<boolean>(!!paramId);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const consecutiveFailures = useRef(0);

  // Fire createAnalysis in the background. The dashboard navigated here
  // immediately and parked the payload in the pendingAnalysis store — so the
  // user sees the boardroom animation while the POST is still in flight.
  // On failure we bounce back to the dashboard so the user doesn't sit
  // through a fake agent ticker for a run that never started.
  useEffect(() => {
    if (paramId) return; // already have an id (e.g. legacy direct nav)
    const pending = consumePendingAnalysis();
    if (!pending) return; // no pending payload → demo/fake flow keeps running
    let cancelled = false;
    createAnalysis(pending)
      .then((analysis) => {
        if (!cancelled) setRealId(analysis.id);
      })
      .catch((err: any) => {
        if (cancelled) return;
        const raw = err?.message || 'Could not start analysis.';
        let msg = raw;
        const i = raw.indexOf('{');
        if (i !== -1) {
          try {
            const parsed = JSON.parse(raw.slice(i));
            if (parsed?.detail) msg = String(parsed.detail);
          } catch {
            // not JSON; keep raw
          }
        }
        toast.show(msg, { type: 'error', title: 'ANALYSIS FAILED' });
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [paramId, toast, router]);

  const handleDone = useCallback(() => {
    router.replace({ pathname: '/handoff', params: { name: startupName, ...(id ? { id } : {}) } });
  }, [router, startupName, id]);

  const handleSkip = useCallback(() => {
    router.replace({ pathname: '/report', params: { name: startupName, ...(id ? { id } : {}) } });
  }, [router, startupName, id]);

  // Pulse the per-agent progress bar so the UI feels alive even when
  // the backend hasn't ticked yet. This drives only the visual fill —
  // agentIdx itself is driven by either the poller or the fake timer.
  useEffect(() => {
    setProgress(0);
    progressAnim.setValue(0);
    const dur = hasRealRun ? 6000 : FAKE_TICK_MS;
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: dur,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
    const start = Date.now();
    const id2 = setInterval(() => {
      setProgress(Math.min(1, (Date.now() - start) / dur));
    }, 80);
    return () => clearInterval(id2);
  }, [agentIdx, hasRealRun]);

  // No id → original timer-driven demo (e.g. opened directly).
  useEffect(() => {
    if (id) return;
    const t = setTimeout(() => {
      if (agentIdx < AGENTS.length - 1) {
        setAgentIdx((p) => p + 1);
      } else {
        handleDone();
      }
    }, FAKE_TICK_MS + 350);
    return () => clearTimeout(t);
  }, [agentIdx, id, handleDone]);

  // Real run → poll the backend; drive scene from agent_runs progress.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      try {
        const a: AnalysisDetail = await getAnalysis(id);
        if (cancelled) return;
        setHasRealRun(true);
        consecutiveFailures.current = 0; // reset failures on success

        // Pick the visible agent: latest 'running' run, or last 'done' run.
        const runs = a.progress || [];
        const runningIdx = runs.findIndex((r) => r.status === 'running');
        const lastDone = runs
          .filter((r) => r.status === 'done')
          .reduce((m, r) => Math.max(m, r.agent_id), 0);
        const nextIdx =
          runningIdx >= 0
            ? Math.max(0, runs[runningIdx].agent_id - 1)
            : Math.min(AGENTS.length - 1, Math.max(0, lastDone));
        if (nextIdx !== agentIdx) setAgentIdx(nextIdx);

        if (a.status === 'completed') {
          handleDone();
          return;
        }
        if (a.status === 'failed') {
          toast.show('Our CVO flagged a major issue. Analysis failed.', { type: 'error', title: 'ANALYSIS RUN FAILED' });
          handleSkip();
          return;
        }
      } catch (err: any) {
        consecutiveFailures.current += 1;
        if (consecutiveFailures.current === 3) {
          toast.show('Backend connection unstable. Retrying...', { type: 'warning', title: 'CONNECTION INTERRUPTED' });
        } else if (consecutiveFailures.current >= 8) {
          toast.show('Lost connection to analysis server. Returning to report.', { type: 'error', title: 'CONNECTION LOST' });
          handleSkip();
          return;
        }
      }
      if (!cancelled) timeoutHandle = setTimeout(tick, POLL_INTERVAL_MS);
    };

    tick();
    return () => {
      cancelled = true;
      if (timeoutHandle) clearTimeout(timeoutHandle);
    };
  }, [id, agentIdx, handleDone, handleSkip]);

  const agent = AGENTS[agentIdx];
  const Scene = SCENES[agent.key];
  const sayingIdx = Math.min(
    Math.floor(progress * agent.sayings.length),
    agent.sayings.length - 1
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.eyebrow}>▸ step 02 · agents working</Text>
        <Text style={styles.counter}>{agentIdx + 1} / {AGENTS.length}</Text>
      </View>

      {/* Target badge */}
      <View style={styles.targetRow}>
        <View style={styles.targetBadge}>
          <Text style={styles.targetText}>target → {startupName.toLowerCase()}</Text>
        </View>
      </View>

      {/* Agent Header */}
      <View style={styles.agentHeader}>
        <View style={styles.agentAvatarWrap}>
          <View style={[styles.agentAvatar, { borderColor: 'rgba(255,255,255,0.15)' }]}>
            <agent.icon color={agent.color} size={28} />
          </View>
          <View style={[styles.agentDot, { backgroundColor: agent.color }]} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.agentRole, { color: agent.color }]}>
            {agent.role.toLowerCase()}
          </Text>
          <Text style={styles.agentName}>{agent.name.toLowerCase()}</Text>
        </View>
      </View>

      {/* Agent saying */}
      <View style={styles.sayingRow}>
        <Text style={styles.saying}>
          {agent.sayings[sayingIdx]}
          <Text style={styles.cursor}>▎</Text>
        </Text>
      </View>

      {/* Scene */}
      <View style={styles.sceneWrap}>
        <Scene />
      </View>

      {/* Progress strips */}
      <View style={styles.progressStrip}>
        {AGENTS.map((a, i) => (
          <View key={a.key} style={styles.progressSegment}>
            <View style={styles.progressTrack}>
              {i < agentIdx ? (
                <View style={[styles.progressFill, { width: '100%', backgroundColor: a.color }]} />
              ) : i === agentIdx ? (
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: a.color,
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              ) : null}
            </View>
            <Text
              style={[
                styles.progressName,
                i <= agentIdx ? { color: '#fff' } : { color: 'rgba(255,255,255,0.3)' },
              ]}
            >
              {a.name.replace('The ', '')}
            </Text>
          </View>
        ))}
      </View>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.hintText}>{'>'} 4 agents · ~12s irl</Text>
      </View>
    </SafeAreaView>
  );
}

// ── Scene Styles ────────────────────────────────────────────
const sceneStyles = StyleSheet.create({
  // Skeptic
  skepticStage: {
    width: '100%', height: 220, borderRadius: 22,
    backgroundColor: '#110D0D', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden', paddingHorizontal: 14, paddingTop: 12,
  },
  skepticOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,107,107,0.03)',
  },
  intelLine: {
    fontFamily: Fonts.mono, fontSize: 10, lineHeight: 18,
    color: 'rgba(255,255,255,0.4)',
  },
  flagLine: { color: '#FF6B6B', fontWeight: '600' },

  // Munshi
  munshiStage: {
    width: '100%', height: 220, borderRadius: 22,
    backgroundColor: '#0D110A', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  calcLine: {
    fontFamily: Fonts.mono, fontSize: 10.5, lineHeight: 18,
    color: 'rgba(34,197,94,0.65)',
  },
  calcNeg: { color: '#FF6B6B' },
  calcTotal: { color: '#D4FF3D', fontWeight: '600' },
  burnCounter: {
    position: 'absolute', bottom: 14, left: 14, right: 14,
    backgroundColor: '#D4FF3D', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  burnLabel: {
    fontFamily: Fonts.mono, fontSize: 9, letterSpacing: 1,
    color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase',
  },
  burnValue: { fontSize: 24, fontWeight: '700', color: '#0A0A0C', marginTop: 2 },
  burnUnit: { fontSize: 13, opacity: 0.6 },

  // Hype
  hypeStage: {
    width: '100%', height: 220, borderRadius: 22,
    backgroundColor: '#15101F', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
  },
  glitchText: {
    fontSize: 52, fontWeight: '800', color: '#fff',
    letterSpacing: -2, fontStyle: 'italic',
  },
  sparkle: {
    position: 'absolute', fontSize: 14, color: '#A78BFA',
  },
  hypeStats: {
    position: 'absolute', top: 14, left: 14, right: 14,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  hypeStat: { fontFamily: Fonts.mono, fontSize: 10, color: 'rgba(167,139,250,0.7)' },
  hypeBottom: {
    position: 'absolute', bottom: 14, left: 14, right: 14,
    flexDirection: 'row', justifyContent: 'space-between',
  },

  // CVO
  cvoStage: {
    width: '100%', height: 220, borderRadius: 22,
    backgroundColor: '#0A0A0C', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
  },
  cvoRing: {
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 4, borderColor: '#FFC83C',
    opacity: 0.4,
  },
  cvoCrown: {
    position: 'absolute', fontSize: 40,
  },
  cvoNode: {
    position: 'absolute', width: 38, height: 38, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  cvoStats: {
    position: 'absolute', top: 14, left: 14, right: 14,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  cvoStatText: { fontFamily: Fonts.mono, fontSize: 10, color: 'rgba(255,255,255,0.35)' },
  cvoBottom: {
    position: 'absolute', bottom: 14, left: 14, right: 14,
    flexDirection: 'row', justifyContent: 'space-between',
  },
});

// ── Main Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090F' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16,
  },
  eyebrow: {
    fontSize: 10, fontWeight: '600', letterSpacing: 1,
    color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase',
  },
  counter: { fontFamily: Fonts.mono, fontSize: 11, color: 'rgba(255,255,255,0.35)' },
  targetRow: { paddingHorizontal: 20, marginTop: 14 },
  targetBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 5, paddingHorizontal: 12,
    borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  targetText: { fontFamily: Fonts.mono, fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  agentHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, marginTop: 18,
  },
  agentAvatarWrap: { position: 'relative' },
  agentAvatar: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  agentDot: {
    position: 'absolute', bottom: -2, right: -2,
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 2, borderColor: '#09090F',
  },
  agentRole: { fontSize: 10, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  agentName: { fontSize: 24, fontWeight: '700', color: '#fff', marginTop: 2 },
  sayingRow: { paddingHorizontal: 20, marginTop: 14 },
  saying: { fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 20 },
  cursor: { color: '#6366f1', fontSize: 14 },
  sceneWrap: { paddingHorizontal: 20, marginTop: 20, flex: 1 },
  progressStrip: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 20, marginTop: 14,
  },
  progressSegment: { flex: 1 },
  progressTrack: {
    height: 3, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 99, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 99 },
  progressName: {
    fontFamily: Fonts.mono, fontSize: 9, marginTop: 4,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  bottomBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 20,
  },
  hintText: { fontFamily: Fonts.mono, fontSize: 11, color: 'rgba(255,255,255,0.25)' },
});
