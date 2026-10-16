@echo off
title AI Interview Bot - Backend (FastAPI :8005)
cd /d "%~dp0backend"
echo ====================================================
echo Starting FastAPI Backend on http://127.0.0.1:8005
echo ====================================================
python -m uvicorn app.main:app --host 127.0.0.1 --port 8005 --reload
pause
