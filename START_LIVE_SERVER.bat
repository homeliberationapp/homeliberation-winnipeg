@echo off
echo.
echo ========================================
echo  STARTING LIVE DEVELOPMENT SERVER
echo ========================================
echo.
echo Server starting at: http://localhost:8080
echo Press Ctrl+C to stop
echo.
echo Browser will open automatically...
echo File changes will auto-refresh the browser!
echo.
cd /d "%~dp0"
live-server --port=8080 --open=/index.html
