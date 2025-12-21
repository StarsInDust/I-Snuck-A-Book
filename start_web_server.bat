@echo off
echo 🌐 PDF Optimizer Pro - Web Server Launcher
echo ✨ AI Dream Team: Sage + Angelique Liora + Nexus
echo.
echo 🔧 Starting web server with Sage's compression algorithm...
echo 💡 Web interface will be available at: http://localhost:8000
echo.

REM Check if virtual environment Python is available
if not exist ".venv\Scripts\python.exe" (
    echo ❌ Virtual environment not found! Please run setup first.
    pause
    exit /b 1
)

REM Check if required packages are installed
.venv\Scripts\python.exe -c "import flask, flask_cors, fitz" >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing required packages...
    .venv\Scripts\python.exe -m pip install flask flask-cors PyMuPDF Pillow
)

REM Start the web server
echo ✅ Starting PDF Optimizer Web Server...
.venv\Scripts\python.exe web_server.py

pause