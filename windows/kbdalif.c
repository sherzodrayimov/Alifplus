#include <windows.h>

#define KBD_TYPE 4
#define CAPLOK       0x01
#define SGCAPS       0x02
#define CAPLOKALTGR  0x04
#define KANALOK      0x08
#define GRPSELTAP    0x10

#define KLLF_ALTGR       0x00000001
#define KLLF_SHIFTLOCK   0x00000002
#define KLLF_LRM_RLM     0x00000004

#define WCH_NONE 0xF000
#define WCH_DEAD 0xF001
#define WCH_LGTR 0xF002

#define KBDEXT      (USHORT)0x0100
#define KBDMULTIVK  (USHORT)0x0200
#define KBDSPECIAL  (USHORT)0x0400
#define KBDNUMPAD   (USHORT)0x0800
#define KBDUNICODE  (USHORT)0x1000
#define KBDINJECTEDVK (USHORT)0x2000
#define KBDMAPPEDVK (USHORT)0x4000
#define KBDBREAK    (USHORT)0x8000

#define SHFT_INVALID 0x0F

typedef struct _VK_TO_BIT { BYTE Vk; BYTE ModBits; } VK_TO_BIT, *PVK_TO_BIT;
typedef struct _MODIFIERS { PVK_TO_BIT pVkToBit; WORD wMaxModBits; BYTE ModNumber[]; } MODIFIERS, *PMODIFIERS;
typedef struct _VSC_VK { BYTE Vsc; USHORT Vk; } VSC_VK, *PVSC_VK;
typedef struct _VK_TO_WCHARS1 { BYTE VirtualKey; BYTE Attributes; WCHAR wch[1]; } VK_TO_WCHARS1, *PVK_TO_WCHARS1;
typedef struct _VK_TO_WCHARS2 { BYTE VirtualKey; BYTE Attributes; WCHAR wch[2]; } VK_TO_WCHARS2, *PVK_TO_WCHARS2;
typedef struct _VK_TO_WCHARS3 { BYTE VirtualKey; BYTE Attributes; WCHAR wch[3]; } VK_TO_WCHARS3, *PVK_TO_WCHARS3;
typedef struct _VK_TO_WCHARS5 { BYTE VirtualKey; BYTE Attributes; WCHAR wch[5]; } VK_TO_WCHARS5, *PVK_TO_WCHARS5;
typedef struct _VK_TO_WCHAR_TABLE { PVK_TO_WCHARS1 pVkToWchars; BYTE nModifications; BYTE cbSize; } VK_TO_WCHAR_TABLE, *PVK_TO_WCHAR_TABLE;
typedef struct _DEADKEY { DWORD dwBoth; WCHAR wchComposed; USHORT uFlags; } DEADKEY, *PDEADKEY;
typedef struct _VSC_LPWSTR { BYTE vsc; LPWSTR pwsz; } VSC_LPWSTR, *PVSC_LPWSTR;

typedef struct tagKbdLayer {
    PMODIFIERS pCharModifiers;
    PVK_TO_WCHAR_TABLE pVkToWcharTable;
    PDEADKEY pDeadKey;
    PVSC_LPWSTR pKeyNames;
    PVSC_LPWSTR pKeyNamesExt;
    WCHAR **pKeyNamesDead;
    USHORT *pusVSCtoVK;
    BYTE bMaxVSCtoVK;
    PVSC_VK pVSCtoVK_E0;
    PVSC_VK pVSCtoVK_E1;
    DWORD fLocaleFlags;
    BYTE nLgMax;
    BYTE cbLgEntry;
    void *pLigature;
    DWORD dwType;
    DWORD dwSubType;
} KBDTABLES, *PKBDTABLES;

static VK_TO_BIT aVkToBits[] = {
    { VK_SHIFT,   0x01 },
    { VK_CONTROL, 0x02 },
    { VK_MENU,    0x04 },
    { 0,          0    }
};

