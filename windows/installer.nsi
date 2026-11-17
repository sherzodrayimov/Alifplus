Unicode true
!include "MUI2.nsh"
!include "x64.nsh"
!include "nsDialogs.nsh"

Name "Alif+ (Oʻzbekcha klaviatura + Avto-oʻgirish)"
OutFile "AlifPlus-1.1.0-Setup.exe"
InstallDir "$PROGRAMFILES64\AlifPlus"
RequestExecutionLevel admin

!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall.ico"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

Section "Alif+ Klaviatura Terilmasi (Majburiy)" SecLayout
    SectionIn RO
    SetOutPath "$INSTDIR"

    ${If} ${RunningX64}
        ${DisableX64FSRedirection}
        SetOutPath "$SYSDIR"
        File "build\x64\kbdalif.dll"
        ${EnableX64FSRedirection}
    ${Else}
        SetOutPath "$SYSDIR"
        File "build\x86\kbdalif.dll"
    ${EndIf}

    SetOutPath "$INSTDIR"
    File "register.ps1"
    File "unregister.ps1"

    ${If} ${RunningX64}
        SetRegView 64
    ${EndIf}
    WriteRegStr HKLM "SYSTEM\CurrentControlSet\Control\Keyboard Layouts\a0000443" "Layout File" "kbdalif.dll"
    WriteRegStr HKLM "SYSTEM\CurrentControlSet\Control\Keyboard Layouts\a0000443" "Layout Text" "Alif+"
    WriteRegStr HKLM "SYSTEM\CurrentControlSet\Control\Keyboard Layouts\a0000443" "Layout Display Name" "Alif+ (Oʻzbekcha)"
    WriteRegStr HKLM "SYSTEM\CurrentControlSet\Control\Keyboard Layouts\a0000443" "Layout Id" "00C5"

    nsExec::ExecToLog 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$INSTDIR\register.ps1"'

    WriteUninstaller "$INSTDIR\uninstall.exe"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AlifPlusKeyboard" "DisplayName" "Alif+ Klaviatura Terilmasi (1.1.0)"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AlifPlusKeyboard" "DisplayVersion" "1.1.0"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AlifPlusKeyboard" "Publisher" "Alif+"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AlifPlusKeyboard" "UninstallString" '"$INSTDIR\uninstall.exe"'
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AlifPlusKeyboard" "QuietUninstallString" '"$INSTDIR\uninstall.exe" /S'
SectionEnd

Section "Avto-oʻgirish yordamchisi (oʻ, gʻ, sh, ch → ö, ğ, ş, ç)" SecAuto
    SetOutPath "$INSTDIR"
    File "build\x64\AlifAutoConvert.exe"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "AlifPlusAutoConvert" '"$INSTDIR\AlifAutoConvert.exe"'
    Exec '"$INSTDIR\AlifAutoConvert.exe"'
SectionEnd

Section "Uninstall"
    nsExec::ExecToLog 'taskkill /F /IM AlifAutoConvert.exe'
    nsExec::ExecToLog 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$INSTDIR\unregister.ps1"'

    ${If} ${RunningX64}
        SetRegView 64
        ${DisableX64FSRedirection}
        Delete "$SYSDIR\kbdalif.dll"
        ${EnableX64FSRedirection}
    ${Else}
        Delete "$SYSDIR\kbdalif.dll"
    ${EndIf}

    DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "AlifPlusAutoConvert"
    DeleteRegKey HKLM "SYSTEM\CurrentControlSet\Control\Keyboard Layouts\a0000443"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AlifPlusKeyboard"

    Delete "$INSTDIR\AlifAutoConvert.exe"
    Delete "$INSTDIR\register.ps1"
    Delete "$INSTDIR\unregister.ps1"
    Delete "$INSTDIR\uninstall.exe"
    RMDir "$INSTDIR"
SectionEnd
