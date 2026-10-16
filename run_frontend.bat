@echo off
title AI Interview Bot - Frontend (Vite :5180)
cd /d "%~dp0frontend"
echo ====================================================
echo Starting Vite Frontend on http://localhost:5180
echo ====================================================
npx vite --port 5180 --host
pause
