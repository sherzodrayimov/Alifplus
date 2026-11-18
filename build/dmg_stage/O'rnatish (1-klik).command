#!/bin/bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
LAYOUTS="$HOME/Library/Keyboard Layouts"
APPS="$HOME/Applications"
NAME="Alif+ Avto-O'girish.app"
fail() { echo "O‘rnatish tugamadi: $*" >&2; exit 1; }
[[ -d "$DIR/Alif+.bundle" && -d "$DIR/$NAME" ]] || fail "Paket to‘liq emas."
/usr/bin/plutil -lint "$DIR/Alif+.bundle/Contents/Info.plist" >/dev/null
/usr/bin/codesign --verify --deep --strict "$DIR/$NAME" || fail "Ilova imzosi tekshiruvdan o‘tmadi."
mkdir -p "$LAYOUTS" "$APPS"
LAYOUT_STAGE="$(mktemp -d "$LAYOUTS/.alif-stage.XXXXXX")"
APP_STAGE="$(mktemp -d "$APPS/.alif-stage.XXXXXX")"
cleanup() { rm -rf "$LAYOUT_STAGE" "$APP_STAGE"; }
trap cleanup EXIT
/usr/bin/ditto "$DIR/Alif+.bundle" "$LAYOUT_STAGE/Alif+.bundle"
/usr/bin/ditto "$DIR/$NAME" "$APP_STAGE/$NAME"
# Only the two explicitly installed Alif+ components are unquarantined.
for component in "$LAYOUT_STAGE/Alif+.bundle" "$APP_STAGE/$NAME"; do
    /usr/bin/xattr -dr com.apple.quarantine "$component" 2>/dev/null || true
done
/usr/bin/pkill -x AlifAutoConvert 2>/dev/null || true
# Keep the previous copy until the complete replacement has been staged.
for pair in layout app; do
    if [[ "$pair" == layout ]]; then base="$LAYOUTS"; component="Alif+.bundle"; stage="$LAYOUT_STAGE"
    else base="$APPS"; component="$NAME"; stage="$APP_STAGE"; fi
    rm -rf "$base/$component.previous"
    [[ ! -e "$base/$component" ]] || mv "$base/$component" "$base/$component.previous"
    if ! mv "$stage/$component" "$base/$component"; then
        [[ ! -e "$base/$component.previous" ]] || mv "$base/$component.previous" "$base/$component"
        fail "Faylni joylab bo‘lmadi: $component"
    fi
done
open "$APPS/$NAME" || fail "Ilovani ishga tushirib bo‘lmadi."
echo "Alif+ o‘rnatildi. Yordamchi: $APPS/$NAME"
echo "1. Privacy & Security → Accessibility orqali o‘rnatilgan Alif+ ga ruxsat bering."
echo "2. Keyboard → Text Input → Edit → + → Uzbek yoki Others → Alif+ ni tanlang."
echo "3. Menyu satridan Alif+ terilmasini tanlang. Ctrl+Shift bilan avto-o‘girishni yoqing."
echo "4. TextEdit’da shahar → şahar va o'zbek → özbek ni sinang. Darhol Delete — asl yozuv."
echo "To‘liq yo‘riqnoma yordamchining ÖZ menyusida ham mavjud."
echo "Ko‘rinmasa, hisobdan chiqib qayta kiring."
if [[ -d "/Library/Keyboard Layouts/Alif+.bundle" ]]; then
    echo "Eski umumiy nusxa ham mavjud: /Library/Keyboard Layouts/Alif+.bundle. Uni Finder orqali olib tashlang."
fi
open "$APPS/$NAME/Contents/Resources/Ornatish-yoriqnomasi.html" 2>/dev/null || true
