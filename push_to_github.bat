@echo off
title Push AI Interview Bot Updates to GitHub
cd /d "%~dp0"
echo ====================================================
echo Pushing latest fixes to GitHub repository...
echo ====================================================
git push origin main
echo.
echo ====================================================
echo Push complete! Vercel will automatically redeploy in ~30 seconds.
echo ====================================================
pause
