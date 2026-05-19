import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createAnalysis, listAnalyses } from '../services/api';
import type { AnalysisSummary } from '../services/types';

const INTENT_OPTIONS = ['Invest', 'Acquire', 'Research', 'Partner'];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function SearchScreen() {
  const router = useRouter();
  const [intent, setIntent] = useState('Invest');
  const [startupName, setStartupName] = useState('');
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('');
  const [funding, setFunding] = useState('');
  const [concern, setConcern] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recent, setRecent] = useState<AnalysisSummary[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listAnalyses(6)
      .then((rows) => {
        if (!cancelled) setRecent(rows);
      })
      .catch(() => {
        // Backend may not be running — fall through to empty state.
      })
      .finally(() => {
        if (!cancelled) setRecentLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAnalyze = async () => {
    const name = startupName.trim();
    if (!name) {
      Alert.alert('Missing name', 'Enter a startup name to analyze.');
      return;
    }
    setSubmitting(true);
    try {
      const analysis = await createAnalysis({
        name,
        intent: intent.toLowerCase(),
        sector: sector.trim() || undefined,
        stage: stage.trim() || undefined,
        funding: funding.trim() || undefined,
        context: concern.trim() || undefined,
      });
      router.push({ pathname: '/loading', params: { id: analysis.id, name } });
    } catch (e: any) {
      Alert.alert('Could not start analysis', e?.message ?? 'Backend not reachable.');
    } finally {
      setSubmitting(false);
    }
  };

  const openRecent = (a: AnalysisSummary) => {
    if (a.status === 'completed') {
      router.push({ pathname: '/report', params: { id: a.id, name: a.startup_name } });
    } else if (a.status === 'failed') {
      Alert.alert('Analysis failed', `${a.startup_name} did not complete.`);
    } else {
      router.push({ pathname: '/loading', params: { id: a.id, name: a.startup_name } });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <Text style={styles.screenTitleSm}>New Analysis</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.searchHero}>
          <Text style={styles.searchHeroH}>
            Which startup are you{'\n'}<Text style={styles.searchHeroHSpan}>researching?</Text>
          </Text>
          <Text style={styles.searchHeroP}>Enter a name and fill in what you know. Our agents will do the rest.</Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.3)" />
          <TextInput
            style={styles.searchInput}
            placeholder="e.g. Airlift, Bykea, Bazaar..."
            placeholderTextColor="rgba(255,255,255,0.25)"
            value={startupName}
            onChangeText={setStartupName}
            autoCapitalize="words"
            editable={!submitting}
          />
        </View>

        <Text style={styles.sectionLbl}>YOUR INTENT</Text>
        <View style={styles.intentRow}>
          {INTENT_OPTIONS.map((i) => (
            <TouchableOpacity
              key={i}
              style={[styles.intentBtn, intent === i && styles.intentBtnActive]}
              onPress={() => setIntent(i)}
              disabled={submitting}
            >
              <Text style={[styles.intentBtnText, intent === i && styles.intentBtnTextActive]}>{i}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLbl}>ADDITIONAL CONTEXT (OPTIONAL)</Text>
        <View style={styles.detailFields}>
          <View style={styles.fieldRow2}>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Sector</Text>
              <TextInput style={styles.fieldInput} value={sector} onChangeText={setSector} placeholder="Fintech, Agri..." placeholderTextColor="rgba(255,255,255,0.2)" editable={!submitting} />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Stage</Text>
              <TextInput style={styles.fieldInput} value={stage} onChangeText={setStage} placeholder="Seed, Series A..." placeholderTextColor="rgba(255,255,255,0.2)" editable={!submitting} />
            </View>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Known funding (PKR / USD)</Text>
            <TextInput style={styles.fieldInput} value={funding} onChangeText={setFunding} placeholder="e.g. $2M raised, 2023" placeholderTextColor="rgba(255,255,255,0.2)" editable={!submitting} />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Your concern / focus area</Text>
            <TextInput style={styles.fieldInput} value={concern} onChangeText={setConcern} placeholder="e.g. Worried about burn rate..." placeholderTextColor="rgba(255,255,255,0.2)" editable={!submitting} />
          </View>
        </View>

        <Text style={styles.sectionLbl}>RECENT REPORTS</Text>
        <View style={styles.recentList}>
          {recentLoading ? (
            <View style={styles.recentEmpty}><ActivityIndicator color="rgba(255,255,255,0.4)" /></View>
          ) : recent.length === 0 ? (
            <View style={styles.recentEmpty}>
              <Text style={styles.recentEmptyText}>No analyses yet. Run your first above.</Text>
            </View>
          ) : (
            recent.map((a) => (
              <TouchableOpacity key={a.id} style={styles.recentItem} onPress={() => openRecent(a)}>
                <View style={[styles.recentLogo, { backgroundColor: '#1a1a2e' }]}>
                  <Text style={{ fontSize: 16 }}>{a.status === 'completed' ? '📊' : a.status === 'failed' ? '⚠️' : '⏳'}</Text>
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName}>{a.startup_name}</Text>
                  <Text style={styles.recentMeta}>
                    {(a.intent || 'invest').toUpperCase()} · {a.status} · {timeAgo(a.created_at)}
                  </Text>
                </View>
                <Text style={styles.recentScore}>{a.score ?? '—'}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.analyzeArea}>
          <TouchableOpacity style={[styles.btnAnalyze, submitting && styles.btnAnalyzeDisabled]} onPress={handleAnalyze} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="sparkles" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.btnAnalyzeText}>Run Due Diligence</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090F' },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 10 },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  screenTitleSm: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  searchHero: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },
  searchHeroH: { fontSize: 22, fontWeight: '700', color: '#fff', lineHeight: 28 },
  searchHeroHSpan: { color: '#818cf8' },
  searchHeroP: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6, lineHeight: 18 },
  searchBox: { marginHorizontal: 20, marginTop: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.4)', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15, padding: 0 },
  sectionLbl: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, fontSize: 11, letterSpacing: 1, color: 'rgba(255,255,255,0.3)' },
  intentRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20 },
  intentBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 10, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)', alignItems: 'center' },
  intentBtnActive: { borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.15)' },
  intentBtnText: { color: 'rgba(255,255,255,0.45)', fontSize: 12 },
  intentBtnTextActive: { color: '#818cf8' },
  detailFields: { paddingHorizontal: 20, gap: 10 },
  fieldRow: { gap: 6, flex: 1 },
  fieldRow2: { flexDirection: 'row', gap: 10 },
  fieldLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  fieldInput: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14, color: '#fff', fontSize: 13 },
  recentList: { paddingHorizontal: 20, gap: 8 },
  recentItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12 },
  recentLogo: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  recentInfo: { flex: 1 },
  recentName: { fontSize: 13, fontWeight: '600', color: '#fff' },
  recentMeta: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  recentScore: { fontSize: 12, fontWeight: '700', color: '#818cf8' },
  recentEmpty: { paddingVertical: 20, alignItems: 'center' },
  recentEmptyText: { fontSize: 12, color: 'rgba(255,255,255,0.3)' },
  analyzeArea: { padding: 20, marginTop: 10 },
  btnAnalyze: { flexDirection: 'row', width: '100%', paddingVertical: 17, backgroundColor: '#6366f1', borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  btnAnalyzeDisabled: { opacity: 0.6 },
  btnAnalyzeText: { color: '#fff', fontSize: 15, fontWeight: '600' }
});
