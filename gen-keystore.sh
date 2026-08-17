#!/usr/bin/env bash
# ============================================================
#  Generate a signing keystore for release APK builds
#  Run ONCE, keep the .keystore file safe (do NOT commit it!)
# ============================================================

set -e

KEYSTORE="jee-battle-arena.keystore"
ALIAS="jee-battle-arena"

echo "⚔️  JEE Battle Arena — Keystore Generator"
echo "==========================================="
echo ""

read -rp "Your name / org  : " DNAME
read -rsp "Keystore password: " STORE_PASS; echo
read -rsp "Key password     : " KEY_PASS;   echo

keytool -genkey -v \
  -keystore "$KEYSTORE" \
  -alias "$ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=$DNAME, OU=JEE, O=BattleArena, L=IN, ST=IN, C=IN" \
  -storepass "$STORE_PASS" \
  -keypass "$KEY_PASS"

echo ""
echo "✅ Keystore saved: $KEYSTORE"
echo ""
echo "── For local release builds, set these env vars ──"
echo "   export KEYSTORE_PATH=\$(pwd)/$KEYSTORE"
echo "   export KEY_ALIAS=$ALIAS"
echo "   export KEY_PASSWORD=<your-key-pass>"
echo "   export STORE_PASSWORD=<your-store-pass>"
echo ""
echo "── For GitHub Actions release builds ─────────────"
echo "   Base64-encode the keystore and add as repo secrets:"
echo "   base64 -w 0 $KEYSTORE | pbcopy   # macOS"
echo "   base64 -w 0 $KEYSTORE            # Linux — then copy"
echo ""
echo "   GitHub Secrets to add:"
echo "   KEYSTORE_BASE64  = <base64 string above>"
echo "   KEY_ALIAS        = $ALIAS"
echo "   KEY_PASSWORD     = <your-key-pass>"
echo "   STORE_PASSWORD   = <your-store-pass>"
echo ""
echo "⚠️  Add $KEYSTORE to .gitignore — NEVER commit it!"
