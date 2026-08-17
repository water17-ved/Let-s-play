#!/usr/bin/env bash
# ============================================================
#  JEE Battle Arena — Local APK Build Script
#  Usage:
#    chmod +x build-apk.sh
#    ./build-apk.sh            # debug APK
#    ./build-apk.sh release    # release APK (needs keystore)
# ============================================================

set -e          # exit on any error
set -o pipefail

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Colour

BUILD_TYPE="${1:-debug}"

echo -e "${BOLD}⚔️  JEE Battle Arena — APK Builder${NC}"
echo "======================================"

# ── Pre-flight checks ─────────────────────────────────────
echo -e "\n${YELLOW}[1/5] Checking prerequisites...${NC}"

command -v node >/dev/null 2>&1 || { echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org${NC}"; exit 1; }
command -v java >/dev/null 2>&1 || { echo -e "${RED}✗ Java not found. Install JDK 17: https://adoptium.net${NC}"; exit 1; }

if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
  echo -e "${RED}✗ ANDROID_HOME not set.${NC}"
  echo "  Install Android Studio or SDK command-line tools, then:"
  echo "  export ANDROID_HOME=\$HOME/Android/Sdk"
  echo "  export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin:\$ANDROID_HOME/platform-tools"
  exit 1
fi

echo -e "${GREEN}✓ Node $(node -v)  |  Java $(java -version 2>&1 | head -1 | awk -F '"' '{print $2}')  |  ANDROID_HOME set${NC}"

# ── Install npm packages ──────────────────────────────────
echo -e "\n${YELLOW}[2/5] Installing npm packages...${NC}"
npm install --silent
echo -e "${GREEN}✓ npm packages ready${NC}"

# ── Ensure android/ platform exists ──────────────────────
echo -e "\n${YELLOW}[3/5] Setting up Capacitor Android platform...${NC}"
if [ ! -d "android" ]; then
  echo "android/ not found — running: npx cap add android"
  npx cap add android
else
  echo "android/ already exists — skipping add"
fi

npx cap sync android
echo -e "${GREEN}✓ Capacitor synced${NC}"

# ── Gradle build ─────────────────────────────────────────
echo -e "\n${YELLOW}[4/5] Building ${BUILD_TYPE} APK with Gradle...${NC}"
chmod +x android/gradlew

if [ "$BUILD_TYPE" = "release" ]; then
  if [ -z "$KEYSTORE_PATH" ]; then
    echo -e "${RED}✗ Release build requires KEYSTORE_PATH, KEY_ALIAS, KEY_PASSWORD, STORE_PASSWORD env vars.${NC}"
    echo "  Generate a keystore first:"
    echo "  keytool -genkey -v -keystore jee-battle-arena.keystore -alias jee-battle-arena -keyalg RSA -keysize 2048 -validity 10000"
    exit 1
  fi
  cd android && ./gradlew assembleRelease \
    -Pandroid.injected.signing.store.file="$KEYSTORE_PATH" \
    -Pandroid.injected.signing.store.password="$STORE_PASSWORD" \
    -Pandroid.injected.signing.key.alias="$KEY_ALIAS" \
    -Pandroid.injected.signing.key.password="$KEY_PASSWORD" \
    --no-daemon
  APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
else
  cd android && ./gradlew assembleDebug --no-daemon
  APK_PATH="../android/app/build/outputs/apk/debug/app-debug.apk"
fi

cd ..

# ── Done ─────────────────────────────────────────────────
echo -e "\n${YELLOW}[5/5] Locating output APK...${NC}"

# resolve path from repo root
if [ "$BUILD_TYPE" = "release" ]; then
  APK_FINAL="android/app/build/outputs/apk/release/app-release.apk"
else
  APK_FINAL="android/app/build/outputs/apk/debug/app-debug.apk"
fi

if [ -f "$APK_FINAL" ]; then
  SIZE=$(du -sh "$APK_FINAL" | cut -f1)
  echo ""
  echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  ✅  APK BUILD SUCCESSFUL!               ║${NC}"
  echo -e "${GREEN}╠══════════════════════════════════════════╣${NC}"
  echo -e "${GREEN}║  📦  File : $APK_FINAL${NC}"
  echo -e "${GREEN}║  📏  Size : $SIZE${NC}"
  echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
  echo ""
  echo "  Install on a connected device:"
  echo "  adb install -r $APK_FINAL"
else
  echo -e "${RED}✗ APK not found at expected path. Check Gradle output above.${NC}"
  exit 1
fi
