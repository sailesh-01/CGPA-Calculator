@echo off
echo ===================================================
echo       Starting Student CGPA Calculator
echo ===================================================

echo.
echo [1/2] Checking and installing dependencies...
pip install -r requirements.txt

echo.
echo [2/2] Starting Flask server...
python app.py

pause
