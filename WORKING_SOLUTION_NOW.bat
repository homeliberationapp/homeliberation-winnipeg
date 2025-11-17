@echo off
echo.
echo ========================================
echo  VISUAL CODING - WORKING NOW
echo ========================================
echo.
echo Starting local server and opening browser...
echo.

cd /d "%~dp0"

REM Check if server is already running
netstat -ano | findstr ":8000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Server already running on port 8000
) else (
    echo Starting server on port 8000...
    start /B npx http-server -p 8000
    timeout /t 2 /nobreak >nul
)

echo.
echo ========================================
echo  OPENING SPLIT SCREEN SETUP
echo ========================================
echo.
echo Opening browser at http://localhost:8000
start http://localhost:8000

echo.
echo Now open your code editor:
echo.
echo OPTION 1 - Notepad (Built-in Windows)
echo   - Right-click any HTML file
echo   - Open with → Notepad
echo.
echo OPTION 2 - VS Code (Recommended - Install first)
echo   - Download: https://code.visualstudio.com/download
echo   - Then run: LAUNCH_VISUAL_CODING.bat
echo.
echo OPTION 3 - Any Text Editor
echo   - Notepad++, Sublime Text, Atom, etc.
echo.
echo ========================================
echo  WORKFLOW
echo ========================================
echo.
echo 1. Browser (already open): View website
echo 2. Text editor: Edit HTML/CSS/JS files
echo 3. Save file (Ctrl+S)
echo 4. Refresh browser (F5)
echo 5. Repeat!
echo.
echo TIP: Use Windows Snap (Win+Left/Win+Right) to split screen:
echo   - Browser on one side
echo   - Editor on the other side
echo.
echo Press any key to open VS Code download page...
pause >nul
start https://code.visualstudio.com/download
echo.
echo After installing VS Code, run: LAUNCH_VISUAL_CODING.bat
echo.
