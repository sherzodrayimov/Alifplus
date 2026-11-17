#!/bin/bash
set -euo pipefail
VERSION="1.1.0"
APP_NAME="Alif+"
DMG_NAME="AlifPlus-${VERSION}.dmg"
STAGE_DIR="build/dmg_stage"
HELPER_APP="$STAGE_DIR/Alif+ Avto-O'girish.app"

rm -rf build
mkdir -p "$STAGE_DIR"
mkdir -p "$HELPER_APP/Contents/MacOS"
mkdir -p "$HELPER_APP/Contents/Resources"

# Compile Universal macOS Auto-Convert Helper (arm64 + x86_64)
swiftc -O -target arm64-apple-macos12.0 macos/AlifAutoConvert.swift -o build/AlifAutoConvert_arm64 -framework Cocoa -framework Carbon
swiftc -O -target x86_64-apple-macos12.0 macos/AlifAutoConvert.swift -o build/AlifAutoConvert_x86_64 -framework Cocoa -framework Carbon
lipo -create -output "$HELPER_APP/Contents/MacOS/AlifAutoConvert" build/AlifAutoConvert_arm64 build/AlifAutoConvert_x86_64

cp "macos/Alif+.bundle/Contents/Resources/Alif+.icns" "$HELPER_APP/Contents/Resources/Alif+.icns"

cat << 'EOF' > "$HELPER_APP/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>AlifAutoConvert</string>
    <key>CFBundleIdentifier</key>
    <string>uz.alifplus.autoconvert</string>
    <key>CFBundleName</key>
    <string>Alif+ Avto-O'girish</string>
    <key>CFBundleIconFile</key>
    <string>Alif+.icns</string>
    <key>CFBundleShortVersionString</key>
    <string>1.1.0</string>
    <key>LSUIElement</key>
    <true/>
</dict>
</plist>
EOF

cp -R "macos/Alif+.bundle" "$STAGE_DIR/"
cp "macos/O'rnatish (1-klik).command" "$STAGE_DIR/"
chmod +x "$STAGE_DIR/O'rnatish (1-klik).command"
ln -s "/Library/Keyboard Layouts" "$STAGE_DIR/Keyboard Layouts"

cat << 'EOF' > "$STAGE_DIR/O'qib chiqing.txt"
Alif+ (v1.1.0) — O'zbekcha klaviatura terilmasi + Avto-o'girish

1. "Alif+.bundle" faylini "Keyboard Layouts" jildiga tashlang.
2. Eski alifboda (o', g', sh, ch) yozganda avtomatik ravishda (ö, ğ, ş, ç) ga o'girish uchun:
   "Alif+ Avto-O'girish.app" dasturini Applications jildiga nusxalab ishga tushiring
   (yuqori menyu panelida "ÖZ⇄" belgisi paydo bo'ladi).
EOF

hdiutil create -volname "${APP_NAME} ${VERSION}" \
    -srcfolder "$STAGE_DIR" \
    -ov -format UDZO \
    "build/${DMG_NAME}"

echo "✅ Yaratildi: build/${DMG_NAME}"
