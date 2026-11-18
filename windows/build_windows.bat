@echo off
setlocal
if not exist dist mkdir dist

where x86_64-w64-mingw32-g++ >nul 2>nul
if %errorlevel%==0 (
    x86_64-w64-mingw32-windres app.rc -O coff -o dist\app_x64.res
    x86_64-w64-mingw32-g++ -O2 -mwindows -municode -static AlifPlus.cpp dist\app_x64.res -o dist\AlifPlus-x64.exe -luser32 -lshell32 -lgdi32
    del dist\app_x64.res
)

where i686-w64-mingw32-g++ >nul 2>nul
if %errorlevel%==0 (
    i686-w64-mingw32-windres app.rc -O coff -o dist\app_x32.res
    i686-w64-mingw32-g++ -O2 -mwindows -municode -static AlifPlus.cpp dist\app_x32.res -o dist\AlifPlus-x32.exe -luser32 -lshell32 -lgdi32
    del dist\app_x32.res
)
pause
