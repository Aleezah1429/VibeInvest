import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDueDiligence } from '../context/DueDiligenceContext';

export default function SearchScreen() {
  const router = useRouter();
  const { startAnalysis } = useDueDiligence();
  const [intent, setIntent] = useState('Invest');
  const intents = ['Invest', 'Acquire', 'Research', 'Partner'];
  const [startupName, setStartupName] = useState('');

  const handleAnalyze = () => {
    const name = startupName || 'Bykea';
    startAnalysis(name);
    router.push({ pathname: '/loading', params: { name } });
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
          />
        </View>

        <Text style={styles.sectionLbl}>YOUR INTENT</Text>
        <View style={styles.intentRow}>
          {intents.map((i) => (
            <TouchableOpacity
              key={i}
              style={[styles.intentBtn, intent === i && styles.intentBtnActive]}
              onPress={() => setIntent(i)}
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
              <TextInput style={styles.fieldInput} placeholder="Fintech, Agri..." placeholderTextColor="rgba(255,255,255,0.2)" />
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Stage</Text>
              <TextInput style={styles.fieldInput} placeholder="Seed, Series A..." placeholderTextColor="rgba(255,255,255,0.2)" />
            </View>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Known funding (PKR / USD)</Text>
            <TextInput style={styles.fieldInput} placeholder="e.g. $2M raised, 2023" placeholderTextColor="rgba(255,255,255,0.2)" />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Your concern / focus area</Text>
            <TextInput style={styles.fieldInput} placeholder="e.g. Worried about burn rate..." placeholderTextColor="rgba(255,255,255,0.2)" />
          </View>
        </View>

        <Text style={styles.sectionLbl}>RECENT REPORTS</Text>
        <View style={styles.recentList}>
          <TouchableOpacity style={styles.recentItem} onPress={() => router.push({ pathname: '/report', params: { name: 'Bykea' } })}>
            <View style={[styles.recentLogo, { backgroundColor: '#1a1a2e' }]}>
              <Text style={{ fontSize: 16 }}>🛵</Text>
            </View>
            <View style={styles.recentInfo}>
              <Text style={styles.recentName}>Bykea</Text>
              <Text style={styles.recentMeta}>Mobility · Seed · 3 days ago</Text>
            </View>
            <Text style={styles.recentScore}>712</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.recentItem} onPress={() => router.push({ pathname: '/report', params: { name: 'Bazaar' } })}>
            <View style={[styles.recentLogo, { backgroundColor: '#0d1b0d' }]}>
              <Text style={{ fontSize: 16 }}>🛒</Text>
            </View>
            <View style={styles.recentInfo}>
              <Text style={styles.recentName}>Bazaar</Text>
              <Text style={styles.recentMeta}>B2B Commerce · Series A · 1 week ago</Text>
            </View>
            <Text style={styles.recentScore}>841</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.analyzeArea}>
          <TouchableOpacity style={styles.btnAnalyze} onPress={handleAnalyze}>
            <Ionicons name="sparkles" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.btnAnalyzeText}>Run Due Diligence</Text>
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
  analyzeArea: { padding: 20, marginTop: 10 },
  btnAnalyze: { flexDirection: 'row', width: '100%', paddingVertical: 17, backgroundColor: '#6366f1', borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  btnAnalyzeText: { color: '#fff', fontSize: 15, fontWeight: '600' }
});
