---
description: Scaffold a new screen and add it to the navigation in Expo Router
---

# Skill: Add Screen

**When to use**: Whenever you need to create a new visible page in the app.

**Steps**:
1. Check `app/_layout.tsx` to verify if this screen should be added to the primary Stack or needs special options (like `presentation: 'modal'`).
2. Create the file under the `app/` directory (e.g., `app/profile.tsx`).
3. Use the basic functional component pattern.
4. Always wrap the main content in a `SafeAreaView` with a dark background (`#09090F`).
5. Ensure there is a way to navigate back if it is not the home screen.

**Template**:
```tsx
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NewScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>New Screen</Text>
      </View>
      
      <View style={styles.content}>
        {/* Content goes here */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090F' },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, paddingHorizontal: 20 }
});
```
