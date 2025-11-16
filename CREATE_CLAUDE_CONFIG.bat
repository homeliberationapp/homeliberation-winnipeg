@echo off
echo.
echo ========================================
echo  CREATING CLAUDE DESKTOP CONFIG
echo ========================================
echo.

if not exist "%APPDATA%\Claude" (
    mkdir "%APPDATA%\Claude"
    echo Created Claude directory
)

(
echo {
echo   "mcpServers": {
echo     "filesystem": {
echo       "command": "npx",
echo       "args": [
echo         "-y",
echo         "@modelcontextprotocol/server-filesystem",
echo         "C:\\Users\\Owner\\Desktop\\VelocityRealEstate"
echo       ]
echo     }
echo   }
echo }
) > "%APPDATA%\Claude\claude_desktop_config.json"

echo.
echo ✅ Config file created at:
echo %APPDATA%\Claude\claude_desktop_config.json
echo.
echo Next steps:
echo 1. Download Claude Desktop from: https://claude.ai/download
echo 2. Install and sign in
echo 3. Restart Claude Desktop
echo 4. Test: Ask it to "Read index.html"
echo.
pause
