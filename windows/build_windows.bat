@echo off
setlocal
echo ======================================================
echo  Alif+ Windows Build Script (x32 / 32-bit va x64 / 64-bit)
echo ======================================================

if not exist dist mkdir dist

where x86_64-w64-mingw32-g++ >nul 2>nul
if %errorlevel%==0 (
    echo [1/2] 64-bit (AlifPlus-x64.exe) kompilyatsiya qilinmoqda...
    x86_64-w64-mingw32-g++ -O2 -mwindows -municode -static AlifPlus.cpp -o dist\AlifPlus-x64.exe -luser32 -lshell32 -lgdi32
)

where i686-w64-mingw32-g++ >nul 2>nul
if %errorlevel%==0 (
    echo [2/2] 32-bit (AlifPlus-x32.exe) kompilyatsiya qilinmoqda...
    i686-w64-mingw32-g++ -O2 -mwindows -municode -static AlifPlus.cpp -o dist\AlifPlus-x32.exe -luser32 -lshell32 -lgdi32
)

echo.
echo Tayyor fayllar dist\ papkasida yaratildi!
pause
