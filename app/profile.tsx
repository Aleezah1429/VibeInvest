import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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

// Shared tokens — mirror app/index.tsx and how-they-work.tsx.
const T = {
  bg: '#08080d',
  ink: '#ffffff',
  dim: 'rgba(255,255,255,0.56)',
  faint: 'rgba(255,255,255,0.36)',
  ghost: 'rgba(255,255,255,0.22)',
  line: 'rgba(255,255,255,0.07)',
  line2: 'rgba(255,255,255,0.12)',
  glass: 'rgba(255,255,255,0.035)',
  purple: '#9550ee',
  purpleSoft: 'rgba(149,80,238,0.18)',
  purpleEdge: 'rgba(149,80,238,0.45)',
  purpleInk: '#d6c0ff',
  green: '#3ddc97',
  red: '#ff5d6c',
};
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string;

// ─── header (back + title) ──────────────────────────────────────────────────
function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} style={s.headerBtn} accessibilityLabel="Back" hitSlop={10}>
        <Ionicons name="chevron-back" size={22} color={T.ink} />
      </TouchableOpacity>
      <Text style={s.headerTitle}>Profile</Text>
      <View style={{ width: 44 }} />
    </View>
  );
}

// ─── section header ─────────────────────────────────────────────────────────
function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.eyebrow}>{eyebrow}</Text>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

// ─── reusable input field ───────────────────────────────────────────────────
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  rightSlot,
  secure,
  editable = true,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  rightSlot?: React.ReactNode;
  secure?: boolean;
  editable?: boolean;
  autoCapitalize?: 'none' | 'words' | 'sentences';
  keyboardType?: 'default' | 'email-address';
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View
        style={[
          s.fieldBox,
          focused && s.fieldBoxFocused,
          !editable && s.fieldBoxDisabled,
        ]}
      >
        <Ionicons
          name={icon}
          size={16}
          color={focused ? T.purpleInk : editable ? T.faint : T.ghost}
          style={{ marginRight: 10 }}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={T.ghost}
          style={[s.fieldInput, !editable && { color: T.faint }]}
          secureTextEntry={secure}
          editable={editable}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightSlot}
      </View>
    </View>
  );
}

