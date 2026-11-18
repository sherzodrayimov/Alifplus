#define UNICODE
#define _UNICODE
#define WIN32_LEAN_AND_MEAN

#include <windows.h>
#include <shellapi.h>
#include <string>
#include <vector>

#define WM_TRAYICON (WM_USER + 1)
#define ID_TRAY_ICON 1001

#define IDM_TOGGLE_ENABLED 2001
#define IDM_RULE_O         2002
#define IDM_RULE_G         2003
#define IDM_RULE_SH        2004
#define IDM_RULE_CH        2005
#define IDM_RULE_NG        2006
#define IDM_INSTANT_UNDO   2007
#define IDM_EXIT           2099

static const ULONG_PTR SYNTHETIC_TAG = 0x414C4946;

struct AppState {
    bool isEnabled = true;
    bool ruleO = true;
    bool ruleG = true;
    bool ruleSh = true;
    bool ruleCh = true;
    bool ruleNg = false;
    bool instantUndo = true;

    wchar_t prevChar = 0;
    bool hasUndo = false;
    std::wstring undoOriginal;
    std::wstring undoInserted;

    bool ctrlShiftChord = false;
    bool otherKeyDuringChord = false;
};

static AppState g_state;
static HHOOK g_hook = NULL;
static HWND g_hwnd = NULL;
static NOTIFYICONDATAW g_nid = {};
static HICON g_iconOn = NULL;
static HICON g_iconOff = NULL;

HICON CreateBadgeIcon(bool active) {
    const int size = 32;
    HDC screenDC = GetDC(NULL);
    HDC memDC = CreateCompatibleDC(screenDC);
    HBITMAP colorBmp = CreateCompatibleBitmap(screenDC, size, size);
    HBITMAP maskBmp = CreateBitmap(size, size, 1, 1, NULL);

    HGDIOBJ oldBmp = SelectObject(memDC, colorBmp);
    HBRUSH bgBrush = CreateSolidBrush(active ? RGB(26, 86, 219) : RGB(100, 116, 139));
    RECT rc = { 0, 0, size, size };
    FillRect(memDC, &rc, bgBrush);
    DeleteObject(bgBrush);

    SetBkMode(memDC, TRANSPARENT);
    SetTextColor(memDC, RGB(255, 255, 255));
    HFONT font = CreateFontW(20, 0, 0, 0, FW_BOLD, FALSE, FALSE, FALSE,
        DEFAULT_CHARSET, OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY,
        DEFAULT_PITCH | FF_SWISS, L"Segoe UI");
    HGDIOBJ oldFont = SelectObject(memDC, font);
    DrawTextW(memDC, active ? L"A+" : L"A-", -1, &rc, DT_CENTER | DT_VCENTER | DT_SINGLELINE);
    SelectObject(memDC, oldFont);
    DeleteObject(font);
    SelectObject(memDC, oldBmp);

    ICONINFO ii = {};
    ii.fIcon = TRUE;
    ii.hbmColor = colorBmp;
    ii.hbmMask = maskBmp;
    HICON hIcon = CreateIconIndirect(&ii);

    DeleteObject(colorBmp);
    DeleteObject(maskBmp);
    DeleteDC(memDC);
    ReleaseDC(NULL, screenDC);
    return hIcon;
}

void ResetBuffer() {
    g_state.prevChar = 0;
    g_state.hasUndo = false;
    g_state.undoOriginal.clear();
    g_state.undoInserted.clear();
}

void UpdateTrayIcon() {
    g_nid.uFlags = NIF_TIP | NIF_ICON;
    g_nid.hIcon = g_state.isEnabled ? g_iconOn : g_iconOff;
    if (g_state.isEnabled) {
        wcscpy_s(g_nid.szTip, L"Alif+ YOQILGAN (Ctrl+Shift)");
    } else {
        wcscpy_s(g_nid.szTip, L"Alif+ O'CHIRILGAN (Ctrl+Shift)");
    }
    Shell_NotifyIconW(NIM_MODIFY, &g_nid);
}

