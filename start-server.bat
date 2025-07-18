@echo off
echo Starting Local Web Server for OCR App...
echo.
echo Choose an option:
echo 1. Python Server (Port 8000)
echo 2. Node.js Server (Port 8080)
echo 3. Exit
echo.
set /p choice=Enter your choice (1-3): 

if "%choice%"=="1" (
    echo.
    echo Starting Python server on http://localhost:8000
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server 8000
) else if "%choice%"=="2" (
    echo.
    echo Installing http-server globally...
    npm install -g http-server
    echo.
    echo Starting Node.js server on http://localhost:8080
    echo Press Ctrl+C to stop the server
    echo.
    http-server -p 8080
) else (
    echo Goodbye!
    pause
)

pause
