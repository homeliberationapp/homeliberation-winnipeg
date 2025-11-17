@echo off
echo.
echo ========================================
echo  OPENING IN VS CODE
echo ========================================
echo.

cd /d "%~dp0"

REM Try different VS Code installation paths
set "VSCODE_PATH="

if exist "C:\Program Files\Microsoft VS Code\Code.exe" (
    set "VSCODE_PATH=C:\Program Files\Microsoft VS Code\Code.exe"
) else if exist "C:\Users\Owner\AppData\Local\Programs\Microsoft VS Code\Code.exe" (
    set "VSCODE_PATH=C:\Users\Owner\AppData\Local\Programs\Microsoft VS Code\Code.exe"
) else if exist "C:\Program Files (x86)\Microsoft VS Code\Code.exe" (
    set "VSCODE_PATH=C:\Program Files (x86)\Microsoft VS Code\Code.exe"
)

if defined VSCODE_PATH (
    echo ✅ Found VS Code at: %VSCODE_PATH%
    echo.
    echo Installing Live Server extension...
    "%VSCODE_PATH%" --install-extension ms-vscode.live-server --force

    echo.
    echo Opening project in VS Code...
    "%VSCODE_PATH%" . index.html

    echo.
    echo ========================================
    echo  VS CODE OPENED
    echo ========================================
    echo.
    echo NEXT STEPS IN VS CODE:
    echo.
    echo 1. Look for "index.html" tab (should be open)
    echo 2. Press: Ctrl+K then V
    echo    (Hold Ctrl, press K, release both, press V)
    echo 3. Live preview opens on right side
    echo 4. Edit code - see changes INSTANTLY!
    echo.
    echo ALTERNATIVE METHOD:
    echo - Right-click "index.html" in file explorer (left)
    echo - Select "Open with Live Server"
    echo.
) else (
    echo ❌ VS Code not found in standard locations
    echo.
    echo Please ensure VS Code is installed from:
    echo https://code.visualstudio.com/download
    echo.
    echo After installing, you may need to:
    echo 1. Restart your computer
    echo 2. Or add VS Code to PATH manually
    echo.
)

pause
