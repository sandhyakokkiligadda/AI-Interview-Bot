# AI Interview Bot Launcher for Windows PowerShell
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "       Starting AI Interview Bot (FastAPI Backend + Vite Frontend)    " -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

$root = $PSScriptRoot

Write-Host "1. Starting FastAPI backend on http://localhost:8001 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"

Write-Host "2. Starting Vite React frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm run dev"

Write-Host ""
Write-Host "Both servers launched successfully!" -ForegroundColor Yellow
Write-Host "Visit: http://localhost:5173 to begin your interview." -ForegroundColor Cyan
Write-Host "API docs: http://localhost:8001/docs" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