void SendBackspaceAndUnicode(const std::wstring& text) {
    std::vector<INPUT> inputs;

    INPUT bsDown = {};
    bsDown.type = INPUT_KEYBOARD;
    bsDown.ki.wVk = VK_BACK;
    bsDown.ki.dwExtraInfo = SYNTHETIC_TAG;
    inputs.push_back(bsDown);

    INPUT bsUp = bsDown;
    bsUp.ki.dwFlags = KEYEVENTF_KEYUP;
    inputs.push_back(bsUp);

    for (wchar_t ch : text) {
        INPUT uDown = {};
        uDown.type = INPUT_KEYBOARD;
        uDown.ki.wScan = ch;
        uDown.ki.dwFlags = KEYEVENTF_UNICODE;
        uDown.ki.dwExtraInfo = SYNTHETIC_TAG;
        inputs.push_back(uDown);

        INPUT uUp = uDown;
        uUp.ki.dwFlags = KEYEVENTF_UNICODE | KEYEVENTF_KEYUP;
        inputs.push_back(uUp);
    }

    SendInput(static_cast<UINT>(inputs.size()), inputs.data(), sizeof(INPUT));
}

bool IsApostrophe(wchar_t ch) {
    return ch == L'\'' || ch == L'\u02BB' || ch == L'\u2019' || ch == L'\u2018' || ch == L'\u02BC' || ch == L'`';
}

bool TryMatchPair(wchar_t prev, wchar_t curr, std::wstring& outReplacement) {
    if (g_state.ruleO && IsApostrophe(curr) && (prev == L'o' || prev == L'O')) {
        outReplacement = (prev == L'O') ? L"\u00D6" : L"\u00F6";
        return true;
    }
    if (g_state.ruleG && IsApostrophe(curr) && (prev == L'g' || prev == L'G')) {
        outReplacement = (prev == L'G') ? L"\u011E" : L"\u011F";
        return true;
    }
    if (g_state.ruleSh && (curr == L'h' || curr == L'H') && (prev == L's' || prev == L'S')) {
        outReplacement = (prev == L'S') ? L"\u015E" : L"\u015F";
        return true;
    }
    if (g_state.ruleCh && (curr == L'h' || curr == L'H') && (prev == L'c' || prev == L'C')) {
        outReplacement = (prev == L'C') ? L"\u00C7" : L"\u00E7";
        return true;
    }
    if (g_state.ruleNg && (curr == L'g' || curr == L'G') && (prev == L'n' || prev == L'N')) {
        outReplacement = (prev == L'N') ? L"\u00D1" : L"\u00F1";
        return true;
    }
    return false;
}

