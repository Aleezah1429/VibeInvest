import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Animated, SafeAreaView } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../context/AuthContext';
import { ReportsProvider } from '../context/ReportsContext';
import { ToastProvider } from '../context/ToastContext';

// Prevent the splash screen from auto-hiding before our custom animation is ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);
  const [opacity] = useState(new Animated.Value(1));

  useEffect(() => {
    const prepare = async () => {
      try {
        // Pre-load assets or do setup here
        await new Promise(resolve => setTimeout(resolve, 100)); 
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
      }
    };
    prepare();
  }, []);

  useEffect(() => {
    if (appReady) {
      // Hide the native splash screen so our custom one shows immediately
      SplashScreen.hideAsync();
      
      // Allow the GIF to play for a bit, then gracefully fade out
      setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 600, // Cinematic fade out
          useNativeDriver: true,
        }).start(() => {
          setSplashAnimationFinished(true);
        });
      }, 3500); // Wait for the GIF animation to complete
    }
  }, [appReady]);

  const showCustomSplash = !splashAnimationFinished;

  return (
    <AuthProvider>
      <ReportsProvider>
        <ToastProvider>
          <ThemeProvider value={DarkTheme}>
            <View style={styles.container}>
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#09090F' } }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="auth" />
                <Stack.Screen name="search" />
                <Stack.Screen name="loading" />
                <Stack.Screen name="handoff" />
                <Stack.Screen name="report" />
                <Stack.Screen name="how-they-work" />
                <Stack.Screen name="profile" />
                <Stack.Screen name="reports" />
              </Stack>
              <StatusBar style="light" />
              
              {showCustomSplash && (
                <Animated.View style={[styles.splashContainer, { opacity }]}>
                  <SafeAreaView style={styles.safeArea}>
                    <Image
                      source={require('../assets/images/vibeinevst-logo.gif')}
                      style={styles.splashImage}
                      resizeMode="contain"
                    />
                  </SafeAreaView>
                </Animated.View>
              )}
            </View>
          </ThemeProvider>
        </ToastProvider>
      </ReportsProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 9999,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashImage: {
    width: '50%',
    height: '50%',
  },
});
