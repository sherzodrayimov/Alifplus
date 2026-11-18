#!/bin/bash
set -e

APP_NAME="Alif+"
BUNDLE_DIR="build/${APP_NAME}.app"
DMG_NAME="AlifPlus-2.0-macOS.dmg"

rm -rf build "${DMG_NAME}"
mkdir -p "${BUNDLE_DIR}/Contents/MacOS"
mkdir -p "${BUNDLE_DIR}/Contents/Resources"

cp Info.plist "${BUNDLE_DIR}/Contents/Info.plist"

echo "1/3 Universal Binary (Apple Silicon arm64 + Intel x86_64) kompilyatsiya qilinmoqda..."
swiftc -O -target arm64-apple-macos11.0 AlifPlusApp.swift -o build/AlifPlus-arm64
swiftc -O -target x86_64-apple-macos11.0 AlifPlusApp.swift -o build/AlifPlus-x86_64
lipo -create -output "${BUNDLE_DIR}/Contents/MacOS/AlifPlus" build/AlifPlus-arm64 build/AlifPlus-x86_64
chmod +x "${BUNDLE_DIR}/Contents/MacOS/AlifPlus"

echo "2/3 Ad-hoc imzo qo'yilmoqda (Apple Silicon SIGKILL xatosini oldini olish uchun)..."
codesign --force --deep --sign - "${BUNDLE_DIR}"

echo "3/3 DMG yaratilmoqda..."
mkdir -p build/dmg_root
cp -R "${BUNDLE_DIR}" build/dmg_root/
ln -s /Applications build/dmg_root/Applications
hdiutil create -volname "Alif+ 2.0" -srcfolder build/dmg_root -ov -format UDZO "${DMG_NAME}"

echo "Tayyor! ${DMG_NAME} yaratildi."
