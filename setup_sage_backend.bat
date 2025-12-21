@echo off
echo.
echo 🎨 PDF Optimizer Pro - Sage's Backend Setup
echo ==========================================
echo.
echo 🔧 Installing Sage's Page-to-Images dependencies...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.7+ from https://python.org
    pause
    exit /b 1
)

echo ✅ Python found
echo.

REM Install required packages
echo 📦 Installing PyMuPDF (Sage's PDF library)...
pip install PyMuPDF

echo 📦 Installing Flask (Web backend)...
pip install Flask

echo 📦 Installing Flask-CORS (Cross-origin support)...
pip install flask-cors

echo.
echo ✅ Installation complete!
echo.
echo 🚀 To start Sage's PDF compression backend:
echo    python pdf_optimizer_backend.py
echo.
echo 🌐 Then open your web browser to:
echo    http://localhost/I-Snuck-A-Book/PDF_Optimizer.html
echo.
pause