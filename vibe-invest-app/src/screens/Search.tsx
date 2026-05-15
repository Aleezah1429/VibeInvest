import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme';

type Intent = 'Invest' | 'Acquire' | 'Research' | 'Partner';

type Props = {
  startupName: string;
  setStartupName: (s: string) => void;
  onBack: () => void;
  onAnalyze: () => void;
  onSelectRecent: (name: string) => void;
};

type Recent = {
  name: string;
  emoji: string;
  bg: string;
  meta: string;
  score: number;
};

const RECENT: Recent[] = [
  { name: 'Bykea',  emoji: '🛵', bg: colors.cardDark,  meta: 'Mobility · Seed · 3 days ago',          score: 712 },
  { name: 'Bazaar', emoji: '🛒', bg: colors.cardGreen, meta: 'B2B Commerce · Series A · 1 week ago',  score: 841 },
];

const INTENTS: Intent[] = ['Invest', 'Acquire', 'Research', 'Partner'];

export default function Search({
  startupName, setStartupName, onBack, onAnalyze, onSelectRecent,
}: Props) {
  const [intent, setIntent] = useState<Intent>('Invest');

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable style={styles.backBtn} onPress={onBack}>
            <Feather name="arrow-left" size={16} color={colors.textMuted} />
          </Pressable>
          <Text style={styles.screenTitle}>New Analysis</Text>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroH}>
            Which startup are you{'\n'}
            <Text style={styles.heroAccent}>researching?</Text>
          </Text>
          <Text style={styles.heroP}>
            Enter a name and fill in what you know. Our agents will do the rest.
          </Text>
        </View>

        {/* Search box */}
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color={colors.textWhisper} />
          <TextInput
            style={styles.searchInput}
            placeholder="e.g. Airlift, Bykea, Bazaar..."
            placeholderTextColor={colors.textTrace}
            value={startupName}
            onChangeText={setStartupName}
            autoCorrect={false}
          />
        </View>

        <Text style={styles.sectionLbl}>Your intent</Text>
        <View style={styles.intentRow}>
          {INTENTS.map((it) => {
            const active = intent === it;
            return (
              <Pressable
                key={it}
                onPress={() => setIntent(it)}
                style={[styles.intentBtn, active && styles.intentBtnActive]}
              >
                <Text style={[styles.intentText, active && styles.intentTextActive]}>{it}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLbl}>Additional context (optional)</Text>
        <View style={styles.fields}>
          <View style={styles.fieldRow2}>
            <Field label="Sector" placeholder="Fintech, Agri..." />
            <Field label="Stage" placeholder="Seed, Series A..." />
          </View>
          <Field label="Known funding (PKR / USD)" placeholder="e.g. $2M raised, 2023" full />
          <Field label="Your concern / focus area" placeholder="e.g. Worried about burn rate post-layoffs..." full />
        </View>

        <Text style={styles.sectionLbl}>Recent reports</Text>
        <View style={styles.recentList}>
          {RECENT.map((r) => (
            <Pressable key={r.name} style={styles.recentItem} onPress={() => onSelectRecent(r.name)}>
              <View style={[styles.recentLogo, { backgroundColor: r.bg }]}>
                <Text style={styles.recentEmoji}>{r.emoji}</Text>
              </View>
              <View style={styles.recentInfo}>
                <Text style={styles.recentName}>{r.name}</Text>
                <Text style={styles.recentMeta}>{r.meta}</Text>
              </View>
              <Text style={styles.recentScore}>{r.score}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.analyzeArea}>
          <Pressable style={styles.btnAnalyze} onPress={onAnalyze}>
            <MaterialCommunityIcons name="creation" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.btnAnalyzeText}>Run Due Diligence</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type FieldProps = { label: string; placeholder: string; full?: boolean };
function Field({ label, placeholder, full }: FieldProps) {
  return (
    <View style={[styles.fieldCol, full && { flex: undefined, width: '100%' }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        placeholder={placeholder}
        placeholderTextColor={colors.textGhost}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 24 },

  topBar: {
    paddingTop: 20, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.surfaceTop,
    borderWidth: 0.5, borderColor: colors.borderTop,
    alignItems: 'center', justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 15, fontWeight: '600', color: colors.textSecondary,
  },

  hero: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  heroH: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, lineHeight: 28 },
  heroAccent: { color: colors.brandSoft },
  heroP: { fontSize: 13, color: colors.textFaint, marginTop: 6, lineHeight: 20 },

  searchBox: {
    marginHorizontal: 20, marginTop: 20,
    backgroundColor: colors.surfaceHi,
    borderWidth: 1, borderColor: colors.brandBorderStrong,
    borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  searchInput: {
    flex: 1, color: colors.textPrimary, fontSize: 15, padding: 0,
  },

  sectionLbl: {
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10,
    fontSize: 11, letterSpacing: 1,
    color: colors.textWhisper,
    textTransform: 'uppercase',
  },

  intentRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 4 },
  intentBtn: {
    flex: 1, paddingVertical: 10, paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 0.5, borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceMid,
    alignItems: 'center',
  },
  intentBtnActive: {
    borderColor: colors.brand,
    backgroundColor: colors.brandTintHi,
  },
  intentText: { fontSize: 12, color: colors.textDimmer },
  intentTextActive: { color: colors.brandSoft },

  fields: { paddingHorizontal: 20, gap: 10 },
  fieldRow2: { flexDirection: 'row', gap: 10 },
  fieldCol: { flex: 1, gap: 6 },
  fieldLabel: { fontSize: 12, color: colors.textFaint },
  fieldInput: {
    backgroundColor: colors.surfaceMid,
    borderWidth: 0.5, borderColor: colors.borderStrong,
    borderRadius: 10,
    paddingVertical: 11, paddingHorizontal: 14,
    color: colors.textPrimary, fontSize: 13,
  },

  recentList: { paddingHorizontal: 20, gap: 8 },
  recentItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 14,
    backgroundColor: colors.surfaceMid,
    borderWidth: 0.5, borderColor: colors.border,
    borderRadius: 12,
  },
  recentLogo: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  recentEmoji: { fontSize: 16 },
  recentInfo: { flex: 1 },
  recentName: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  recentMeta: { fontSize: 11, color: colors.textHint, marginTop: 1 },
  recentScore: { fontSize: 12, fontWeight: '700', color: colors.brandSoft },

  analyzeArea: { padding: 20 },
  btnAnalyze: {
    flexDirection: 'row',
    paddingVertical: 17,
    backgroundColor: colors.brand,
    borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  btnAnalyzeText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
