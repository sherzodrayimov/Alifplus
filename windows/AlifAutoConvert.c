#define UNICODE
#define _UNICODE
#include <windows.h>
#include <shellapi.h>

#define WM_TRAYICON (WM_USER + 1)
#define ID_TRAY_TOGGLE 1001
#define ID_TRAY_CLIP   1002
#define ID_TRAY_EXIT   1003

static HHOOK g_hook = NULL;
static BOOL g_enabled = TRUE;
static BOOL g_injecting = FALSE;
static WCHAR g_prevChar = 0;
static NOTIFYICONDATAW g_nid = {0};

static void SendBackspaceAndUnicode(WCHAR ch) {
    g_injecting = TRUE;
    INPUT inputs[4] = {0};

    inputs[0].type = INPUT_KEYBOARD;
    inputs[0].ki.wVk = VK_BACK;

    inputs[1].type = INPUT_KEYBOARD;
    inputs[1].ki.wVk = VK_BACK;
    inputs[1].ki.dwFlags = KEYEVENTF_KEYUP;

    inputs[2].type = INPUT_KEYBOARD;
    inputs[2].ki.wScan = ch;
    inputs[2].ki.dwFlags = KEYEVENTF_UNICODE;

    inputs[3].type = INPUT_KEYBOARD;
    inputs[3].ki.wScan = ch;
    inputs[3].ki.dwFlags = KEYEVENTF_UNICODE | KEYEVENTF_KEYUP;

    SendInput(4, inputs, sizeof(INPUT));
    g_injecting = FALSE;
}

static void SendUnicodeOnly(WCHAR ch) {
    g_injecting = TRUE;
    INPUT inputs[2] = {0};

    inputs[0].type = INPUT_KEYBOARD;
    inputs[0].ki.wScan = ch;
    inputs[0].ki.dwFlags = KEYEVENTF_UNICODE;

    inputs[1].type = INPUT_KEYBOARD;
    inputs[1].ki.wScan = ch;
    inputs[1].ki.dwFlags = KEYEVENTF_UNICODE | KEYEVENTF_KEYUP;

    SendInput(2, inputs, sizeof(INPUT));
    g_injecting = FALSE;
}

static void ConvertClipboardText(HWND hwnd) {
    if (!OpenClipboard(hwnd)) return;
    HANDLE hData = GetClipboardData(CF_UNICODETEXT);
    if (hData) {
        LPCWSTR src = (LPCWSTR)GlobalLock(hData);
        if (src) {
            size_t len = wcslen(src);
            HGLOBAL hOut = GlobalAlloc(GMEM_MOVEABLE, (len + 1) * sizeof(WCHAR));
            if (hOut) {
                LPWSTR dst = (LPWSTR)GlobalLock(hOut);
                size_t j = 0;
                for (size_t i = 0; i < len; i++) {
                    WCHAR c = src[i];
                    WCHAR n = (i + 1 < len) ? src[i + 1] : 0;
                    BOOL nIsApos = (n == L'\'' || n == 0x2018 || n == 0x2019 || n == 0x02BB || n == 0x02BC || n == L'`');
                    if (c == L'o' && nIsApos) { dst[j++] = 0x00F6; i++; continue; }
                    if (c == L'O' && nIsApos) { dst[j++] = 0x00D6; i++; continue; }
                    if (c == L'g' && nIsApos) { dst[j++] = 0x011F; i++; continue; }
                    if (c == L'G' && nIsApos) { dst[j++] = 0x011E; i++; continue; }
                    if (c == L's' && (n == L'h' || n == L'H')) { dst[j++] = 0x015F; i++; continue; }
                    if (c == L'S' && (n == L'h' || n == L'H')) { dst[j++] = 0x015E; i++; continue; }
                    if (c == L'c' && (n == L'h' || n == L'H')) { dst[j++] = 0x00E7; i++; continue; }
                    if (c == L'C' && (n == L'h' || n == L'H')) { dst[j++] = 0x00C7; i++; continue; }
                    if (c == L'\'' && i > 0 && iswalpha(src[i - 1])) { dst[j++] = 0x2019; continue; }
                    dst[j++] = c;
                }
                dst[j] = 0;
                GlobalUnlock(hOut);
                EmptyClipboard();
                SetClipboardData(CF_UNICODETEXT, hOut);
            }
            GlobalUnlock(hData);
        }
    }
    CloseClipboard();
}

