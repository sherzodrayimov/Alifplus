#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="$HOME/Library/Keyboard Layouts"
mkdir -p "$TARGET_DIR"
rm -rf "$TARGET_DIR/Alif+.bundle"
cp -R "$DIR/Alif+.bundle" "$TARGET_DIR/"

if [ -d "$DIR/Alif+ Avto-O'girish.app" ]; then
    rm -rf "/Applications/Alif+ Avto-O'girish.app"
    cp -R "$DIR/Alif+ Avto-O'girish.app" "/Applications/"
    open "/Applications/Alif+ Avto-O'girish.app"
fi

killall -HUP cfprefsd 2>/dev/null || true
echo ""
echo "✅ Alif+ klaviatura terilmasi va Avto-O'girish yordamchisi o'rnatildi!"
open "x-apple.systempreferences:com.apple.Keyboard-Settings.extension" 2>/dev/null || true
