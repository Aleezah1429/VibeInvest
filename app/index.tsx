import { useRouter } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top}>
        <Image 
          source={require('../assets/images/VI-logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.h}>
          Vibe<Text style={styles.hSpan}>Invest</Text>
        </Text>
        <Text style={styles.p}>
          AI-powered due diligence on any Pakistan startup — before you write the cheque.
        </Text>

        <View style={styles.stats}>
          <View style={styles.statBox}>
            <Text style={styles.statN}>4</Text>
            <Text style={styles.statL}>AI agents</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statN}>5m</Text>
            <Text style={styles.statL}>avg report</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statN}>PKR</Text>
            <Text style={styles.statL}>native data</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/search')}>
          <Text style={styles.btnPrimaryText}>Analyze a Startup</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnGhost} onPress={() => router.push('/search')}>
          <Text style={styles.btnGhostText}>Browse Recent Reports</Text>
        </TouchableOpacity>

        <View style={styles.trustRow}>
          <View style={styles.trustDot} />
          <Text style={styles.trustTxt}>Trusted by 200+ investors & acquirers in Pakistan</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090F',
  },
  top: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  h: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  hSpan: {
    color: '#818cf8',
  },
  p: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 32,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statN: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  statL: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 2,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  btnPrimary: {
    width: '100%',
    paddingVertical: 17,
    backgroundColor: '#6366f1',
    borderRadius: 50,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  btnGhost: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: 'transparent',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 10,
  },
  btnGhostText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  trustDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  trustTxt: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
  },
});
