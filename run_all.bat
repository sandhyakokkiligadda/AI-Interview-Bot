@echo off
title AI Interview Bot Launcher
echo ====================================================
echo Launching AI Interview Bot Backend and Frontend...
echo ====================================================
start "AI Interview Bot - Backend" cmd /k "%~dp0run_backend.bat"
timeout /t 3 /nobreak >nul
start "AI Interview Bot - Frontend" cmd /k "%~dp0run_frontend.bat"
timeout /t 2 /nobreak >nul
start http://localhost:5180
echo Services started! Opening browser at http://localhost:5180...
