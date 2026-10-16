@echo off
title AI Interview Bot - Launcher
echo =====================================================================
echo          Starting AI Interview Bot (Backend + Frontend)
echo =====================================================================
echo.

echo Starting FastAPI Backend on http://localhost:8001 ...
start "AI Interview Bot - Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"

echo Starting Vite Frontend on http://localhost:5173 ...
start "AI Interview Bot - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers have been launched in separate windows!
echo Open your browser at http://localhost:5173 to start your mock interview.
echo =====================================================================
pause
