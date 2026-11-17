# Alif+ (v1.1.0) — O‘zbekcha Klaviatura Terilmasi + Avto-O‘girish + Veb-sayt

Ushbu papka **Alif+ (v1.1.0)** loyihasini GitHub’ga yuklash, Windows (`.exe`) va macOS (`.dmg`) o‘rnatuvchilarini avtomatik yig‘ish hamda taqdimot saytini ishga tushirish uchun **barcha kerakli fayllarni** o‘z ichiga oladi.

## Papka tarkibi
- `index.html` — Jonli sinov maydoni, real-vaqt avto-o‘girish va OS’ni avtomatik aniqlab yuklab beruvchi veb-sayt.
- `.github/workflows/release.yml` — GitHub Actions avtomatik yig‘uvchi (Windows `.exe` + macOS `.dmg`).
- `macos/` — `Alif+.bundle` (ÖZ ikonkali), `AlifAutoConvert.swift` (real-vaqt avto-o‘girish) va `build_dmg.sh`.
- `windows/` — `kbdalif.c` (klaviatura drayveri), `AlifAutoConvert.c` (real-vaqt avto-o‘girish) va `installer.nsi` (NSIS `.exe` o‘rnatuvchi).

## GitHub’ga yuklash va ishga tushirish (3 qadam)

1. GitHub’da yangi **Public** repository yarating (masalan, `alifplus`).
2. Ushbu papkadagi barcha fayllarni yuklang va `v1.1.0` tegini yuboring:
   ```bash
   git init
   git add .
   git commit -m "Alif+ v1.1.0 launch"
   git branch -M main
   git remote add origin https://github.com/SIZNING_USERNAME/alifplus.git
   git push -u origin main
   git tag v1.1.0
   git push origin v1.1.0
   ```
3. **Saytni yoqish:** Repository → **Settings → Pages → Source: Deploy from a branch (`main` / `/root`)** ni tanlang. 1 daqiqada sayt `https://SIZNING_USERNAME.github.io/alifplus/` manzilida ishga tushadi va yuklab olish tugmalari avtomatik ravishda GitHub Releases’dagi `.exe` va `.dmg` fayllarga ulanadi.
