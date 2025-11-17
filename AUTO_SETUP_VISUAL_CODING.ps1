# Automatic Visual Coding Setup - Split Screen with Browser and Editor

Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WindowManager {
    [DllImport("user32.dll")]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
}
"@

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " SETTING UP VISUAL CODING ENVIRONMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get screen resolution
Add-Type -AssemblyName System.Windows.Forms
$screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$screenWidth = $screen.Width
$screenHeight = $screen.Height
$halfWidth = [Math]::Floor($screenWidth / 2)

Write-Host "✓ Screen resolution: $screenWidth x $screenHeight" -ForegroundColor Green
Write-Host "✓ Setting up split screen: $halfWidth px per side" -ForegroundColor Green
Write-Host ""

# Step 1: Open browser at localhost:8000
Write-Host "1. Opening browser at http://localhost:8000..." -ForegroundColor Yellow
Start-Process "http://localhost:8000"
Start-Sleep -Seconds 2

# Step 2: Find and position browser window (left half)
Write-Host "2. Positioning browser on LEFT half of screen..." -ForegroundColor Yellow
$browserProcesses = Get-Process | Where-Object { $_.MainWindowTitle -ne "" -and ($_.ProcessName -eq "chrome" -or $_.ProcessName -eq "msedge" -or $_.ProcessName -eq "firefox" -or $_.ProcessName -eq "iexplore") } | Select-Object -First 1

if ($browserProcesses) {
    $hwnd = $browserProcesses.MainWindowHandle
    # Position: Left half (x=0, y=0, width=half screen, height=full screen)
    [WindowManager]::SetWindowPos($hwnd, [IntPtr]::Zero, 0, 0, $halfWidth, $screenHeight, 0x0040)
    Write-Host "✓ Browser positioned on left side" -ForegroundColor Green
} else {
    Write-Host "! Browser window not found - position manually with Win+Left" -ForegroundColor Yellow
}

Start-Sleep -Seconds 1

# Step 3: Open text editor with index.html
Write-Host ""
Write-Host "3. Opening index.html in text editor..." -ForegroundColor Yellow

$projectPath = "C:\Users\Owner\Desktop\VelocityRealEstate"
$indexFile = "$projectPath\index.html"

# Try to find VS Code first
$vsCodePaths = @(
    "$env:LOCALAPPDATA\Programs\Microsoft VS Code\Code.exe",
    "$env:ProgramFiles\Microsoft VS Code\Code.exe",
    "${env:ProgramFiles(x86)}\Microsoft VS Code\Code.exe"
)

$editorFound = $false
foreach ($vsPath in $vsCodePaths) {
    if (Test-Path $vsPath) {
        Write-Host "✓ Found VS Code, launching..." -ForegroundColor Green
        Start-Process $vsPath -ArgumentList """$projectPath""", """$indexFile"""
        $editorFound = $true
        Start-Sleep -Seconds 3
        break
    }
}

if (-not $editorFound) {
    # Try Notepad++
    $notepadPP = "${env:ProgramFiles}\Notepad++\notepad++.exe"
    if (Test-Path $notepadPP) {
        Write-Host "✓ Found Notepad++, launching..." -ForegroundColor Green
        Start-Process $notepadPP -ArgumentList """$indexFile"""
        $editorFound = $true
        Start-Sleep -Seconds 2
    } else {
        # Fall back to regular Notepad
        Write-Host "✓ Using Notepad..." -ForegroundColor Green
        Start-Process notepad -ArgumentList """$indexFile"""
        $editorFound = $true
        Start-Sleep -Seconds 1
    }
}

# Step 4: Position editor window (right half)
Write-Host "4. Positioning editor on RIGHT half of screen..." -ForegroundColor Yellow

$editorProcesses = Get-Process | Where-Object { $_.MainWindowTitle -ne "" -and ($_.ProcessName -eq "Code" -or $_.ProcessName -eq "notepad++" -or $_.ProcessName -eq "notepad") } | Select-Object -First 1

if ($editorProcesses) {
    $hwnd = $editorProcesses.MainWindowHandle
    # Position: Right half (x=half screen, y=0, width=half screen, height=full screen)
    [WindowManager]::SetWindowPos($hwnd, [IntPtr]::Zero, $halfWidth, 0, $halfWidth, $screenHeight, 0x0040)
    Write-Host "✓ Editor positioned on right side" -ForegroundColor Green
} else {
    Write-Host "! Editor window not found - position manually with Win+Right" -ForegroundColor Yellow
}

Start-Sleep -Seconds 1

# Step 5: Show instructions
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your screen layout:" -ForegroundColor Cyan
Write-Host "┌────────────────────┬────────────────────┐"
Write-Host "│                    │                    │"
Write-Host "│   BROWSER          │   CODE EDITOR      │"
Write-Host "│   (Left Half)      │   (Right Half)     │"
Write-Host "│                    │                    │"
Write-Host "│   localhost:8000   │   index.html       │"
Write-Host "│   [Website View]   │   [Edit Code]      │"
Write-Host "│                    │                    │"
Write-Host "└────────────────────┴────────────────────┘"
Write-Host ""
Write-Host "HOW TO USE:" -ForegroundColor Yellow
Write-Host "1. Edit code in the editor (RIGHT side)" -ForegroundColor White
Write-Host "2. Save your changes (Ctrl+S)" -ForegroundColor White
Write-Host "3. Refresh browser (F5 on LEFT side)" -ForegroundColor White
Write-Host "4. See your changes appear!" -ForegroundColor White
Write-Host ""
Write-Host "Files you can edit:" -ForegroundColor Cyan
Write-Host "- index.html (currently open)" -ForegroundColor White
Write-Host "- contact.html" -ForegroundColor White
Write-Host "- about.html" -ForegroundColor White
Write-Host "- foreclosure.html" -ForegroundColor White
Write-Host "- And all other HTML files in the project" -ForegroundColor White
Write-Host ""
Write-Host "Quick test:" -ForegroundColor Yellow
Write-Host "1. In the editor, find: <h1 class=""hero-title"">We Buy Houses in Winnipeg</h1>" -ForegroundColor White
Write-Host "2. Change the text to anything you want" -ForegroundColor White
Write-Host "3. Save (Ctrl+S)" -ForegroundColor White
Write-Host "4. Refresh browser (F5)" -ForegroundColor White
Write-Host "5. See the headline change!" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " READY TO CODE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Keep window open
Read-Host "Press Enter to close this window"
