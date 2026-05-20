import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, isLoading, isAuthenticated } = useAuth();

  // Mode: 'signin' | 'signup'
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Field focus states (for custom glowing borders)
  const [focusName, setFocusName] = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPassword, setFocusPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        router.replace('/');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    return null; // Avoid flashing auth screen if already logged in
  }

  // Quick email format validator
  const isValidEmail = (text: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
  };

  const handleAuth = async () => {
    setErrorMessage(null);

    // Validation
    if (mode === 'signup' && !name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(name, email, password);
      }
      // Navigate to main welcome page
      router.replace('/');
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'An error occurred during authentication.');
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    try {
      await signInWithGoogle();
      router.replace('/');
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Google Sign-in failed.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header branding */}
          <View style={styles.brandContainer}>
            <Image
              source={require('../assets/images/VI-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brandTitle}>
              Vibe<Text style={styles.brandSpan}>Invest</Text>
            </Text>
            <Text style={styles.brandSubtitle}>
              {"Pakistan's Premier AI Due Diligence Hub"}
            </Text>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, mode === 'signin' && styles.activeTab]}
              onPress={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              disabled={isLoading}
              accessibilityLabel="Switch to Sign In mode"
            >
              <Text
                style={[styles.tabText, mode === 'signin' && styles.activeTabText]}
              >
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'signup' && styles.activeTab]}
              onPress={() => {
                setMode('signup');
                setErrorMessage(null);
              }}
              disabled={isLoading}
              accessibilityLabel="Switch to Create Account mode"
            >
              <Text
                style={[styles.tabText, mode === 'signup' && styles.activeTabText]}
              >
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Area */}
          <View style={styles.formContainer}>
            {/* Error Message Display */}
            {errorMessage && (
              <View style={styles.errorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#ef4444"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Full Name field (Signup Only) */}
            {mode === 'signup' && (
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>FULL NAME</Text>
                <View
                  style={[
                    styles.inputContainer,
                    focusName && styles.inputContainerFocused,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={16}
                    color={focusName ? '#818cf8' : 'rgba(255,255,255,0.3)'}
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Ali Rizvi"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={name}
                    onChangeText={(t) => {
                      setName(t);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    autoCapitalize="words"
                    onFocus={() => setFocusName(true)}
                    onBlur={() => setFocusName(false)}
                    editable={!isLoading}
                  />
                  {name.trim().length >= 2 && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#22c55e"
                      style={styles.fieldCheckIcon}
                    />
                  )}
                </View>
              </View>
            )}

            {/* Email field */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusEmail && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={16}
                  color={focusEmail ? '#818cf8' : 'rgba(255,255,255,0.3)'}
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. investor@vibeinvest.com"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  onFocus={() => setFocusEmail(true)}
                  onBlur={() => setFocusEmail(false)}
                  editable={!isLoading}
                />
                {isValidEmail(email) && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color="#22c55e"
                    style={styles.fieldCheckIcon}
                  />
                )}
              </View>
            </View>

            {/* Password field */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>PASSWORD</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusPassword && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color={focusPassword ? '#818cf8' : 'rgba(255,255,255,0.3)'}
                  style={styles.fieldIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder={mode === 'signin' ? '••••••••' : 'Min. 6 characters'}
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onFocus={() => setFocusPassword(true)}
                  onBlur={() => setFocusPassword(false)}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.passwordToggle}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="rgba(255,255,255,0.4)"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.btnPrimary, isLoading && styles.btnPrimaryDisabled]}
              onPress={handleAuth}
              disabled={isLoading}
              accessibilityLabel={mode === 'signin' ? 'Submit sign in' : 'Submit sign up'}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name={mode === 'signin' ? 'log-in-outline' : 'person-add-outline'}
                    size={18}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.btnPrimaryText}>
                    {mode === 'signin' ? 'Sign In to Hub' : 'Create Investor Account'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In button */}
            <TouchableOpacity
              style={[styles.btnGoogle, isLoading && styles.btnGoogleDisabled]}
              onPress={handleGoogleAuth}
              disabled={isLoading}
              accessibilityLabel="Sign in with Google"
            >
              <Ionicons
                name="logo-google"
                size={16}
                color="#ea4335"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.btnGoogleText}>
                {mode === 'signin' ? 'Sign In with Google' : 'Sign Up with Google'}
              </Text>
            </TouchableOpacity>

            {/* Switch Mode Prompt footer */}
            <View style={styles.switchModePrompt}>
              <Text style={styles.switchModePromptText}>
                {mode === 'signin'
                  ? "Don't have an investor account?"
                  : 'Already registered on VibeInvest?'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setErrorMessage(null);
                }}
                disabled={isLoading}
              >
                <Text style={styles.switchModeLink}>
                  {mode === 'signin' ? ' Create Account' : ' Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090F',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 20,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  brandSpan: {
    color: '#818cf8',
  },
  brandSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(99,102,241,0.4)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
  },
  activeTabText: {
    color: '#818cf8',
  },
  formContainer: {
    gap: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.07)',
    borderWidth: 0.5,
    borderColor: 'rgba(239,68,68,0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  fieldWrapper: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputContainerFocused: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99,102,241,0.06)',
  },
  fieldIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    paddingVertical: 12,
  },
  fieldCheckIcon: {
    marginLeft: 8,
  },
  passwordToggle: {
    padding: 8,
    marginRight: -4,
  },
  btnPrimary: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#6366f1',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  btnPrimaryDisabled: {
    opacity: 0.6,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    letterSpacing: 1,
  },
  btnGoogle: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 14,
    backgroundColor: 'transparent',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGoogleDisabled: {
    opacity: 0.6,
  },
  btnGoogleText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
  switchModePrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  switchModePromptText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  switchModeLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#818cf8',
  },
});
