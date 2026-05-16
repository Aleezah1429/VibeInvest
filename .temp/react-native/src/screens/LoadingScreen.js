import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated, Easing } from 'react-native';
import { colors, radius, typography } from '../theme';

// Agent pipeline stages. status: 'idle' | 'running' | 'done'
const INITIAL_AGENTS = [
  { id: 1, name: 'The Skeptic',  emoji: '🔍', tint: 'danger',  task: 'Scanning market & competitors...', status: 'running' },
  { id: 2, name: 'The Munshi',   emoji: '💰', tint: 'success', task: 'Queued — awaiting market data',    status: 'idle'    },
  { id: 3, name: 'The Hype',     emoji: '✨', tint: 'purple',  task: 'Queued — brand & positioning',     status: 'idle'    },
  { id: 4, name: 'The CVO',      emoji: '👑', tint: 'warning', task: 'Orchestrating final verdict',      status: 'idle'    },
];

const STEPS = [
  { d: 900,  apply: (a) => upd(a, 1, 'Identifying 14 competitors...', 'running'),                                   pct: 10, label: 'Skeptic analyzing...' },
  { d: 2000, apply: (a) => upd(upd(a, 1, 'Market analysis done', 'done'), 2, 'Pulling PKR financials...', 'running'), pct: 28, label: 'Munshi crunching numbers...' },
  { d: 3400, apply: (a) => upd(upd(a, 2, 'Unit economics checked', 'done'), 3, 'Evaluating brand equity...', 'running'), pct: 55, label: 'Hype assessing brand...' },
  { d: 4600, apply: (a) => upd(upd(a, 3, 'Brand report ready', 'done'), 4, 'Writing final verdict...', 'running'),  pct: 78, label: 'CVO deliberating...' },
  { d: 5800, apply: (a) => upd(a, 4, 'Verdict delivered', 'done'),                                                  pct: 100, label: 'Report ready' },
];

function upd(arr, id, task, status) {
  return arr.map((a) => (a.id === id ? { ...a, task, status } : a));
}

export default function LoadingScreen({ navigation, route }) {
  const startup = route?.params?.startup || 'Bykea';
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [pct, setPct] = useState(0);
  const [label, setLabel] = useState('Skeptic analyzing...');
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timers = STEPS.map((s) =>
      setTimeout(() => {
        setAgents((a) => s.apply(a));
        setPct(s.pct);
        setLabel(s.label);
        Animated.timing(progressAnim, {
          toValue: s.pct,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
      }, s.d)
    );
    const goTimer = setTimeout(() => {
      navigation.replace('Report', { startup });
    }, 6600);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(goTimer);
    };
  }, [navigation, progressAnim, startup]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>LIVE ANALYSIS</Text>
      </View>

      <Text style={styles.h}>Running due diligence on</Text>
      <Text style={styles.startup}>{startup}</Text>
      <Text style={styles.sub}>4 agents are working simultaneously</Text>

      <View style={styles.pipeline}>
        {agents.map((a) => (
          <AgentRow key={a.id} agent={a} />
        ))}
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={styles.progressLabel}>{pct}%</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function AgentRow({ agent }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (agent.status !== 'running') return;
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [agent.status, pulse]);

  const tint = TINTS[agent.tint];
  const rowStyle = [
    styles.apRow,
    agent.status === 'running' && styles.apRowActive,
    agent.status === 'done' && styles.apRowDone,
  ];
  const taskStyle = [
    styles.apTask,
    agent.status === 'running' && styles.apTaskRunning,
    agent.status === 'done' && styles.apTaskDone,
  ];

  const indColor =
    agent.status === 'running'
      ? colors.primary
      : agent.status === 'done'
      ? colors.success
      : 'rgba(255,255,255,0.15)';

  return (
    <View style={rowStyle}>
      <View style={[styles.apAvatar, { backgroundColor: tint.bg, borderColor: tint.border }]}>
        <Text style={{ fontSize: 17 }}>{agent.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.apName}>{agent.name}</Text>
        <Text style={taskStyle}>{agent.task}</Text>
      </View>
      <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
        {agent.status === 'running' && (
          <Animated.View
            style={[
              styles.apPing,
              {
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
              },
            ]}
          />
        )}
        <View style={[styles.apInd, { backgroundColor: indColor }]} />
      </View>
    </View>
  );
}

const TINTS = {
  danger:  { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)' },
  success: { bg: 'rgba(34,197,94,0.10)',  border: 'rgba(34,197,94,0.20)' },
  purple:  { bg: 'rgba(168,85,247,0.10)', border: 'rgba(168,85,247,0.20)' },
  warning: { bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.20)' },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  badge: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.30)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: { color: colors.danger, fontSize: 11, fontWeight: typography.weight.semibold, letterSpacing: 0.5 },

  h: { fontSize: 20, fontWeight: typography.weight.bold, color: colors.text, textAlign: 'center', marginBottom: 6 },
  startup: { fontSize: 28, fontWeight: typography.weight.extrabold, color: colors.primaryLight, marginBottom: 6 },
  sub: { fontSize: 13, color: colors.textDim, marginBottom: 36 },

  pipeline: { width: '100%', gap: 10 },
  apRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: colors.borderSoft,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  apRowActive: { borderColor: 'rgba(99,102,241,0.4)', backgroundColor: 'rgba(99,102,241,0.07)' },
  apRowDone: { borderColor: 'rgba(34,197,94,0.30)', backgroundColor: 'rgba(34,197,94,0.05)' },
  apAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apName: { fontSize: 13, fontWeight: typography.weight.semibold, color: colors.text },
  apTask: { fontSize: 11, marginTop: 1, color: colors.textFaint },
  apTaskRunning: { color: colors.primaryLight },
  apTaskDone: { color: colors.success },
  apInd: { position: 'absolute', width: 8, height: 8, borderRadius: 4 },
  apPing: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },

  progressWrap: { width: '100%', marginTop: 28 },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.pill },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressLabel: { fontSize: 11, color: 'rgba(255,255,255,0.3)' },
});
