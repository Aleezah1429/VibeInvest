import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  duration?: number;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextType {
  show: (message: string, options?: ToastOptions) => void;
  hide: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Premium Neon / VibeInvest themed colors
const COLORS = {
  success: '#3ddc97',
  error: '#ff5d6c',
  warning: '#f0b34a',
  info: '#818cf8',
};

const BORDERS = {
  success: 'rgba(61, 220, 151, 0.3)',
  error: 'rgba(255, 93, 108, 0.3)',
  warning: 'rgba(240, 179, 74, 0.3)',
  info: 'rgba(129, 140, 248, 0.3)',
};

const GLOWS = {
  success: 'rgba(61, 220, 151, 0.15)',
  error: 'rgba(255, 93, 108, 0.15)',
  warning: 'rgba(240, 179, 74, 0.15)',
  info: 'rgba(129, 140, 248, 0.15)',
};

const ICONS: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle-sharp',
  error: 'alert-circle-sharp',
  warning: 'warning-sharp',
  info: 'information-circle-sharp',
};

const TITLES: Record<ToastType, string> = {
  success: 'SUCCESS',
  error: 'ERROR OCCURRED',
  warning: 'WARNING',
  info: 'NOTIFICATION',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setState((prev) => ({ ...prev, visible: false }));
    });
  }, [slideAnim, fadeAnim]);

  const show = useCallback(
    (message: string, options?: ToastOptions) => {
      const type = options?.type ?? 'info';
      const title = options?.title ?? TITLES[type];
      const duration = options?.duration ?? 4500;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setState({
        visible: true,
        message,
        type,
        title,
      });

      // Animate entry
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        hide();
      }, duration);
    },
    [slideAnim, fadeAnim, hide]
  );

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const toastColor = COLORS[state.type];
  const toastBorder = BORDERS[state.type];
  const toastGlow = GLOWS[state.type];
  const toastIcon = ICONS[state.type];

  return (
    <ToastContext.Provider value={{ show, hide }}>
      {children}
      {state.visible && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              top: insets.top > 0 ? insets.top + 8 : 24,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              shadowColor: toastColor,
            },
          ]}
        >
          <BlurView tint="dark" intensity={85} style={[styles.blurView, { borderColor: toastBorder }]}>
            {/* Glow Aura Overlay */}
            <View style={[styles.glowAura, { backgroundColor: toastGlow }]} pointerEvents="none" />
            
            <View style={styles.contentRow}>
              {/* Icon Container */}
              <View style={[styles.iconWrapper, { backgroundColor: `${toastColor}15` }]}>
                <Ionicons name={toastIcon} size={20} color={toastColor} />
              </View>

              {/* Message Block */}
              <View style={styles.textContainer}>
                {state.title && (
                  <Text style={[styles.title, { color: toastColor }]}>
                    {state.title}
                  </Text>
                )}
                <Text style={styles.message} numberOfLines={3}>
                  {state.message}
                </Text>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                onPress={hide}
                style={styles.closeBtn}
                accessibilityLabel="Close notification"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close-sharp" size={18} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999999,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  blurView: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(12, 12, 18, 0.75)',
  },
  glowAura: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    bottom: -50,
    opacity: 0.7,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
    fontWeight: '500',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