// ─── primary CTA (gradient + arrow) ─────────────────────────────────────────
function PrimaryCTA({
  label,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[s.ctaTouchable, disabled && { opacity: 0.5 }]}
      accessibilityLabel={label}
    >
      <LinearGradient
        colors={disabled ? ['rgba(149,80,238,0.4)', 'rgba(123,59,217,0.4)'] : ['#9550ee', '#7b3bd9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={s.cta}
      >
        <Ionicons name={icon} size={16} color="#fff" style={{ marginRight: 8 }} />
        <Text style={s.ctaText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── main screen ────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  // Name section
  const [name, setName] = useState(user?.name ?? '');
  const nameChanged = name.trim().length > 0 && name.trim() !== (user?.name ?? '').trim();

  // Password section
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const canEditPasswordFields = currentPw.trim().length > 0;
  const passwordsMatch = newPw.length > 0 && newPw === confirmPw;
  const canSubmitPassword =
    canEditPasswordFields && newPw.length >= 6 && passwordsMatch;

  const handleSaveName = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    updateProfile({ name: trimmed });
    Alert.alert('Saved', 'Your name has been updated.');
  };

  const handleChangePassword = () => {
    if (!currentPw.trim()) {
      Alert.alert('Current password required', 'Enter your current password to continue.');
      return;
    }
    if (newPw.length < 6) {
      Alert.alert('Password too short', 'New password must be at least 6 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      Alert.alert('Passwords do not match', 'New and confirm passwords must match.');
      return;
    }
    // TODO: wire to a real change-password endpoint when the backend supports
    // it. AuthContext exposes signIn/signUp/signOut/updateProfile today, so
    // the password mutation has nowhere to land yet.
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    Alert.alert('Password updated', 'Your password has been changed.');
  };

  const renderEye = (visible: boolean, toggle: () => void) => (
    <TouchableOpacity onPress={toggle} style={{ padding: 6 }} accessibilityLabel="Toggle password visibility">
      <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={18} color={T.faint} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.screen}>
      <Header onBack={() => router.back()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Account section ───────────────────────────────────────────── */}
          <View style={s.section}>
            <SectionHead eyebrow="◢ ACCOUNT" title="Your details" />
            <View style={s.cardOuter}>
              <LinearGradient
                colors={['rgba(255,255,255,0.045)', 'rgba(255,255,255,0.012)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={s.card}
              >
                <Field
                  label="FULL NAME"
                  icon="person-outline"
                  value={name}
                  onChangeText={setName}
                  placeholder="Your full name"
                  autoCapitalize="words"
                />
                <Field
                  label="EMAIL"
                  icon="mail-outline"
                  value={user?.email ?? ''}
                  onChangeText={() => {}}
                  placeholder="—"
                  editable={false}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  rightSlot={
                    <Ionicons name="lock-closed" size={14} color={T.ghost} style={{ marginLeft: 6 }} />
                  }
                />
                <Text style={s.helper}>{"Email is the unique identifier for your account and can't be changed."}</Text>
                <View style={{ marginTop: 14 }}>
                  <PrimaryCTA
                    label="Save Changes"
                    icon="checkmark-outline"
                    onPress={handleSaveName}
                    disabled={!nameChanged}
                  />
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* ── Security section ──────────────────────────────────────────── */}
          <View style={s.section}>
            <SectionHead eyebrow="◢ SECURITY" title="Change password" />
            <View style={s.cardOuter}>
              <LinearGradient
                colors={['rgba(255,255,255,0.045)', 'rgba(255,255,255,0.012)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={s.card}
              >
                <Field
                  label="CURRENT PASSWORD"
                  icon="lock-closed-outline"
                  value={currentPw}
                  onChangeText={setCurrentPw}
                  placeholder="Enter your current password"
                  secure={!showCurrent}
                  autoCapitalize="none"
                  rightSlot={renderEye(showCurrent, () => setShowCurrent((p) => !p))}
                />
                {!canEditPasswordFields && (
                  <Text style={s.helper}>
                    Enter your current password to unlock the fields below.
                  </Text>
                )}
                <View style={{ height: 6 }} />

                <Field
                  label="NEW PASSWORD"
                  icon="key-outline"
                  value={newPw}
                  onChangeText={setNewPw}
                  placeholder="Min 6 characters"
                  secure={!showNew}
                  editable={canEditPasswordFields}
                  autoCapitalize="none"
                  rightSlot={
                    canEditPasswordFields ? renderEye(showNew, () => setShowNew((p) => !p)) : undefined
                  }
                />

                <Field
                  label="CONFIRM NEW PASSWORD"
                  icon="key-outline"
                  value={confirmPw}
                  onChangeText={setConfirmPw}
                  placeholder="Re-enter your new password"
                  secure={!showConfirm}
                  editable={canEditPasswordFields}
                  autoCapitalize="none"
                  rightSlot={
                    canEditPasswordFields ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {confirmPw.length > 0 && (
                          <Ionicons
                            name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
                            size={16}
                            color={passwordsMatch ? T.green : T.red}
                            style={{ marginRight: 6 }}
                          />
                        )}
                        {renderEye(showConfirm, () => setShowConfirm((p) => !p))}
                      </View>
                    ) : undefined
                  }
                />

                <View style={{ marginTop: 14 }}>
                  <PrimaryCTA
                    label="Update Password"
                    icon="shield-checkmark-outline"
                    onPress={handleChangePassword}
                    disabled={!canSubmitPassword}
                  />
                </View>
              </LinearGradient>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.line,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: T.ink,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  // section
  section: { paddingHorizontal: 20, marginTop: 20 },
  eyebrow: {
    fontFamily: MONO,
    fontSize: 9.5,
    color: T.faint,
    letterSpacing: 1.4,
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: T.ink,
    letterSpacing: -0.3,
  },

  // card
  cardOuter: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: T.line2,
    overflow: 'hidden',
  },
  card: {
    padding: 16,
  },

  // field
  fieldLabel: {
    fontFamily: MONO,
    fontSize: 9.5,
    color: T.faint,
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
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
  fieldBoxDisabled: {
    opacity: 0.55,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  fieldInput: {
    flex: 1,
    color: T.ink,
    fontSize: 14,
    paddingVertical: 10,
  },

  helper: {
    fontSize: 11.5,
    color: T.faint,
    lineHeight: 16,
    marginTop: -4,
    marginBottom: 4,
  },

  // CTA
  ctaTouchable: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  cta: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  ctaText: {
    color: '#fff',
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