static MODIFIERS CharModifiers = {
    &aVkToBits[0],
    7,
    { 0, 1, 2, SHFT_INVALID, SHFT_INVALID, SHFT_INVALID, 3, 4 }
};

static VK_TO_WCHARS2 aVkToWch2[] = {
    { '0', 0, { '0', ')' } }, { '1', 0, { '1', '!' } }, { '3', 0, { '3', '#' } },
    { '4', 0, { '4', '$' } }, { '5', 0, { '5', '%' } }, { '7', 0, { '7', '&' } },
    { '8', 0, { '8', '*' } }, { '9', 0, { '9', '(' } }, { VK_OEM_PLUS, 0, { '=', '+' } },
    { VK_OEM_2, 0, { '/', '?' } }, { VK_TAB, 0, { '\t', '\t' } }, { VK_ADD, 0, { '+', '+' } },
    { VK_DECIMAL, 0, { '.', '.' } }, { VK_DIVIDE, 0, { '/', '/' } },
    { VK_MULTIPLY, 0, { '*', '*' } }, { VK_SUBTRACT, 0, { '-', '-' } },
    { 0, 0, { 0, 0 } }
};

static VK_TO_WCHARS3 aVkToWch3[] = {
    { '2', 0, { '2', '@', 0x0000 } }, { '6', 0, { '6', '^', 0x001E } },
    { VK_OEM_MINUS, 0, { '-', '_', 0x001F } }, { VK_BACK, 0, { '\b', '\b', 0x007F } },
    { VK_ESCAPE, 0, { 0x001B, 0x001B, 0x001B } }, { VK_RETURN, 0, { '\r', '\r', '\n' } },
    { VK_SPACE, 0, { ' ', ' ', ' ' } }, { VK_CANCEL, 0, { 0x0003, 0x0003, 0x0003 } },
    { 0, 0, { 0, 0, 0 } }
};

static VK_TO_WCHARS5 aVkToWch5[] = {
    { 'A', CAPLOK, { 'a', 'A', 0x0001, WCH_NONE, WCH_NONE } },
    { 'B', CAPLOK, { 'b', 'B', 0x0002, WCH_NONE, WCH_NONE } },
    { 'C', CAPLOK, { 'c', 'C', 0x0003, 0x00E7,   0x00C7   } },
    { 'D', CAPLOK, { 'd', 'D', 0x0004, WCH_NONE, WCH_NONE } },
    { 'E', CAPLOK, { 'e', 'E', 0x0005, 0x20AC,   WCH_NONE } },
    { 'F', CAPLOK, { 'f', 'F', 0x0006, WCH_NONE, WCH_NONE } },
    { 'G', CAPLOK, { 'g', 'G', 0x0007, 0x011F,   0x011E   } },
    { 'H', CAPLOK, { 'h', 'H', 0x0008, WCH_NONE, WCH_NONE } },
    { 'I', CAPLOK, { 'i', 'I', 0x0009, 0x0131,   0x0130   } },
    { 'J', CAPLOK, { 'j', 'J', 0x000A, WCH_NONE, WCH_NONE } },
    { 'K', CAPLOK, { 'k', 'K', 0x000B, WCH_NONE, WCH_NONE } },
    { 'L', CAPLOK, { 'l', 'L', 0x000C, WCH_NONE, WCH_NONE } },
    { 'M', CAPLOK, { 'm', 'M', 0x000D, WCH_NONE, WCH_NONE } },
    { 'N', CAPLOK, { 'n', 'N', 0x000E, WCH_NONE, WCH_NONE } },
    { 'O', CAPLOK, { 'o', 'O', 0x000F, 0x00F6,   0x00D6   } },
    { 'P', CAPLOK, { 'p', 'P', 0x0010, WCH_NONE, WCH_NONE } },
    { 'Q', CAPLOK, { 'q', 'Q', 0x0011, WCH_NONE, WCH_NONE } },
    { 'R', CAPLOK, { 'r', 'R', 0x0012, WCH_NONE, WCH_NONE } },
    { 'S', CAPLOK, { 's', 'S', 0x0013, 0x015F,   0x015E   } },
    { 'T', CAPLOK, { 't', 'T', 0x0014, WCH_NONE, WCH_NONE } },
    { 'U', CAPLOK, { 'u', 'U', 0x0015, 0x00FC,   0x00DC   } },
    { 'V', CAPLOK, { 'v', 'V', 0x0016, WCH_NONE, WCH_NONE } },
    { 'W', CAPLOK, { 'w', 'W', 0x0017, WCH_NONE, WCH_NONE } },
    { 'X', CAPLOK, { 'x', 'X', 0x0018, WCH_NONE, WCH_NONE } },
    { 'Y', CAPLOK, { 'y', 'Y', 0x0019, WCH_NONE, WCH_NONE } },
    { 'Z', CAPLOK, { 'z', 'Z', 0x001A, WCH_NONE, WCH_NONE } },
    { VK_OEM_4,      CAPLOK, { 0x00F6, 0x00D6, 0x001B, '[',  '{'    } },
    { VK_OEM_6,      CAPLOK, { 0x011F, 0x011E, 0x001D, ']',  '}'    } },
    { VK_OEM_1,      CAPLOK, { 0x015F, 0x015E, WCH_NONE, ';', ':'   } },
    { VK_OEM_7,      CAPLOK, { 0x00E7, 0x00C7, WCH_NONE, '\'','"'   } },
    { VK_OEM_3,      0,      { 0x2019, '~',    WCH_NONE, 0x2018,'`' } },
    { VK_OEM_5,      0,      { ';',    ':',    0x001C,   '\\', '|'  } },
    { VK_OEM_COMMA,  0,      { ',',    0x201C, WCH_NONE, '<', 0x00AB} },
    { VK_OEM_PERIOD, 0,      { '.',    0x201D, WCH_NONE, '>', 0x00BB} },
    { 0, 0, { 0, 0, 0, 0, 0 } }
};

