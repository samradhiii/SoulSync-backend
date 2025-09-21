@echo off
echo Starting SoulSync Application...
echo.

echo Starting Backend Server...
start "SoulSync Backend" cmd /k "cd /d Backend && node server.js"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "SoulSync Frontend" cmd /k "cd /d Frontend && npm start"

echo.
echo SoulSync is starting up!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Both servers will open in separate command windows.
pause
