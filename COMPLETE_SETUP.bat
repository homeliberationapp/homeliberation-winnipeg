@echo off
echo.
echo ========================================
echo  AUTO VISUAL CODING SETUP
echo ========================================
echo.

cd /d "%~dp0"

echo 1. Opening browser at localhost:8000...
start http://localhost:8000
timeout /t 2 /nobreak >nul

echo 2. Opening index.html in text editor...
start notepad.exe "%~dp0index.html"
timeout /t 1 /nobreak >nul

echo 3. Arranging windows in split-screen...
echo.
echo ========================================
echo  MANUAL WINDOW ARRANGEMENT
echo ========================================
echo.
echo Please do the following:
echo.
echo For BROWSER window (showing localhost:8000):
echo   - Click on the browser window
echo   - Press: Win + Left Arrow
echo   - This snaps it to the LEFT half of screen
echo.
echo For NOTEPAD window (showing index.html):
echo   - Click on the Notepad window
echo   - Press: Win + Right Arrow
echo   - This snaps it to the RIGHT half of screen
echo.
echo ========================================
echo  YOUR SPLIT SCREEN LAYOUT
echo ========================================
echo.
echo +--------------------+--------------------+
echo ^|                    ^|                    ^|
echo ^|   BROWSER          ^|   NOTEPAD          ^|
echo ^|   (LEFT)           ^|   (RIGHT)          ^|
echo ^|                    ^|                    ^|
echo ^|   Website View     ^|   Edit Code        ^|
echo ^|   localhost:8000   ^|   index.html       ^|
echo ^|                    ^|                    ^|
echo +--------------------+--------------------+
echo.
echo ========================================
echo  HOW TO USE
echo ========================================
echo.
echo 1. Edit the HTML code in Notepad (right side)
echo 2. Save your changes (Ctrl+S)
echo 3. Click on browser (left side)
echo 4. Refresh browser (F5)
echo 5. See your changes!
echo.
echo TRY IT NOW:
echo 1. In Notepad, find this line:
echo    ^<h1 class="hero-title"^>We Buy Houses in Winnipeg^</h1^>
echo.
echo 2. Change "We Buy Houses in Winnipeg" to anything you want
echo.
echo 3. Save (Ctrl+S)
echo.
echo 4. Refresh browser (F5)
echo.
echo 5. Watch the headline change!
echo.
echo ========================================
echo.
pause
