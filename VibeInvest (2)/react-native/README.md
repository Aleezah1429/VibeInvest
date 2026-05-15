# VibeInvest — React Native

React Native conversion of the VibeInvest investor-due-diligence app design. Dark indigo theme, four screens, agent pipeline animation.

## Stack
- **React Native** 0.73
- **React Navigation** (native-stack) for screen flow
- **react-native-vector-icons** (Feather) for line icons
- Pure RN `Animated` API for the loading-screen pulse + progress bar

## Project layout
```
react-native/
├─ App.js                       # NavigationContainer + Stack
├─ package.json
└─ src/
   ├─ theme.js                  # colors, radii, typography tokens
   └─ screens/
      ├─ SplashScreen.js        # Splash + stats + CTAs
      ├─ SearchScreen.js        # Form, intent, recent reports
      ├─ LoadingScreen.js       # 4-agent pipeline + progress bar
      └─ ReportScreen.js        # Score, dimensions, metrics, expandable agent cards
```

## Setup

```bash
# 1. Create a fresh RN app (or use Expo)
npx react-native@latest init VibeInvest
cd VibeInvest

# 2. Drop these files in (replace App.js, add src/)
#    Copy everything from react-native/ in this project.

# 3. Install deps
npm install @react-navigation/native @react-navigation/native-stack \
            react-native-safe-area-context react-native-screens \
            react-native-vector-icons

# 4. iOS native deps
cd ios && pod install && cd ..

# 5. Run
npm run ios     # or
npm run android
```

### react-native-vector-icons
- **iOS**: add `Feather.ttf` to your app's Info.plist under `UIAppFonts` (or auto-link via the library's docs).
- **Android**: add this line to `android/app/build.gradle`:
  ```gradle
  apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
  ```

## Expo alternative

If you'd rather use Expo, swap `react-native-vector-icons/Feather` for `@expo/vector-icons/Feather` — same API, no linking required.

```js
// in each screen file
import { Feather as Icon } from '@expo/vector-icons';
```

## Notes
- All colors, radii, and weights live in `src/theme.js` — edit there to re-skin.
- Emoji are used for agent avatars / logos as in the original HTML. Replace with real SVGs (e.g. `react-native-svg`) when you have brand-final assets.
- The grid backdrop on Splash is recreated with tiled bordered cells (no SVG). If you want exact parity, drop in `react-native-svg` and draw two stroke patterns instead.
- Screen-to-screen transitions use the stack's `fade` animation to match the HTML's `fadeIn` keyframe.
