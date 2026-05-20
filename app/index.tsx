import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
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
import { BlurView } from 'expo-blur';
import { CircleDollarSign, Crown, Search, Sparkles, LucideIcon } from 'lucide-react-native';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, RadialGradient, Stop } from 'react-native-svg';
import * as DocumentPicker from 'expo-document-picker';

import { useAuth } from '../context/AuthContext';
import { useReports, SavedReport } from '../context/ReportsContext';
import { useToast } from '../context/ToastContext';
import { createAnalysis } from '../services/api';

// ─── search payload shape ───────────────────────────────────────────────────
const INTENT_OPTIONS = ['Invest', 'Acquire', 'Research', 'Partner'] as const;
type Intent = (typeof INTENT_OPTIONS)[number];

type ExtraDetails = {
  website?: string;
  linkedin?: string;
  pitchDeckFile?: DocumentPicker.DocumentPickerAsset;
  sector?: string;
  stage?: string;
  funding?: string;
  focus?: string;
};

type SearchPayload = { name: string; intent: Intent; details?: ExtraDetails };

// ─── design tokens (mirrors VibeInvest/empty.jsx and dashboard.jsx) ─────────
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
  amber: '#f0b34a',
  red: '#ff5d6c',
};
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string;

// ─── background ambient glows (mirrors empty.jsx / dashboard.jsx) ──────────
// RN has no radial-gradient or filter:blur, but react-native-svg's
// <RadialGradient> reproduces the soft purple falloff faithfully. Slow
// opacity + scale loops give the blobs the same "breathing" feel the mock's
// CSS animations convey.
function useBreathe(durationMs: number, delayMs = 0) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration: durationMs / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
          delay: delayMs,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration: durationMs / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, durationMs, delayMs]);
  return v;
}

function BackgroundGlow() {
  const breathA = useBreathe(7000);
  const opacityA = breathA.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  const scaleA = breathA.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.1] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          styles_glow.blob,
          { top: 200, left: -80, width: 280, height: 280, opacity: opacityA, transform: [{ scale: scaleA }] },
        ]}
      >
        <Svg width={280} height={280}>
          <Defs>
            <RadialGradient id="glowA" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#9550ee" stopOpacity={0.32} />
              <Stop offset="65%" stopColor="#9550ee" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={140} cy={140} r={140} fill="url(#glowA)" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles_glow = StyleSheet.create({
  blob: { position: 'absolute' },
});

// ─── small reusable: section header (eyebrow + title) ──────────────────────
function SectionHead({
  eyebrow,
  title,
  meta,
  actionLabel,
  onAction,
}: {
  eyebrow: string;
  title: string;
  meta?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={s.sectionHead}>
      <View>
        <Text style={s.eyebrow}>{eyebrow}</Text>
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} hitSlop={10} accessibilityLabel={actionLabel}>
          <Text style={s.sectionAction}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : meta ? (
        <Text style={s.sectionMeta}>{meta}</Text>
      ) : null}
    </View>
  );
}

// ─── header ────────────────────────────────────────────────────────────────
function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <View style={s.headerRow}>
      <View style={s.headerBrand}>
        <TouchableOpacity
          accessibilityLabel="Open menu"
          onPress={onMenu}
          style={s.menuBtn}
          hitSlop={10}
        >
          <Ionicons name="menu" size={20} color={T.ink} />
        </TouchableOpacity>
        <Image
          source={require('../assets/images/VI-logo.png')}
          style={s.headerLogo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

// ─── greeting block ────────────────────────────────────────────────────────
function Welcome({ firstName }: { firstName: string }) {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 14 }}>
      <Text style={s.welcomeHead}>
        Welcome, <Text>{firstName}.</Text>
        {'\n'}
        <Text style={{ color: T.dim }}>{"Let's vet your first startup."}</Text>
      </Text>
      <Text style={s.welcomeSub}>
        Type a name below. Four AI agents go deep on financials, market, brand and risk — then return a verdict.
      </Text>
    </View>
  );
}

// ─── rotating purple halo behind the search card ───────────────────────────
// Approximates the mock's `conic-gradient(from 0deg, purple, transparent 35%,
// purple 70%, transparent)` + `filter: blur(14px)` by placing two opposing
// soft radial blobs on a rectangle and rotating the whole SVG. The two-blob
// pattern produces the same "double sweep" the conic gradient creates.
function SearchCardGlow() {
  const spinV = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    // Run 0 → 2 (two full turns) per loop so the iteration boundary is hit
    // half as often. iterations: -1 + linear easing + native driver keeps
    // the rotation truly continuous; the asymmetric hot-spot layout below
    // makes the motion always visually detectable.
    const loop = Animated.loop(
      Animated.timing(spinV, {
        toValue: 2,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      }),
      { iterations: -1 },
    );
    loop.start();
    return () => loop.stop();
  }, [spinV]);
  // 0 → 2 maps to 0° → 720° (two full turns). 720° lands back at the same
  // orientation as 0°, so the loop wrap is invisible.
  const rotate = spinV.interpolate({ inputRange: [0, 2], outputRange: ['0deg', '720deg'] });
  return (
    <Animated.View
      pointerEvents="none"
      style={[s.searchHaloWrap, { transform: [{ rotate }] }]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          {/* Multi-stop falloff — no more visible stroke at the edge. */}
          <RadialGradient id="haloPrimary" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor="#9550ee" stopOpacity={0.95} />
            <Stop offset="30%"  stopColor="#9550ee" stopOpacity={0.55} />
            <Stop offset="65%"  stopColor="#9550ee" stopOpacity={0.18} />
            <Stop offset="100%" stopColor="#9550ee" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="haloSecondary" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor="#c79bff" stopOpacity={0.7} />
            <Stop offset="35%"  stopColor="#c79bff" stopOpacity={0.35} />
            <Stop offset="75%"  stopColor="#c79bff" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#c79bff" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        {/* Asymmetric placement (not 180°) so rotation is always visible. */}
        <Circle cx={48} cy={10} r={88} fill="url(#haloPrimary)" />
        <Circle cx={22} cy={70} r={68} fill="url(#haloSecondary)" />
      </Svg>
    </Animated.View>
  );
}

