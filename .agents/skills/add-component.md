---
description: Create a reusable UI component the right way
---

# Skill: Add Component

**When to use**: Whenever you have UI logic that is reused across multiple screens or makes a screen file too large (e.g., an `AgentCard` or `StatBox`).

**Steps**:
1. Create the file in the `components/` directory (e.g., `components/AgentCard.tsx`).
2. Define a strict TypeScript interface for the component props. No `any` types.
3. Keep styling in the same file using `StyleSheet.create`.
4. If the component receives heavy data, wrap it in `React.memo` only if performance is a known issue. Otherwise, standard functional components are fine.
5. Export the component as the default export (or named export if grouped).

**Template**:
```tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'ghost';
}

export default function CustomButton({ label, onPress, icon, variant = 'primary' }: CustomButtonProps) {
  const isPrimary = variant === 'primary';
  
  return (
    <TouchableOpacity 
      style={[styles.base, isPrimary ? styles.primary : styles.ghost]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon && <Ionicons name={icon} size={16} color={isPrimary ? '#fff' : 'rgba(255,255,255,0.6)'} style={styles.icon} />}
      <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textGhost]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', padding: 16, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: '#6366f1' },
  ghost: { backgroundColor: 'transparent', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)' },
  icon: { marginRight: 8 },
  text: { fontSize: 14, fontWeight: '600' },
  textPrimary: { color: '#fff' },
  textGhost: { color: 'rgba(255,255,255,0.6)' }
});
```
