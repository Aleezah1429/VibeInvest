---
description: Checklist for debugging iOS vs Android bugs
---

# Skill: Debug Platform Issue

**When to use**: When a component looks fine on iOS but breaks on Android (or vice-versa).

**Checklist**:
1. **Shadows**: iOS uses `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`. Android requires the `elevation` property. If shadows are missing on Android, add `elevation`.
2. **Keyboard**: Text inputs hidden behind the keyboard? Wrap the screen in `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>`.
3. **Safe Area**: Android notches vary. Ensure you are using `SafeAreaView` from `react-native-safe-area-context` instead of the standard `react-native` one, as it behaves better cross-platform.
4. **Z-Index**: Android historically struggles with `zIndex`. If an absolute positioned element is hidden on Android, re-order the elements in the JSX structure so the top element is rendered last.
5. **Overflow**: `overflow: 'hidden'` behaves differently. On Android, it clips shadows. Test shadow/overflow combinations rigorously.

**Platform Check Utility**:
```typescript
import { Platform } from 'react-native';

const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';

// Usage in styling
const styles = StyleSheet.create({
  card: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1 },
      android: { elevation: 3 }
    })
  }
});
```
