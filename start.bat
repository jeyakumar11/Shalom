@echo off
cd /d "%~dp0"
echo Starting Shalom Fashion Website...
echo.
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)
echo Website:     http://localhost:3001
echo Admin Panel: http://localhost:3001/admin
echo.
echo Press Ctrl+C to stop.
echo.
node server.js
pause