static LRESULT CALLBACK LowLevelKeyboardProc(int nCode, WPARAM wParam, LPARAM lParam) {
    if (nCode == HC_ACTION && g_enabled && !g_injecting && (wParam == WM_KEYDOWN || wParam == WM_SYSKEYDOWN)) {
        KBDLLHOOKSTRUCT *kb = (KBDLLHOOKSTRUCT *)lParam;
        if (kb->flags & LLKHF_INJECTED) {
            return CallNextHookEx(g_hook, nCode, wParam, lParam);
        }

        BOOL ctrl = (GetAsyncKeyState(VK_CONTROL) & 0x8000) != 0;
        BOOL alt  = (GetAsyncKeyState(VK_MENU) & 0x8000) != 0;
        BOOL win  = ((GetAsyncKeyState(VK_LWIN) | GetAsyncKeyState(VK_RWIN)) & 0x8000) != 0;

        if (ctrl || alt || win) {
            g_prevChar = 0;
            return CallNextHookEx(g_hook, nCode, wParam, lParam);
        }

        BYTE keyState[256] = {0};
        if (GetAsyncKeyState(VK_SHIFT) & 0x8000) keyState[VK_SHIFT] = 0x80;
        if (GetKeyState(VK_CAPITAL) & 0x0001) keyState[VK_CAPITAL] = 0x01;

        WCHAR buf[4] = {0};
        HKL hkl = GetKeyboardLayout(GetWindowThreadProcessId(GetForegroundWindow(), NULL));
        int rc = ToUnicodeEx(kb->vkCode, kb->scanCode, keyState, buf, 4, 0, hkl);

        if (rc == 1) {
            WCHAR ch = buf[0];
            BOOL isApos = (ch == L'\'' || ch == 0x2018 || ch == 0x2019 || ch == 0x02BB || ch == 0x02BC || ch == L'`');

            if (g_prevChar != 0) {
                WCHAR rep = 0;
                if (g_prevChar == L'o' && isApos) rep = 0x00F6;
                else if (g_prevChar == L'O' && isApos) rep = 0x00D6;
                else if (g_prevChar == L'g' && isApos) rep = 0x011F;
                else if (g_prevChar == L'G' && isApos) rep = 0x011E;
                else if (g_prevChar == L's' && (ch == L'h' || ch == L'H')) rep = 0x015F;
                else if (g_prevChar == L'S' && (ch == L'h' || ch == L'H')) rep = 0x015E;
                else if (g_prevChar == L'c' && (ch == L'h' || ch == L'H')) rep = 0x00E7;
                else if (g_prevChar == L'C' && (ch == L'h' || ch == L'H')) rep = 0x00C7;

                if (rep != 0) {
                    g_prevChar = 0;
                    SendBackspaceAndUnicode(rep);
                    return 1;
                }
            }

            if (ch == L'\'' && g_prevChar != 0 && iswalpha(g_prevChar)) {
                g_prevChar = 0;
                SendUnicodeOnly(0x2019);
                return 1;
            }

            g_prevChar = iswalpha(ch) ? ch : 0;
        } else {
            g_prevChar = 0;
        }
    }
    return CallNextHookEx(g_hook, nCode, wParam, lParam);
}

static LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    if (msg == WM_TRAYICON && lParam == WM_RBUTTONUP) {
        POINT pt;
        GetCursorPos(&pt);
        HMENU menu = CreatePopupMenu();
        AppendMenuW(menu, MF_STRING | (g_enabled ? MF_CHECKED : 0), ID_TRAY_TOGGLE, L"Avto-o\x02BBgirish (o\x02BB/g\x02BB/sh/ch \x2192 \x00F6/\x011F/\x015F/\x00E7)");
        AppendMenuW(menu, MF_STRING, ID_TRAY_CLIP, L"Buferdagi (Clipboard) matnni o\x02BBgirish");
        AppendMenuW(menu, MF_SEPARATOR, 0, NULL);
        AppendMenuW(menu, MF_STRING, ID_TRAY_EXIT, L"Chiqish");
        SetForegroundWindow(hwnd);
        TrackPopupMenu(menu, TPM_BOTTOMALIGN | TPM_LEFTALIGN, pt.x, pt.y, 0, hwnd, NULL);
        DestroyMenu(menu);
        return 0;
    }
    if (msg == WM_COMMAND) {
        switch (LOWORD(wParam)) {
            case ID_TRAY_TOGGLE:
                g_enabled = !g_enabled;
                g_prevChar = 0;
                wcscpy_s(g_nid.szTip, 128, g_enabled ? L"Alif+ Avto-o\x02BBgirish (Faol)" : L"Alif+ Avto-o\x02BBgirish (O\x02BBchiq)");
                Shell_NotifyIconW(NIM_MODIFY, &g_nid);
                break;
            case ID_TRAY_CLIP:
                ConvertClipboardText(hwnd);
                break;
            case ID_TRAY_EXIT:
                PostQuitMessage(0);
                break;
        }
    }
    if (msg == WM_DESTROY) {
        Shell_NotifyIconW(NIM_DELETE, &g_nid);
        PostQuitMessage(0);
    }
    return DefWindowProcW(hwnd, msg, wParam, lParam);
}

int WINAPI wWinMain(HINSTANCE hInst, HINSTANCE hPrev, LPWSTR lpCmdLine, int nShow) {
    HANDLE hMutex = CreateMutexW(NULL, TRUE, L"AlifPlusAutoConvertSingleInstance");
    if (GetLastError() == ERROR_ALREADY_EXISTS) return 0;

    WNDCLASSW wc = {0};
    wc.lpfnWndProc = WndProc;
    wc.hInstance = hInst;
    wc.lpszClassName = L"AlifPlusAutoConvertWnd";
    RegisterClassW(&wc);

    HWND hwnd = CreateWindowW(wc.lpszClassName, L"Alif+", 0, 0, 0, 0, 0, HWND_MESSAGE, NULL, hInst, NULL);

    g_nid.cbSize = sizeof(NOTIFYICONDATAW);
    g_nid.hWnd = hwnd;
    g_nid.uID = 1;
    g_nid.uFlags = NIF_ICON | NIF_MESSAGE | NIF_TIP;
    g_nid.uCallbackMessage = WM_TRAYICON;
    g_nid.hIcon = LoadIcon(NULL, IDI_APPLICATION);
    wcscpy_s(g_nid.szTip, 128, L"Alif+ Avto-o\x02BBgirish (Faol)");
    Shell_NotifyIconW(NIM_ADD, &g_nid);

    g_hook = SetWindowsHookExW(WH_KEYBOARD_LL, LowLevelKeyboardProc, hInst, 0);

    MSG msg;
    while (GetMessageW(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessageW(&msg);
    }

    if (g_hook) UnhookWindowsHookEx(g_hook);
    if (hMutex) CloseHandle(hMutex);
    return 0;
}
