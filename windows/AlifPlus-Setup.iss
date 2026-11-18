[Setup]
AppName=Alif+
AppVersion=2.0.0
DefaultDirName={autopf}\AlifPlus
DefaultGroupName=Alif+
OutputDir=dist
OutputBaseFilename=AlifPlus-2.0-Windows-Setup
Compression=lzma2
SolidCompression=yes
ArchitecturesAllowed=x86 x64
ArchitecturesInstallIn64BitMode=x64

[Files]
Source: "dist\AlifPlus-x64.exe"; DestDir: "{app}"; DestName: "AlifPlus.exe"; Check: Is64BitInstallMode; Flags: ignoreversion
Source: "dist\AlifPlus-x32.exe"; DestDir: "{app}"; DestName: "AlifPlus.exe"; Check: not Is64BitInstallMode; Flags: ignoreversion

[Icons]
Name: "{group}\Alif+"; Filename: "{app}\AlifPlus.exe"
Name: "{autodesktop}\Alif+"; Filename: "{app}\AlifPlus.exe"

[Run]
Filename: "{app}\AlifPlus.exe"; Description: "Alif+ dasturini hozir ishga tushirish"; Flags: nowait postinstall skipifsilent