// ─── reusable field for the expanded details panel ─────────────────────────
function DetailField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  placeholder: string;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  keyboardType?: 'default' | 'url' | 'email-address';
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={s.detailLabel}>{label}</Text>
      <View style={[s.detailBox, focused && s.detailBoxFocused, multiline && { minHeight: 70 }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={T.ghost}
          style={[s.detailInput, multiline && { minHeight: 60, textAlignVertical: 'top' }]}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
}

// ─── focal search card (CTA) ───────────────────────────────────────────────
function SearchCard({ onRun }: { onRun: (payload: SearchPayload) => void | Promise<void> }) {
  const toast = useToast();
  const [val, setVal] = useState('');
  const [intent, setIntent] = useState<Intent | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // extras (only sent if expanded)
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [pitchDeck, setPitchDeck] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('');
  const [funding, setFunding] = useState('');
  const [focus, setFocus] = useState('');

  const suggestions = ['Bazaar', 'Retailo', 'Sadapay'];
  const hasTyped = val.trim().length > 0;
  const canSubmit = hasTyped && intent !== null && !submitting;

  const handlePickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        multiple: false,
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        setPitchDeck(result.assets[0]);
      }
    } catch {
      toast.show('Could not pick a PDF.', { type: 'error', title: 'UPLOAD FAILED' });
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || intent === null) return;
    setSubmitting(true);
    try {
      const details: ExtraDetails | undefined = expanded
        ? {
            website: website.trim() || undefined,
            linkedin: linkedin.trim() || undefined,
            pitchDeckFile: pitchDeck ?? undefined,
            sector: sector.trim() || undefined,
            stage: stage.trim() || undefined,
            funding: funding.trim() || undefined,
            focus: focus.trim() || undefined,
          }
        : undefined;
      await onRun({ name: val.trim(), intent, details });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View style={s.searchCardWrap}>
      <SearchCardGlow />
      <View style={s.searchCardOuter}>
      <LinearGradient
        colors={['rgba(28,20,46,0.92)', 'rgba(14,11,24,0.92)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={s.searchCard}
      >
        <View style={s.searchHeaderRow}>
          <View style={s.searchStatus}>
            <View style={s.purpleDot} />
            <Text style={s.searchStatusText}>STANDING BY</Text>
          </View>
          <Text style={s.searchAgents}>4 AGENTS · IDLE</Text>
        </View>

        <View style={s.searchInputWrap}>
          <Ionicons name="search" size={18} color={T.purple} style={{ marginRight: 10 }} />
          <TextInput
            value={val}
            onChangeText={setVal}
            placeholder="Analyze a startup…"
            placeholderTextColor={T.faint}
            style={s.searchInput}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        {/* TRY suggestions when empty; INTENT picker once user starts typing */}
        {!hasTyped ? (
          <View style={s.suggRow}>
            <Text style={s.tryLabel}>TRY</Text>
            {suggestions.map((sug) => (
              <TouchableOpacity
                key={sug}
                onPress={() => setVal(sug)}
                style={s.suggChip}
                accessibilityLabel={`Suggest ${sug}`}
              >
                <Text style={s.suggChipText}>{sug}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={{ marginBottom: 14 }}>
            <Text style={[s.tryLabel, { marginBottom: 8, marginRight: 0 }]}>INTENT · REQUIRED</Text>
            <View style={s.intentRow}>
              {INTENT_OPTIONS.map((opt) => {
                const active = intent === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setIntent(opt)}
                    style={[s.intentChip, active && s.intentChipActive]}
                    accessibilityLabel={`Intent ${opt}`}
                  >
                    <Text style={[s.intentChipText, active && s.intentChipTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Toggle for additional details (only after user has typed) */}
        {hasTyped && (
          <TouchableOpacity
            onPress={() => setExpanded((p) => !p)}
            style={s.detailsToggle}
            accessibilityLabel={expanded ? 'Hide additional details' : 'Add additional details'}
          >
            <Ionicons
              name={expanded ? 'remove-circle-outline' : 'add-circle-outline'}
              size={14}
              color={T.purple}
            />
            <Text style={s.detailsToggleText}>
              {expanded ? 'Hide additional details' : 'Add additional details'}
            </Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={T.purple}
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>
        )}

        {/* Expanded details panel */}
        {hasTyped && expanded && (
          <View style={s.detailsPanel}>
            <DetailField
              label="WEBSITE URL"
              value={website}
              onChangeText={setWebsite}
              placeholder="https://startup.com"
              autoCapitalize="none"
              keyboardType="url"
            />
            <DetailField
              label="LINKEDIN URL"
              value={linkedin}
              onChangeText={setLinkedin}
              placeholder="linkedin.com/company/…"
              autoCapitalize="none"
              keyboardType="url"
            />

            <View style={{ marginBottom: 10 }}>
              <Text style={s.detailLabel}>PITCH DECK (PDF)</Text>
              <TouchableOpacity
                onPress={handlePickPdf}
                style={s.uploadBtn}
                accessibilityLabel="Upload pitch deck PDF"
              >
                <Ionicons
                  name={pitchDeck ? 'document-text' : 'cloud-upload-outline'}
                  size={16}
                  color={pitchDeck ? T.purpleInk : T.dim}
                  style={{ marginRight: 8 }}
                />
                <Text style={s.uploadBtnText} numberOfLines={1}>
                  {pitchDeck ? pitchDeck.name : 'Upload PDF'}
                </Text>
                {pitchDeck && (
                  <TouchableOpacity
                    onPress={() => setPitchDeck(null)}
                    hitSlop={8}
                    accessibilityLabel="Remove uploaded PDF"
                    style={{ marginLeft: 8 }}
                  >
                    <Ionicons name="close-circle" size={16} color={T.faint} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>

            <Text style={s.contextHead}>◢ ADDITIONAL CONTEXT</Text>

            <DetailField
              label="SECTOR"
              value={sector}
              onChangeText={setSector}
              placeholder="e.g., FinTech, Quick Commerce"
              autoCapitalize="words"
            />
            <DetailField
              label="STAGE"
              value={stage}
              onChangeText={setStage}
              placeholder="e.g., Pre-seed, Series A"
              autoCapitalize="words"
            />
            <DetailField
              label="KNOWN FUNDING (PKR / USD)"
              value={funding}
              onChangeText={setFunding}
              placeholder="e.g., $1.5M seed or PKR 400M"
            />
            <DetailField
              label="YOUR FOCUS / CONCERN"
              value={focus}
              onChangeText={setFocus}
              placeholder="What should the agents dig into?"
              multiline
            />
          </View>
        )}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit}
          accessibilityLabel="Start Analyzing"
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={canSubmit || submitting ? ['#9550ee', '#7b3bd9'] : ['rgba(149,80,238,0.35)', 'rgba(123,59,217,0.35)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={s.searchCta}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={s.searchCtaText}>Start Analyzing</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
      </View>
      </View>
    </View>
  );
}

// ─── meet your agents (empty state only) ───────────────────────────────────
// Icons + colors mirror app/loading.tsx and app/handoff.tsx so the agents
// look identical wherever they appear in the app.
const ROSTER: { Icon: LucideIcon; color: string; name: string; role: string }[] = [
  { Icon: Search,           color: '#FF6B6B', name: 'The Skeptic', role: 'Risk · Red flags' },
  { Icon: CircleDollarSign, color: '#D4FF3D', name: 'The Munshi',  role: 'Financials' },
  { Icon: Sparkles,         color: '#A78BFA', name: 'The Hype',    role: 'Brand · Sentiment' },
  { Icon: Crown,            color: '#FFC83C', name: 'The CVO',     role: 'Verdict · Synth.' },
];

function MeetAgents({ onHowItWorks }: { onHowItWorks: () => void }) {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <SectionHead
        eyebrow="◢ YOUR TEAM"
        title="Meet your agents"
        actionLabel="How they work →"
        onAction={onHowItWorks}
      />
      <View style={s.rosterGrid}>
        {ROSTER.map((a) => (
          <View key={a.name} style={s.rosterCard}>
            <View style={s.rosterRow}>
              <View
                style={[
                  s.glyphBox,
                  { backgroundColor: `${a.color}1f`, borderColor: `${a.color}55` },
                ]}
              >
                <a.Icon size={16} color={a.color} />
              </View>
              <Text style={s.idleTag}>IDLE</Text>
            </View>
            <Text style={s.rosterName}>{a.name}</Text>
            <Text style={s.rosterRole}>{a.role}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── aura ring (svg) — used by both empty + populated ──────────────────────
function AuraRing({ score, max = 1000 }: { score: number; max?: number }) {
  const r = 64;
  const C0 = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, score / max));
  const offset = C0 * (1 - pct);
  return (
    <Svg width={148} height={148} viewBox="0 0 148 148">
      <Defs>
        <SvgLinearGradient id="auraRing" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#e9d4ff" />
          <Stop offset="50%" stopColor="#a96bff" />
          <Stop offset="100%" stopColor="#7d3fdf" />
        </SvgLinearGradient>
        <RadialGradient id="auraRingHalo" cx="50%" cy="50%" r="50%">
          <Stop offset="55%" stopColor="#9550ee" stopOpacity={0} />
          <Stop offset="78%" stopColor="#9550ee" stopOpacity={0.28} />
          <Stop offset="100%" stopColor="#9550ee" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {score > 0 && (
        <Circle cx={74} cy={74} r={68} fill="url(#auraRingHalo)" />
      )}
      <Circle cx={74} cy={74} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={6} fill="none" />
      {score > 0 && (
        <>
          {/* Stacked translucent halos approximate a CSS drop-shadow glow:
              widest+softest underneath, tightening toward the crisp gradient
              ring on top. */}
          <Circle
            cx={74}
            cy={74}
            r={r}
            stroke="#9550ee"
            strokeWidth={28}
            opacity={0.10}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={C0}
            strokeDashoffset={offset}
            transform="rotate(-90 74 74)"
          />
          <Circle
            cx={74}
            cy={74}
            r={r}
            stroke="#a96bff"
            strokeWidth={18}
            opacity={0.22}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={C0}
            strokeDashoffset={offset}
            transform="rotate(-90 74 74)"
          />
          <Circle
            cx={74}
            cy={74}
            r={r}
            stroke="#c79bff"
            strokeWidth={11}
            opacity={0.45}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={C0}
            strokeDashoffset={offset}
            transform="rotate(-90 74 74)"
          />
          <Circle
            cx={74}
            cy={74}
            r={r}
            stroke="url(#auraRing)"
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={C0}
            strokeDashoffset={offset}
            transform="rotate(-90 74 74)"
          />
        </>
      )}
    </Svg>
  );
}

// ─── empty aura preview ────────────────────────────────────────────────────
function EmptyAura() {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View style={s.auraEmptyOuter}>
      <LinearGradient
        colors={['rgba(28,20,46,0.55)', 'rgba(14,11,24,0.85)']}
        locations={[0, 0.6]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={s.auraEmptyCard}
      >
        <View style={s.auraEmptyHead}>
          <View>
            <Text style={s.eyebrow}>◢ AURA SCORE</Text>
            <Text style={[s.sectionTitle, { color: T.dim }]}>No analysis yet</Text>
          </View>
          <View style={s.dashChip}>
            <Text style={s.dashChipText}>—— ——</Text>
          </View>
        </View>

        <View style={s.auraBody}>
          <View style={s.auraRingWrap}>
            <AuraRing score={0} />
            <View style={s.auraRingCenter} pointerEvents="none">
              <Text style={s.auraScoreEmpty}>—</Text>
              <Text style={s.auraMaxText}>/ 1000</Text>
              <Text style={s.auraTbd}>TBD</Text>
            </View>
          </View>

          <View style={{ flex: 1, gap: 10 }}>
            {['Market', 'Financials', 'Brand'].map((label) => (
              <View key={label}>
                <View style={s.breakdownRow}>
                  <Text style={s.breakdownLabel}>{label}</Text>
                  <Text style={s.breakdownVal}>—</Text>
                </View>
                <View style={s.breakdownTrack}>
                  <View style={s.breakdownEmptyFill} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={s.auraFootRow}>
          <Text style={s.auraFootText}>⌁ Run an analysis to reveal your first Aura</Text>
        </View>
      </LinearGradient>
      </View>
    </View>
  );
}

// ─── populated aura score ──────────────────────────────────────────────────
function VerdictPill({ verdict }: { verdict: SavedReport['verdict'] }) {
  const map: Record<SavedReport['verdict'], { bg: string; border: string; ink: string }> = {
    INVEST:  { bg: 'rgba(61,220,151,0.12)',  border: 'rgba(61,220,151,0.45)',  ink: T.green },
    ITERATE: { bg: 'rgba(149,80,238,0.14)',  border: 'rgba(149,80,238,0.55)',  ink: T.purpleInk },
    WATCH:   { bg: 'rgba(240,179,74,0.12)',  border: 'rgba(240,179,74,0.45)',  ink: T.amber },
    PIVOT:   { bg: 'rgba(240,179,74,0.12)',  border: 'rgba(240,179,74,0.45)',  ink: T.amber },
    ACQUIRE: { bg: 'rgba(149,80,238,0.14)',  border: 'rgba(149,80,238,0.55)',  ink: T.purpleInk },
    PASS:    { bg: 'rgba(255,93,108,0.10)',  border: 'rgba(255,93,108,0.40)',  ink: T.red },
  };
  const m = map[verdict] ?? map.WATCH;
  return (
    <View style={[s.verdictPill, { backgroundColor: m.bg, borderColor: m.border }]}>
      <Ionicons name="checkmark" size={11} color={m.ink} style={{ marginRight: 4 }} />
      <Text style={[s.verdictPillText, { color: m.ink }]}>{verdict}</Text>
    </View>
  );
}

function AuraScoreCard({ report }: { report: SavedReport }) {
  const router = useRouter();
  const breakdowns =
    report.breakdowns && report.breakdowns.length > 0
      ? report.breakdowns
      : [
          { label: 'Market', val: 0 },
          { label: 'Financials', val: 0 },
          { label: 'Brand', val: 0 },
        ];
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <TouchableOpacity
        onPress={() => router.push({ pathname: '/report', params: { id: report.id, name: report.name } })}
        activeOpacity={0.85}
        style={s.auraCardOuter}
        accessibilityLabel={`View full report for ${report.name}`}
      >
      <LinearGradient
        colors={['rgba(40,24,72,0.65)', 'rgba(14,11,24,0.85)']}
        locations={[0, 0.6]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={s.auraCard}
      >
        <View style={s.auraEmptyHead}>
          <View style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
            <Text style={s.eyebrow}>◢ AURA SCORE</Text>
            <Text style={s.sectionTitle} numberOfLines={1}>{report.name}</Text>
          </View>
          <VerdictPill verdict={report.verdict} />
        </View>

        <View style={s.auraBody}>
          <View style={s.auraRingWrap}>
            <AuraRing score={report.score} />
            <View style={s.auraRingCenter} pointerEvents="none">
              <Text style={s.auraScore}>{report.score}</Text>
              <Text style={s.auraMaxText}>/ 1000</Text>
              <Text style={s.auraTier}>▲ TIER A</Text>
            </View>
          </View>

          <View style={{ flex: 1, gap: 10 }}>
            {breakdowns.slice(0, 3).map((b) => (
              <View key={b.label}>
                <View style={s.breakdownRow}>
                  <Text style={[s.breakdownLabel, { color: T.dim }]}>{b.label}</Text>
                  <Text style={[s.breakdownVal, { color: T.ink }]}>{b.val}</Text>
                </View>
                <View style={s.breakdownTrack}>
                  <View style={[s.breakdownFill, { width: `${Math.max(0, Math.min(100, b.val))}%` }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={s.auraFootRow}>
          <Text style={s.auraFootText}>⌁ Confidence 0.91 · 4/4 agents</Text>
          <Text style={[s.auraFootText, { color: T.purple }]}>Full report →</Text>
        </View>
      </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ─── trending (empty state) ────────────────────────────────────────────────
// ─── Quick Insights (populated dashboard only) ─────────────────────────────
type Insight = {
  tag: string;
  title: string;
  subtitle: string;
  source: string;
  accent: string;
  url: string;
};

const INSIGHTS: Insight[] = [
  {
    tag: 'CAPITAL',
    title: 'Q1 2026 deal flow',
    subtitle: 'Fintech took 34% of $62M raised; cross-border revenue is the new bar.',
    source: 'Startup.pk · May 2026',
    accent: '#9550ee',
    url: 'https://startup.pk/where-startup-capital-is-actually-going-in-pakistan-right-now/',
  },
  {
    tag: 'FINANCING',
    title: 'Hybrid debt + equity surge',
    subtitle: 'Hybrid rounds jumped $1M → $66M — 89% of 2025 total funding.',
    source: 'Brecorder · Feb 2026',
    accent: '#c79bff',
    url: 'https://www.brecorder.com/news/40407474',
  },
  {
    tag: 'FOUNDERS',
    title: 'Female-led founder wave',
    subtitle: '8 of 11 disclosed 2025 deals had female founders or co-founders.',
    source: 'Brecorder · Jan 2026',
    accent: '#FFC83C',
    url: 'https://www.brecorder.com/news/40402392',
  },
  {
    tag: 'GAP',
    title: 'India is 160× ahead',
    subtitle: 'Pakistan ~$1B raised since 2015 vs India $160B+ in the same period.',
    source: 'TechJuice · Apr 2026',
    accent: '#ff5d6c',
    url: 'https://www.techjuice.pk/pakistans-startups-have-a-159-billion-problem-here-is-why/',
  },
  {
    tag: 'RECOVERY',
    title: 'Equity funding ticks up',
    subtitle: '$36.6M equity in 2025 (+63% YoY) — still far below the 2021 peak.',
    source: 'PhoneWorld · Jan 2026',
    accent: '#3ddc97',
    url: 'https://www.phoneworld.com.pk/how-pakistans-startup-ecosystem-can-thrive-in-2026/',
  },
  {
    tag: 'ROUNDS',
    title: 'Haball, Trukkr, Shadiyana',
    subtitle: '$52M Pre-A · $10M · $800K — three names to watch in 2026.',
    source: 'Daftarkhwan · Feb 2026',
    accent: '#A78BFA',
    url: 'https://www.daftarkhwan.com/post/top-pakistani-startups-to-watch-in-2026',
  },
  {
    tag: 'TOP 10',
    title: 'Flagship roster',
    subtitle: 'Abhi $57.8M · PostEx $15.9M · Tazah $6.5M — scaled players.',
    source: 'Startup Network · Feb 2026',
    accent: '#D4FF3D',
    url: 'https://startupnetwork.pk/10-pakistans-top-startups-you-must-know-about/',
  },
  {
    tag: 'POSTMORTEM',
    title: 'Airlift cautionary tale',
    subtitle: 'Raised ~$109M Series B, shut 2022 — capital ≠ survival.',
    source: 'ArabFounders · Feb 2026',
    accent: '#f0b34a',
    url: 'https://arabfounders.net/en/top-startups-pakistan-2026-2/',
  },
  {
    tag: 'TRACXN',
    title: '22,596 startups tracked',
    subtitle: '~1,000 funded · $4.77B cumulative · $93.5M YTD 2026.',
    source: 'Tracxn · May 2026',
    accent: '#9550ee',
    url: 'https://tracxn.com/d/geographies/pakistan/__SNCx2XH4A3PyUUpzsO6Kmz4y9f8Z2LFQWK1jSZrVm98',
  },
  {
    tag: 'POLICY',
    title: 'PSF "last cheque"',
    subtitle: '10–30% equity-free capital, disbursed after a VC commits.',
    source: 'MoITT · Pakistan Startup Fund',
    accent: '#c79bff',
    url: 'https://moitt.gov.pk/Detail/NjZjZmUyZDQtNDU5MS00NzIzLTgyNTAtNmIzY2Y4ODFjODIz',
  },
];

function InsightCard({ insight }: { insight: Insight }) {
  const toast = useToast();
  const open = () => {
    Linking.openURL(insight.url).catch(() => {
      toast.show('Could not open the link.', { type: 'error', title: 'LINK ERROR' });
    });
  };
  return (
    <TouchableOpacity onPress={open} activeOpacity={0.85} style={s.insightOuter}>
      <LinearGradient
        colors={['rgba(255,255,255,0.045)', 'rgba(255,255,255,0.012)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={s.insightCard}
      >
        <View pointerEvents="none" style={[s.insightGlow, { backgroundColor: insight.accent }]} />
        <View style={s.insightHead}>
          <View
            style={[
              s.insightTag,
              { backgroundColor: `${insight.accent}1f`, borderColor: `${insight.accent}55` },
            ]}
          >
            <Text style={[s.insightTagText, { color: insight.accent }]}>{insight.tag}</Text>
          </View>
          <Sparkles size={11} color={T.faint} />
        </View>
        <Text style={s.insightTitle} numberOfLines={2}>{insight.title}</Text>
        <Text style={s.insightSubtitle} numberOfLines={3}>{insight.subtitle}</Text>
        <View style={s.insightFoot}>
          <Text style={s.insightSource} numberOfLines={1}>{insight.source}</Text>
          <Text style={s.insightArrow}>→</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function QuickInsights() {
  return (
    <View>
      <View style={{ paddingHorizontal: 20 }}>
        <SectionHead
          eyebrow="◢ INTELLIGENCE"
          title="Quick insights"
          meta={`${INSIGHTS.length} SOURCES`}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 14, gap: 10 }}
      >
        {INSIGHTS.map((ix) => (
          <InsightCard key={ix.url} insight={ix} />
        ))}
      </ScrollView>
    </View>
  );
}

const TRENDING = [
  { name: 'Bazaar Tech', sector: 'B2B Retail', stat: '↑ 142%', heat: 'HOT' as const, logo: require('../assets/images/bazaar.png'), bg: '#000' },
  { name: 'Retailo', sector: 'Distribution', stat: '↑ 21%', heat: 'NEW' as const, logo: require('../assets/images/retailo.png'), bg: '#fff' },
  { name: 'Truck It In', sector: 'Logistics', stat: '↑ 48%', heat: 'BUZZ' as const, logo: require('../assets/images/Truckitin.png'), bg: '#fff' },
  { name: 'Sadapay', sector: 'Fintech', stat: '↑ 87%', heat: 'HOT' as const, logo: require('../assets/images/sadapay.png'), bg: '#fff' },
];

function Trending({ onPick }: { onPick: (name: string) => void }) {
  return (
    <View>
      <View style={{ paddingHorizontal: 20 }}>
        <SectionHead eyebrow="◢ TRENDING NOW" title="Start with one of these" />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 14, gap: 10 }}
      >
        {TRENDING.map((t) => {
          const heatStyles = {
            HOT: { bg: 'rgba(255,93,108,0.12)', border: 'rgba(255,93,108,0.4)', ink: '#ff8e98' },
            BUZZ: { bg: T.purpleSoft, border: T.purpleEdge, ink: T.purpleInk },
            NEW: { bg: 'rgba(61,220,151,0.12)', border: 'rgba(61,220,151,0.4)', ink: T.green },
          }[t.heat];
          return (
            <TouchableOpacity key={t.name} onPress={() => onPick(t.name)} style={s.trendCard}>
              <View style={s.trendRow}>
                <View style={[s.trendInitial, { backgroundColor: t.bg }]}>
                  <Image source={t.logo} style={s.trendLogo} resizeMode="contain" />
                </View>
                <View style={[s.heatChip, { backgroundColor: heatStyles.bg, borderColor: heatStyles.border }]}>
                  <Text style={[s.heatChipText, { color: heatStyles.ink }]}>{t.heat}</Text>
                </View>
              </View>
              <Text style={s.trendName}>{t.name}</Text>
              <Text style={s.trendSector}>{t.sector}</Text>
              <View style={s.trendFootRow}>
                <Text style={s.trendStat}>{t.stat}</Text>
                <Text style={s.trendRun}>Run →</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── recent / empty history ────────────────────────────────────────────────
function EmptyHistory() {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <SectionHead eyebrow="◢ HISTORY" title="Recent analyses" />
      <View style={s.emptyHist}>
        <View style={s.emptyHistGlyph}>
          <Ionicons name="trending-up" size={20} color={T.purpleInk} />
        </View>
        <Text style={s.emptyHistTitle}>No reports yet</Text>
        <Text style={s.emptyHistSub}>
          Your past Aura scores, verdicts and trend graphs land here after your first run.
        </Text>
      </View>
    </View>
  );
}

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

function RecentList({ reports, onPick }: { reports: SavedReport[]; onPick: (id: string, name: string) => void }) {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <SectionHead eyebrow="◢ HISTORY" title="Recent analyses" meta={`${reports.length} total`} />
      <View style={{ gap: 8 }}>
        {reports.map((r) => (
          <TouchableOpacity key={r.id} onPress={() => onPick(r.id, r.name)} style={s.recentRow}>
            <View style={s.recentInitial}>
              <Text style={s.recentInitialText}>{r.name[0]}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={s.recentName} numberOfLines={1}>
                  {r.name}
                </Text>
                <VerdictPill verdict={r.verdict} />
              </View>
              <Text style={s.recentMeta}>
                Aura {r.score} · {timeAgo(r.finishedAt)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={T.faint} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── hamburger menu modal ──────────────────────────────────────────────────
function HamburgerMenu({
  visible,
  onClose,
  onProfile,
  onReports,
  onLogout,
}: {
  visible: boolean;
  onClose: () => void;
  onProfile: () => void;
  onReports: () => void;
  onLogout: () => void;
}) {
  const items: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; tone?: 'danger' }[] = [
    { label: 'Profile', icon: 'person-outline', onPress: onProfile },
    { label: 'Reports', icon: 'document-text-outline', onPress: onReports },
    { label: 'Logout', icon: 'log-out-outline', onPress: onLogout, tone: 'danger' },
  ];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.menuBackdrop} onPress={onClose} accessibilityLabel="Close menu">
        <View />
      </Pressable>
      <View style={s.menuSheetOuter}>
        <BlurView intensity={50} tint="dark" style={s.menuSheetBlur}>
          <View style={s.menuSheetTint}>
            <Text style={s.menuEyebrow}>◢ MENU</Text>
            {items.map((it, i) => (
              <TouchableOpacity
                key={it.label}
                onPress={() => {
                  onClose();
                  it.onPress();
                }}
                style={[s.menuItem, i < items.length - 1 && s.menuItemDivider]}
                accessibilityLabel={it.label}
              >
                <Ionicons
                  name={it.icon}
                  size={18}
                  color={it.tone === 'danger' ? T.red : T.ink}
                  style={{ marginRight: 12 }}
                />
                <Text style={[s.menuItemText, it.tone === 'danger' && { color: T.red }]}>{it.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

// ─── main screen ───────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const router = useRouter();
  const { isAuthenticated, user, signOut } = useAuth();
  const { reports, latestReport } = useReports();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => router.replace('/auth'), 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const firstName = (user?.name || 'Investor').split(' ')[0];

  const hasReports = reports.length > 0;

  // SearchCard → kick off the agent pipeline immediately. Calls createAnalysis
  // with the full payload, then pushes the user straight to /loading so the
  // boardroom animation begins. If the backend isn't reachable, we still
  // navigate to /loading (without an id) so the demo flow runs against the
  // placeholder report downstream.
  const goRunDetailed = async (payload: SearchPayload) => {
    const d = payload.details;
    // Match search.tsx's context-string convention: focus + URLs merged.
    const parts: string[] = [];
    if (d?.focus) parts.push(d.focus);
    if (d?.website) parts.push(`Website: ${d.website}`);
    if (d?.linkedin) parts.push(`LinkedIn: ${d.linkedin}`);
    const context = parts.length > 0 ? parts.join(' | ') : undefined;

    // createAnalysis expects { uri, name, type }; DocumentPicker exposes mimeType.
    const file = d?.pitchDeckFile
      ? {
          uri: d.pitchDeckFile.uri,
          name: d.pitchDeckFile.name,
          type: d.pitchDeckFile.mimeType ?? 'application/pdf',
        }
      : undefined;

    try {
      const analysis = await createAnalysis({
        name: payload.name,
        intent: payload.intent.toLowerCase(),
        sector: d?.sector,
        stage: d?.stage,
        funding: d?.funding,
        context,
        file,
      });
      router.push({ pathname: '/loading', params: { id: analysis.id, name: payload.name } });
    } catch (err: any) {
      // Surface the real reason instead of silently sliding into a placeholder
      // report — that's what made trending picks feel like "static results".
      const raw = err?.message || 'Could not start analysis.';
      let msg = raw;
      const i = raw.indexOf('{');
      if (i !== -1) {
        try {
          const parsed = JSON.parse(raw.slice(i));
          if (parsed?.detail) msg = String(parsed.detail);
        } catch {
          // not JSON; keep raw
        }
      }
      toast.show(msg, { type: 'error', title: 'ANALYSIS FAILED' });
    }
  };

  const handleProfile = () => {
    router.push('/profile');
  };
  const handleReports = () => {
    router.push('/reports');
  };
  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      router.replace('/auth');
    }
  };

  return (
    <SafeAreaView style={s.screen}>
      <BackgroundGlow />
      <ScrollView contentContainerStyle={{ paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
        <Header onMenu={() => setMenuOpen(true)} />

        {hasReports ? (
          <>
            <Welcome firstName={firstName} />
            <SearchCard onRun={goRunDetailed} />
            <View style={{ height: 22 }} />
            {latestReport && <AuraScoreCard report={latestReport} />}
            <View style={{ height: 22 }} />
            <QuickInsights />
            <View style={{ height: 6 }} />
            <RecentList
              reports={reports}
              onPick={(id, name) => router.push({ pathname: '/report', params: { id, name } })}
            />
          </>
        ) : (
          <>
            <Welcome firstName={firstName} />
            <SearchCard onRun={goRunDetailed} />
            <View style={{ height: 22 }} />
            <MeetAgents onHowItWorks={() => router.push('/how-they-work')} />
            <View style={{ height: 22 }} />
            <EmptyAura />
            <View style={{ height: 22 }} />
            <Trending onPick={(companyName) => goRunDetailed({ name: companyName, intent: 'Research' })} />
            <View style={{ height: 6 }} />
            <EmptyHistory />
          </>
        )}

      </ScrollView>

      <HamburgerMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onProfile={handleProfile}
        onReports={handleReports}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
}

// ─── styles ────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },

  // ── header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  menuBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerLogo: { width: 56, height: 56 },

  // ── welcome
  welcomeHead: {
    fontSize: 26,
    fontWeight: '500',
    color: T.ink,
    letterSpacing: -0.6,
    lineHeight: 30,
  },
  welcomeSub: {
    marginTop: 8,
    fontSize: 13,
    color: T.dim,
    lineHeight: 19,
    maxWidth: 320,
  },

  // ── section header
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
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
  sectionMeta: {
    fontFamily: MONO,
    fontSize: 10,
    color: T.faint,
    letterSpacing: 0.6,
  },
  sectionAction: {
    fontFamily: MONO,
    fontSize: 10,
    color: T.purple,
    letterSpacing: 0.6,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },

  // ── search card
  searchCardWrap: {
    position: 'relative',
  },
  searchHaloWrap: {
    position: 'absolute',
    top: -28,
    left: -28,
    right: -28,
    bottom: -28,
    opacity: 0.6,
  },
  searchCardOuter: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.purpleEdge,
    overflow: 'hidden',
    shadowColor: T.purple,
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  searchCard: {
    padding: 16,
  },
  searchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  searchStatus: { flexDirection: 'row', alignItems: 'center' },
  purpleDot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: T.purple,
    marginRight: 7,
  },
  searchStatusText: {
    fontFamily: MONO,
    fontSize: 10.5,
    color: T.ink,
    letterSpacing: 1,
  },
  searchAgents: {
    fontFamily: MONO,
    fontSize: 10,
    color: T.faint,
    letterSpacing: 0.6,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: T.line2,
    borderRadius: 13,
    paddingHorizontal: 14,
    minHeight: 48,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: T.ink,
    fontSize: 15,
  },
  suggRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 14 },
  tryLabel: {
    fontFamily: MONO,
    fontSize: 9.5,
    color: T.faint,
    letterSpacing: 0.8,
    marginRight: 2,
  },
  suggChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(149,80,238,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(149,80,238,0.28)',
  },
  suggChipText: { color: T.purpleInk, fontSize: 12, fontWeight: '500' },

  // ── intent picker (shown once user starts typing)
  intentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  intentChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: T.line2,
    minHeight: 36,
    justifyContent: 'center',
  },
  intentChipActive: {
    backgroundColor: T.purpleSoft,
    borderColor: T.purpleEdge,
  },
  intentChipText: {
    color: T.dim,
    fontSize: 12.5,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  intentChipTextActive: {
    color: T.purpleInk,
  },

  // ── additional details toggle + expanded panel
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(149,80,238,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(149,80,238,0.25)',
    marginBottom: 12,
  },
  detailsToggleText: {
    color: T.purpleInk,
    fontSize: 12.5,
    fontWeight: '500',
    flex: 1,
  },
  detailsPanel: {
    paddingTop: 4,
    paddingBottom: 4,
    marginBottom: 12,
  },
  detailLabel: {
    fontFamily: MONO,
    fontSize: 9.5,
    color: T.faint,
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  detailBox: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: T.line2,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 42,
    justifyContent: 'center',
  },
  detailBoxFocused: {
    borderColor: T.purpleEdge,
    backgroundColor: 'rgba(149,80,238,0.06)',
  },
  detailInput: {
    color: T.ink,
    fontSize: 13.5,
    paddingVertical: 10,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: T.line2,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  uploadBtnText: {
    flex: 1,
    color: T.dim,
    fontSize: 13,
  },
  contextHead: {
    fontFamily: MONO,
    fontSize: 9.5,
    color: T.faint,
    letterSpacing: 1.4,
    marginTop: 6,
    marginBottom: 10,
  },

  searchCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    minHeight: 50,
  },
  searchCtaText: { color: '#fff', fontSize: 14.5, fontWeight: '600', letterSpacing: -0.2 },

  // ── roster (meet your agents)
  rosterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  rosterCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: T.line2,
    borderRadius: 14,
    padding: 13,
    gap: 8,
  },
  rosterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  glyphBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: T.purpleSoft,
    borderWidth: 1,
    borderColor: T.purpleEdge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleTag: {
    fontFamily: MONO,
    fontSize: 9,
    color: T.faint,
    letterSpacing: 0.8,
  },
  rosterName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: T.ink,
    letterSpacing: -0.2,
  },
  rosterRole: {
    fontFamily: MONO,
    fontSize: 10,
    color: T.faint,
    marginTop: 2,
  },

  // ── aura (shared parts)
  auraCardOuter: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: T.purpleEdge,
    overflow: 'hidden',
    shadowColor: T.purple,
    shadowOpacity: 0.2,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  auraCard: {
    padding: 18,
  },
  auraEmptyOuter: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: T.purpleEdge,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  auraEmptyCard: {
    padding: 18,
  },
  auraEmptyHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dashChip: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: T.line2,
  },
  dashChipText: { fontFamily: MONO, fontSize: 10, color: T.faint, letterSpacing: 0.8 },
  auraBody: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  auraRingWrap: { width: 148, height: 148, position: 'relative' },
  auraRingCenter: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  auraScore: { fontSize: 44, fontWeight: '500', color: T.ink, letterSpacing: -1.4, lineHeight: 46 },
  auraScoreEmpty: { fontSize: 44, fontWeight: '500', color: T.ghost, letterSpacing: -1.4, lineHeight: 46 },
  auraMaxText: { fontFamily: MONO, fontSize: 10, color: T.faint, letterSpacing: 0.8, marginTop: 2 },
  auraTier: { fontFamily: MONO, fontSize: 9.5, color: T.green, letterSpacing: 1, marginTop: 4 },
  auraTbd: { fontFamily: MONO, fontSize: 9.5, color: T.faint, letterSpacing: 1, marginTop: 4 },

  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  breakdownLabel: { fontSize: 12, color: T.faint, fontWeight: '500' },
  breakdownVal: { fontFamily: MONO, fontSize: 11.5, color: T.ghost },
  breakdownTrack: {
    height: 4,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  breakdownEmptyFill: {
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    opacity: 0.5,
  },
  breakdownFill: {
    height: '100%',
    backgroundColor: T.purple,
  },

  auraFootRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: T.line2,
    borderStyle: 'dashed',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  auraFootText: { fontFamily: MONO, fontSize: 10, color: T.dim, letterSpacing: 0.4 },

  // ── verdict pill
  verdictPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  verdictPillText: {
    fontFamily: MONO,
    fontSize: 9.5,
    letterSpacing: 0.8,
    fontWeight: '600',
  },

  // ── insight cards (Quick Insights, populated state)
  insightOuter: {
    width: 244,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.line2,
    overflow: 'hidden',
  },
  insightCard: {
    padding: 14,
    minHeight: 160,
    position: 'relative',
  },
  insightGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 80,
    opacity: 0.08,
  },
  insightHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  insightTag: {
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 5,
    borderWidth: 1,
  },
  insightTagText: {
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  insightTitle: {
    color: T.ink,
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  insightSubtitle: {
    color: T.dim,
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  insightFoot: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: T.line2,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  insightSource: {
    fontFamily: MONO,
    fontSize: 9.5,
    color: T.faint,
    letterSpacing: 0.4,
    flex: 1,
  },
  insightArrow: {
    fontFamily: MONO,
    fontSize: 11,
    color: T.purple,
    marginLeft: 6,
  },

  // ── trending
  trendCard: {
    width: 168,
    borderRadius: 16,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: T.line2,
    gap: 10,
  },
  trendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trendInitial: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  trendInitialText: { color: T.ink, fontWeight: '600', fontSize: 13 },
  trendLogo: { width: '100%', height: '100%' },
  heatChip: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  heatChipText: { fontFamily: MONO, fontSize: 8.5, letterSpacing: 1 },
  trendName: { color: T.ink, fontSize: 13.5, fontWeight: '600', letterSpacing: -0.2 },
  trendSector: { fontFamily: MONO, fontSize: 10, color: T.faint, marginTop: 2 },
  trendFootRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: T.line2,
    borderStyle: 'dashed',
  },
  trendStat: { fontFamily: MONO, fontSize: 11, color: T.ink, fontWeight: '500' },
  trendRun: { fontFamily: MONO, fontSize: 10, color: T.purple },

  // ── empty history
  emptyHist: {
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: T.line2,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 10,
  },
  emptyHistGlyph: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: T.purpleEdge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHistTitle: { color: T.ink, fontSize: 14, fontWeight: '600', letterSpacing: -0.2 },
  emptyHistSub: { color: T.dim, fontSize: 12, lineHeight: 18, textAlign: 'center', maxWidth: 240 },

  // ── recent list (populated)
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.025)',
    borderWidth: 1,
    borderColor: T.line,
  },
  recentInitial: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: T.line2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentInitialText: { color: T.ink, fontSize: 13, fontWeight: '600' },
  recentName: { color: T.ink, fontSize: 13.5, fontWeight: '600', letterSpacing: -0.2, flexShrink: 1 },
  recentMeta: { fontFamily: MONO, fontSize: 10, color: T.faint, marginTop: 2, letterSpacing: 0.4 },

  // ── menu modal
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuSheetOuter: {
    position: 'absolute',
    top: 60,
    left: 16,
    minWidth: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.line2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  menuSheetBlur: {
    // BlurView fills the rounded container; the inner tint adds the
    // saturated dark overlay so we don't end up with white frosted glass.
  },
  menuSheetTint: {
    backgroundColor: 'rgba(14,11,24,0.62)',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  menuEyebrow: {
    fontFamily: MONO,
    fontSize: 9,
    color: T.faint,
    letterSpacing: 1.4,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    minHeight: 44,
  },
  menuItemDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.line2,
  },
  menuItemText: { color: T.ink, fontSize: 14, fontWeight: '500' },
});
