import React, { useState, useEffect } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../context/AuthContext';

// ── design tokens — mirrors VibeInvest/auth.jsx mock ────────────────────────
const T = {
  bg: '#08080d',
  ink: '#ffffff',
  dim: 'rgba(255,255,255,0.56)',
  faint: 'rgba(255,255,255,0.36)',
  ghost: 'rgba(255,255,255,0.22)',
  line: 'rgba(255,255,255,0.07)',
  line2: 'rgba(255,255,255,0.12)',
  glass: 'rgba(255,255,255,0.035)',
  glass2: 'rgba(255,255,255,0.05)',
  fieldBg: 'rgba(0,0,0,0.35)',
  purple: '#9550ee',
  purpleSoft: 'rgba(149,80,238,0.18)',
  purpleEdge: 'rgba(149,80,238,0.45)',
  purpleInk: '#d6c0ff',
  purpleDeep: '#7b3bd9',
  green: '#3ddc97',
  amber: '#f0b34a',
  red: '#ff5d6c',
};

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string;

// ── Hero (logo + kicker + headline + tagline) ───────────────────────────────
function Hero({ mode }: { mode: 'signin' | 'signup' }) {
  return (
    <View style={styles.hero}>
      <Image
        source={require('../assets/images/VI-logo.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />

      <Text style={styles.heroHeadline}>
        {mode === 'signin' ? 'Welcome back.' : 'Welcome Onboard'}
      </Text>
      <Text style={styles.heroTagline}>
        {mode === 'signin'
          ? 'Sign in to run Aura on any startup — public or private.'
          : "Pakistan's premier AI due-diligence hub for VCs, angels and acquirers."}
      </Text>
    </View>
  );
}

// ── Segmented mode switcher ─────────────────────────────────────────────────
function Segmented({
  mode,
  setMode,
  disabled,
}: {
  mode: 'signin' | 'signup';
  setMode: (m: 'signin' | 'signup') => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.segmentedRow}>
      {(['signin', 'signup'] as const).map((m) => {
        const active = mode === m;
        return (
          <TouchableOpacity
            key={m}
            onPress={() => setMode(m)}
            disabled={disabled}
            accessibilityLabel={m === 'signin' ? 'Switch to Sign In' : 'Switch to Create Account'}
            style={[styles.segment, active && styles.segmentActive]}
          >
            {active && <View style={styles.segmentNotch} />}
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Generic labelled input row ──────────────────────────────────────────────
type FieldProps = {
  label: string;
  hint?: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (s: string) => void;
  placeholder: string;
  secure?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  autoComplete?: 'email' | 'name' | 'password' | 'off';
  editable?: boolean;
  rightSlot?: React.ReactNode;
};
function Field({
  label,
  hint,
  icon,
  value,
  onChangeText,
  placeholder,
  secure,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete,
  editable = true,
  rightSlot,
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
        {hint && <Text style={styles.fieldHint}>{hint}</Text>}
      </View>
      <View style={[styles.fieldBox, focused && styles.fieldBoxFocused]}>
        <Ionicons
          name={icon}
          size={16}
          color={focused ? T.purpleInk : T.faint}
          style={{ marginRight: 10 }}
        />
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={T.ghost}
          secureTextEntry={!!secure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightSlot}
      </View>
    </View>
  );
}

// ── Password strength meter ─────────────────────────────────────────────────
function StrengthMeter({ value }: { value: string }) {
  const score =
    (value.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(value) ? 1 : 0) +
    (/[0-9]/.test(value) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(value) ? 1 : 0);
  const labels = ['—', 'Weak', 'OK', 'Strong', 'Excellent'] as const;
  const colors = [T.line2, T.red, T.amber, T.purpleInk, T.green] as const;
  const tone = colors[score];
  return (
    <View style={{ marginTop: -6, marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', gap: 3, marginBottom: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 2,
              borderRadius: 2,
              backgroundColor: i < score ? tone : T.line2,
            }}
          />
        ))}
      </View>
      <View style={styles.strengthRow}>
        <Text style={styles.strengthLabel}>
          Strength: <Text style={{ color: tone }}>{labels[score]}</Text>
        </Text>
        <Text style={styles.strengthLabel}>8+ chars · 1 number · 1 symbol</Text>
      </View>
    </View>
  );
}

// ── Primary CTA with glow halo ──────────────────────────────────────────────
function CTA({
  label,
  icon,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <View style={{ marginTop: 4, marginBottom: 18 }}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        accessibilityLabel={label}
        activeOpacity={0.85}
        style={[styles.ctaTouchable, (disabled || loading) && { opacity: 0.6 }]}
      >
        <LinearGradient
          colors={['#9550ee', '#7b3bd9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.cta}
        >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name={icon} size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.ctaText}>{label}</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />
          </>
        )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ── OR divider ──────────────────────────────────────────────────────────────
function OrDivider() {
  return (
    <View style={styles.orRow}>
      <View style={styles.orLine} />
      <Text style={styles.orText}>OR</Text>
      <View style={styles.orLine} />
    </View>
  );
}

// ── Google sign-in button ───────────────────────────────────────────────────
function GoogleButton({
  onPress,
  disabled,
  mode,
}: {
  onPress: () => void;
  disabled?: boolean;
  mode: 'signin' | 'signup';
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
      style={[styles.oauthBtn, disabled && { opacity: 0.6 }]}
    >
      <Ionicons name="logo-google" size={16} color="#ea4335" style={{ marginRight: 8 }} />
      <Text style={styles.oauthText}>
        {mode === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
      </Text>
    </TouchableOpacity>
  );
}

// ── Switch mode footer link ─────────────────────────────────────────────────
function FooterLink({
  mode,
  onSwitch,
  disabled,
}: {
  mode: 'signin' | 'signup';
  onSwitch: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.switchFooter}>
      <Text style={styles.switchFooterText}>
        {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
      </Text>
      <TouchableOpacity onPress={onSwitch} disabled={disabled}>
        <Text style={styles.switchFooterLink}>
          {mode === 'signin' ? 'Create one.' : 'Sign in.'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Error banner ────────────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <View style={styles.errorBox}>
      <Ionicons name="alert-circle-outline" size={16} color={T.red} style={{ marginRight: 8 }} />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

// ── Main screen ─────────────────────────────────────────────────────────────
export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp, signInWithGoogle, isLoading, isAuthenticated } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isValidEmail = (text: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);

  const clearErrorOnChange = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    if (errorMessage) setErrorMessage(null);
  };

  const handleAuth = async () => {
    setErrorMessage(null);
    if (mode === 'signup' && !name.trim()) return setErrorMessage('Full name is required.');
    if (!email.trim()) return setErrorMessage('Email is required.');
    if (!isValidEmail(email)) return setErrorMessage('Please enter a valid email.');
    if (!password) return setErrorMessage('Password is required.');
    if (password.length < 6) return setErrorMessage('Password must be at least 6 characters.');
    if (mode === 'signup' && !confirmPassword) return setErrorMessage('Please confirm your password.');
    if (mode === 'signup' && password !== confirmPassword) return setErrorMessage('Passwords do not match.');

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(name, email, password);
      }
      router.replace('/');
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'An error occurred during authentication.');
    }
  };

  const handleGoogle = async () => {
    setErrorMessage(null);
    try {
      await signInWithGoogle();
      router.replace('/');
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Google Sign-in failed.');
    }
  };

  const passwordEye = (
    <TouchableOpacity
      onPress={() => setShowPassword((s) => !s)}
      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
      style={{ padding: 6 }}
    >
      <Ionicons
        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
        size={18}
        color={T.faint}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Hero mode={mode} />

          <Segmented mode={mode} setMode={(m) => { setMode(m); setErrorMessage(null); }} disabled={isLoading} />

          <View style={styles.formCol}>
            {errorMessage && <ErrorBanner message={errorMessage} />}

            {mode === 'signin' ? (
              <>
                <Field
                  label="Email"
                  icon="mail-outline"
                  value={email}
                  onChangeText={clearErrorOnChange(setEmail)}
                  placeholder="rayan@kalaam.vc"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoading}
                />
                <Field
                  label="Password"
                  icon="lock-closed-outline"
                  value={password}
                  onChangeText={clearErrorOnChange(setPassword)}
                  placeholder="••••••••"
                  secure={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  editable={!isLoading}
                  rightSlot={passwordEye}
                />
                <CTA
                  label="Sign in to Hub"
                  icon="log-in-outline"
                  onPress={handleAuth}
                  loading={isLoading}
                />
              </>
            ) : (
              <>
                <Field
                  label="Full Name"
                  icon="person-outline"
                  value={name}
                  onChangeText={clearErrorOnChange(setName)}
                  placeholder="Rayan Khan"
                  autoCapitalize="words"
                  autoComplete="name"
                  editable={!isLoading}
                />
                <Field
                  label="Email"
                  icon="mail-outline"
                  value={email}
                  onChangeText={clearErrorOnChange(setEmail)}
                  placeholder="you@yourfund.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoading}
                />
                <Field
                  label="Password"
                  icon="lock-closed-outline"
                  value={password}
                  onChangeText={clearErrorOnChange(setPassword)}
                  placeholder="Min 8 chars"
                  secure={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                  rightSlot={passwordEye}
                />
                <StrengthMeter value={password} />

                <Field
                  label="Confirm Password"
                  icon="lock-closed-outline"
                  value={confirmPassword}
                  onChangeText={clearErrorOnChange(setConfirmPassword)}
                  placeholder="Re-enter password"
                  secure={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                  rightSlot={
                    confirmPassword.length > 0 ? (
                      <Ionicons
                        name={password === confirmPassword ? 'checkmark-circle' : 'close-circle'}
                        size={16}
                        color={password === confirmPassword ? T.green : T.red}
                      />
                    ) : undefined
                  }
                />

                <CTA
                  label="Create Account"
                  icon="person-add-outline"
                  onPress={handleAuth}
                  loading={isLoading}
                />
              </>
            )}

            <OrDivider />
            <GoogleButton onPress={handleGoogle} disabled={isLoading} mode={mode} />
          </View>

          <FooterLink
            mode={mode}
            onSwitch={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setErrorMessage(null); }}
            disabled={isLoading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  scroll: {
    flexGrow: 1,
    paddingBottom: 28,
  },

  // hero
  hero: { paddingTop: 56, paddingHorizontal: 24, paddingBottom: 24, alignItems: 'center' },
  logoImage: {
    width: 160,
    height: 160,
    marginBottom: 4,
  },
  heroHeadline: {
    marginTop: 0,
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.6,
    color: T.ink,
    lineHeight: 32,
    textAlign: 'center',
  },
  heroTagline: {
    fontSize: 13,
    color: T.dim,
    marginTop: 8,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 300,
  },

  // segmented
  segmentedRow: {
    marginHorizontal: 24,
    marginBottom: 18,
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    backgroundColor: T.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: T.line2,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  segmentActive: {
    backgroundColor: T.purpleSoft,
    borderWidth: 1,
    borderColor: T.purpleEdge,
  },
  segmentNotch: {
    position: 'absolute',
    top: -2,
    width: 18,
    height: 1.5,
    backgroundColor: T.purple,
    borderRadius: 2,
  },
  segmentText: {
    fontSize: 13.5,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: T.dim,
  },
  segmentTextActive: { color: T.purpleInk },

  // form
  formCol: { paddingHorizontal: 24, gap: 0 },

  // field
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  fieldLabel: {
    fontFamily: MONO,
    fontSize: 9.5,
    color: T.faint,
    letterSpacing: 1.4,
  },
  fieldHint: {
    fontFamily: MONO,
    fontSize: 9.5,
    color: T.faint,
  },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.fieldBg,
    borderWidth: 1,
    borderColor: T.line2,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  fieldBoxFocused: {
    borderColor: T.purpleEdge,
    backgroundColor: 'rgba(149,80,238,0.06)',
  },
  fieldInput: {
    flex: 1,
    color: T.ink,
    fontSize: 14.5,
    paddingVertical: 12,
  },

  // strength
  strengthRow: { flexDirection: 'row', justifyContent: 'space-between' },
  strengthLabel: {
    fontFamily: MONO,
    fontSize: 9.5,
    color: T.faint,
    letterSpacing: 0.4,
  },

  // error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,93,108,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,93,108,0.25)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  errorText: { flex: 1, color: T.red, fontSize: 12, fontWeight: '500' },

  // cta
  ctaTouchable: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  cta: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  ctaText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.3,
  },

  // or
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 14,
  },
  orLine: {
    flex: 1,
    height: 1,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: T.line2,
    borderStyle: 'dashed',
  },
  orText: {
    fontFamily: MONO,
    fontSize: 9.5,
    color: T.faint,
    letterSpacing: 1.4,
  },

  // oauth
  oauthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: T.glass,
    borderWidth: 1,
    borderColor: T.line2,
    minHeight: 44,
  },
  oauthText: {
    color: T.ink,
    fontSize: 13.5,
    fontWeight: '500',
    letterSpacing: -0.2,
  },

  // switch mode footer link
  switchFooter: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchFooterText: {
    fontSize: 12.5,
    color: T.dim,
  },
  switchFooterLink: {
    fontSize: 12.5,
    fontWeight: '600',
    color: T.purpleInk,
    textDecorationLine: 'underline',
  },

});
