@echo off
echo.
echo ========================================
echo  LAUNCHING VISUAL CODING ENVIRONMENT
echo ========================================
echo.
echo Opening VS Code with Live Preview...
echo.
echo What you'll see:
echo - Left: Code editor
echo - Right: Live preview (Ctrl+K V to open)
echo - Bottom: Terminal
echo.
echo Quick Start:
echo 1. VS Code will open with your project
echo 2. Open any HTML file (e.g., index.html)
echo 3. Press Ctrl+K then V for live preview
echo 4. Edit code - see changes instantly!
echo.
echo Checking if VS Code is installed...

where code >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ VS Code is not installed or not in PATH
    echo.
    echo Please install VS Code:
    echo https://code.visualstudio.com/download
    echo.
    echo After installing, run this script again.
    echo.
    pause
    exit /b 1
)

echo ✅ VS Code found!
echo.
echo Installing Live Preview extension...
code --install-extension ms-vscode.live-server --force

echo.
echo Opening project in VS Code...
cd /d "%~dp0"
code . index.html

echo.
echo ========================================
echo  VS CODE LAUNCHED
echo ========================================
echo.
echo Next Steps in VS Code:
echo 1. Look for "index.html" tab (already open)
echo 2. Press: Ctrl+K then V
echo 3. Live preview opens on right side
echo 4. Edit code, see changes instantly!
echo.
echo Alternative: Right-click index.html → "Open with Live Server"
echo.
