import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme';

type Props = {
  startupName: string;
  onComplete: () => void;
};

type StepState = 'idle' | 'running' | 'done';

type AgentRow = {
  name: string;
  emoji: string;
  bg: string;
  border: string;
  idleTask: string;
};

// Matches the HTML 1:1: same colors, same emojis, same idle copy.
const AGENTS: AgentRow[] = [
  { name: 'The Skeptic', emoji: '🔍', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', idleTask: 'Scanning market & competitors...' },
  { name: 'The Munshi',  emoji: '💰', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)',  idleTask: 'Queued — awaiting market data' },
  { name: 'The Hype',    emoji: '✨', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)', idleTask: 'Queued — brand & positioning' },
  { name: 'The CVO',     emoji: '👑', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', idleTask: 'Orchestrating final verdict' },
];

// Same setTimeout schedule as the HTML's startAnalysis(): time-from-start (ms) and the resulting
// snapshot of (per-agent task text, per-agent state, progress%, progress label, progress %txt).
type Snapshot = {
  tasks: [string, string, string, string];
  states: [StepState, StepState, StepState, StepState];
  pct: number;
  pLabel: string;
};

const SCHEDULE: Array<{ at: number; snap: Snapshot }> = [
  {
    at: 0,
    snap: {
      tasks: ['Scanning market & competitors...', 'Queued — awaiting market data', 'Queued — brand & positioning', 'Orchestrating final verdict'],
      states: ['running', 'idle', 'idle', 'idle'],
      pct: 0, pLabel: 'Skeptic analyzing...',
    },
  },
  {
    at: 900,
    snap: {
      tasks: ['Identifying 14 competitors...', 'Queued — awaiting market data', 'Queued — brand & positioning', 'Orchestrating final verdict'],
      states: ['running', 'idle', 'idle', 'idle'],
      pct: 0, pLabel: 'Skeptic analyzing...',
    },
  },
  {
    at: 2000,
    snap: {
      tasks: ['Market analysis done', 'Pulling PKR financials...', 'Queued — brand & positioning', 'Orchestrating final verdict'],
      states: ['done', 'running', 'idle', 'idle'],
      pct: 28, pLabel: 'Munshi crunching numbers...',
    },
  },
  {
    at: 3400,
    snap: {
      tasks: ['Market analysis done', 'Unit economics checked', 'Evaluating brand equity...', 'Orchestrating final verdict'],
      states: ['done', 'done', 'running', 'idle'],
      pct: 55, pLabel: 'Hype assessing brand...',
    },
  },
  {
    at: 4600,
    snap: {
      tasks: ['Market analysis done', 'Unit economics checked', 'Brand report ready', 'Writing final verdict...'],
      states: ['done', 'done', 'done', 'running'],
      pct: 78, pLabel: 'CVO deliberating...',
    },
  },
  {
    at: 5800,
    snap: {
      tasks: ['Market analysis done', 'Unit economics checked', 'Brand report ready', 'Verdict delivered'],
      states: ['done', 'done', 'done', 'done'],
      pct: 100, pLabel: 'Report ready',
    },
  },
];

const TOTAL_MS = 6600; // matches HTML: final showScreen at 6600ms

export default function Loading({ startupName, onComplete }: Props) {
  const [snap, setSnap] = useState<Snapshot>(SCHEDULE[0].snap);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const step of SCHEDULE) {
      if (step.at === 0) continue;
      timers.push(setTimeout(() => setSnap(step.snap), step.at));
    }
    timers.push(setTimeout(onComplete, TOTAL_MS));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: snap.pct,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [snap.pct, progress]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>LIVE ANALYSIS</Text>
        </View>
        <Text style={styles.h}>Running due diligence on</Text>
        <Text style={styles.startupName}>{startupName}</Text>
        <Text style={styles.sub}>4 agents are working simultaneously</Text>

        <View style={styles.pipeline}>
          {AGENTS.map((a, i) => (
            <AgentRowView
              key={a.name}
              agent={a}
              task={snap.tasks[i]}
              state={snap.states[i]}
            />
          ))}
        </View>

        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>{snap.pLabel}</Text>
            <Text style={styles.progressLabel}>{snap.pct}%</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function AgentRowView({
  agent, task, state,
}: { agent: AgentRow; task: string; state: StepState }) {
  const rowStyle = [
    styles.apRow,
    state === 'running' && styles.apRowActive,
    state === 'done' && styles.apRowDone,
  ];
  const taskStyle = [
    styles.apTask,
    state === 'running' && styles.apTaskRunning,
    state === 'done' && styles.apTaskDone,
    state === 'idle' && styles.apTaskIdle,
  ];
  return (
    <View style={rowStyle}>
      <View style={[styles.apAvatar, { backgroundColor: agent.bg, borderColor: agent.border }]}>
        <Text style={styles.apEmoji}>{agent.emoji}</Text>
      </View>
      <View style={styles.apInfo}>
        <Text style={styles.apName}>{agent.name}</Text>
        <Text style={taskStyle}>{task}</Text>
      </View>
      <Indicator state={state} />
    </View>
  );
}

function Indicator({ state }: { state: StepState }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state !== 'running') return;
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale,   { toValue: 1.8, duration: 840,  useNativeDriver: true, easing: Easing.out(Easing.ease) }),
          Animated.timing(scale,   { toValue: 1.0, duration: 360,  useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0,   duration: 840,  useNativeDriver: true, easing: Easing.out(Easing.ease) }),
          Animated.timing(opacity, { toValue: 0,   duration: 360,  useNativeDriver: true }),
        ]),
      ]),
    );
    opacity.setValue(1);
    scale.setValue(1);
    loop.start();
    return () => loop.stop();
  }, [state, scale, opacity]);

  const colorMap = {
    idle: 'rgba(255,255,255,0.15)',
    running: colors.brand,
    done: colors.success,
  } as const;

  return (
    <View style={[styles.ind, { backgroundColor: colorMap[state] }]}>
      {state === 'running' && (
        <Animated.View
          style={[
            styles.indPing,
            { backgroundColor: colors.brand, opacity, transform: [{ scale }] },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  container: {
    flex: 1,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, paddingVertical: 40,
  },
  badge: {
    backgroundColor: colors.dangerBgHi,
    borderWidth: 1, borderColor: colors.dangerBorderTop,
    paddingVertical: 6, paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    color: colors.danger,
    fontSize: 11, fontWeight: '600', letterSpacing: 0.5,
  },
  h: {
    fontSize: 20, fontWeight: '700',
    color: colors.textPrimary, textAlign: 'center',
    marginBottom: 6,
  },
  startupName: {
    fontSize: 28, fontWeight: '800',
    color: colors.brandSoft, textAlign: 'center',
    marginBottom: 6,
  },
  sub: {
    fontSize: 13, color: colors.textHint,
    textAlign: 'center', marginBottom: 36,
  },

  pipeline: { width: '100%', gap: 10 },
  apRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 13, paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 0.5, borderColor: colors.border,
    backgroundColor: colors.surfaceLow,
  },
  apRowActive: {
    borderColor: colors.brandBorderStrong,
    backgroundColor: colors.brandTintBg,
  },
  apRowDone: {
    borderColor: colors.successBorderTop,
    backgroundColor: colors.successBg,
  },
  apAvatar: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 0.5,
    alignItems: 'center', justifyContent: 'center',
  },
  apEmoji: { fontSize: 17 },
  apInfo: { flex: 1 },
  apName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  apTask: { fontSize: 11, marginTop: 1 },
  apTaskIdle: { color: colors.textTrace },
  apTaskRunning: { color: colors.brandSoft },
  apTaskDone: { color: colors.success },

  ind: {
    width: 8, height: 8, borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  indPing: {
    position: 'absolute',
    width: 8, height: 8, borderRadius: 4,
  },

  progressWrap: { width: '100%', marginTop: 28 },
  progressTrack: {
    width: '100%', height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 50, overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand,
    borderRadius: 50,
  },
  progressLabels: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: { fontSize: 11, color: colors.textWhisper },
});