static VK_TO_WCHARS1 aVkToWch1[] = {
    { VK_NUMPAD0, 0, { '0' } }, { VK_NUMPAD1, 0, { '1' } }, { VK_NUMPAD2, 0, { '2' } },
    { VK_NUMPAD3, 0, { '3' } }, { VK_NUMPAD4, 0, { '4' } }, { VK_NUMPAD5, 0, { '5' } },
    { VK_NUMPAD6, 0, { '6' } }, { VK_NUMPAD7, 0, { '7' } }, { VK_NUMPAD8, 0, { '8' } },
    { VK_NUMPAD9, 0, { '9' } }, { 0, 0, { 0 } }
};

static VK_TO_WCHAR_TABLE aVkToWcharTable[] = {
    { (PVK_TO_WCHARS1)aVkToWch3, 3, sizeof(aVkToWch3[0]) },
    { (PVK_TO_WCHARS1)aVkToWch5, 5, sizeof(aVkToWch5[0]) },
    { (PVK_TO_WCHARS1)aVkToWch2, 2, sizeof(aVkToWch2[0]) },
    { (PVK_TO_WCHARS1)aVkToWch1, 1, sizeof(aVkToWch1[0]) },
    { NULL, 0, 0 }
};

static USHORT ausVSCtoVK[] = {
    0xFF, VK_ESCAPE, '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
    VK_OEM_MINUS, VK_OEM_PLUS, VK_BACK, VK_TAB,
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
    VK_OEM_4, VK_OEM_6, VK_RETURN, VK_LCONTROL,
    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
    VK_OEM_1, VK_OEM_7, VK_OEM_3, VK_LSHIFT, VK_OEM_5,
    'Z', 'X', 'C', 'V', 'B', 'N', 'M',
    VK_OEM_COMMA, VK_OEM_PERIOD, VK_OEM_2, VK_RSHIFT | KBDEXT,
    VK_MULTIPLY | KBDMULTIVK, VK_LMENU, VK_SPACE, VK_CAPITAL,
    VK_F1, VK_F2, VK_F3, VK_F4, VK_F5, VK_F6, VK_F7, VK_F8, VK_F9, VK_F10,
    VK_NUMLOCK | KBDEXT | KBDMULTIVK, VK_SCROLL | KBDMULTIVK,
    VK_HOME | KBDNUMPAD | KBDSPECIAL, VK_UP | KBDNUMPAD | KBDSPECIAL,
    VK_PRIOR | KBDNUMPAD | KBDSPECIAL, VK_SUBTRACT,
    VK_LEFT | KBDNUMPAD | KBDSPECIAL, VK_CLEAR | KBDNUMPAD | KBDSPECIAL,
    VK_RIGHT | KBDNUMPAD | KBDSPECIAL, VK_ADD,
    VK_END | KBDNUMPAD | KBDSPECIAL, VK_DOWN | KBDNUMPAD | KBDSPECIAL,
    VK_NEXT | KBDNUMPAD | KBDSPECIAL, VK_INSERT | KBDNUMPAD | KBDSPECIAL,
    VK_DELETE | KBDNUMPAD | KBDSPECIAL,
    0, 0, VK_OEM_102, VK_F11, VK_F12
};

