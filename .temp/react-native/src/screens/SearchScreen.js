import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, radius, typography } from '../theme';

const INTENTS = ['Invest', 'Acquire', 'Research', 'Partner'];

const RECENT = [
  { name: 'Bykea', logo: '🛵', logoBg: '#1a1a2e', meta: 'Mobility · Seed · 3 days ago', score: 712 },
  { name: 'Bazaar', logo: '🛒', logoBg: '#0d1b0d', meta: 'B2B Commerce · Series A · 1 week ago', score: 841 },
];

export default function SearchScreen({ navigation }) {
  const [name, setName] = useState('');
  const [intent, setIntent] = useState('Invest');
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('');
  const [funding, setFunding] = useState('');
  const [concern, setConcern] = useState('');

  const onAnalyze = () => {
    navigation.navigate('Loading', { startup: name || 'Bykea' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={16} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>New Analysis</Text>
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
          <Icon name="search" size={18} color="rgba(255,255,255,0.3)" />
          <TextInput
            style={styles.searchInput}
            placeholder="e.g. Airlift, Bykea, Bazaar..."
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Intent */}
        <Text style={styles.sectionLabel}>Your intent</Text>
        <View style={styles.intentRow}>
          {INTENTS.map((opt) => {
            const active = intent === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.intentBtn, active && styles.intentBtnActive]}
                onPress={() => setIntent(opt)}
              >
                <Text style={[styles.intentText, active && styles.intentTextActive]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Detail fields */}
        <Text style={styles.sectionLabel}>Additional context (optional)</Text>
        <View style={styles.fields}>
          <View style={styles.fieldRow2}>
            <Field label="Sector" placeholder="Fintech, Agri..." value={sector} onChange={setSector} />
            <Field label="Stage" placeholder="Seed, Series A..." value={stage} onChange={setStage} />
          </View>
          <Field
            label="Known funding (PKR / USD)"
            placeholder="e.g. $2M raised, 2023"
            value={funding}
            onChange={setFunding}
          />
          <Field
            label="Your concern / focus area"
            placeholder="e.g. Worried about burn rate post-layoffs..."
            value={concern}
            onChange={setConcern}
          />
        </View>

        {/* Recent reports */}
        <Text style={styles.sectionLabel}>Recent reports</Text>
        <View style={styles.recentList}>
          {RECENT.map((r) => (
            <TouchableOpacity
              key={r.name}
              style={styles.recentItem}
              onPress={() => navigation.navigate('Report', { startup: r.name })}
            >
              <View style={[styles.recentLogo, { backgroundColor: r.logoBg }]}>
                <Text style={{ fontSize: 16 }}>{r.logo}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.recentName}>{r.name}</Text>
                <Text style={styles.recentMeta}>{r.meta}</Text>
              </View>
              <Text style={styles.recentScore}>{r.score}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Analyze CTA */}
        <View style={styles.analyzeArea}>
          <TouchableOpacity style={styles.btnAnalyze} onPress={onAnalyze} activeOpacity={0.85}>
            <Icon name="zap" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.btnAnalyzeText}>Run Due Diligence</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, placeholder, value, onChange }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.2)"
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  topBar: { paddingHorizontal: 20, paddingTop: 20, flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: { fontSize: 15, fontWeight: typography.weight.semibold, color: 'rgba(255,255,255,0.8)' },

  hero: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  heroH: { fontSize: 22, fontWeight: typography.weight.bold, color: colors.text, lineHeight: 29 },
  heroAccent: { color: colors.primaryLight },
  heroP: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6, lineHeight: 20 },

  searchBox: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.4)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 12 },

  sectionLabel: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    fontSize: 11,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
  },

  intentRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20 },
  intentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  intentBtnActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  intentText: { color: 'rgba(255,255,255,0.45)', fontSize: 12 },
  intentTextActive: { color: colors.primaryLight },

  fields: { paddingHorizontal: 20, gap: 10 },
  fieldRow2: { flexDirection: 'row', gap: 10 },
  field: { flex: 1, gap: 6 },
  fieldLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  fieldInput: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: colors.text,
    fontSize: 13,
  },

  recentList: { paddingHorizontal: 20, gap: 8 },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
  },
  recentLogo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentName: { fontSize: 13, fontWeight: typography.weight.semibold, color: colors.text },
  recentMeta: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 },
  recentScore: { fontSize: 12, fontWeight: typography.weight.bold, color: colors.primaryLight },

  analyzeArea: { padding: 20 },
  btnAnalyze: {
    flexDirection: 'row',
    paddingVertical: 17,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAnalyzeText: { color: '#fff', fontSize: 15, fontWeight: typography.weight.semibold },
});