LRESULT CALLBACK LowLevelKeyboardProc(int nCode, WPARAM wParam, LPARAM lParam) {
    if (nCode == HC_ACTION) {
        const KBDLLHOOKSTRUCT* kb = reinterpret_cast<const KBDLLHOOKSTRUCT*>(lParam);

        if (kb->dwExtraInfo == SYNTHETIC_TAG) {
            return CallNextHookEx(g_hook, nCode, wParam, lParam);
        }

        bool isDown = (wParam == WM_KEYDOWN || wParam == WM_SYSKEYDOWN);
        bool isUp = (wParam == WM_KEYUP || wParam == WM_SYSKEYUP);
        DWORD vk = kb->vkCode;

        bool ctrlDown = (GetAsyncKeyState(VK_CONTROL) & 0x8000) != 0;
        bool shiftDown = (GetAsyncKeyState(VK_SHIFT) & 0x8000) != 0;
        bool altDown = (GetAsyncKeyState(VK_MENU) & 0x8000) != 0;

        if (vk == VK_LCONTROL || vk == VK_RCONTROL || vk == VK_CONTROL ||
            vk == VK_LSHIFT || vk == VK_RSHIFT || vk == VK_SHIFT) {
            if (isDown && ctrlDown && shiftDown && !altDown) {
                g_state.ctrlShiftChord = true;
                g_state.otherKeyDuringChord = false;
            } else if (isUp && g_state.ctrlShiftChord && !ctrlDown && !shiftDown) {
                if (!g_state.otherKeyDuringChord) {
                    g_state.isEnabled = !g_state.isEnabled;
                    ResetBuffer();
                    UpdateTrayIcon();
                }
                g_state.ctrlShiftChord = false;
                g_state.otherKeyDuringChord = false;
            }
            return CallNextHookEx(g_hook, nCode, wParam, lParam);
        }

        if (isDown && g_state.ctrlShiftChord) {
            g_state.otherKeyDuringChord = true;
        }

        if (!isDown || !g_state.isEnabled) {
            return CallNextHookEx(g_hook, nCode, wParam, lParam);
        }

        if (ctrlDown || altDown) {
            ResetBuffer();
            return CallNextHookEx(g_hook, nCode, wParam, lParam);
        }

        if (vk == VK_BACK) {
            if (g_state.instantUndo && g_state.hasUndo) {
                std::wstring orig = g_state.undoOriginal;
                g_state.hasUndo = false;
                g_state.prevChar = orig.empty() ? 0 : orig.back();
                SendBackspaceAndUnicode(orig);
                return 1;
            }
            ResetBuffer();
            return CallNextHookEx(g_hook, nCode, wParam, lParam);
        }

        if (vk == VK_RETURN || vk == VK_TAB || vk == VK_ESCAPE || vk == VK_DELETE ||
            vk == VK_LEFT || vk == VK_RIGHT || vk == VK_UP || vk == VK_DOWN ||
            vk == VK_HOME || vk == VK_END || vk == VK_PRIOR || vk == VK_NEXT) {
            ResetBuffer();
            return CallNextHookEx(g_hook, nCode, wParam, lParam);
        }

        BYTE keyState[256] = {};
        GetKeyboardState(keyState);
        if (shiftDown) keyState[VK_SHIFT] = 0x80;
        if ((GetKeyState(VK_CAPITAL) & 0x0001) != 0) keyState[VK_CAPITAL] = 0x01;

        wchar_t buf[4] = {};
        HKL layout = GetKeyboardLayout(GetWindowThreadProcessId(GetForegroundWindow(), NULL));
        int rc = ToUnicodeEx(vk, kb->scanCode, keyState, buf, 4, 0, layout);
        if (rc != 1) {
            ResetBuffer();
            return CallNextHookEx(g_hook, nCode, wParam, lParam);
        }

        wchar_t currChar = buf[0];
        std::wstring replacement;
        if (g_state.prevChar != 0 && TryMatchPair(g_state.prevChar, currChar, replacement)) {
            g_state.hasUndo = true;
            g_state.undoInserted = replacement;
            g_state.undoOriginal = std::wstring(1, g_state.prevChar) + std::wstring(1, currChar);
            g_state.prevChar = replacement.back();
            SendBackspaceAndUnicode(replacement);
            return 1;
        }

        g_state.hasUndo = false;
        g_state.prevChar = iswalpha(currChar) ? currChar : 0;
    }
    return CallNextHookEx(g_hook, nCode, wParam, lParam);
}

void ShowTrayMenu(HWND hwnd) {
    POINT pt;
    GetCursorPos(&pt);

    HMENU menu = CreatePopupMenu();
    AppendMenuW(menu, MF_STRING | (g_state.isEnabled ? MF_CHECKED : 0), IDM_TOGGLE_ENABLED, L"Alif+ YOQILGAN (Ctrl + Shift)");
    AppendMenuW(menu, MF_SEPARATOR, 0, NULL);
    AppendMenuW(menu, MF_STRING | (g_state.ruleO ? MF_CHECKED : 0), IDM_RULE_O, L"o' / O' -> \u00F6 / \u00D6");
    AppendMenuW(menu, MF_STRING | (g_state.ruleG ? MF_CHECKED : 0), IDM_RULE_G, L"g' / G' -> \u011F / \u011E");
    AppendMenuW(menu, MF_STRING | (g_state.ruleSh ? MF_CHECKED : 0), IDM_RULE_SH, L"sh / Sh -> \u015F / \u015E");
    AppendMenuW(menu, MF_STRING | (g_state.ruleCh ? MF_CHECKED : 0), IDM_RULE_CH, L"ch / Ch -> \u00E7 / \u00C7");
    AppendMenuW(menu, MF_STRING | (g_state.ruleNg ? MF_CHECKED : 0), IDM_RULE_NG, L"ng / Ng -> \u00F1 / \u00D1");
    AppendMenuW(menu, MF_SEPARATOR, 0, NULL);
    AppendMenuW(menu, MF_STRING | (g_state.instantUndo ? MF_CHECKED : 0), IDM_INSTANT_UNDO, L"Backspace bilan asl holiga qaytarish");
    AppendMenuW(menu, MF_SEPARATOR, 0, NULL);
    AppendMenuW(menu, MF_STRING, IDM_EXIT, L"Chiqish (Exit)");

    SetForegroundWindow(hwnd);
    TrackPopupMenu(menu, TPM_BOTTOMALIGN | TPM_LEFTALIGN, pt.x, pt.y, 0, hwnd, NULL);
    DestroyMenu(menu);
}

LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    switch (uMsg) {
        case WM_TRAYICON:
            if (lParam == WM_RBUTTONUP || lParam == WM_LBUTTONUP) {
                ShowTrayMenu(hwnd);
            }
            return 0;

        case WM_COMMAND:
            switch (LOWORD(wParam)) {
                case IDM_TOGGLE_ENABLED:
                    g_state.isEnabled = !g_state.isEnabled;
                    ResetBuffer();
                    UpdateTrayIcon();
                    break;
                case IDM_RULE_O: g_state.ruleO = !g_state.ruleO; break;
                case IDM_RULE_G: g_state.ruleG = !g_state.ruleG; break;
                case IDM_RULE_SH: g_state.ruleSh = !g_state.ruleSh; break;
                case IDM_RULE_CH: g_state.ruleCh = !g_state.ruleCh; break;
                case IDM_RULE_NG: g_state.ruleNg = !g_state.ruleNg; break;
                case IDM_INSTANT_UNDO: g_state.instantUndo = !g_state.instantUndo; break;
                case IDM_EXIT:
                    Shell_NotifyIconW(NIM_DELETE, &g_nid);
                    PostQuitMessage(0);
                    break;
            }
            return 0;

        case WM_DESTROY:
            Shell_NotifyIconW(NIM_DELETE, &g_nid);
            PostQuitMessage(0);
            return 0;
    }
    return DefWindowProcW(hwnd, uMsg, wParam, lParam);
}

int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE, PWSTR, int) {
    HANDLE mutex = CreateMutexW(NULL, TRUE, L"Global\\AlifPlusSingleInstanceMutex");
    if (GetLastError() == ERROR_ALREADY_EXISTS) {
        return 0;
    }

    g_iconOn = CreateBadgeIcon(true);
    g_iconOff = CreateBadgeIcon(false);

    WNDCLASSW wc = {};
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = hInstance;
    wc.lpszClassName = L"AlifPlusTrayWindowClass";
    RegisterClassW(&wc);

    g_hwnd = CreateWindowExW(0, wc.lpszClassName, L"Alif+", 0, 0, 0, 0, 0, HWND_MESSAGE, NULL, hInstance, NULL);

    g_nid.cbSize = sizeof(NOTIFYICONDATAW);
    g_nid.hWnd = g_hwnd;
    g_nid.uID = ID_TRAY_ICON;
    g_nid.uFlags = NIF_ICON | NIF_MESSAGE | NIF_TIP;
    g_nid.uCallbackMessage = WM_TRAYICON;
    g_nid.hIcon = g_iconOn;
    wcscpy_s(g_nid.szTip, L"Alif+ YOQILGAN (Ctrl+Shift)");
    Shell_NotifyIconW(NIM_ADD, &g_nid);

    g_hook = SetWindowsHookExW(WH_KEYBOARD_LL, LowLevelKeyboardProc, hInstance, 0);

    MSG msg;
    while (GetMessageW(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessageW(&msg);
    }

    if (g_hook) UnhookWindowsHookEx(g_hook);
    if (g_iconOn) DestroyIcon(g_iconOn);
    if (g_iconOff) DestroyIcon(g_iconOff);
    if (mutex) CloseHandle(mutex);
    return 0;
}