static VSC_VK aE0VscToVk[] = {
    { 0x1C, VK_RETURN | KBDEXT }, { 0x1D, VK_RCONTROL | KBDEXT },
    { 0x35, VK_DIVIDE | KBDEXT }, { 0x37, VK_SNAPSHOT | KBDEXT },
    { 0x38, VK_RMENU | KBDEXT },  { 0x47, VK_HOME | KBDEXT },
    { 0x48, VK_UP | KBDEXT },     { 0x49, VK_PRIOR | KBDEXT },
    { 0x4B, VK_LEFT | KBDEXT },   { 0x4D, VK_RIGHT | KBDEXT },
    { 0x4F, VK_END | KBDEXT },    { 0x50, VK_DOWN | KBDEXT },
    { 0x51, VK_NEXT | KBDEXT },   { 0x52, VK_INSERT | KBDEXT },
    { 0x53, VK_DELETE | KBDEXT }, { 0x5B, VK_LWIN | KBDEXT },
    { 0x5C, VK_RWIN | KBDEXT },   { 0x5D, VK_APPS | KBDEXT },
    { 0, 0 }
};

static VSC_VK aE1VscToVk[] = { { 0x1D, VK_PAUSE }, { 0, 0 } };

static VSC_LPWSTR aKeyNames[] = {
    { 0x01, L"Esc" }, { 0x0E, L"Backspace" }, { 0x0F, L"Tab" },
    { 0x1C, L"Enter" }, { 0x1D, L"Ctrl" }, { 0x2A, L"Shift" },
    { 0x36, L"Right Shift" }, { 0x37, L"Num *" }, { 0x38, L"Alt" },
    { 0x39, L"Space" }, { 0x3A, L"Caps Lock" }, { 0, NULL }
};

static VSC_LPWSTR aKeyNamesExt[] = {
    { 0x1C, L"Num Enter" }, { 0x1D, L"Right Ctrl" }, { 0x35, L"Num /" },
    { 0x38, L"Right Alt" }, { 0x47, L"Home" }, { 0x48, L"Up" },
    { 0x49, L"Page Up" }, { 0x4B, L"Left" }, { 0x4D, L"Right" },
    { 0x4F, L"End" }, { 0x50, L"Down" }, { 0x51, L"Page Down" },
    { 0x52, L"Insert" }, { 0x53, L"Delete" }, { 0, NULL }
};

static KBDTABLES KbdTables = {
    &CharModifiers, aVkToWcharTable, NULL, aKeyNames, aKeyNamesExt, NULL,
    ausVSCtoVK, sizeof(ausVSCtoVK) / sizeof(ausVSCtoVK[0]),
    aE0VscToVk, aE1VscToVk, KLLF_ALTGR, 0, 0, NULL, 4, 0
};

__declspec(dllexport) PKBDTABLES KbdLayerDescriptor(VOID) {
    return &KbdTables;
}
