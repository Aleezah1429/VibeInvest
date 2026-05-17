# Setup Guide

Complete setup instructions for running VibeInvest locally.

---

## Prerequisites

| Tool | Version | Why |
|------|---------|-----|
| Node.js | 18+ | Expo CLI and React Native tooling |
| Yarn | 1.22+ | Package manager (see `packageManager` in `package.json`) |
| Python | 3.10+ | FastAPI backend + Google ADK agent runner |
| Expo CLI | Latest | `npx expo` — no global install needed |
| iOS Simulator | Xcode 15+ | iOS testing (macOS only) |
| Android Emulator | API 34+ | Android testing |

---

## 1. Clone the Repo

```bash
git clone https://github.com/Aleezah1429/VibeInvest.git
cd VibeInvest
```

---

## 2. Backend Setup (FastAPI + Google ADK)

### 2.1 Create a Python virtual environment

```bash
python -m venv venv
source venv/bin/activate   # macOS/Linux
# venv\Scripts\activate    # Windows
```

### 2.2 Install Python dependencies

```bash
pip install fastapi uvicorn sse-starlette google-adk
```

### 2.3 Configure environment variables

Create `google-adk-agent/.env`:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081
```

> **Where to get a key**: Visit [Google AI Studio](https://aistudio.google.com/apikey) to generate a Gemini API key.

### 2.4 Run the backend

```bash
# Run from project root so import paths resolve correctly
uvicorn api.main:app --reload --port 8000
```

### 2.5 Verify

```bash
curl http://localhost:8000/api/health
# → {"status":"ok"}
```

---

## 3. Mobile App Setup (Expo / React Native)

### 3.1 Install dependencies

```bash
yarn install
```

### 3.2 Configure API endpoint

Create a `.env` file in the project root (or set the environment variable):

```env
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

> **On a physical device**: Replace `localhost` with your machine's local IP address (e.g., `http://192.168.1.42:8000/api`).

### 3.3 Start the dev server

```bash
# Start Expo dev server
npx expo start

# Or target a specific platform directly:
npx expo start --ios
npx expo start --android
```

### 3.4 Run on simulators

- **iOS**: Press `i` in the Expo CLI terminal, or run `npx expo start --ios`
- **Android**: Press `a` in the Expo CLI terminal, or run `npx expo start --android`
- **Expo Go**: Scan the QR code with the Expo Go app on your physical device

---

## 4. Environment Variables Reference

| Variable | File | Required | Purpose |
|----------|------|----------|---------|
| `GOOGLE_API_KEY` | `google-adk-agent/.env` | ✅ | Gemini API auth for ADK agents |
| `ALLOWED_ORIGINS` | `google-adk-agent/.env` | ✅ | CORS allowlist for FastAPI |
| `EXPO_PUBLIC_API_URL` | `.env` (root) | ⚠️ Optional | Backend URL for mobile app (defaults to `http://localhost:8000/api`) |
| `ANTHROPIC_API_KEY` | `api/.env` | ❌ Optional | Claude SDK comparison runner |
| `OPENAI_API_KEY` | `api/.env` | ❌ Optional | OpenAI Agents comparison runner |

> ⚠️ **Security**: Never commit `.env` files with real API keys. Add them to `.gitignore`.

---

## 5. Smoke Test — End to End

```bash
# 1. Start the backend
uvicorn api.main:app --reload --port 8000

# 2. In a new terminal, test SSE streaming
curl -N -X POST http://localhost:8000/api/run/google-adk \
  -H "Content-Type: application/json" \
  -d '{"company_name":"Bazaar Technologies"}'

# You should see SSE events:
# data: {"event":"pipeline_start", ...}
# data: {"event":"agent_start", "agent":"skeptic", ...}
# data: {"event":"agent_text", ...}
# ...
# data: {"event":"pipeline_complete", ...}

# 3. In another terminal, start the mobile app
npx expo start --ios
```

---

## 6. Troubleshooting

### `Error: GOOGLE_API_KEY not set`
Make sure `google-adk-agent/.env` exists and contains your key. The backend reads from this file at startup.

### Metro bundler stuck / cache issues
```bash
npx expo start --clear
```

### iOS build fails with "No such module"
```bash
cd ios && pod install && cd ..
npx expo start --ios
```

### Android emulator not detected
Ensure the emulator is running before pressing `a`. Check with:
```bash
adb devices
```

### SSE stream hangs or returns 500
- Verify your `GOOGLE_API_KEY` is valid and has Gemini API access
- Check the backend terminal for Python tracebacks
- Ensure `ALLOWED_ORIGINS` includes your frontend URL

### "Network request failed" on physical device
Replace `localhost` with your machine's IP in `EXPO_PUBLIC_API_URL`:
```bash
# Find your IP
ifconfig | grep "inet " | grep -v 127.0.0.1
```

---

*See [README.md](README.md) for project overview, and [AGENTS.md](AGENTS.md) for agent specifications.*
