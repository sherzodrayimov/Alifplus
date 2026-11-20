# Alif+ — Yangi O‘zbek Lotin Alifbosi (2026) Ekotizimi

**Alif+** — 1995-yilgi o‘zbek lotin va kirill yozuvlaridan **2026-yilgi 28 harfli yangi o‘zbek lotin alifbosiga** (`Ö ö`, `Ğ ğ`, `Ş ş`, `Ç ç`) tezkor o‘tish uchun yaratilgan veb-platforma hamda **macOS / Windows** tizim ilovalari majmuasi.

🌐 **Rasmiy sayt:** [alifplus.uz](https://alifplus.uz)

---

## Asosiy imkoniyatlar

### 1. Veb-platforma (`index.html`, `web/`)
* **Real vaqt konverteri:** Kirill va eski lotin matnlarini bir zumda yangi alifboga (`o' → ö`, `g' → ğ`, `sh → ş`, `ch → ç`) o‘girish.
* **Hujjatlar konverteri:** `.docx`, `.pdf` va `.txt` fayllarni dizaynini buzmasdan brauzerning o‘zida (serversiz) konvertatsiya qilish.
* **28 harfli alifbo tartibi:** Yangi va 1995-yilgi alifbolarning qiyosiy jadvali.
* **Tez yoziş trenajyori (WPM):** Monkeytype uslubida yangi alifboda yozish tezligi va aniqligini oshirish mashqlari.
* **Namunaviy hujjatlar konstruktori:** *Tilxat*, *Ishdan bo‘shash arizasi*, *Ta’til arizasi*, *Tushuntirish xati*, *Tavsifnoma* va *Buyruq* hujjatlarini shakllantirib, tayyor **`.docx`** formatida yuklab olish.
* **Brauzer xatcho‘pi (Bookmarklet):** Istalgan veb-saytdagi maqolalarni 1 bosishda yangi alifboga o‘girib o‘qish.

### 2. Kompyuter dasturlari (`macos/`, `windows/`)
* **macOS (Universal — Apple Silicon M1–M4 va Intel):** Istalgan dasturda (Telegram, Word, Safari, VS Code) yozayotganda harflarni real vaqtda avtomatik o‘zgartiradi (`Ctrl + Shift` bilan yoqish/o‘chirish).
* **Windows (x64 va x32):** Windows 7 / 8 / 10 / 11 tizimlari uchun tizim darajasidagi jonli klaviatura yordamchisi.

---

## Loyiha tuzilmasi

```text
Alif+/
├── index.html          # Asosiy veb-ilova sahifasi
├── sayt.html           # Qo‘shimcha sahifa / o‘rnatish qo‘llanmasi
├── web/                # Konverter, trenajyor va hujjatlar konstruktori (JS/CSS)
├── macos/              # macOS ilovasi manba kodi va yig‘ish skriptlari
├── windows/            # Windows (C++) ilovasi manba kodi
└── .github/workflows/  # Avtomatik DMG va EXE reliz yig‘ish (GitHub Actions)

