@echo off
echo ================================================
echo   ENVIRONMENT VARIABLES UPDATE TOOL
echo ================================================
echo.
echo This script will help you update .env with your credentials
echo.

set /p GMAIL_PASS="Enter Gmail App Password (16 chars): "
set /p TWILIO_SID="Enter Twilio Account SID (starts with AC): "
set /p TWILIO_TOKEN="Enter Twilio Auth Token: "
set /p TWILIO_PHONE="Enter Twilio Phone Number (+1204...): "
set /p OPENAI_KEY="Enter OpenAI API Key (starts with sk-): "

echo.
echo Updating .env file...

powershell -Command "(Get-Content .env) -replace 'GMAIL_APP_PASSWORD=.*', 'GMAIL_APP_PASSWORD=%GMAIL_PASS%' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'TWILIO_ACCOUNT_SID=.*', 'TWILIO_ACCOUNT_SID=%TWILIO_SID%' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'TWILIO_AUTH_TOKEN=.*', 'TWILIO_AUTH_TOKEN=%TWILIO_TOKEN%' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace 'TWILIO_PHONE_NUMBER=.*', 'TWILIO_PHONE_NUMBER=%TWILIO_PHONE%' | Set-Content .env"
powershell -Command "Add-Content .env \"`nOPENAI_API_KEY=%OPENAI_KEY%\""

echo.
echo ✅ .env file updated!
echo.
echo Press any key to restart services...
pause > nul

taskkill /F /IM node.exe /FI "WINDOWTITLE eq form-handler*" 2>nul
timeout /t 2 /nobreak >nul
start /B node form-handler.js

echo.
echo ✅ Services restarted!
echo.
pause
